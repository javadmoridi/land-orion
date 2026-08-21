-- ============================================
-- Land-Orion Supabase Schema & RLS Policies
-- Run this in the Supabase SQL Editor.
-- ============================================

-- ---------- PLAYERS TABLE ----------
create table if not exists public.players (
  id text primary key,
  wallet_address text unique not null,
  username text not null,
  level integer not null default 1,
  experience integer not null default 0,
  status text not null default 'connecting',
  inventory jsonb not null default '[]'::jsonb,
  land jsonb not null default '[]'::jsonb,
  game_state jsonb,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

comment on table public.players is 'Land-Orion player profiles keyed by TON wallet address.';

-- ---------- SAVES TABLE ----------
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  player_id text not null references public.players(id) on delete cascade,
  player_data jsonb not null,
  saved_at timestamptz not null default now(),
  unique (player_id)
);

comment on table public.saves is 'Full game save snapshots per player.';

-- ---------- PAYMENTS TABLE ----------
-- Records Gem purchases paid in TON. tx_hash is unique so the same transaction
-- can never be credited twice (anti double-spend).
create table if not exists public.payments (
  id text primary key,
  user_id text not null references public.players(id) on delete cascade,
  wallet_address text not null,
  tx_hash text not null unique,
  ton_amount numeric not null default 0,
  usd_amount numeric not null default 0,
  gems_amount integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

comment on table public.payments is 'TON-backed Gem purchase records. tx_hash is unique to prevent double use.';

create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_tx_hash_idx on public.payments (tx_hash);

-- ---------- INDEXES ----------
create index if not exists players_wallet_address_idx on public.players (wallet_address);
create index if not exists saves_player_id_idx on public.saves (player_id);

-- ============================================
-- RLS: ENABLE
-- ============================================
alter table public.players enable row level security;
alter table public.saves enable row level security;

-- ============================================
-- PLAYERS POLICIES
-- The wallet_address is the primary identifier.
-- The anon key can only read/write the row whose
-- wallet_address equals the wallet passed in the
-- request via a custom header (x-wallet-address) - see app code.
-- ============================================

-- Allow anyone to create a new player row (used on first login).
drop policy if exists "players_insert_policy" on public.players;
create policy "players_insert_policy"
  on public.players
  for insert
  to anon
  with check (true);

-- Allow a player to read their own row by matching the custom header.
drop policy if exists "players_select_own" on public.players;
create policy "players_select_own"
  on public.players
  for select
  to anon
  using (
    wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
  );

-- Allow a player to update their own row.
drop policy if exists "players_update_own" on public.players;
create policy "players_update_own"
  on public.players
  for update
  to anon
  using (
    wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
  )
  with check (
    wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
  );

-- ============================================
-- SAVES POLICIES
-- ============================================

-- Allow a player to insert/upsert their own save.
drop policy if exists "saves_upsert_own" on public.saves;
create policy "saves_upsert_own"
  on public.saves
  for insert
  to anon
  with check (
    player_id in (
      select id from public.players
      where wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
    )
  );

-- Allow a player to read their own saves.
drop policy if exists "saves_select_own" on public.saves;
create policy "saves_select_own"
  on public.saves
  for select
  to anon
  using (
    player_id in (
      select id from public.players
      where wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
    )
  );

-- Allow a player to update their own saves.
drop policy if exists "saves_update_own" on public.saves;
create policy "saves_update_own"
  on public.saves
  for update
  to anon
  using (
    player_id in (
      select id from public.players
      where wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
    )
  )
  with check (
    player_id in (
      select id from public.players
      where wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
    )
  );

-- ============================================
-- PAYMENTS RLS
-- ============================================
alter table public.payments enable row level security;

-- Allow a player to read their own payments.
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments
  for select
  to anon
  using (
    wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
  );

-- Allow a player to insert their own payments (tx_hash uniqueness is enforced
-- by the table's unique constraint, preventing double use).
drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own"
  on public.payments
  for insert
  to anon
  with check (
    wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
  );

-- Allow a player to update their own payments (e.g. status changes).
drop policy if exists "payments_update_own" on public.payments;
create policy "payments_update_own"
  on public.payments
  for update
  to anon
  using (
    wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
  )
  with check (
    wallet_address = current_setting('request.headers', true)::jsonb ->> 'x-wallet-address'
  );

-- ============================================
-- PLAYER ECONOMY (Gems / Coins / VIP) + REFERRALS
-- ============================================
-- The currencies (Gems & Coins), VIP state, referral code and welcome flag all
-- live on the players row. The app writes them through the same RLS-protected
-- row the player already owns, so nothing is stored in the browser.

alter table public.players
  add column if not exists eco_state jsonb not null default '{}'::jsonb;

alter table public.players
  add column if not exists referral_code text;

alter table public.players
  add column if not exists referred_by text;

alter table public.players
  add column if not exists welcome_claimed boolean not null default false;

create unique index if not exists players_referral_code_key
  on public.players (referral_code)
  where referral_code is not null;

create index if not exists players_referred_by_idx
  on public.players (referred_by);

-- ---------- referral code generator ----------
create or replace function public.generate_ref_code()
returns text
language sql
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

-- ============================================
-- claim_login_rewards (SECURITY DEFINER)
-- Called by the client after a wallet connects. Grants the 100 Gem welcome
-- reward (once per player) and, when a valid referral code is provided,
-- records the referral and credits 50 Gems to the REFERRER.
--
-- Security: the function verifies the current request wallet header matches
-- the passed wallet, so a user can only claim for themselves. It runs with
-- definer rights so it can also credit the referrer's row.
-- ============================================
create or replace function public.claim_login_rewards(
  p_wallet text,
  p_referral_code text default ''
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  header_wallet text;
  v_player public.players%rowtype;
  v_referrer_id text;
  v_welcome_gems integer := 100;
  v_referral_gems integer := 50;
  v_welcome_granted boolean := false;
  v_referral_granted boolean := false;
begin
  header_wallet := coalesce(
    current_setting('request.headers', true)::jsonb ->> 'x-wallet-address',
    ''
  );

  -- A user may only claim for themselves.
  if header_wallet <> p_wallet then
    return json_build_object('ok', false, 'reason', 'wallet_mismatch');
  end if;

  select * into v_player from public.players where wallet_address = p_wallet;

  if v_player.id is null then
    return json_build_object('ok', false, 'reason', 'player_not_found');
  end if;

  -- Ensure every player has a personal referral code.
  if v_player.referral_code is null or v_player.referral_code = '' then
    update public.players
      set referral_code = public.generate_ref_code()
      where id = v_player.id;
  end if;

  -- Welcome reward (100 gems) — only once per player.
  if not coalesce(v_player.welcome_claimed, false) then
    update public.players
      set eco_state = jsonb_set(
            coalesce(eco_state, '{}'::jsonb),
            '{gems}',
            to_jsonb(coalesce((eco_state->>'gems')::numeric, 0) + v_welcome_gems)
          ),
          welcome_claimed = true
      where id = v_player.id;

    v_welcome_granted := true;
  end if;

  -- Referral: record who referred this player and reward the referrer once.
  if p_referral_code <> ''
     and (v_player.referred_by is null or v_player.referred_by = '') then
    select id into v_referrer_id
      from public.players
      where referral_code = p_referral_code
        and id <> v_player.id
      limit 1;

    if v_referrer_id is not null then
      update public.players
        set referred_by = p_referral_code
        where id = v_player.id;

      update public.players
        set eco_state = jsonb_set(
              coalesce(eco_state, '{}'::jsonb),
              '{gems}',
              to_jsonb(coalesce((eco_state->>'gems')::numeric, 0) + v_referral_gems)
            )
        where id = v_referrer_id;

      v_referral_granted := true;
    end if;
  end if;

  return json_build_object(
    'ok', true,
    'welcomeGems', case when v_welcome_granted then v_welcome_gems else 0 end,
    'referralGems', case when v_referral_granted then v_referral_gems else 0 end,
    'referred', v_referral_granted
  );
end $$;

revoke execute on function public.claim_login_rewards(text, text) from public;
grant execute on function public.claim_login_rewards(text, text) to anon;
