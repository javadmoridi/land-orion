import type {
  Quest,
  QuestRequirement,
} from './questTypes';
import type { PlayerResources } from '../resourceStore';

/*
|--------------------------------------------------------------------------
| ORION — GRAND CHIEF (ریس بزرگ)
|
| جم و هر چیزی دیگر می‌خواهد (سکه، ارز، منابع، میوه).
| پاداش = حداکثر ۵ جم.
|--------------------------------------------------------------------------
*/

function emptyReward(): PlayerResources {
  return {
    coins: 0,
    tokens: 0,
    gems: 1,
    water: 0,
    air: 0,
    earth: 0,
    fire: 0,
    wood: 0,
    stone: 0,
    iron: 0,
    gold: 0,
    crystal: 0,
  };
}

interface ChiefSpec {
  /** resource key یا inventory item id */
  kind: 'resource' | 'inventory';
  id: string;
  name: string;
  image: string;
  amount: number;
  rewardGems: number;
}

const DEMANDS: ChiefSpec[] = [
  // --- resource demands ---
  { kind: 'resource', id: 'wood', name: 'Wood', image: '/assets/orion-wood.png', amount: 150, rewardGems: 2 },
  { kind: 'resource', id: 'stone', name: 'Stone', image: '/assets/orion-stone.png', amount: 100, rewardGems: 2 },
  { kind: 'resource', id: 'iron', name: 'Iron', image: '/assets/orion-iron.png', amount: 50, rewardGems: 3 },
  { kind: 'resource', id: 'gold', name: 'Gold', image: '/assets/orion-gold.png', amount: 30, rewardGems: 3 },
  { kind: 'resource', id: 'crystal', name: 'Crystal', image: '/assets/orion-crystal.png', amount: 20, rewardGems: 4 },
  { kind: 'resource', id: 'water', name: 'Orion Water', image: '/assets/orion-element-water.png', amount: 8, rewardGems: 3 },
  { kind: 'resource', id: 'air', name: 'Orion Air', image: '/assets/orion-element-air.png', amount: 8, rewardGems: 3 },
  { kind: 'resource', id: 'earth', name: 'Orion Earth', image: '/assets/orion-element-earth.png', amount: 8, rewardGems: 4 },
  { kind: 'resource', id: 'fire', name: 'Orion Fire', image: '/assets/orion-element-fire.png', amount: 8, rewardGems: 4 },

  // --- inventory demands (میوه‌های گران‌بها) ---
  { kind: 'inventory', id: 'celestial-melon', name: 'Celestial Melon', image: '/assets/celestial-melon.png', amount: 3, rewardGems: 5 },
  { kind: 'inventory', id: 'solar-dragon-fruit', name: 'Solar Dragon Fruit', image: '/assets/solar-dragon-fruit.png', amount: 5, rewardGems: 5 },
  { kind: 'inventory', id: 'galaxy-mango', name: 'Galaxy Mango', image: '/assets/galaxy-mango.png', amount: 6, rewardGems: 4 },
  { kind: 'inventory', id: 'cosmic-peach', name: 'Cosmic Peach', image: '/assets/cosmic-peach.png', amount: 10, rewardGems: 4 },
  { kind: 'inventory', id: 'nebula-orange', name: 'Nebula Orange', image: '/assets/nebula-orange.png', amount: 15, rewardGems: 3 },
  { kind: 'inventory', id: 'orion-eternal-fruit', name: 'Orion Eternal Fruit', image: '/assets/orion-eternal-fruit.png', amount: 25, rewardGems: 5 },
];

export const ORION_QUESTS: Quest[] =
  DEMANDS.map(
    (demand, index) => {
      const requirement: QuestRequirement =
        {
          kind: demand.kind,
          id: demand.id,
          name: demand.name,
          amount: demand.amount,
          image: demand.image,
        };

      const isInventory =
        demand.kind ===
        'inventory';

      const inventoryId = isInventory
        ? demand.id
        : undefined;

      return {
        id: `orion-${String(index + 1).padStart(2, '0')}`,
        characterId: 'orion',

        title: `Grand Chief's Demand: ${demand.name}`,
        description: `The Grand Chief calls upon you. Deliver ${demand.amount} ${demand.name} to earn his favor.`,

        requirement,

        condition: {
          label: `Have ${demand.amount} ${demand.name}`,
          test: isInventory
            ? (ctx) =>
                (ctx.inventoryQuantities?.[
                  inventoryId!
                ] ??
                  0) >=
                demand.amount
            : (ctx) =>
                ctx[
                  demand.id as
                    | 'wood'
                    | 'air'
                ] >= demand.amount,
        },

        reward: {
          ...emptyReward(),
          gems: demand.rewardGems,
        },

        cost: isInventory
          ? undefined
          : ({
              [demand.id]:
                demand.amount,
            } as Partial<PlayerResources>),

        inventoryCost: isInventory
          ? [
              {
                id: inventoryId!,
                name: demand.name,
                quantity:
                  demand.amount,
              },
            ]
          : undefined,
      };
    },
  );
