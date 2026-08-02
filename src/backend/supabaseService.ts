import type { BackendSavePayload, GameState, LandPlot, PlayerProfile } from '../types';
import { supabase, isSupabaseConfigured, setWalletHeader, type PlayerRow, type SaveRow } from './supabaseClient';

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    this.name = 'SupabaseNotConfiguredError';
  }
}

function mapPlayerRowToProfile(row: PlayerRow): PlayerProfile {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    username: row.username,
    level: row.level,
    experience: row.experience,
    status: row.status as PlayerProfile['status'],
    inventory: (row.inventory as PlayerProfile['inventory']) ?? [],
    land: (row.land as LandPlot[]) ?? [],
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
  };
}

function mapProfileToRow(profile: PlayerProfile): Record<string, unknown> {
  return {
    id: profile.id,
    wallet_address: profile.walletAddress,
    username: profile.username,
    level: profile.level,
    experience: profile.experience,
    status: profile.status,
    inventory: profile.inventory,
    land: profile.land,
    last_seen_at: profile.lastSeenAt,
  };
}

function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured || !supabase) {
    throw new SupabaseNotConfiguredError();
  }
}

export async function findPlayerByWallet(walletAddress: string): Promise<PlayerProfile | null> {
  assertSupabaseConfigured();
  if (!supabase) return null;

  // Set the wallet header so RLS matches the correct row.
  setWalletHeader(walletAddress);

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('wallet_address', walletAddress)
    .maybeSingle();

  if (error) {
    console.error('[supabase] findPlayerByWallet error:', error.message);
    throw error;
  }

  if (!data) return null;
  return mapPlayerRowToProfile(data as PlayerRow);
}

const FRESH_GAME_STATE = (playerId: string): GameState => ({
  playerId,
  progress: { completedMissions: [], currentMissionId: 'intro-mission', lastAction: 'joined-land-orion' },
  inventory: [],
  resources: {},
  currency: {},
  status: 'in-game',
});

export async function createNewPlayer(walletAddress: string): Promise<PlayerProfile> {
  assertSupabaseConfigured();
  if (!supabase) throw new SupabaseNotConfiguredError();

  // Set the wallet header so RLS matches the correct row.
  setWalletHeader(walletAddress);

  const id = `player-${walletAddress}`;
  const now = new Date().toISOString();
  const freshState = FRESH_GAME_STATE(id);

  const row: Record<string, unknown> = {
    id,
    wallet_address: walletAddress,
    username: `Player-${walletAddress.slice(0, 6)}`,
    level: 1,
    experience: 0,
    status: 'in-game',
    inventory: [],
    land: [],
    game_state: freshState,
    last_seen_at: now,
  };

  const { data, error } = await supabase
    .from('players')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    console.error('[supabase] createNewPlayer error:', error.message);
    throw error;
  }

  return mapPlayerRowToProfile(data as PlayerRow);
}

export async function savePlayerData(payload: BackendSavePayload): Promise<void> {
  assertSupabaseConfigured();
  if (!supabase) return;

  // Ensure the wallet header matches the player being saved.
  setWalletHeader(payload.player.walletAddress);

  const { error: playerError } = await supabase
    .from('players')
    .update({
      ...mapProfileToRow(payload.player),
      game_state: payload.gameState,
    })
    .eq('id', payload.player.id);

  if (playerError) {
    console.error('[supabase] savePlayerData (players) error:', playerError.message);
    throw playerError;
  }

  const { error: saveError } = await supabase
    .from('saves')
    .upsert(
      {
        player_id: payload.player.id,
        player_data: payload,
        saved_at: payload.savedAt,
      },
      { onConflict: 'player_id' },
    );

  if (saveError) {
    console.error('[supabase] savePlayerData (saves) error:', saveError.message);
    throw saveError;
  }
}

export async function loadPlayerData(playerId: string): Promise<BackendSavePayload | null> {
  assertSupabaseConfigured();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('saves')
    .select('*')
    .eq('player_id', playerId)
    .maybeSingle();

  if (error) {
    console.error('[supabase] loadPlayerData error:', error.message);
    throw error;
  }

  if (!data) {
    const { data: playerRow, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError) {
      console.error('[supabase] loadPlayerData (players) error:', playerError.message);
      throw playerError;
    }

    if (!playerRow) return null;
    const profile = mapPlayerRowToProfile(playerRow as PlayerRow);

    const gameStateFromRow = (playerRow as PlayerRow & { game_state?: unknown }).game_state;
    const gameState = gameStateFromRow
      ? (gameStateFromRow as GameState)
      : FRESH_GAME_STATE(profile.id);

    return {
      player: profile,
      gameState,
      land: profile.land,
      savedAt: profile.lastSeenAt,
    };
  }

  const saveRow = data as SaveRow;
  return saveRow.player_data as BackendSavePayload;
}