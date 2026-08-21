import {
  supabase,
  setWalletHeader,
  isSupabaseConfigured,
} from '../backend/supabaseClient';

import { useGameStore } from '../game/useGameStore';

// ============================================================================
// Player Economy API
//
// This module is the SINGLE place that reads/writes the player's currencies
// (Gems, Coins, Tokens) and VIP state for the currently logged-in wallet.
//
// Nothing here is stored in the browser (no localStorage). All data lives in
// the `players.eco_state` JSONB column on Supabase so it survives across
// devices and is never reset by clearing the browser storage.
// ============================================================================

export interface EconomyVipState {
  activeVip: {
    tierId: string;
    name: string;
    purchasedAt: string;
    expiresAt: string;
  } | null;
}

export interface PlayerEcoState {
  gems: number;
  resources: Record<string, number>;
  claimedQuestIds: string[];
  vip: EconomyVipState | null;
}

export interface LoginRewardResult {
  ok: boolean;
  welcomeGems: number;
  referralGems: number;
}

const EMPTY_ECO: PlayerEcoState = {
  gems: 0,
  resources: {},
  claimedQuestIds: [],
  vip: null,
};

/**
 * Wallet of the currently logged-in player (from the game store).
 * Returns null when no wallet has connected (e.g. before login).
 */
