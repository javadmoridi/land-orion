import { create } from 'zustand';

import { getEggById } from './eggCatalog';
import { useGameStore } from './useGameStore';
import { useResourceStore } from '../economy/resourceStore';
import { useGemStore } from '../economy/gemStore';
import { hatchTimeMs } from './orionCatalog';

export interface IncubatorSlot {
  id: number;
  eggId: string;
  placedAt: string | null;
  unlocked: boolean;
}

export const INCUBATOR_MAX_LEVEL = 10;

export interface SlotCost {
  coins?: number;
  tokens?: number;
  wood?: number;
  stone?: number;
  iron?: number;
  gold?: number;
  crystal?: number;
  gems?: number;
}

export const INCUBATOR_SLOT_COSTS: SlotCost[] = [
  { coins: 50 },

  { coins: 300 },

  {
    coins: 150,
    wood: 3,
  },

  {
    coins: 300,
    wood: 6,
    stone: 3,
  },

  {
    coins: 500,
    tokens: 10,
    wood: 3,
    stone: 3,
    iron: 3,
  },

  {
    coins: 500,
    tokens: 200,
    wood: 3,
    stone: 3,
    iron: 3,
    gold: 3,
  },

  {
    coins: 500,
    tokens: 300,
    wood: 10,
    stone: 10,
    iron: 10,
    gold: 3,
  },

  {
    coins: 5000,
    tokens: 500,
    wood: 50,
    stone: 50,
    iron: 50,
    gold: 20,
    crystal: 5,
    gems: 5,
  },

  {
    coins: 10000,
    tokens: 500,
    wood: 50,
    stone: 50,
    iron: 50,
    gold: 20,
    crystal: 20,
    gems: 10,
  },

  {
    gems: 10000,
  },
];

export function incubatorUpgradeCost(
  level: number
): number {
  return level * 500;
}

const INCUBATOR_STORAGE_KEY =
  'land-orion-incubator';

interface IncubatorSaveData {
  level: number;
  slots: IncubatorSlot[];
}

function createSlots(): IncubatorSlot[] {
  return Array.from(
    {
      length: INCUBATOR_MAX_LEVEL,
    },
    (_, index) => ({
      id: index + 1,
      eggId: '',
      placedAt: null,
      unlocked: index === 0,
    })
  );
}

function loadIncubatorData(): IncubatorSaveData {
  if (
    typeof window === 'undefined'
  ) {
    return {
      level: 1,
      slots: createSlots(),
    };
  }

  const raw =
    window.localStorage.getItem(
      INCUBATOR_STORAGE_KEY
    );

  if (!raw) {
    return {
      level: 1,
      slots: createSlots(),
    };
  }

  try {
    const parsed =
      JSON.parse(raw) as Partial<IncubatorSaveData>;

    const defaultSlots =
      createSlots();

    const savedSlots =
      Array.isArray(parsed.slots)
        ? parsed.slots
        : [];

    const slots =
      defaultSlots.map(
        (defaultSlot) => {
          const saved =
            savedSlots.find(
              (slot) =>
                slot.id ===
                defaultSlot.id
            );

          if (!saved) {
            return defaultSlot;
          }

          return {
            id: defaultSlot.id,

            eggId:
              typeof saved.eggId ===
              'string'
                ? saved.eggId
                : '',

            placedAt:
              typeof saved.placedAt ===
                'string' &&
              saved.placedAt.length > 0
                ? saved.placedAt
                : null,

            unlocked:
              saved.unlocked === true,
          };
        }
      );

    const level =
      typeof parsed.level ===
        'number' &&
      Number.isFinite(parsed.level)
        ? Math.max(
            1,
            Math.min(
              INCUBATOR_MAX_LEVEL,
              Math.floor(
                parsed.level
              )
            )
          )
        : 1;

    /*
     * Slot 1 is always unlocked.
     */
    slots[0].unlocked = true;

    return {
      level,
      slots,
    };
  } catch {
    return {
      level: 1,
      slots: createSlots(),
    };
  }
}

function saveIncubatorData(
  data: IncubatorSaveData
): void {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  window.localStorage.setItem(
    INCUBATOR_STORAGE_KEY,
    JSON.stringify(data)
  );
}

interface IncubatorStoreState {
  level: number;
  slots: IncubatorSlot[];

