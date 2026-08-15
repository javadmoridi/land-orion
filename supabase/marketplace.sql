-- ============================================================
-- Land-Orion Marketplace (Supabase)
-- Run this in the Supabase SQL Editor AFTER schema.sql.
--
-- Tables + RPC functions for REAL player-to-player trading:
--   marketplace_sell()    - seller lists an item (item deducted)
--   marketplace_buy()     - buyer pays, seller gets net (5% tax),
--                           item transferred, transaction recorded
--   marketplace_cancel()  - seller removes listing, item refunded
--   marketplace_get_listings() - active listings
--
-- All RPC functions are SECURITY DEFINER so they can atomically
-- read/update both players' saves regardless of RLS.
-- ============================================================

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id text not null,
  seller_wallet text not null default '',
  item_type text not null,           -- 'resource' | 'fruit' | 'orion'
  item_id text not null,             -- e.g. 'wood', 'fruit-1', 'water:5'
  item_name text not null default '',
  quantity integer not null default 1,
  price_per_item numeric not null default 0,
  currency text not null default 'orion-token',
  status text not null default 'active',   -- 'active' | 'sold' | 'cancelled'
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_sales (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null,
  seller_id text not null,
  buyer_id text not null,
  item_type text not null,
  item_id text not null,
  item_name text not null default '',
  quantity integer not null,
  price_per_item numeric not null,
  gross_amount numeric not null,
  tax_amount numeric not null,
  seller_amount numeric not null,
  currency text not null default 'orion-token',
  created_at timestamptz not null default now(),
  constraint fk_sales_listing foreign key (listing_id)
    references public.marketplace_listings(id)
);

create index if not exists idx_listings_status
  on public.marketplace_listings (status);
create index if not exists idx_listings_item
  on public.marketplace_listings (item_type, item_id);
create index if not exists idx_sales_buyer
  on public.marketplace_sales (buyer_id);

alter table public.marketplace_listings enable row level security;
alter table public.marketplace_sales enable row level security;

-- Anyone can read active listings.
drop policy if exists "listings_select_active" on public.marketplace_listings;
create policy "listings_select_active"
  on public.marketplace_listings
  for select to anon
  using (status = 'active');

-- Written only through SECURITY DEFINER RPCs.
drop policy if exists "listings_no_insert" on public.marketplace_listings;
create policy "listings_no_insert"
  on public.marketplace_listings
  for insert to anon
  with check (false);

drop policy if exists "sales_no_insert" on public.marketplace_sales;
create policy "sales_no_insert"
  on public.marketplace_sales
  for insert to anon
  with check (false);

