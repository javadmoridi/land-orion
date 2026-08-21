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

comment on table public.players is
'Land-Orion player profiles keyed by TON wallet address.';


-- ---------- SAVES TABLE ----------
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  player_id text not null references public.players(id) on delete cascade,
  player_data jsonb not null,
  saved_at timestamptz not null default now(),
  unique (player_id)
);

comment on table public.saves is
'Full game save snapshots per player.';


-- ---------- PAYMENTS TABLE ----------
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

comment on table public.payments is
'TON-backed Gem purchase records. tx_hash is unique to prevent double use.';

create index if not exists payments_user_id_idx
  on public.payments (user_id);

create index if not exists payments_tx_hash_idx
  on public.payments (tx_hash);


-- ---------- INDEXES ----------
create index if not exists players_wallet_address_idx
  on public.players (wallet_address);

create index if not exists saves_player_id_idx
  on public.saves (player_id);


-- ============================================
-- RLS: ENABLE
-- ============================================

alter table public.players enable row level security;
alter table public.saves enable row level security;


-- ============================================
-- PLAYERS POLICIES
-- ============================================

drop policy if exists "players_insert_policy"
on public.players;

create policy "players_insert_policy"
  on public.players
  for insert
  to anon
  with check (true);


drop policy if exists "players_select_own"
on public.players;

create policy "players_select_own"
  on public.players
  for select
  to anon
  using (
    wallet_address =
    current_setting('request.headers', true)::jsonb
      ->> 'x-wallet-address'
  );


drop policy if exists "players_update_own"
on public.players;

create policy "players_update_own"
  on public.players
  for update
  to anon
  using (
    wallet_address =
    current_setting('request.headers', true)::jsonb
      ->> 'x-wallet-address'
  )
  with check (
    wallet_address =
    current_setting('request.headers', true)::jsonb
      ->> 'x-wallet-address'
  );


-- ============================================
-- SAVES POLICIES
-- ============================================

drop policy if exists "saves_upsert_own"
on public.saves;

create policy "saves_upsert_own"
  on public.saves
  for insert
  to anon
  with check (
    player_id in (
      select id
      from public.players
      where wallet_address =
        current_setting('request.headers', true)::jsonb
          ->> 'x-wallet-address'
    )
  );


drop policy if exists "saves_select_own"
on public.saves;

create policy "saves_select_own"
  on public.saves
  for select
  to anon
  using (
    player_id in (
      select id
      from public.players
      where wallet_address =
        current_setting('request.headers', true)::jsonb
          ->> 'x-wallet-address'
    )
  );


drop policy if exists "saves_update_own"
on public.saves;

create policy "saves_update_own"
  on public.saves
  for update
  to anon
  using (
    player_id in (
      select id
      from public.players
      where wallet_address =
        current_setting('request.headers', true)::jsonb
          ->> 'x-wallet-address'
    )
  )
  with check (
    player_id in (
      select id
      from public.players
      where wallet_address =
        current_setting('request.headers', true)::jsonb
          ->> 'x-wallet-address'
    )
  );


-- ============================================
-- PAYMENTS RLS
-- ============================================

alter table public.payments enable row level security;


drop policy if exists "payments_select_own"
on public.payments;

create policy "payments_select_own"
  on public.payments
  for select
  to anon
  using (
    wallet_address =
    current_setting('request.headers', true)::jsonb
      ->> 'x-wallet-address'
  );


drop policy if exists "payments_insert_own"
on public.payments;

create policy "payments_insert_own"
  on public.payments
  for insert
  to anon
  with check (
    wallet_address =
    current_setting('request.headers', true)::jsonb
      ->> 'x-wallet-address'
  );


drop policy if exists "payments_update_own"
on public.payments;

create policy "payments_update_own"
  on public.payments
  for update
  to anon
  using (
    wallet_address =
    current_setting('request.headers', true)::jsonb
      ->> 'x-wallet-address'
  )
  with check (
    wallet_address =
    current_setting('request.headers', true)::jsonb
      ->> 'x-wallet-address'
  );


-- ============================================
-- PLAYER ECONOMY + REFERRALS
-- ============================================

alter table public.players
  add column if not exists eco_state
  jsonb not null default '{}'::jsonb;

alter table public.players
  add column if not exists referral_code
  text;

alter table public.players
  add column if not exists referred_by
  text;

alter table public.players
  add column if not exists welcome_claimed
  boolean not null default false;


-- Every player has one unique referral code.
create unique index if not exists players_referral_code_key
  on public.players (referral_code)
  where referral_code is not null;


create index if not exists players_referred_by_idx
  on public.players (referred_by);


-- ============================================
-- REFERRAL CODE GENERATOR
-- ============================================

create or replace function public.generate_ref_code()
returns text
language sql
as $$
  select upper(
    substr(
      replace(gen_random_uuid()::text, '-', ''),
      1,
      8
    )
  );
$$;


-- ============================================
-- REFERRAL REWARD VALUES
-- ============================================

-- NEW PLAYER REWARD
-- 100 Gems
-- 300 Tokens
-- 2000 Coins

-- REFERRER REWARD
-- 100 Gems
-- 300 Tokens
-- 2000 Coins


