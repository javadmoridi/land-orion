import {
  supabase,
  setWalletHeader,
  isSupabaseConfigured,
} from '../backend/supabaseClient';

import { useGameStore } from '../game/useGameStore';

// ============================================================================
// Player Economy API
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

  // Normal welcome reward
  welcomeGems: number;

  // Referral signup reward for the NEW PLAYER
  referralGems: number;
  referralTokens: number;
  referralCoins: number;
}

const EMPTY_ECO: PlayerEcoState = {
  gems: 0,
  resources: {},
  claimedQuestIds: [],
  vip: null,
};

// ============================================================================
// ACTIVE WALLET
// ============================================================================

export function activeWallet(): string | null {
  const state = useGameStore.getState();

  return (
    state.playerProfile?.walletAddress ??
    state.wallet?.address ??
    null
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
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
    const out: Record<string, unknown> = {
      ...base,
    };

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

// ============================================================================
// GET PLAYER ECONOMY
// ============================================================================

export async function getPlayerEco(): Promise<PlayerEcoState | null> {
  const wallet = activeWallet();

  if (
    !isSupabaseConfigured ||
    !supabase ||
    !wallet
  ) {
    return null;
  }

  setWalletHeader(wallet);

  const { data, error } = await supabase
    .from('players')
    .select('eco_state')
    .eq('wallet_address', wallet)
    .maybeSingle();

  if (error) {
    console.error(
      '[playerApi] getPlayerEco error:',
      error.message,
    );

    return null;
  }

  if (!data) {
    return null;
  }

  const raw = (
    data as {
      eco_state?: unknown;
    }
  ).eco_state;

  if (
    !raw ||
    !isPlainObject(raw)
  ) {
    return null;
  }

  const eco =
    raw as Partial<PlayerEcoState>;

  return {
    gems:
      typeof eco.gems === 'number'
        ? eco.gems
        : 0,

    resources:
      isPlainObject(eco.resources)
        ? {
            ...(eco.resources as Record<
              string,
              number
            >),
          }
        : {},

    claimedQuestIds:
      Array.isArray(
        eco.claimedQuestIds,
      )
        ? (eco.claimedQuestIds as string[])
        : [],

    vip:
      (eco.vip as
        | EconomyVipState
        | undefined) ?? null,
  };
}

// ============================================================================
// PATCH PLAYER ECONOMY
// ============================================================================

export async function patchPlayerEco(
  partial: Partial<PlayerEcoState>,
): Promise<void> {
  const wallet = activeWallet();

  if (
    !isSupabaseConfigured ||
    !supabase ||
    !wallet
  ) {
    return;
  }

  const current =
    (await getPlayerEco()) ??
    EMPTY_ECO;

  const next =
    mergeEconomy(
      current,
      partial,
    ) as PlayerEcoState;

  setWalletHeader(wallet);

  const { error } = await supabase
    .from('players')
    .update({
      eco_state: next,
    })
    .eq(
      'wallet_address',
      wallet,
    );

  if (error) {
    console.error(
      '[playerApi] patchPlayerEco error:',
      error.message,
    );
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
    code +=
      alphabet[
        Math.floor(
          Math.random() *
            alphabet.length,
        )
      ];
  }

  return code;
}

// ============================================================================
// GET MY REFERRAL CODE
// ============================================================================

export async function getMyReferralCode(): Promise<string | null> {
  const wallet = activeWallet();

  if (
    !isSupabaseConfigured ||
    !supabase ||
    !wallet
  ) {
    return null;
  }

  setWalletHeader(wallet);

  const { data, error } = await supabase
    .from('players')
    .select('referral_code')
    .eq(
      'wallet_address',
      wallet,
    )
    .maybeSingle();

  if (error) {
    console.error(
      '[playerApi] getMyReferralCode error:',
      error.message,
    );

    return null;
  }

  const existing = (
    data as {
      referral_code?:
        | string
        | null;
    }
  )?.referral_code;

  if (existing) {
    return existing;
  }

  const code =
    generateReferralCode();

  setWalletHeader(wallet);

  const {
    error: updateError,
  } = await supabase
    .from('players')
    .update({
      referral_code: code,
    })
    .eq(
      'wallet_address',
      wallet,
    );

  if (updateError) {
    console.error(
      '[playerApi] set referral code error:',
      updateError.message,
    );

    return null;
  }

  return code;
}

// ============================================================================
// GET REFERRAL CODE FROM URL
// ============================================================================

export function getReferralCodeFromUrl(): string {
  if (
    typeof window ===
    'undefined'
  ) {
    return '';
  }

  const params =
    new URLSearchParams(
      window.location.search,
    );

  return (
    params
      .get('ref')
      ?.trim()
      .toUpperCase() ?? ''
  );
}

// ============================================================================
// LOGIN / REFERRAL REWARDS
//
// Normal player:
//   +100 Gems
//
// Player joining through referral:
//   +100 Gems welcome
//   +100 Gems referral
//   +300 Tokens
//   +2000 Coins
//
// Referral reward is given to the NEW PLAYER.
// Each player can use a referral only once.
// ============================================================================

export async function claimLoginRewards(
  referralCode: string,
): Promise<LoginRewardResult> {
  const wallet =
    activeWallet();

  const playerName =
    useGameStore.getState()
      .playerProfile?.username ??
    '';

  const cleanReferralCode =
    referralCode
      .trim()
      .toUpperCase();

  // ========================================================================
  // DEV FALLBACK
  // ========================================================================

  if (
    !isSupabaseConfigured ||
    !supabase
  ) {
    if (
      !fallbackWelcomeGivenThisSession
    ) {
      fallbackWelcomeGivenThisSession =
        true;

      if (
        cleanReferralCode &&
        cleanReferralCode !==
          playerName
      ) {
        return {
          ok: true,

          welcomeGems: 100,

          referralGems: 100,

          referralTokens: 300,

          referralCoins: 2000,
        };
      }

      return {
        ok: true,

        welcomeGems: 100,

        referralGems: 0,

        referralTokens: 0,

        referralCoins: 0,
      };
    }

    return {
      ok: true,

      welcomeGems: 0,

      referralGems: 0,

      referralTokens: 0,

      referralCoins: 0,
    };
  }

  // ========================================================================
  // WALLET LOGIN
  // ========================================================================

  if (wallet) {
    setWalletHeader(wallet);

    const {
      data,
      error,
    } = await supabase.rpc(
      'claim_login_rewards',
      {
        p_wallet: wallet,

        p_referral_code:
          cleanReferralCode,
      },
    );

    if (error) {
      console.error(
        '[playerApi] claimLoginRewards error:',
        error.message,
      );

      return {
        ok: false,

        welcomeGems: 0,

        referralGems: 0,

        referralTokens: 0,

        referralCoins: 0,
      };
    }

    const result =
      (data ?? {}) as {
        ok?: boolean;

        welcomeGems?: number;

        referralGems?: number;

        referralTokens?: number;

        referralCoins?: number;
      };

    return {
      ok: !!result.ok,

      welcomeGems:
        Number(
          result.welcomeGems ??
            0,
        ),

      referralGems:
        Number(
          result.referralGems ??
            0,
        ),

      referralTokens:
        Number(
          result.referralTokens ??
            0,
        ),

      referralCoins:
        Number(
          result.referralCoins ??
            0,
        ),
    };
  }

  // ========================================================================
  // NAME-BASED LOGIN
  // ========================================================================

  if (playerName) {
    const {
      data,
      error,
    } = await supabase.rpc(
      'claim_login_rewards_by_name',
      {
        p_player_name:
          playerName,

        p_referral_code:
          cleanReferralCode,
      },
    );

    if (error) {
      console.error(
        '[playerApi] claimLoginRewards (name) error:',
        error.message,
      );

      return {
        ok: false,

        welcomeGems: 0,

        referralGems: 0,

        referralTokens: 0,

        referralCoins: 0,
      };
    }

    const result =
      (data ?? {}) as {
        ok?: boolean;

        welcomeGems?: number;

        referralGems?: number;

        referralTokens?: number;

        referralCoins?: number;
      };

    return {
      ok: !!result.ok,

      welcomeGems:
        Number(
          result.welcomeGems ??
            0,
        ),

      referralGems:
        Number(
          result.referralGems ??
            0,
        ),

      referralTokens:
        Number(
          result.referralTokens ??
            0,
        ),

      referralCoins:
        Number(
          result.referralCoins ??
            0,
        ),
    };
  }

  // ========================================================================
  // NO WALLET / NO NAME
  // ========================================================================

  if (
    !fallbackWelcomeGivenThisSession
  ) {
    fallbackWelcomeGivenThisSession =
      true;

    return {
      ok: true,

      welcomeGems: 100,

      referralGems: 0,

      referralTokens: 0,

      referralCoins: 0,
    };
  }

  return {
    ok: true,

    welcomeGems: 0,

    referralGems: 0,

    referralTokens: 0,

    referralCoins: 0,
  };
}

let fallbackWelcomeGivenThisSession =
  false;

// ============================================================================
// MIGRATE ECONOMY TO WALLET
// ============================================================================

export async function migrateEconomyToWallet(
  newWallet: string,
): Promise<void> {
  const oldWallet =
    activeWallet();

  if (
    !isSupabaseConfigured ||
    !supabase ||
    !oldWallet ||
    newWallet === oldWallet
  ) {
    return;
  }

  try {
    // Read old wallet economy
    setWalletHeader(
      oldWallet,
    );

    const {
      data: oldData,
      error: readError,
    } = await supabase
      .from('players')
      .select(
        'eco_state, referral_code, referred_by, welcome_claimed',
      )
      .eq(
        'wallet_address',
        oldWallet,
      )
      .maybeSingle();

    if (
      readError ||
      !oldData
    ) {
      return;
    }

    // Check destination player
    setWalletHeader(
      newWallet,
    );

    const {
      data: newData,
    } = await supabase
      .from('players')
      .select('id')
      .eq(
        'wallet_address',
        newWallet,
      )
      .maybeSingle();

    // Create destination player
    if (!newData) {
      await supabase
        .from('players')
        .insert({
          id: `player-${newWallet}`,

          wallet_address:
            newWallet,

          username:
            'Orion Player',

          status:
            'in-game',
        });
    }

    // Copy economy and referral data
    setWalletHeader(
      newWallet,
    );

    await supabase
      .from('players')
      .update({
        eco_state:
          (
            oldData as {
              eco_state?:
                unknown;
            }
          ).eco_state ??
          {},

        referral_code:
          (
            oldData as {
              referral_code?:
                | string
                | null;
            }
          ).referral_code ??
          null,

        referred_by:
          (
            oldData as {
              referred_by?:
                | string
                | null;
            }
          ).referred_by ??
          null,

        welcome_claimed:
          !!(
            (
              oldData as {
                welcome_claimed?:
                  boolean;
              }
            )
              .welcome_claimed
          ),
      })
      .eq(
        'wallet_address',
        newWallet,
      );
  } catch (err) {
    console.error(
      '[playerApi] migrateEconomyToWallet error:',
      err,
    );
  }
}

// ============================================================================
// USERNAME
// ============================================================================

export async function setPlayerUsername(
  name: string,
): Promise<boolean> {
  const wallet =
    activeWallet();

  const cleaned =
    name
      .trim()
      .slice(0, 20);

  if (!cleaned) {
    return false;
  }

  // DEV
  if (
    !isSupabaseConfigured ||
    !supabase ||
    !wallet
  ) {
    const state =
      useGameStore.getState();

    if (
      state.playerProfile
    ) {
      useGameStore.setState({
        playerProfile: {
          ...state.playerProfile,

          username:
            cleaned,
        },
      });
    }

    return true;
  }

  setWalletHeader(wallet);

  const {
    error,
  } = await supabase
    .from('players')
    .update({
      username:
        cleaned,
    })
    .eq(
      'wallet_address',
      wallet,
    );

  if (error) {
    console.error(
      '[playerApi] setPlayerUsername error:',
      error.message,
    );

    return false;
  }

  const state =
    useGameStore.getState();

  if (
    state.playerProfile
  ) {
    useGameStore.setState({
      playerProfile: {
        ...state.playerProfile,

        username:
          cleaned,
      },
    });
  }

  return true;
}

// ============================================================================
// ALIAS
// ============================================================================

export const setPlayerName =
  setPlayerUsername;

// ============================================================================
// LOAD GAME BY NAME
// ============================================================================

export async function loadGameByName(
  name: string,
): Promise<boolean> {
  return useGameStore
    .getState()
    .loadGameByName(name);
}