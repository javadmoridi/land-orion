import type {
  BackendSavePayload,
  GameState,
  LandPlot,
  PlayerProfile,
} from '../types';

import {
  supabase,
  isSupabaseConfigured,
  setWalletHeader,
} from './supabaseClient';

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
    );
    this.name = 'SupabaseNotConfiguredError';
  }
}

// ============================================================
// LOCAL FALLBACK
// ============================================================

const FALLBACK_STORAGE_KEY = 'land-orion-save';

function warnIfNotConfigured(): void {
  if (!isSupabaseConfigured) {
    console.warn(
      '[land-orion] Supabase is NOT configured. Using LOCAL fallback storage.',
    );
  }
}

function readFallback(): BackendSavePayload | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(
    FALLBACK_STORAGE_KEY,
  );

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(
      raw,
    ) as BackendSavePayload;
  } catch {
    return null;
  }
}

function writeFallback(
  payload: BackendSavePayload,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    FALLBACK_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

// ============================================================
// GAME STATE
// ============================================================

const FRESH_GAME_STATE = (
  playerId: string,
): GameState => ({
  playerId,

  progress: {
    completedMissions: [],
    currentMissionId: 'intro-mission',
    lastAction: 'joined-land-orion',
  },

  inventory: [],
  resources: {},
  currency: {},
  status: 'in-game',
});

// ============================================================
// STORED GAME DATA
// ============================================================

interface StoredGameData {
  player?: Partial<PlayerProfile>;
  gameState?: GameState;
  land?: LandPlot[];
  savedAt?: string;

  [key: string]: unknown;
}

// ============================================================
// DATABASE ROW -> PLAYER PROFILE
// ============================================================

function mapRowToProfile(
  row: any,
  gameData: StoredGameData = {},
): PlayerProfile {
  const storedPlayer =
    gameData.player ?? {};

  const gameState =
    gameData.gameState;

  const inventory =
    storedPlayer.inventory ??
    gameState?.inventory ??
    [];

  const land =
    storedPlayer.land ??
    gameData.land ??
    [];

  return {
    ...storedPlayer,

    id: String(row.id),

    walletAddress:
      row.wallet ??
      storedPlayer.walletAddress ??
      '',

    username:
      storedPlayer.username ??
      `Player-${String(
        row.wallet ?? '',
      ).slice(0, 6)}`,

    level:
      typeof row.level === 'number'
        ? row.level
        : typeof storedPlayer.level === 'number'
          ? storedPlayer.level
          : 1,

    experience:
      typeof storedPlayer.experience === 'number'
        ? storedPlayer.experience
        : 0,

    status:
      storedPlayer.status ??
      'in-game',

    inventory,

    land,

    createdAt:
      row.created_at ??
      storedPlayer.createdAt ??
      new Date().toISOString(),

    lastSeenAt:
      storedPlayer.lastSeenAt ??
      row.created_at ??
      new Date().toISOString(),
  } as PlayerProfile;
}

// ============================================================
// FIND PLAYER BY WALLET
// ============================================================

export async function findPlayerByWallet(
  walletAddress: string,
): Promise<PlayerProfile | null> {
  if (!isSupabaseConfigured || !supabase) {
    warnIfNotConfigured();

    const stored =
      readFallback();

    if (
      stored &&
      stored.player.walletAddress ===
        walletAddress
    ) {
      return stored.player;
    }

    return null;
  }

  setWalletHeader(
    walletAddress,
  );

  const {
    data,
    error,
  } = await supabase
    .from('players')
    .select(
      'id, created_at, wallet, level, game_data',
    )
    .eq(
      'wallet',
      walletAddress,
    )
    .maybeSingle();

  if (error) {
    console.error(
      '[supabase] findPlayerByWallet:',
      error.message,
    );

    throw error;
  }

  if (!data) {
    return null;
  }

  const gameData =
    (data.game_data as StoredGameData) ??
    {};

  return mapRowToProfile(
    data,
    gameData,
  );
}

// ============================================================
// CREATE NEW PLAYER
// ============================================================

export async function createNewPlayer(
  walletAddress: string,
): Promise<PlayerProfile> {
  const now =
    new Date().toISOString();

  const id =
    `player-${walletAddress}`;

  const profile:
    PlayerProfile = {
    id,
    walletAddress,
    username:
      `Player-${walletAddress.slice(0, 6)}`,
    level: 1,
    experience: 0,
    status: 'in-game',
    inventory: [],
    land: [],
    createdAt: now,
    lastSeenAt: now,
  };

  const gameState =
    FRESH_GAME_STATE(id);

  const gameData:
    StoredGameData = {
    player: profile,

    gameState,

    land: [],

    savedAt: now,
  };

  // ----------------------------------------------------------
  // LOCAL
  // ----------------------------------------------------------

  if (!isSupabaseConfigured || !supabase) {
    warnIfNotConfigured();

    writeFallback({
      player: profile,
      gameState,
      land: [],
      savedAt: now,
    });

    return profile;
  }

  // ----------------------------------------------------------
  // SUPABASE
  // ----------------------------------------------------------

  setWalletHeader(
    walletAddress,
  );

  const {
    data,
    error,
  } = await supabase
    .from('players')
    .insert({
      wallet:
        walletAddress,

      level: 1,

      game_data:
        gameData,
    })
    .select(
      'id, created_at, wallet, level, game_data',
    )
    .single();

  if (error) {
    console.error(
      '[supabase] createNewPlayer:',
      error.message,
    );

    throw error;
  }

  const savedGameData =
    (data.game_data as StoredGameData) ??
    gameData;

  const savedProfile =
    mapRowToProfile(
      data,
      savedGameData,
    );

  const fixedGameState:
    GameState = {
    ...gameState,

    playerId:
      savedProfile.id,
  };

  const finalGameData:
    StoredGameData = {
    ...savedGameData,

    player:
      savedProfile,

    gameState:
      fixedGameState,

    land:
      savedGameData.land ??
      [],

    savedAt:
      now,
  };

  const {
    error: updateError,
  } = await supabase
    .from('players')
    .update({
      game_data:
        finalGameData,
    })
    .eq(
      'id',
      data.id,
    );

  if (updateError) {
    console.error(
      '[supabase] createNewPlayer update:',
      updateError.message,
    );

    throw updateError;
  }

  return savedProfile;
}

// ============================================================
// SAVE EVERYTHING
// ============================================================

export async function savePlayerData(
  payload: BackendSavePayload,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    warnIfNotConfigured();

    writeFallback(payload);

    return;
  }

  const wallet =
    payload.player.walletAddress;

  if (!wallet) {
    throw new Error(
      'Cannot save player without wallet.',
    );
  }

  setWalletHeader(
    wallet,
  );

  const now =
    payload.savedAt ||
    new Date().toISOString();

  // ----------------------------------------------------------
  // Read existing data first.
  // This prevents economy / quests / other stored data
  // from being deleted accidentally.
  // ----------------------------------------------------------

  const {
    data: existing,
    error: readError,
  } = await supabase
    .from('players')
    .select(
      'id, game_data',
    )
    .eq(
      'wallet',
      wallet,
    )
    .maybeSingle();

  if (readError) {
    console.error(
      '[supabase] save read error:',
      readError.message,
    );

    throw readError;
  }

  const previousGameData:
    StoredGameData =
      (existing?.game_data as StoredGameData) ??
      {};

  // ----------------------------------------------------------
  // IMPORTANT:
  // Inventory is kept in BOTH places used by the project:
  //
  // player.inventory
  // gameState.inventory
  //
  // This prevents items from disappearing when one system
  // reads the player profile and another reads gameState.
  // ----------------------------------------------------------

  const inventory =
    payload.gameState?.inventory ??
    payload.player.inventory ??
    [];

  const playerToSave:
    PlayerProfile = {
    ...payload.player,

    inventory,

    land:
      payload.land ??
      payload.player.land ??
      [],

    lastSeenAt:
      now,
  };

  const gameStateToSave:
    GameState = {
    ...payload.gameState,

    inventory,
  };

  const mergedGameData:
    StoredGameData = {
    // Preserve everything already stored.
    ...previousGameData,

    // Save player.
    player:
      playerToSave,

    // Save COMPLETE game state.
    gameState:
      gameStateToSave,

    // Save land.
    land:
      payload.land ??
      playerToSave.land ??
      [],

    // Save timestamp.
    savedAt:
      now,
  };

  // ----------------------------------------------------------
  // INSERT
  // ----------------------------------------------------------

  if (!existing) {
    const {
      error,
    } = await supabase
      .from('players')
      .insert({
        wallet,

        level:
          playerToSave.level ?? 1,

        game_data:
          mergedGameData,
      });

    if (error) {
      console.error(
        '[supabase] save insert error:',
        error.message,
      );

      throw error;
    }

    return;
  }

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------

  const {
    error,
  } = await supabase
    .from('players')
    .update({
      wallet,

      level:
        playerToSave.level ?? 1,

      game_data:
        mergedGameData,
    })
    .eq(
      'id',
      existing.id,
    );

  if (error) {
    console.error(
      '[supabase] save update error:',
      error.message,
    );

    throw error;
  }
}

