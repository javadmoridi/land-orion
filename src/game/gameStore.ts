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

import {
  getFoodById,
  type FoodDefinition,
} from './foodCatalog';

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

const LOCAL_GAME_STORAGE_KEY =
  'land-orion-game-save';

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
  };
}

function loadLocalGameSave(): LocalGameSave | null {
  if (
    typeof window === 'undefined'
  ) {
    return null;
  }

  const raw =
    window.localStorage.getItem(
      LOCAL_GAME_STORAGE_KEY
    );

  if (!raw) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(raw) as Partial<LocalGameSave>;

    return {
      playerProfile:
        parsed.playerProfile ?? null,

      gameState:
        parsed.gameState ?? null,

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
  save: LocalGameSave
): void {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  window.localStorage.setItem(
    LOCAL_GAME_STORAGE_KEY,
    JSON.stringify(save)
  );
}

const initialLocalSave =
  loadLocalGameSave();

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

  disconnectWallet: () => void;

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

  canCookFood: (
    food: FoodDefinition
  ) => boolean;

  cookFood: (
    food: FoodDefinition
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

            writeLocalGameSave({
              playerProfile:
                newProfile,

              gameState:
                newGameState,

              playerPosition:
                get().playerPosition,

              worldTiles:
                get().worldTiles,

              savedAt: now,
            });

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

        let localPlayer =
          playerProfile;

        let localGameState =
          gameState;

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

        writeLocalGameSave(
          localSave
        );

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

            set({
              playerProfile:
                loaded.player,

              gameState:
                loaded.gameState,

              lastSavedAt:
                loaded.savedAt,

              saveStatus:
                'saved',
            });

            writeLocalGameSave({
              playerProfile:
                loaded.player,

              gameState:
                loaded.gameState,

              playerPosition:
                get().playerPosition,

              worldTiles:
                get().worldTiles,

              savedAt:
                loaded.savedAt,
            });

            console.log(
              '[Game] Load complete'
            );
          } catch (err) {
            console.error(
              '[Load] ERROR:',
              err
            );

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

      // ================================================================
      // FOOD / KITCHEN
      // ================================================================

      canCookFood:
        (food) => {
          const {
            gameState,
            playerProfile,
          } = get();

          const resources =
            gameState?.resources ??
            {};

          const inventory =
            gameState?.inventory ??
            playerProfile?.inventory ??
            [];

          return food.ingredients.every(
            (ingredient) => {
              if (
                ingredient.quantity <=
                0
              ) {
                return true;
              }

              if (
                ingredient.type ===
                'resource'
              ) {
                return (
                  (resources[
                    ingredient.id
                  ] ?? 0) >=
                  ingredient.quantity
                );
              }

              const item =
                inventory.find(
                  (i) =>
                    i.id ===
                      ingredient.id &&
                    i.quantity > 0
                );

              return (
                (item?.quantity ?? 0) >=
                ingredient.quantity
              );
            }
          );
        },

      cookFood:
        (food) => {
          const {
            gameState,
            playerProfile,
          } = get();

          /*
           * Resolve the latest food definition from the catalog.
           * This also protects the store from accidentally receiving
           * an invalid/stale food object.
           */
          const catalogFood =
            getFoodById(food.id);

          if (!catalogFood) {
            return false;
          }

          const resources = {
            ...(gameState?.resources ??
              {}),
          };

          const inventory = [
            ...(gameState?.inventory ??
              playerProfile?.inventory ??
              []),
          ];

          /*
           * Check every ingredient BEFORE changing anything.
           * Therefore a failed cooking attempt never partially
           * consumes materials.
           */
          const enoughIngredients =
            catalogFood.ingredients.every(
              (ingredient) => {
                if (
                  ingredient.quantity <=
                  0
                ) {
                  return true;
                }

                if (
                  ingredient.type ===
                  'resource'
                ) {
                  return (
                    (resources[
                      ingredient.id
                    ] ?? 0) >=
                    ingredient.quantity
                  );
                }

                const item =
                  inventory.find(
                    (i) =>
                      i.id ===
                        ingredient.id &&
                      i.quantity > 0
                  );

                return (
                  (item?.quantity ?? 0) >=
                  ingredient.quantity
                );
              }
            );

          if (!enoughIngredients) {
            return false;
          }

          /*
           * Consume all ingredients.
           */
          for (
            const ingredient of
              catalogFood.ingredients
          ) {
            if (
              ingredient.quantity <=
              0
            ) {
              continue;
            }

            if (
              ingredient.type ===
              'resource'
            ) {
              resources[
                ingredient.id
              ] =
                (resources[
                  ingredient.id
                ] ?? 0) -
                ingredient.quantity;

              continue;
            }

            const inventoryIndex =
              inventory.findIndex(
                (item) =>
                  item.id ===
                  ingredient.id
              );

            if (
              inventoryIndex ===
              -1
            ) {
              return false;
            }

            const item =
              inventory[
                inventoryIndex
              ];

            const newQuantity =
              item.quantity -
              ingredient.quantity;

            if (
              newQuantity <= 0
            ) {
              inventory.splice(
                inventoryIndex,
                1
              );
            } else {
              inventory[
                inventoryIndex
              ] = {
                ...item,
                quantity:
                  newQuantity,
              };
            }
          }

          /*
           * Create the cooked food inventory item.
           */
          const foodInventoryId =
            `food:${catalogFood.id}`;

          const existingFood =
            inventory.find(
              (item) =>
                item.id ===
                foodInventoryId
            );

          if (existingFood) {
            existingFood.quantity += 1;
          } else {
            inventory.push({
              id: foodInventoryId,
              name:
                catalogFood.name,
              type: 'food',
              quantity: 1,
              rarity:
                catalogFood.level >= 10
                  ? 'mythic'
                  : catalogFood.level >=
                      8
                    ? 'legendary'
                    : catalogFood.level >=
                        6
                      ? 'epic'
                      : catalogFood.level >=
                          4
                        ? 'rare'
                        : 'common',
              image:
                catalogFood.image,
            });
          }

          const nextGameState =
            gameState
              ? {
                  ...gameState,

                  inventory,

                  resources,

                  progress: {
                    ...gameState.progress,

                    lastAction:
                      'cooked-food',
                  },
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
                      'cooked-food',
                  },

                  inventory,

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
    })
  );