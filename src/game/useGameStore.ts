import { create } from 'zustand';
import type { BackendSavePayload, GameState, PlayerProfile, WalletSession } from '../types';
import { findPlayerByWallet, createNewPlayer, loadPlayerData, savePlayerData } from '../backend/supabaseService';
import type { ConnectionStatus } from '../wallet/walletService';

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface WorldTile {
  id: string;
  x: number;
  y: number;
  type: 'grass' | 'tree' | 'rock' | 'farm' | 'water';
  harvestable?: boolean;
  harvested?: boolean;
}

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
  // World state
  playerPosition: PlayerPosition;
  worldTiles: WorldTile[];
  selectedTile: WorldTile | null;
  // Actions
  connectWallet: (session: WalletSession) => Promise<void>;
  disconnectWallet: () => void;
  saveGame: () => Promise<void>;
  loadGame: (playerId: string) => Promise<void>;
  movePlayer: (dx: number, dy: number) => void;
  interactWithTile: (tile: WorldTile) => void;
  selectTile: (tile: WorldTile | null) => void;
}

const GRID_SIZE = 10;

function createWorldTiles(): WorldTile[] {
  const tiles: WorldTile[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let type: WorldTile['type'] = 'grass';
      // Environment elements
      if ((x === 2 && y === 2) || (x === 7 && y === 3) || (x === 3 && y === 7)) type = 'tree';
      if ((x === 8 && y === 8) || (x === 1 && y === 8)) type = 'rock';
      if ((x === 4 && y === 4) || (x === 5 && y === 4) || (x === 4 && y === 5)) type = 'farm';
      if (x === 0 || y === 0 || x === GRID_SIZE - 1 || y === GRID_SIZE - 1) type = 'water';
      tiles.push({
        id: `tile-${x}-${y}`,
        x,
        y,
        type,
        harvestable: type === 'tree' || type === 'rock' || type === 'farm',
        harvested: false,
      });
    }
  }
  return tiles;
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
  // World state
  playerPosition: { x: 5, y: 5 },
  worldTiles: createWorldTiles(),
  selectedTile: null,
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
      playerPosition: { x: 5, y: 5 },
      selectedTile: null,
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
  movePlayer: (dx, dy) => {
    const { playerPosition, worldTiles } = get();
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    // Boundary check
    if (newX < 1 || newX > 8 || newY < 1 || newY > 8) return;

    // Can't walk on water
    const targetTile = worldTiles.find((t) => t.x === newX && t.y === newY);
    if (targetTile?.type === 'water') return;

    set({ playerPosition: { x: newX, y: newY } });
  },
  interactWithTile: (tile) => {
    const { playerPosition, worldTiles, playerProfile, gameState } = get();

    // Must be adjacent to the tile
    const distance = Math.abs(tile.x - playerPosition.x) + Math.abs(tile.y - playerPosition.y);
    if (distance > 1) return;

    if (!tile.harvestable || tile.harvested) return;

    // Harvest the tile
    const updatedTiles = worldTiles.map((t) =>
      t.id === tile.id ? { ...t, harvested: true } : t,
    );

    // Add resources based on tile type
    const resources = { ...(gameState?.resources ?? {}) };
    if (tile.type === 'tree') {
      resources.wood = (resources.wood ?? 0) + 5;
    } else if (tile.type === 'rock') {
      resources.stone = (resources.stone ?? 0) + 3;
    } else if (tile.type === 'farm') {
      resources.food = (resources.food ?? 0) + 10;
    }

    set({
      worldTiles: updatedTiles,
      gameState: gameState
        ? { ...gameState, resources }
        : {
            playerId: playerProfile?.id ?? 'player',
            progress: { completedMissions: [], currentMissionId: 'intro-mission', lastAction: 'harvested' },
            inventory: [],
            resources,
            currency: {},
            status: 'in-game',
          },
    });

    // Auto-save after interaction
    void get().saveGame();
  },
  selectTile: (tile) => {
    set({ selectedTile: tile });
  },
}));