  unlockSlot: (
    slotId: number
  ) => boolean;

  placeEgg: (
    slotId: number,
    eggId: string
  ) => boolean;

  removeEgg: (
    slotId: number
  ) => void;

  hatchEgg: (
    slotId: number,
    fast?: boolean
  ) => boolean;

  upgrade: () => boolean;

  reset: () => void;
}

function hasCost(
  cost: SlotCost
): boolean {
  const resources =
    useResourceStore.getState()
      .resources;

  const gems =
    useGemStore.getState()
      .gems;

  if (
    cost.coins &&
    resources.coins < cost.coins
  ) {
    return false;
  }

  if (
    cost.tokens &&
    resources.tokens < cost.tokens
  ) {
    return false;
  }

  if (
    cost.wood &&
    resources.wood < cost.wood
  ) {
    return false;
  }

  if (
    cost.stone &&
    resources.stone < cost.stone
  ) {
    return false;
  }

  if (
    cost.iron &&
    resources.iron < cost.iron
  ) {
    return false;
  }

  if (
    cost.gold &&
    resources.gold < cost.gold
  ) {
    return false;
  }

  if (
    cost.crystal &&
    resources.crystal < cost.crystal
  ) {
    return false;
  }

  if (
    cost.gems &&
    gems < cost.gems
  ) {
    return false;
  }

  return true;
}

function payCost(
  cost: SlotCost
): boolean {
  if (!hasCost(cost)) {
    return false;
  }

  const resourceStore =
    useResourceStore.getState();

  const gemStore =
    useGemStore.getState();

  if (cost.coins) {
    if (
      !resourceStore.spendCoins(
        cost.coins
      )
    ) {
      return false;
    }
  }

  if (cost.tokens) {
    if (
      !resourceStore.spendTokens(
        cost.tokens
      )
    ) {
      return false;
    }
  }

  if (cost.wood) {
    if (
      !resourceStore.spendWood(
        cost.wood
      )
    ) {
      return false;
    }
  }

  if (cost.stone) {
    if (
      !resourceStore.spendStone(
        cost.stone
      )
    ) {
      return false;
    }
  }

  if (cost.iron) {
    if (
      !resourceStore.spendIron(
        cost.iron
      )
    ) {
      return false;
    }
  }

  if (cost.gold) {
    if (
      !resourceStore.spendGold(
        cost.gold
      )
    ) {
      return false;
    }
  }

  if (cost.crystal) {
    if (
      !resourceStore.spendCrystal(
        cost.crystal
      )
    ) {
      return false;
    }
  }

  if (cost.gems) {
    if (
      !gemStore.spendGems(
        cost.gems
      )
    ) {
      return false;
    }
  }

  return true;
}