-- -------------------------------------------------------------
-- Internal helper: exchange-amount math (5% municipal tax).
-- -------------------------------------------------------------
-- -------------------------------------------------------------
-- SELL: seller lists an item for sale.
-- The item quantity is deducted from the seller's inventory.
-- -------------------------------------------------------------
create or replace function public.marketplace_sell(
  p_seller_id text,
  p_item_type text,
  p_item_id text,
  p_item_name text default '',
  p_quantity integer default 1,
  p_price_per_item numeric default 0,
  p_currency text default 'orion-token'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row_save jsonb;
  row_inv jsonb;
  item jsonb;
  new_inv jsonb := '[]'::jsonb;
  available integer := 0;
  found boolean := false;
  listing_id uuid;
begin
  -- Load the seller's full save (authoritative inventory source).
  select player_data into row_save
    from public.saves
   where player_id = p_seller_id
   for update;

  if row_save is null then
    raise exception 'Seller save not found.';
  end if;

  -- gameState.inventory is the item list the game loads.
  row_inv := coalesce(row_save #> '{gameState,inventory}', '[]'::jsonb);
  if jsonb_typeof(row_inv) <> 'array' then
    row_inv := '[]'::jsonb;
  end if;

  p_quantity := greatest(1, p_quantity);
  if p_price_per_item <= 0 then
    raise exception 'Price must be greater than zero.';
  end if;

  -- Deduct p_quantity from the matching item.
  for item in select value from jsonb_array_elements(row_inv) loop
    if item ->> 'id' = p_item_id
       or (item ->> 'name') = p_item_id
       or (item ->> 'type' = p_item_type and item ->> 'id' = p_item_id)
    then
      available := coalesce((item ->> 'quantity')::int, 1);
      found := true;
    end if;
  end loop;

  if not found or available < p_quantity then
    raise exception 'Not enough "%" to sell.', p_item_id;
  end if;

  -- Rebuild inventory without the sold quantity.
  select coalesce(jsonb_agg(
      case
        when (value ->> (case when value ? 'id' then 'id' else 'id' end)) = p_item_id
             or value ->> 'name' = p_item_id
        then jsonb_set(value, '{quantity}',
             to_jsonb(greatest(0, coalesce((value ->> 'quantity')::int, 1) - p_quantity)))
        else value
      end
    ), '[]'::jsonb)
    into new_inv
    from jsonb_array_elements(row_inv);

  insert into public.marketplace_listings
    (seller_id, seller_wallet, item_type, item_id, item_name,
     quantity, price_per_item, currency)
  values
    (p_seller_id,
     coalesce(row_save #>> '{player,walletAddress}', p_seller_id),
     p_item_type, p_item_id,
     case when p_item_name = '' then p_item_id else p_item_name end,
     p_quantity, p_price_per_item, p_currency)
  returning id into listing_id;

  -- Persist reduced inventory.
  update public.saves
     set player_data =
       jsonb_set(row_save, '{gameState,inventory}', new_inv)
   where player_id = p_seller_id;

  -- -------------------------------------------------------------
-- BUY: buyer purchases a listing.
--   - Seller cannot buy their own listing.
--   - Buyer pays gross, seller receives gross - 5% tax.
--   - Item is added to buyer inventory, transaction recorded.
-- -------------------------------------------------------------
create or replace function public.marketplace_buy(
  p_buyer_id text,
  p_listing_id uuid,
  p_quantity integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row record;
  buyer_save jsonb;
  seller_save jsonb;
  buyer_inv jsonb;
  buyer_cur jsonb;
  gross numeric;
  tax numeric;
  seller_amount numeric;
  buyer_tokens numeric;
  sale_id uuid;
begin
  -- Lock the listing row.
  select * into row
    from public.marketplace_listings
   where id = p_listing_id
   for update;

  if not found then
    raise exception 'Listing not found.';
  end if;

  if row.status <> 'active' then
    raise exception 'Listing is no longer active.';
  end if;

  -- Prevent selling to yourself.
  if row.seller_id = p_buyer_id then
    raise exception 'You cannot buy your own listing.';
  end if;

  p_quantity := greatest(1, least(p_quantity, row.quantity));

  -- Buyer save + currency.
  select player_data into buyer_save
    from public.saves where player_id = p_buyer_id for update;
  if buyer_save is null then
    raise exception 'Buyer save not found.';
  end if;

  -- Load + lock seller save.
  select player_data into seller_save
    from public.saves where player_id = row.seller_id for update;
  if seller_save is null then
    raise exception 'Seller save not found.';
  end if;

  buyer_cur := coalesce(buyer_save #> '{gameState,currency}', '{}'::jsonb);
  buyer_tokens := coalesce((buyer_cur ->> 'orion_token')::numeric, 0);

  gross := round(row.price_per_item * p_quantity, 2);
  tax := round(gross * 0.05, 2);
  seller_amount := gross - tax;

  if buyer_tokens < gross then
    raise exception 'Not enough Orion Token. Need % (have %).', gross, buyer_tokens;
  end if;

  -- --- Buyer side: deduct tokens, add item -------------------
  buyer_cur := jsonb_set(buyer_cur, '{orion_token}',
    to_jsonb((buyer_tokens - gross)::numeric));
  buyer_inv := coalesce(buyer_save #> '{gameState,inventory}', '[]'::jsonb);
  buyer_inv := add_marketplace_item(buyer_inv, row.item_type, row.item_id,
                  row.item_name, p_quantity);

  buyer_save := jsonb_set(buyer_save, '{gameState,currency}', buyer_cur);
  buyer_save := jsonb_set(buyer_save, '{gameState,inventory}', buyer_inv);
  update public.saves set player_data = buyer_save where player_id = p_buyer_id;

  -- --- Seller side: add net tokens ---------------------------
  declare
    seller_cur jsonb := coalesce(seller_save #> '{gameState,currency}', '{}'::jsonb);
    seller_tokens numeric := coalesce((seller_cur ->> 'orion_token')::numeric, 0);
  begin
    seller_cur := jsonb_set(seller_cur, '{orion_token}',
      to_jsonb((seller_tokens + seller_amount)::numeric));
    seller_save := jsonb_set(seller_save, '{gameState,currency}', seller_cur);
    update public.saves set player_data = seller_save where player_id = row.seller_id;
  end;

  insert into public.marketplace_sales
    (listing_id, seller_id, buyer_id, item_type, item_id, item_name,
     quantity, price_per_item, gross_amount, tax_amount, seller_amount, currency)
  values
    (row.id, row.seller_id, p_buyer_id, row.item_type, row.item_id, row.item_name,
     p_quantity, row.price_per_item, gross, tax, seller_amount, row.currency)
  returning id into sale_id;

  update public.marketplace_listings
     set status = case when p_quantity >= row.quantity then 'sold' else 'active' end,
         quantity = row.quantity - p_quantity
   where id = row.id;

  -- -------------------------------------------------------------
-- CANCEL: seller removes an active listing; item is refunded.
-- -------------------------------------------------------------
create or replace function public.marketplace_cancel(
  p_seller_id text,
  p_listing_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row record;
  seller_save jsonb;
  seller_inv jsonb;
begin
  select * into row
    from public.marketplace_listings
   where id = p_listing_id
   for update;

  if not found then
    raise exception 'Listing not found.';
  end if;

  if row.status <> 'active' then
    raise exception 'Listing is no longer active.';
  end if;

  if row.seller_id <> p_seller_id then
    raise exception 'Only the seller can cancel this listing.';
  end if;

  select player_data into seller_save
    from public.saves where player_id = p_seller_id for update;
  if seller_save is null then
    raise exception 'Seller save not found.';
  end if;

  seller_inv := coalesce(seller_save #> '{gameState,inventory}', '[]'::jsonb);
  seller_inv := public.add_marketplace_item(
    seller_inv, row.item_type, row.item_id, row.item_name, row.quantity);

  seller_save := jsonb_set(seller_save, '{gameState,inventory}', seller_inv);
  update public.saves set player_data = seller_save where player_id = p_seller_id;

  update public.marketplace_listings
     set status = 'cancelled'
   where id = row.id;

  return jsonb_build_object(
    'listingId', row.id,
    'status', 'cancelled',
    'refunded', jsonb_build_object(
      'itemType', row.item_type,
      'itemId', row.item_id,
      'quantity', row.quantity
    )
  );
end;
$$;

-- -------------------------------------------------------------
-- GET: active listings (reads are safe through RLS policy too,
-- but this RPC returns all active listings for the panel).
-- -------------------------------------------------------------
create or replace function public.marketplace_get_listings()
returns setof public.marketplace_listings
language sql
security definer
set search_path = public
as $$
  select * from public.marketplace_listings
   where status = 'active'
   order by created_at desc;
$$;