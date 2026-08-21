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

import type { WarState } from '../types';

import type { ConnectionStatus } from '../wallet/walletService';
import { createWalletSession } from '../wallet/walletService';

import { migrateEconomyToWallet } from '../economy/playerApi';

import { normalizeFruitInventory } from './seedCatalog';

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface WorldTile {
  id: string;
  x: number;
  y: number;
  type:
    | 'grass'
    | 'tree'
    | 'rock'
    | 'farm'
    | 'water';
  harvestable?: boolean;
  harvested?: boolean;
}

interface LocalGameSave {
  playerProfile: PlayerProfile | null;
  gameState: GameState | null;
  playerPosition: PlayerPosition;
  worldTiles: WorldTile[];
  savedAt: string;
}

// Identical to the guest id used by the entry screen. Each player gets their
// own save key, so every person's progress & items are stored separately.
const GUEST_ID_KEY = 'land-orion-guest-id';

/**
 * LocalStorage key scoped to a specific account (player id). This guarantees
 * that progress/items of one person are never mixed with (or lost by) another
 * person's save â€” each identity has its own slot.
 */
function saveKeyFor(profileId: string): string {
  return `land-orion-save-${profileId}`;
}

function createWorldTiles(): WorldTile[] {
  const tiles: WorldTile[] = [];

  const GRID_SIZE = 10;

  for (
    let y = 0;
    y < GRID_SIZE;
    y++
  ) {
    for (
      let x = 0;
      x < GRID_SIZE;
      x++
    ) {
      let type: WorldTile['type'] =
        'grass';

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

function createFreshGameState(
  playerId: string
): GameState {
  return {
    playerId,
    progress: {
      completedMissions: [],
      currentMissionId:
        'intro-mission',
      lastAction: 'in-game',
    },
    inventory: [],
    resources: {},
    currency: {},
    status: 'in-game',
    war: {
      currentLevel: 1,
      highestLevel: 0,
      wins: 0,
      losses: 0,
      totalRewardTokens: 0,
    },
  };
}

function loadLocalGameSave(
  profileId: string
): LocalGameSave | null {
  if (
    typeof window === 'undefined'
  ) {
    return null;
  }

  const raw =
    window.localStorage.getItem(
      saveKeyFor(profileId)
    );

  if (!raw) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(raw) as Partial<LocalGameSave>;

    return {
      playerProfile:
        parsed.playerProfile
          ? {
              ...parsed.playerProfile,
              inventory:
                normalizeFruitInventory(
                  parsed.playerProfile.inventory ?? [],
                ),
            }
          : null,

      gameState:
        parsed.gameState
          ? {
              ...parsed.gameState,
              inventory:
                normalizeFruitInventory(
                  parsed.gameState.inventory ?? [],
                ),
            }
          : null,

      playerPosition:
        parsed.playerPosition ?? {
          x: 5,
          y: 5,
        },

      worldTiles:
        Array.isArray(
          parsed.worldTiles
        )
          ? parsed.worldTiles
          : createWorldTiles(),

      savedAt:
        typeof parsed.savedAt === 'string'
          ? parsed.savedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeLocalGameSave(
  profileId: string,
  save: LocalGameSave
): void {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  window.localStorage.setItem(
    saveKeyFor(profileId),
    JSON.stringify(save)
  );
}

/**
 * Before a real identity is known (first run), fall back to the guest id that
 * the entry screen stores, so a returning guest immediately sees their save.
 */
function detectInitialProfileId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const guestId =
    window.localStorage.getItem(
      GUEST_ID_KEY
    );

  if (!guestId) {
    return null;
  }

  return `player-${guestId}`;
}

const initialProfileId =
  detectInitialProfileId();

const initialLocalSave =
  initialProfileId
    ? loadLocalGameSave(
        initialProfileId
      )
    : null;

interface GameStoreState {
  wallet: WalletSession | null;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;

  playerProfile:
    | PlayerProfile
    | null;

  gameState:
    | GameState
    | null;

  isSaving: boolean;

  saveStatus:
    | 'idle'
    | 'saving'
    | 'saved'
    | 'error';

  lastSavedAt:
    | string
    | null;

  error:
    | string
    | null;

  playerPosition:
    PlayerPosition;

  worldTiles: WorldTile[];

  selectedTile:
    | WorldTile
    | null;

  connectWallet: (
    session: WalletSession
  ) => Promise<void>;

  /**
   * Re-binds the current account (name + progress + items) to a TON wallet
   * address. Call this when the player connects a wallet in the VIP section so
   * everything keeps saving under the name + wallet address.
   */
  bindWallet: (
    walletAddress: string
  ) => Promise<void>;

    disconnectWallet: () => void;

  /**
   * Updates the in-memory player profile (e.g. after setting a name or
   * binding a wallet) without requiring a full game load.
   */
  setPlayerProfile: (
    profile: PlayerProfile | null
  ) => void;

  /**
   * Persists the Bot War progression into the game state and triggers a
   * full game save (localStorage + Supabase).
   */
  setWarState: (
    war: WarState
  ) => void;

  /**
   * Attempts to load a previously saved game (from Supabase or local
   * storage) associated with the given player name. Returns true when a
   * saved game was found and applied, false otherwise.
   */
  loadGameByName: (
    name: string
  ) => Promise<boolean>;

  saveGame: () => Promise<void>;

  loadGame: (
    playerId: string
  ) => Promise<void>;

  movePlayer: (
    dx: number,
    dy: number
  ) => void;

  interactWithTile: (
    tile: WorldTile
  ) => void;

  selectTile: (
    tile: WorldTile | null
  ) => void;

  addToInventory: (
    item: InventoryItem
  ) => void;

  removeFromInventory: (
    id: string,
    quantity?: number
  ) => boolean;

  addResource: (
    key: string,
    amount: number
  ) => void;

  spendResource: (
    key: string,
    amount: number
  ) => boolean;

  hasItem: (
    id: string
  ) => boolean;
}

export const useGameStore =
  create<GameStoreState>(
    (set, get) => ({
      wallet: null,

      connectionStatus:
        'disconnected',

      isConnected: false,

      playerProfile:
        initialLocalSave
          ?.playerProfile ?? null,

      gameState:
        initialLocalSave
          ?.gameState ?? null,

      isSaving: false,

      saveStatus:
        initialLocalSave
          ? 'saved'
          : 'idle',

      lastSavedAt:
        initialLocalSave
          ?.savedAt ?? null,

      error: null,

      playerPosition:
        initialLocalSave
          ?.playerPosition ?? {
            x: 5,
            y: 5,
          },

      worldTiles:
        initialLocalSave
          ?.worldTiles ??
        createWorldTiles(),

      selectedTile: null,

      // ================================================================
      // CONNECT WALLET
      // ================================================================

      connectWallet:
        async (session) => {
          set({
            wallet: session,

            connectionStatus:
              'connecting',

            error: null,
          });

          try {
            console.log(
              '[DEBUG] Finding player:',
              session.address
            );

            const existingPlayer =
              await findPlayerByWallet(
                session.address
              );

            if (existingPlayer) {
              set({
                playerProfile:
                  existingPlayer,

                connectionStatus:
                  'connected',

                isConnected:
                  true,
              });

              await get().loadGame(
                existingPlayer.id
              );

              return;
            }

            const newProfile =
              await createNewPlayer(
                session.address
              );

            const now =
              new Date().toISOString();

            const newGameState =
              createFreshGameState(
                newProfile.id
              );

            set({
              playerProfile:
                newProfile,

              gameState:
                newGameState,

              connectionStatus:
                'connected',

              isConnected:
                true,

              saveStatus:
                'saved',

              lastSavedAt:
                now,
            });

            writeLocalGameSave(
              newProfile.id,
              {
                playerProfile:
                  newProfile,

                gameState:
                  newGameState,

                playerPosition:
                  get().playerPosition,

                worldTiles:
                  get().worldTiles,

                savedAt: now,
              }
            );

            await savePlayerData({
              player: {
                ...newProfile,
                lastSeenAt: now,
              },

              gameState:
                newGameState,

              land: newProfile.land,

              savedAt: now,
            });

            console.log(
              '[DEBUG] Wallet connection complete'
            );
          } catch (err) {
            console.error(
              '[DEBUG] CONNECT ERROR:',
              err
            );

            set({
              connectionStatus:
                'disconnected',

              isConnected: false,

              error:
                err instanceof Error
                  ? err.message
                  : String(err),
            });
          }
        },

      // ================================================================
      // BIND WALLET
      // Re-binds the current account (name + progress + items) to a TON
      // wallet address, so everything keeps saving under name + wallet.
      // ================================================================

      bindWallet:
        async (walletAddress) => {
          const {
            playerProfile,
            gameState,
          } = get();

          if (!playerProfile) {
            return;
          }

          const now =
            new Date().toISOString();

          const newId =
            `player-${walletAddress}`;

          const newProfile:
            PlayerProfile = {
              ...playerProfile,
              id: newId,
              walletAddress,
              lastSeenAt: now,
            };

          const newGameState:
            GameState = gameState
              ? {
                  ...gameState,
                  playerId: newId,
                }
              : createFreshGameState(
                  newId
                );

          // Migrate the local save to the wallet-scoped key.
          writeLocalGameSave(
            newId,
            {
              playerProfile:
                newProfile,

              gameState:
                newGameState,

              playerPosition:
                get().playerPosition,

              worldTiles:
                get().worldTiles,

              savedAt: now,
            }
          );

          set({
            wallet: createWalletSession(
              walletAddress
            ),

            playerProfile:
              newProfile,

            gameState:
              newGameState,

            connectionStatus:
              'connected',

            isConnected: true,

            saveStatus:
              'saved',

            lastSavedAt: now,

            error: null,
          });

          // Server-side sync (best-effort):
          // 1. Migrate gems/currency/VIP (eco_state) to the new wallet.
          // 2. Ensure the player row exists and save the game under the wallet.
          try {
            await migrateEconomyToWallet(
              walletAddress
            );

            await createNewPlayer(
              walletAddress
            ).catch(() => {
              /* row may already exist */
            });

            await savePlayerData({
              player:
                newProfile,

              gameState:
                newGameState,

              land: newProfile.land,

              savedAt: now,
            });
          } catch (err) {
            console.error(
              '[BindWallet] server sync error:',
              err
            );
          }
        },

            // ================================================================
      // SET PLAYER PROFILE
      // ================================================================

      setPlayerProfile: (profile) => {
        set({
          playerProfile: profile,
        });
      },

      // ================================================================
      // SET WAR STATE (BOT WAR PROGRESSION)
      // ================================================================

      setWarState: (war) => {
        const currentState =
          get().gameState;

        if (!currentState) {
          return;
        }

        set({
          gameState: {
            ...currentState,
            war,
          },
        });

        /*
         * Persist immediately (localStorage + Supabase)
         * so war progress is never lost.
         */
        void get().saveGame();
      },

      // ================================================================
      // LOAD GAME BY NAME
      // ================================================================

      loadGameByName: async (name) => {
        const trimmed = name.trim();
        if (!trimmed) {
          return false;
        }

        const localSave = loadLocalGameSave(`name-${trimmed}`);
        if (localSave) {
          set({
            playerProfile: localSave.playerProfile,
            gameState: localSave.gameState,
            playerPosition: localSave.playerPosition ?? {
              x: 5,
              y: 5,
            },
            worldTiles: localSave.worldTiles ?? createWorldTiles(),
            saveStatus: 'saved',
            lastSavedAt: localSave.savedAt ?? null,
          });
          return true;
        }

        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem(
            saveKeyFor(`name-${trimmed}`)
          );
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as Partial<LocalGameSave>;
              set({
                playerProfile: parsed.playerProfile ?? null,
                gameState: parsed.gameState ?? null,
                playerPosition: parsed.playerPosition ?? {
                  x: 5,
                  y: 5,
                },
                worldTiles: Array.isArray(parsed.worldTiles)
                  ? parsed.worldTiles
                  : createWorldTiles(),
                saveStatus: 'saved',
                lastSavedAt:
                  typeof parsed.savedAt === 'string'
                    ? parsed.savedAt
                    : null,
              });
              return true;
            } catch {
              return false;
            }
          }
        }
        return false;
      },

      // ================================================================
      // DISCONNECT
      // ================================================================

      disconnectWallet: () => {
        set({
          wallet: null,

          connectionStatus:
            'disconnected',

          isConnected: false,

          saveStatus:
            get().gameState
              ? 'saved'
              : 'idle',

          selectedTile: null,
        });
      },

      // ================================================================
      // SAVE GAME
      // ================================================================

      saveGame: async () => {
        const {
          wallet,
          playerProfile,
          gameState,
          playerPosition,
          worldTiles,
        } = get();

        const now =
          new Date().toISOString();

        /*
         * Always save locally.
         */

        let localPlayer =
          playerProfile;

        let localGameState =
          gameState;

        /*
         * If there is no profile yet but there is game data,
         * create a lightweight local profile.
         */

        if (!localPlayer) {
          localPlayer = {
            id: 'local-player',
            walletAddress:
              'local',
            username:
              'Local Player',
            level: 1,
            experience: 0,
            status: 'in-game',
            inventory:
              localGameState?.inventory ??
              [],
            land: [],
            createdAt: now,
            lastSeenAt: now,
          };
        }

        if (!localGameState) {
          localGameState =
            createFreshGameState(
              localPlayer.id
            );
        }

        const localSave: LocalGameSave =
          {
            playerProfile:
              localPlayer,

            gameState:
              localGameState,

            playerPosition,

            worldTiles,

            savedAt: now,
          };

        /*
         * Key the save by the wallet address when connected, otherwise
         * by the player name (so progress is tied to the name), falling
         * back to the local player id.
         */
        const walletAddress =
          typeof wallet === 'string'
            ? wallet
            : (wallet?.address ?? null);

        const saveKey =
          walletAddress && playerProfile
            ? walletAddress
            : localPlayer.username && localPlayer.username !== 'Local Player'
              ? `name-${localPlayer.username}`
              : localPlayer.id;

        writeLocalGameSave(
          saveKey,
          localSave
        );

        /*
         * If there is no Wallet,
         * LocalStorage is enough.
         */

        if (
          !wallet ||
          !playerProfile
        ) {
          set({
            playerProfile:
              localPlayer,

            gameState:
              localGameState,

            saveStatus:
              'saved',

            lastSavedAt: now,

            isSaving: false,
          });

          return;
        }

        // ================================================================
        // SUPABASE SAVE
        // ================================================================

        const payload:
          BackendSavePayload = {
            player: {
              ...playerProfile,

              lastSeenAt: now,
            },

            gameState: {
              ...localGameState,

              status:
                'in-game',
            },

            land:
              playerProfile.land,

            savedAt: now,
          };

        set({
          isSaving: true,

          saveStatus:
            'saving',
        });

        try {
          await savePlayerData(
            payload
          );

          set({
            isSaving: false,

            saveStatus:
              'saved',

            lastSavedAt:
              payload.savedAt,

            error: null,
          });
        } catch (err) {
          console.error(
            '[Save] SUPABASE ERROR:',
            err
          );

          /*
           * Local save has already succeeded,
           * so the game is still safe.
           */

          set({
            isSaving: false,

            saveStatus:
              'error',

            lastSavedAt: now,

            error:
              err instanceof Error
                ? err.message
                : String(err),
          });
        }
      },

      // ================================================================
      // LOAD GAME
      // ================================================================

      loadGame:
        async (playerId) => {
          try {
            console.log(
              '[Game] Loading player:',
              playerId
            );

            const loaded =
              await loadPlayerData(
                playerId
              );

            if (!loaded) {
              console.warn(
                '[Game] No remote save found. Keeping local save.'
              );

              return;
            }

            /*
             * Normalize legacy fruit ids (fruit-seed-1 -> crystal-pear)
             * so harvested fruits match the recipe ingredients.
             */
            const normalizedPlayer = loaded.player
              ? {
                  ...loaded.player,
                  inventory:
                    normalizeFruitInventory(
                      loaded.player.inventory ?? [],
                    ),
                }
              : null;

            const normalizedGameState =
              loaded.gameState
                ? {
                    ...loaded.gameState,
                    inventory:
                      normalizeFruitInventory(
                        loaded.gameState.inventory ?? [],
                      ),
                  }
                : null;

            set({
              playerProfile:
                normalizedPlayer,

              gameState:
                normalizedGameState,

              lastSavedAt:
                loaded.savedAt,

              saveStatus:
                'saved',
            });

            /*
             * Keep LocalStorage synchronized
             * after a successful remote load.
             */

            writeLocalGameSave(
              playerId,
              {
                playerProfile:
                  normalizedPlayer,

                gameState:
                  normalizedGameState,

                playerPosition:
                  get().playerPosition,

                worldTiles:
                  get().worldTiles,

                savedAt:
                  loaded.savedAt,
              }
            );

            console.log(
              '[Game] Load complete'
            );
          } catch (err) {
            console.error(
              '[Load] ERROR:',
              err
            );

            /*
             * Local save remains available.
             */

            set({
              error:
                err instanceof Error
                  ? err.message
                  : String(err),
            });
          }
        },

      // ================================================================
      // PLAYER MOVEMENT
      // ================================================================

      movePlayer: (
        dx,
        dy
      ) => {
        const {
          playerPosition,
          worldTiles,
        } = get();

        const newX =
          playerPosition.x +
          dx;

        const newY =
          playerPosition.y +
          dy;

        if (
          newX < 1 ||
          newX > 8 ||
          newY < 1 ||
          newY > 8
        ) {
          return;
        }

        const targetTile =
          worldTiles.find(
            (t) =>
              t.x === newX &&
              t.y === newY
          );

        if (
          targetTile?.type ===
          'water'
        ) {
          return;
        }

        set({
          playerPosition: {
            x: newX,
            y: newY,
          },
        });
      },

      // ================================================================
      // TILE INTERACTION
      // ================================================================

      interactWithTile:
        (tile) => {
          const {
            playerPosition,
            worldTiles,
            playerProfile,
            gameState,
          } = get();

          const distance =
            Math.abs(
              tile.x -
                playerPosition.x
            ) +
            Math.abs(
              tile.y -
                playerPosition.y
            );

          if (distance > 1) {
            return;
          }

          if (
            !tile.harvestable ||
            tile.harvested
          ) {
            return;
          }

          const updatedTiles =
            worldTiles.map(
              (t) =>
                t.id === tile.id
                  ? {
                      ...t,
                      harvested:
                        true,
                    }
                  : t
            );

          const resources = {
            ...(gameState?.resources ??
              {}),
          };

          if (
            tile.type === 'tree'
          ) {
            resources.wood =
              (resources.wood ??
                0) + 5;
          }

          if (
            tile.type === 'rock'
          ) {
            resources.stone =
              (resources.stone ??
                0) + 3;
          }

          if (
            tile.type === 'farm'
          ) {
            resources.food =
              (resources.food ??
                0) + 10;
          }

          const nextGameState =
            gameState
              ? {
                  ...gameState,
                  resources,
                }
              : {
                  playerId:
                    playerProfile?.id ??
                    'local-player',

                  progress: {
                    completedMissions:
                      [],
                    currentMissionId:
                      'intro-mission',
                    lastAction:
                      'harvested',
                  },

                  inventory: [],
                  resources,
                  currency: {},
                  status:
                    'in-game' as const,
                };

          set({
            worldTiles:
              updatedTiles,

            gameState:
              nextGameState,
          });

          void get().saveGame();
        },

      // ================================================================
      // SELECT TILE
      // ================================================================

      selectTile: (
        tile
      ) => {
        set({
          selectedTile:
            tile,
        });
      },

      // ================================================================
      // ADD INVENTORY
      // ================================================================

      addToInventory:
        (item) => {
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
              ? inventory.map(
                  (i) =>
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

          const nextGameState =
            gameState
              ? {
                  ...gameState,
                  inventory:
                    next,
                }
              : {
                  playerId:
                    playerProfile?.id ??
                    'local-player',

                  progress: {
                    completedMissions:
                      [],
                    currentMissionId:
                      'intro-mission',
                    lastAction:
                      'bought-egg',
                  },

                  inventory:
                    next,

                  resources: {},
                  currency: {},
                  status:
                    'in-game' as const,
                };

          set({
            gameState:
              nextGameState,
          });

          void get().saveGame();
        },

      // ================================================================
      // REMOVE INVENTORY
      // ================================================================

      removeFromInventory:
        (
          id,
          quantity = 1
        ) => {
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
                i.id === id
            );

          if (
            !existing ||
            existing.quantity <
              quantity
          ) {
            return false;
          }

          const next =
            inventory
              .map(
                (i) =>
                  i.id === id
                    ? {
                        ...i,
                        quantity:
                          i.quantity -
                          quantity,
                      }
                    : i
              )
              .filter(
                (i) =>
                  i.quantity > 0
              );

          const nextGameState =
            gameState
              ? {
                  ...gameState,
                  inventory:
                    next,
                }
              : {
                  playerId:
                    playerProfile?.id ??
                    'local-player',

                  progress: {
                    completedMissions:
                      [],
                    currentMissionId:
                      'intro-mission',
                    lastAction:
                      'removed-inventory',
                  },

                  inventory:
                    next,

                  resources: {},
                  currency: {},
                  status:
                    'in-game' as const,
                };

          set({
            gameState:
              nextGameState,
          });

          void get().saveGame();

          return true;
        },

      // ================================================================
      // ADD RESOURCE
      // ================================================================

      addResource: (
        key,
        amount
      ) => {
        if (amount < 0) {
          return;
        }

        const {
          gameState,
          playerProfile,
        } = get();

        const resources = {
          ...(gameState?.resources ??
            {}),
        };

        resources[key] =
          (resources[key] ?? 0) +
          amount;

        const nextGameState =
          gameState
            ? {
                ...gameState,
                resources,
              }
            : {
                playerId:
                  playerProfile?.id ??
                  'local-player',

                progress: {
                  completedMissions:
                    [],
                  currentMissionId:
                    'intro-mission',
                  lastAction:
                    'add-resource',
                },

                inventory: [],
                resources,
                currency: {},
                status:
                  'in-game' as const,
              };

        set({
          gameState:
            nextGameState,
        });

        void get().saveGame();
      },

      // ================================================================
      // SPEND RESOURCE
      // ================================================================

      spendResource: (
        key,
        amount
      ) => {
        if (amount < 0) {
          return false;
        }

        const {
          gameState,
          playerProfile,
        } = get();

        const resources = {
          ...(gameState?.resources ??
            {}),
        };

        const current =
          resources[key] ?? 0;

        if (
          current < amount
        ) {
          return false;
        }

        resources[key] =
          current - amount;

        const nextGameState =
          gameState
            ? {
                ...gameState,
                resources,
              }
            : {
                playerId:
                  playerProfile?.id ??
                  'local-player',

                progress: {
                  completedMissions:
                    [],
                  currentMissionId:
                    'intro-mission',
                  lastAction:
                    'spend-resource',
                },

                inventory: [],
                resources,
                currency: {},
                status:
                  'in-game' as const,
              };

        set({
          gameState:
            nextGameState,
        });

        void get().saveGame();

        return true;
      },

      // ================================================================
      // INVENTORY CHECK
      // ================================================================

      hasItem: (
        id
      ) =>
        (
          get().gameState
            ?.inventory ??
          get().playerProfile
            ?.inventory ??
          []
        ).some(
          (i) =>
            i.id === id &&
            i.quantity > 0
        ),
    })
  );
