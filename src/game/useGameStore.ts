import { create } from 'zustand';
import type {
  BackendSavePayload,
  GameState,
  InventoryItem,
  PlayerProfile,
  WalletSession,
} from '../types';

import {
  findPlayerByWallet,
  createNewPlayer,
  loadPlayerData,
  savePlayerData,
} from '../backend/supabaseService';

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

  playerPosition: PlayerPosition;
  worldTiles: WorldTile[];
  selectedTile: WorldTile | null;

  connectWallet: (session: WalletSession) => Promise<void>;
  disconnectWallet: () => void;
  saveGame: () => Promise<void>;
  loadGame: (playerId: string) => Promise<void>;

  movePlayer: (dx: number, dy: number) => void;
  interactWithTile: (tile: WorldTile) => void;
  selectTile: (tile: WorldTile | null) => void;
  addToInventory: (item: InventoryItem) => void;
}

const GRID_SIZE = 10;

function createWorldTiles(): WorldTile[] {
  const tiles: WorldTile[] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let type: WorldTile['type'] = 'grass';

      if (
        (x === 2 && y === 2) ||
        (x === 7 && y === 3) ||
        (x === 3 && y === 7)
      ) {
        type = 'tree';
      }

      if (
        (x === 8 && y === 8) ||
        (x === 1 && y === 8)
      ) {
        type = 'rock';
      }

      if (
        (x === 4 && y === 4) ||
        (x === 5 && y === 4) ||
        (x === 4 && y === 5)
      ) {
        type = 'farm';
      }

      if (
        x === 0 ||
        y === 0 ||
        x === GRID_SIZE - 1 ||
        y === GRID_SIZE - 1
      ) {
        type = 'water';
      }

      tiles.push({
        id: `tile-${x}-${y}`,
        x,
        y,
        type,
        harvestable:
          type === 'tree' ||
          type === 'rock' ||
          type === 'farm',
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

  playerPosition: {
    x: 5,
    y: 5,
  },

  worldTiles: createWorldTiles(),

  selectedTile: null,

  connectWallet: async (session) => {
    set({
      wallet: session,
      connectionStatus: 'connecting',
      error: null,
    });

    try {
      console.log('[DEBUG] Finding player:', session.address);

      const existingPlayer =
        await findPlayerByWallet(session.address);

      console.log('[DEBUG] Player result:', existingPlayer);

      if (existingPlayer) {
        set({
          playerProfile: existingPlayer,
          connectionStatus: 'connected',
          isConnected: true,
        });

        console.log('[DEBUG] Loading saved game');

        await get().loadGame(existingPlayer.id);

        console.log('[DEBUG] Load complete');

        return;
      }

      console.log('[DEBUG] Creating new player');

      const newProfile =
        await createNewPlayer(session.address);

      console.log('[DEBUG] New player created:', newProfile);

      set({
        playerProfile: newProfile,
        connectionStatus: 'connected',
        isConnected: true,
      });

      const now = new Date().toISOString();

      await savePlayerData({
        player: {
          ...newProfile,
          lastSeenAt: now,
        },

        gameState: {
          playerId: newProfile.id,
          progress: {
            completedMissions: [],
            currentMissionId: 'intro-mission',
            lastAction: 'joined-land-orion',
          },
          inventory: [],
          resources: {},
          currency: {},
          status: 'in-game',
        },

        land: [],

        savedAt: now,
      });

      set({
        saveStatus: 'saved',
        lastSavedAt: now,
      });

      console.log('[DEBUG] Wallet connection complete');

    } catch (err) {
      console.error('[DEBUG] CONNECT ERROR:', err);

      set({
        playerProfile: null,
        connectionStatus: 'disconnected',
        isConnected: false,
        error:
          err instanceof Error
            ? err.message
            : String(err),
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
      playerPosition: {
        x: 5,
        y: 5,
      },
      selectedTile: null,
    });
  },  saveGame: async () => {
    const {
      wallet,
      playerProfile,
      gameState,
    } = get();

    if (!wallet || !playerProfile) return;

    const currentState =
      gameState ?? {
        playerId: playerProfile.id,

        progress: {
          completedMissions: [],
          currentMissionId: 'intro-mission',
          lastAction: 'in-game',
        },

        inventory: playerProfile.inventory,

        resources: {},

        currency: {},

        status: 'in-game' as const,
      };

    const payload: BackendSavePayload = {
      player: {
        ...playerProfile,
        lastSeenAt: new Date().toISOString(),
      },

      gameState: {
        ...currentState,
        status: 'in-game',
      },

      land: playerProfile.land,

      savedAt: new Date().toISOString(),
    };

    set({
      isSaving: true,
      saveStatus: 'saving',
    });

    try {
      await savePlayerData(payload);

      set({
        isSaving: false,
        saveStatus: 'saved',
        lastSavedAt: payload.savedAt,
      });

    } catch (err) {
      console.error('[Save] ERROR:', err);

      set({
        isSaving: false,
        saveStatus: 'error',
        error:
          err instanceof Error
            ? err.message
            : String(err),
      });
    }
  },


  loadGame: async (playerId) => {
    try {
      console.log('[Game] Loading player:', playerId);

      const loaded =
        await loadPlayerData(playerId);

      if (!loaded) {
        console.warn('[Game] No save found');
        return;
      }

      set({
        playerProfile: loaded.player,
        gameState: loaded.gameState,
        lastSavedAt: loaded.savedAt,
        saveStatus: 'saved',
      });

      console.log('[Game] Load complete');

    } catch (err) {
      console.error('[Load] ERROR:', err);

      set({
        error:
          err instanceof Error
            ? err.message
            : String(err),
      });
    }
  },


  movePlayer: (dx, dy) => {
    const {
      playerPosition,
      worldTiles,
    } = get();

    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    if (
      newX < 1 ||
      newX > 8 ||
      newY < 1 ||
      newY > 8
    ) return;

    const targetTile =
      worldTiles.find(
        (t) =>
          t.x === newX &&
          t.y === newY
      );

    if (targetTile?.type === 'water') return;

    set({
      playerPosition: {
        x: newX,
        y: newY,
      },
    });
  },


  interactWithTile: (tile) => {
    const {
      playerPosition,
      worldTiles,
      playerProfile,
      gameState,
    } = get();

    const distance =
      Math.abs(tile.x - playerPosition.x) +
      Math.abs(tile.y - playerPosition.y);

    if (distance > 1) return;

    if (!tile.harvestable || tile.harvested) return;

    const updatedTiles =
      worldTiles.map((t) =>
        t.id === tile.id
          ? {
              ...t,
              harvested: true,
            }
          : t
      );

    const resources = {
      ...(gameState?.resources ?? {}),
    };

    if (tile.type === 'tree') {
      resources.wood =
        (resources.wood ?? 0) + 5;
    }

    if (tile.type === 'rock') {
      resources.stone =
        (resources.stone ?? 0) + 3;
    }

    if (tile.type === 'farm') {
      resources.food =
        (resources.food ?? 0) + 10;
    }

    set({
      worldTiles: updatedTiles,

      gameState:
        gameState
          ? {
              ...gameState,
              resources,
            }
          : {
              playerId:
                playerProfile?.id ?? 'player',

              progress: {
                completedMissions: [],
                currentMissionId:
                  'intro-mission',
                lastAction:
                  'harvested',
              },

              inventory: [],
              resources,
              currency: {},
              status: 'in-game',
            },
    });

    void get().saveGame();
  },


  selectTile: (tile) => {
    set({
      selectedTile: tile,
    });
  },


  addToInventory: (item) => {
    const {
      gameState,
      playerProfile,
    } = get();

    const inventory =
      gameState?.inventory ??
      playerProfile?.inventory ??
      [];

    const existing =
      inventory.find(
        (i) =>
          i.id === item.id &&
          i.type === item.type
      );

    const next =
      existing
        ? inventory.map((i) =>
            i === existing
              ? {
                  ...i,
                  quantity:
                    i.quantity +
                    item.quantity,
                }
              : i
          )
        : [
            ...inventory,
            item,
          ];

    set({
      gameState:
        gameState
          ? {
              ...gameState,
              inventory: next,
            }
          : {
              playerId:
                playerProfile?.id ?? 'player',

              progress: {
                completedMissions: [],
                currentMissionId:
                  'intro-mission',
                lastAction:
                  'bought-egg',
              },

              inventory: next,
              resources: {},
              currency: {},
              status: 'in-game',
            },
    });

    void get().saveGame();
  },

}));