export const useIncubatorStore =
  create<IncubatorStoreState>(
    (set, get) => {
      const saved =
        loadIncubatorData();

      const persist = (
        level: number,
        slots: IncubatorSlot[]
      ) => {
        saveIncubatorData({
          level,
          slots,
        });
      };

      return {
        level: saved.level,

        slots: saved.slots,

        // ============================================================
        // UNLOCK SLOT
        // ============================================================

        unlockSlot: (
          slotId
        ) => {
          const slot =
            get().slots.find(
              (item) =>
                item.id === slotId
            );

          if (
            !slot ||
            slot.unlocked
          ) {
            return false;
          }

          /*
           * Unlock slots in order.
           */
          const previousSlot =
            get().slots.find(
              (item) =>
                item.id ===
                slotId - 1
            );

          if (
            slotId > 1 &&
            !previousSlot?.unlocked
          ) {
            return false;
          }

          const cost =
            INCUBATOR_SLOT_COSTS[
              slotId - 1
            ];

          if (!cost) {
            return false;
          }

          if (
            !payCost(cost)
          ) {
            return false;
          }

          const nextSlots =
            get().slots.map(
              (item) =>
                item.id === slotId
                  ? {
                      ...item,
                      unlocked: true,
                    }
                  : item
            );

          set({
            slots:
              nextSlots,
          });

          persist(
            get().level,
            nextSlots
          );

          return true;
        },

        // ============================================================
        // PLACE EGG
        // ============================================================

        placeEgg: (
          slotId,
          eggId
        ) => {
          if (!eggId) {
            return false;
          }

          const def =
            getEggById(
              eggId
            );

          if (!def) {
            return false;
          }

          const slot =
            get().slots.find(
              (item) =>
                item.id === slotId
            );

          if (
            !slot ||
            !slot.unlocked ||
            slot.eggId
          ) {
            return false;
          }

          const removed =
            useGameStore
              .getState()
              .removeFromInventory(
                eggId,
                1
              );

          if (!removed) {
            return false;
          }

          const placedAt =
            new Date().toISOString();

          const nextSlots =
            get().slots.map(
              (item) =>
                item.id === slotId
                  ? {
                      ...item,
                      eggId,
                      placedAt,
                    }
                  : item
            );

          set({
            slots:
              nextSlots,
          });

          /*
           * IMPORTANT:
           * Save egg ID + placedAt immediately.
           */
          persist(
            get().level,
            nextSlots
          );

          void useGameStore
            .getState()
            .saveGame();

          return true;
        },

        // ============================================================
        // REMOVE EGG
        // ============================================================

        removeEgg: (
          slotId
        ) => {
          const slot =
            get().slots.find(
              (item) =>
                item.id === slotId
            );

          if (
            !slot ||
            !slot.eggId
          ) {
            return;
          }

          const def =
            getEggById(
              slot.eggId
            );

          if (def) {
            useGameStore
              .getState()
              .addToInventory({
                id: def.id,
                name: def.name,
                type: 'egg',
                rarity:
                  def.rarity,
                quantity: 1,
                image:
                  def.image,
              });
          }

          const nextSlots =
            get().slots.map(
              (item) =>
                item.id === slotId
                  ? {
                      ...item,
                      eggId: '',
                      placedAt:
                        null,
                    }
                  : item
            );

          set({
            slots:
              nextSlots,
          });

          persist(
            get().level,
            nextSlots
          );

          void useGameStore
            .getState()
            .saveGame();
        },

        // ============================================================
        // HATCH EGG
        // ============================================================

        hatchEgg: (
          slotId,
          fast = false
        ) => {
          const slot =
            get().slots.find(
              (item) =>
                item.id === slotId
            );

          if (
            !slot ||
            !slot.unlocked ||
            !slot.eggId ||
            !slot.placedAt
          ) {
            return false;
          }

          const def =
            getEggById(
              slot.eggId
            );

          if (!def) {
            return false;
          }

          if (!fast) {
            const duration =
              hatchTimeMs(
                def.rarity
              );

            const readyAt =
              new Date(
                slot.placedAt
              ).getTime() +
              duration;

            if (
              Date.now() <
              readyAt
            ) {
              return false;
            }
          }

          const fruit =
            def.fruit;

          useGameStore
            .getState()
            .addToInventory({
              id: fruit.id,
              name: fruit.name,
              type: 'fruit',
              rarity:
                def.rarity,
              quantity: 1,
              image:
                fruit.image,
            });

          const nextSlots =
            get().slots.map(
              (item) =>
                item.id === slotId
                  ? {
                      ...item,
                      eggId: '',
                      placedAt:
                        null,
                    }
                  : item
            );

          set({
            slots:
              nextSlots,
          });

          persist(
            get().level,
            nextSlots
          );

          void useGameStore
            .getState()
            .saveGame();

          return true;
        },

        // ============================================================
        // UPGRADE
        // ============================================================

        upgrade: () => {
          const {
            level,
          } = get();

          if (
            level >=
            INCUBATOR_MAX_LEVEL
          ) {
            return false;
          }

          const cost =
            incubatorUpgradeCost(
              level
            );

          if (
            !useResourceStore
              .getState()
              .spendCoins(
                cost
              )
          ) {
            return false;
          }

          const nextLevel =
            level + 1;

          set({
            level:
              nextLevel,
          });

          persist(
            nextLevel,
            get().slots
          );

          void useGameStore
            .getState()
            .saveGame();

          return true;
        },

        // ============================================================
        // RESET
        // ============================================================

        reset: () => {
          const nextSlots =
            createSlots();

          set({
            level: 1,
            slots:
              nextSlots,
          });

          persist(
            1,
            nextSlots
          );

          void useGameStore
            .getState()
            .saveGame();
        },
      };
    }
  );