// ============================================================
// LOAD EVERYTHING
// ============================================================

export async function loadPlayerData(
  playerId: string,
): Promise<BackendSavePayload | null> {
  // ----------------------------------------------------------
  // LOCAL
  // ----------------------------------------------------------

  if (!isSupabaseConfigured || !supabase) {
    warnIfNotConfigured();

    const stored =
      readFallback();

    if (
      stored &&
      stored.player.id ===
        playerId
    ) {
      return stored;
    }

    return null;
  }

  // ----------------------------------------------------------
  // SUPABASE
  // ----------------------------------------------------------

  const {
    data,
    error,
  } = await supabase
    .from('players')
    .select(
      'id, created_at, wallet, level, game_data',
    )
    .eq(
      'id',
      playerId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      '[supabase] loadPlayerData:',
      error.message,
    );

    throw error;
  }

  if (!data) {
    return null;
  }

  const gameData:
    StoredGameData =
    (data.game_data as StoredGameData) ??
    {};

  const profile =
    mapRowToProfile(
      data,
      gameData,
    );

  const savedGameState =
    gameData.gameState ??
    FRESH_GAME_STATE(
      profile.id,
    );

  // ----------------------------------------------------------
  // Make sure inventory survives regardless of which
  // location the older save used.
  // ----------------------------------------------------------

  const inventory =
    profile.inventory?.length
      ? profile.inventory
      : savedGameState.inventory ?? [];

  const gameState:
    GameState = {
    ...savedGameState,

    playerId:
      profile.id,

    inventory,
  };

  const land =
    gameData.land ??
    profile.land ??
    [];

  const loadedPlayer:
    PlayerProfile = {
    ...profile,

    inventory,

    land,
  };

  return {
    player:
      loadedPlayer,

    gameState,

    land,

    savedAt:
      gameData.savedAt ??
      profile.lastSeenAt ??
      data.created_at,
  };
}