-- ============================================
-- CLAIM LOGIN / REFERRAL REWARDS
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

  -- New player reward
  v_welcome_gems integer := 100;
  v_welcome_tokens integer := 300;
  v_welcome_coins integer := 2000;

  -- Referrer reward
  v_referral_gems integer := 100;
  v_referral_tokens integer := 300;
  v_referral_coins integer := 2000;

  v_welcome_granted boolean := false;
  v_referral_granted boolean := false;

begin

  -- ==========================================
  -- VERIFY WALLET
  -- ==========================================

  header_wallet := coalesce(
    current_setting(
      'request.headers',
      true
    )::jsonb ->> 'x-wallet-address',
    ''
  );

  if header_wallet <> p_wallet then

    return json_build_object(
      'ok',
      false,
      'reason',
      'wallet_mismatch'
    );

  end if;


  -- ==========================================
  -- FIND PLAYER
  -- ==========================================

  select *
  into v_player
  from public.players
  where wallet_address = p_wallet;


  if v_player.id is null then

    return json_build_object(
      'ok',
      false,
      'reason',
      'player_not_found'
    );

  end if;


  -- ==========================================
  -- CREATE PERSONAL REFERRAL CODE
  -- ==========================================

  if v_player.referral_code is null
     or v_player.referral_code = '' then

    update public.players

    set referral_code =
      public.generate_ref_code()

    where id = v_player.id;

  end if;


  -- ==========================================
  -- NEW PLAYER WELCOME REWARD
  -- ==========================================

  if not coalesce(
    v_player.welcome_claimed,
    false
  ) then

    update public.players

    set eco_state =
      jsonb_set(
        jsonb_set(
          jsonb_set(
            coalesce(
              eco_state,
              '{}'::jsonb
            ),

            '{gems}',

            to_jsonb(
              coalesce(
                (eco_state ->> 'gems')::numeric,
                0
              )
              + v_welcome_gems
            )

          ),

          '{resources,tokens}',

          to_jsonb(
            coalesce(
              (
                eco_state
                  -> 'resources'
                  ->> 'tokens'
              )::numeric,
              0
            )
            + v_welcome_tokens
          )

        ),

        '{resources,coins}',

        to_jsonb(
          coalesce(
            (
              eco_state
                -> 'resources'
                ->> 'coins'
            )::numeric,
            0
          )
          + v_welcome_coins
        )

      ),

      welcome_claimed = true

    where id = v_player.id;


    v_welcome_granted := true;

  end if;


  -- ==========================================
  -- REFERRAL
  -- ==========================================

  if trim(
    coalesce(
      p_referral_code,
      ''
    )
  ) <> ''

  and (
    v_player.referred_by is null
    or v_player.referred_by = ''
  )

  then

    -- Find owner of referral code.
    select id
    into v_referrer_id

    from public.players

    where upper(referral_code)
      = upper(
          trim(p_referral_code)
        )

      and id <> v_player.id

    limit 1;


    -- ========================================
    -- VALID REFERRAL
    -- ========================================

    if v_referrer_id is not null then

      -- Record who referred this player.
      update public.players

      set referred_by =
        upper(
          trim(p_referral_code)
        )

      where id = v_player.id;


      -- ======================================
      -- REWARD REFERRER
      -- ======================================

      update public.players

      set eco_state =
        jsonb_set(

          jsonb_set(

            jsonb_set(

              coalesce(
                eco_state,
                '{}'::jsonb
              ),

              '{gems}',

              to_jsonb(
                coalesce(
                  (
                    eco_state
                      ->> 'gems'
                  )::numeric,
                  0
                )
                + v_referral_gems
              )

            ),

            '{resources,tokens}',

            to_jsonb(
              coalesce(
                (
                  eco_state
                    -> 'resources'
                    ->> 'tokens'
                )::numeric,
                0
              )
              + v_referral_tokens
            )

          ),

          '{resources,coins}',

          to_jsonb(
            coalesce(
              (
                eco_state
                  -> 'resources'
                  ->> 'coins'
              )::numeric,
              0
            )
            + v_referral_coins
          )

        )

      where id = v_referrer_id;


      v_referral_granted := true;

    end if;

  end if;


  -- ==========================================
  -- RETURN RESULT
  -- ==========================================

  return json_build_object(

    'ok',
    true,

    'welcomeGems',
    case
      when v_welcome_granted
      then v_welcome_gems
      else 0
    end,

    'welcomeTokens',
    case
      when v_welcome_granted
      then v_welcome_tokens
      else 0
    end,

    'welcomeCoins',
    case
      when v_welcome_granted
      then v_welcome_coins
      else 0
    end,

    'referralGems',
    case
      when v_referral_granted
      then v_referral_gems
      else 0
    end,

    'referralTokens',
    case
      when v_referral_granted
      then v_referral_tokens
      else 0
    end,

    'referralCoins',
    case
      when v_referral_granted
      then v_referral_coins
      else 0
    end,

    'referred',
    v_referral_granted

  );

end
$$;


-- ============================================
-- FUNCTION PERMISSIONS
-- ============================================

revoke execute
on function public.claim_login_rewards(text, text)
from public;

grant execute
on function public.claim_login_rewards(text, text)
to anon;