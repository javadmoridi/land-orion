import { create } from 'zustand';
import type { BackendSavePayload, GameState, WalletSession } from '../types';
import { createPlayerProfile } from '../player/playerService';
import { createInventoryItem } from '../inventory/inventoryService';
import { loadPlayerData, savePlayerData } from '../backend/supabaseService';

interface GameStoreState {
  wallet: WalletSession | null;
  isConnected: boolean;
  playerProfile: ReturnType<typeof createPlayerProfile> | null;
  gameState: GameState | null;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: string | null;
  connectWallet: (session: WalletSession) => Promise<void>;
  disconnectWallet: () => void;
  saveGame: () => Promise<void>;
  loadGame: (playerId: string) => Promise<void>;
}

const initialGameState: GameState = {
  playerId: 'player-template',
  progress: {
    completedMissions: [],
    currentMissionId: 'intro-mission',
    lastAction: 'joined-land-orion',
  },
  inventory: [createInventoryItem('starter-tool', 'Starter Tool')],
  resources: {
    wood: 100,
    stone: 50,
  },
  currency: {
    ton: 100,
  },
  status: 'in-game',
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  wallet: null,
  isConnected: false,
  playerProfile: null,
  gameState: initialGameState,
  isSaving: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  connectWallet: async (session) => {
    const profile = createPlayerProfile(session.address);
    set({ wallet: session, isConnected: true, playerProfile: profile, gameState: { ...initialGameState, playerId: profile.id, status: 'in-game' } });
    await get().loadGame(profile.id);
  },
  disconnectWallet: () => {
    set({ wallet: null, isConnected: false, playerProfile: null, gameState: initialGameState, saveStatus: 'idle', lastSavedAt: null });
  },
  saveGame: async () => {
    const { wallet, playerProfile, gameState } = get();
    if (!wallet || !playerProfile || !gameState) return;

    set({ isSaving: true, saveStatus: 'saving' });
    const payload: BackendSavePayload = {
      player: { ...playerProfile, lastSeenAt: new Date().toISOString() },
      gameState: { ...gameState, status: 'in-game' },
      land: playerProfile.land,
      savedAt: new Date().toISOString(),
    };

    try {
      await savePlayerData(payload);
      set({ isSaving: false, saveStatus: 'saved', lastSavedAt: payload.savedAt });
    } catch {
      set({ isSaving: false, saveStatus: 'error' });
    }
  },
  loadGame: async (playerId) => {
    const loaded = await loadPlayerData(playerId);
    if (!loaded) return;
    set({
      playerProfile: loaded.player,
      gameState: loaded.gameState,
      lastSavedAt: loaded.savedAt,
      saveStatus: 'saved',
    });
  },
}));
