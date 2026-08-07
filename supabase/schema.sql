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