export function activeWallet(): string | null {
  const state = useGameStore.getState();
  return (
    state.playerProfile?.walletAddress ??
    state.wallet?.address ??
    null
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function mergeEconomy(
  base: unknown,
  patch: unknown,
): any {
  if (
    isPlainObject(base) &&
    isPlainObject(patch)
  ) {
    const out: Record<string, unknown> = { ...base };

    for (const key of Object.keys(patch)) {
      out[key] = mergeEconomy(
        base[key],
        patch[key],
      );
    }

    return out;
  }

  return patch === undefined
    ? base
    : patch;
}

/**
 * Returns the full economy state of the current player, or null when the
 * player has not logged in yet / Supabase is not configured.
 */
export async function getPlayerEco(): Promise<PlayerEcoState | null> {
  const wallet = activeWallet();

  if (!isSupabaseConfigured || !supabase || !wallet) {
    return null;
  }

  setWalletHeader(wallet);

  const { data, error } = await supabase
    .from('players')
    .select('eco_state')
    .eq('wallet_address', wallet)
    .maybeSingle();

  if (error) {
    console.error('[playerApi] getPlayerEco error:', error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const raw = (data as { eco_state?: unknown }).eco_state;

  if (!raw || !isPlainObject(raw)) {
    return null;
  }

  const eco = raw as Partial<PlayerEcoState>;

  return {
    gems: typeof eco.gems === 'number' ? eco.gems : 0,
    resources: isPlainObject(eco.resources)
      ? { ...(eco.resources as Record<string, number>) }
      : {},
    claimedQuestIds: Array.isArray(eco.claimedQuestIds)
      ? (eco.claimedQuestIds as string[])
      : [],
    vip: (eco.vip as EconomyVipState | undefined) ?? null,
  };
}

/**
 * Merges a partial update into the player's economy state and writes it back
 * to Supabase. Re-reads a fresh copy first so concurrent stores (gems,
 * resources, vip) never overwrite each other.
 */
export async function patchPlayerEco(
  partial: Partial<PlayerEcoState>,
): Promise<void> {
  const wallet = activeWallet();

  if (!isSupabaseConfigured || !supabase || !wallet) {
    return;
  }

  const current = (await getPlayerEco()) ?? EMPTY_ECO;
  const next = mergeEconomy(current, partial) as PlayerEcoState;

  setWalletHeader(wallet);

  const { error } = await supabase
    .from('players')
    .update({ eco_state: next })
    .eq('wallet_address', wallet);

  if (error) {
    console.error('[playerApi] patchPlayerEco error:', error.message);
  }
}

// ============================================================================
// REFERRAL
// ============================================================================

function generateReferralCode(): string {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < 8; i++) {
    code += alphabet[
      Math.floor(Math.random() * alphabet.length)
    ];
  }

  return code;
}

/**
 * Returns the current player's personal referral code, creating & saving it
 * on the players row when it does not exist yet.
 */
export async function getMyReferralCode(): Promise<string | null> {
  const wallet = activeWallet();

  if (!isSupabaseConfigured || !supabase || !wallet) {
    return null;
  }

  setWalletHeader(wallet);

  const { data, error } = await supabase
    .from('players')
    .select('referral_code')
    .eq('wallet_address', wallet)
    .maybeSingle();

  if (error) {
    console.error('[playerApi] getMyReferralCode error:', error.message);
    return null;
  }

  const existing = (data as { referral_code?: string | null })
    ?.referral_code;

  if (existing) {
    return existing;
  }

  const code = generateReferralCode();

  setWalletHeader(wallet);

  const { error: updateError } = await supabase
    .from('players')
    .update({ referral_code: code })
    .eq('wallet_address', wallet);

  if (updateError) {
    console.error('[playerApi] set referral code error:', updateError.message);
    return null;
  }

  return code;
}

/**
 * Reads a referral code from the current URL (?ref=CODE). Used when a friend
 * follows a shared invite link.
 */
export function getReferralCodeFromUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const params = new URLSearchParams(
    window.location.search,
  );

  return (
    params.get('ref')?.trim().toUpperCase() ?? ''
  );
}

/**
 * Claims the login / welcome reward and records the referral.
 *
 * The 100 Gem welcome reward is granted to the current player (only once).
 * If the player joined through a valid referral code, the REFERRER receives
 * 50 Gems on the server side (securely, it cannot be faked client-side).
 *
 * Returns how many Gems the CURRENT player should receive.
 */
export async function claimLoginRewards(
  referralCode: string,
): Promise<LoginRewardResult> {
  const wallet = activeWallet();
  const playerName = useGameStore.getState().playerProfile?.username ?? '';

  // Dev fallback (Supabase not configured): grant the welcome Gems once per
  // session, purely in memory — never persisted to the browser.
  if (!isSupabaseConfigured || !supabase) {
    if (!fallbackWelcomeGivenThisSession) {
      fallbackWelcomeGivenThisSession = true;
      // Also simulate referrer bonus in dev.
      if (referralCode && referralCode !== playerName) {
        return {
          ok: true,
          welcomeGems: 100,
          referralGems: 50,
        };
      }
      return {
        ok: true,
        welcomeGems: 100,
        referralGems: 0,
      };
    }

    return {
      ok: true,
      welcomeGems: 0,
      referralGems: 0,
    };
  }

  // If we have a wallet, use the wallet-scoped RPC.
  if (wallet) {
    setWalletHeader(wallet);
    const { data, error } = await supabase.rpc(
      'claim_login_rewards',
      {
        p_wallet: wallet,
        p_referral_code: referralCode.trim().toUpperCase(),
      },
    );

    if (error) {
      console.error('[playerApi] claimLoginRewards error:', error.message);
      return { ok: false, welcomeGems: 0, referralGems: 0 };
    }

    const result = (data ?? {}) as {
      ok?: boolean;
      welcomeGems?: number;
      referralGems?: number;
    };

    return {
      ok: !!result.ok,
      welcomeGems: Number(result.welcomeGems ?? 0),
      referralGems: Number(result.referralGems ?? 0),
    };
  }

  // No wallet — use the name-based RPC if a name is known.
  if (playerName) {
    const { data, error } = await supabase.rpc(
      'claim_login_rewards_by_name',
      {
        p_player_name: playerName,
        p_referral_code: referralCode.trim().toUpperCase(),
      },
    );

    if (error) {
      console.error('[playerApi] claimLoginRewards (name) error:', error.message);
      return { ok: false, welcomeGems: 0, referralGems: 0 };
    }

    const result = (data ?? {}) as {
      ok?: boolean;
      welcomeGems?: number;
      referralGems?: number;
    };

    return {
      ok: !!result.ok,
      welcomeGems: Number(result.welcomeGems ?? 0),
      referralGems: Number(result.referralGems ?? 0),
    };
  }

  // No wallet and no name — grant welcome gems in-memory for dev.
  if (!fallbackWelcomeGivenThisSession) {
    fallbackWelcomeGivenThisSession = true;
    return { ok: true, welcomeGems: 100, referralGems: 0 };
  }

  return { ok: true, welcomeGems: 0, referralGems: 0 };
}

let fallbackWelcomeGivenThisSession = false;

// ============================================================================
// MIGRATE ECONOMY TO WALLET
// Copies the current player's currencies / VIP (eco_state) onto a new wallet
// address. Used when the player connects a TON wallet so gems/coins/items stay
// associated with the name + wallet instead of the old guest identity.
// ============================================================================

export async function migrateEconomyToWallet(
  newWallet: string,
): Promise<void> {
  const oldWallet = activeWallet();

  if (
    !isSupabaseConfigured ||
    !supabase ||
    !oldWallet ||
    newWallet === oldWallet
  ) {
    return;
  }

  try {
    // Read the old wallet's economy state (with its own RLS header).
    setWalletHeader(oldWallet);
    const { data: oldData, error: readError } = await supabase
      .from('players')
      .select('eco_state, referral_code, referred_by, welcome_claimed')
      .eq('wallet_address', oldWallet)
      .maybeSingle();

    if (readError || !oldData) {
      return;
    }

    // Ensure the destination player row exists.
    setWalletHeader(newWallet);
    const { data: newData } = await supabase
      .from('players')
      .select('id')
      .eq('wallet_address', newWallet)
      .maybeSingle();

    if (!newData) {
      await supabase
        .from('players')
        .insert({
          id: `player-${newWallet}`,
          wallet_address: newWallet,
          username: 'Orion Player',
          status: 'in-game',
        });
    }

    // Write the same economy state (and referral info) onto the new wallet.
    setWalletHeader(newWallet);
    await supabase
      .from('players')
      .update({
        eco_state: (oldData as { eco_state?: unknown }).eco_state ?? {},
        referral_code: (oldData as { referral_code?: string | null }).referral_code ?? null,
        referred_by: (oldData as { referred_by?: string | null }).referred_by ?? null,
        welcome_claimed: !!(
          (oldData as { welcome_claimed?: boolean }).welcome_claimed
        ),
      })
      .eq('wallet_address', newWallet);
  } catch (err) {
    console.error('[playerApi] migrateEconomyToWallet error:', err);
  }
}

// ============================================================================
// USERNAME
// ============================================================================

/**
 * Persists the chosen player name in the players row (Supabase). The progress
 * of the account is tied to that name, so it travels with the player.
 */
export async function setPlayerUsername(
  name: string,
): Promise<boolean> {
  const wallet = activeWallet();
  const cleaned = name.trim().slice(0, 20);

  if (!cleaned) {
    return false;
  }

  if (!isSupabaseConfigured || !supabase || !wallet) {
    // Keep the name in memory so the UI still reflects it during dev.
    const state = useGameStore.getState();
    if (state.playerProfile) {
      useGameStore.setState({
        playerProfile: {
          ...state.playerProfile,
          username: cleaned,
        },
      });
    }

    return true;
  }

  setWalletHeader(wallet);

  const { error } = await supabase
    .from('players')
    .update({ username: cleaned })
    .eq('wallet_address', wallet);

  if (error) {
    console.error('[playerApi] setPlayerUsername error:', error.message);
    return false;
  }

  const state = useGameStore.getState();
  if (state.playerProfile) {
    useGameStore.setState({
      playerProfile: {
        ...state.playerProfile,
        username: cleaned,
      },
    });
  }

  return true;
}

/**
 * Alias so callers can use `setPlayerName` (more natural in the UI).
 */
export const setPlayerName = setPlayerUsername;

// ============================================================================
// LOAD GAME BY NAME
// ============================================================================
/**
 * Attempts to load a previously saved game (from Supabase or local
 * storage) associated with the given player name. The caller (GameWorld)
 * handles applying the loaded state into the game store.
 */
export async function loadGameByName(name: string): Promise<boolean> {
  return useGameStore.getState().loadGameByName(name);
}
