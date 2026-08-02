import { create } from 'zustand';
import type { BackendSavePayload, GameState, PlayerProfile, WalletSession } from '../types';
import { findPlayerByWallet, createNewPlayer, loadPlayerData, savePlayerData } from '../backend/supabaseService';
import type { ConnectionStatus } from '../wallet/walletService';

interface GameStoreState {
  wallet: WalletSession | null;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  playerProfile: PlayerProfile | null;
  gameState: GameState | null;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: string | null;
  error: string | null;
  connectWallet: (session: WalletSession) => Promise<void>;
  disconnectWallet: () => void;
  saveGame: () => Promise<void>;
  loadGame: (playerId: string) => Promise<void>;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  wallet: null,
  connectionStatus: 'disconnected',
  isConnected: false,
  playerProfile: null,
  gameState: null,
  isSaving: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  error: null,
  connectWallet: async (session) => {
    set({
      wallet: session,
      connectionStatus: 'connecting',
      error: null,
    });

    try {
      // 1) Search for existing player by wallet_address in Supabase.
      const existingPlayer = await findPlayerByWallet(session.address);

      if (existingPlayer) {
        // 2a) Existing player -> load real saved game data from Supabase.
        set({ playerProfile: existingPlayer, connectionStatus: 'connected', isConnected: true });
        await get().loadGame(existingPlayer.id);
        return;
      }

      // 2b) New wallet -> create a real initial account in Supabase.
      const newProfile = await createNewPlayer(session.address);
      set({
        playerProfile: newProfile,
        gameState: null,
        connectionStatus: 'connected',
        isConnected: true,
      });

      // Persist the initial save snapshot (upsert into saves table).
      const now = new Date().toISOString();
      await savePlayerData({
        player: { ...newProfile, lastSeenAt: now },
        gameState: {
          playerId: newProfile.id,
          progress: { completedMissions: [], currentMissionId: 'intro-mission', lastAction: 'joined-land-orion' },
          inventory: [],
          resources: {},
          currency: {},
          status: 'in-game',
        },
        land: [],
        savedAt: now,
      });
      set({ saveStatus: 'saved', lastSavedAt: now });
    } catch (err) {
      console.error('[useGameStore] connectWallet error:', err);
      set({
        connectionStatus: 'disconnected',
        isConnected: false,
        error: err instanceof Error ? err.message : 'Failed to connect wallet. Please try again.',
      });
    }
  },
  disconnectWallet: () => {
    set({
      wallet: null,
      connectionStatus: 'disconnected',
      isConnected: false,
      playerProfile: null,
      gameState: null,
      saveStatus: 'idle',
      lastSavedAt: null,
      error: null,
    });
  },
  saveGame: async () => {
    const { wallet, playerProfile, gameState } = get();
    if (!wallet || !playerProfile) return;

    const currentState = gameState ?? {
      playerId: playerProfile.id,
      progress: { completedMissions: [], currentMissionId: 'intro-mission', lastAction: 'in-game' },
      inventory: playerProfile.inventory,
      resources: {},
      currency: {},
      status: 'in-game' as const,
    };

    set({ isSaving: true, saveStatus: 'saving' });
    const payload: BackendSavePayload = {
      player: { ...playerProfile, lastSeenAt: new Date().toISOString() },
      gameState: { ...currentState, status: 'in-game' },
      land: playerProfile.land,
      savedAt: new Date().toISOString(),
    };

    try {
      await savePlayerData(payload);
      set({ isSaving: false, saveStatus: 'saved', lastSavedAt: payload.savedAt });
    } catch (err) {
      console.error('[useGameStore] saveGame error:', err);
      set({
        isSaving: false,
        saveStatus: 'error',
        error: err instanceof Error ? err.message : 'Failed to save game.',
      });
    }
  },
  loadGame: async (playerId) => {
    try {
      const loaded = await loadPlayerData(playerId);
      if (!loaded) return;
      set({
        playerProfile: loaded.player,
        gameState: loaded.gameState,
        lastSavedAt: loaded.savedAt,
        saveStatus: 'saved',
      });
    } catch (err) {
      console.error('[useGameStore] loadGame error:', err);
      set({ error: err instanceof Error ? err.message : 'Failed to load game data.' });
    }
  },
}));