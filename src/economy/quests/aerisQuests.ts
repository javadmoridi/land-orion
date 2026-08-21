import type {
  Quest,
  QuestRequirement,
} from './questTypes';
import type { PlayerResources } from '../resourceStore';

/*
|--------------------------------------------------------------------------
| AERIS — GRANDMOTHER (مادر بزرگ)
|
| میوه می‌گیرد و سکه می‌دهد.
| پاداش = ارزش میوه × 1.6 (حداکثر 1000 سکه)
|
| ارزش هر میوه بر اساس قیمت بذر آن در seedCatalog:
|   crystal-pear 2 · star-plum 3 · nova-berry 4 · moon-apple 10
|   orion-eternal-fruit 20 · nebula-orange 40 · cosmic-peach 100
|   galaxy-mango 150 · celestial-melon 300 · solar-dragon-fruit 500
|--------------------------------------------------------------------------
*/

function emptyReward(): PlayerResources {
  return {
    coins: 0,
    tokens: 0,
    gems: 0,
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

interface FruitSpec {
  id: string;
  name: string;
  image: string;
  unitValue: number;
  amount: number;
}

const FRUITS: FruitSpec[] = [
  { id: 'crystal-pear', name: 'Crystal Pear', image: '/assets/crystal-pear.png', unitValue: 2, amount: 100 },
  { id: 'crystal-pear', name: 'Crystal Pear', image: '/assets/crystal-pear.png', unitValue: 2, amount: 180 },
  { id: 'star-plum', name: 'Star Plum', image: '/assets/star-plum.png', unitValue: 3, amount: 90 },
  { id: 'star-plum', name: 'Star Plum', image: '/assets/star-plum.png', unitValue: 3, amount: 150 },
  { id: 'nova-berry', name: 'Nova Berry', image: '/assets/nova-berry.png', unitValue: 4, amount: 70 },
  { id: 'nova-berry', name: 'Nova Berry', image: '/assets/nova-berry.png', unitValue: 4, amount: 120 },
  { id: 'moon-apple', name: 'Moon Apple', image: '/assets/moon-apple.png', unitValue: 10, amount: 35 },
  { id: 'moon-apple', name: 'Moon Apple', image: '/assets/moon-apple.png', unitValue: 10, amount: 55 },
  { id: 'orion-eternal-fruit', name: 'Orion Eternal Fruit', image: '/assets/orion-eternal-fruit.png', unitValue: 20, amount: 25 },
  { id: 'orion-eternal-fruit', name: 'Orion Eternal Fruit', image: '/assets/orion-eternal-fruit.png', unitValue: 20, amount: 31 },
  { id: 'nebula-orange', name: 'Nebula Orange', image: '/assets/nebula-orange.png', unitValue: 40, amount: 12 },
  { id: 'nebula-orange', name: 'Nebula Orange', image: '/assets/nebula-orange.png', unitValue: 40, amount: 15 },
  { id: 'cosmic-peach', name: 'Cosmic Peach', image: '/assets/cosmic-peach.png', unitValue: 100, amount: 6 },
  { id: 'galaxy-mango', name: 'Galaxy Mango', image: '/assets/galaxy-mango.png', unitValue: 150, amount: 4 },
  { id: 'celestial-melon', name: 'Celestial Melon', image: '/assets/celestial-melon.png', unitValue: 300, amount: 2 },
];

export const AERIS_QUESTS: Quest[] = FRUITS.map(
  (fruit, index) => {
    const rewardCoins = Math.min(
      1000,
      Math.ceil(
        fruit.amount *
          fruit.unitValue *
          1.6,
      ),
    );

    const requirement: QuestRequirement =
      {
        kind: 'inventory',
        id: fruit.id,
        name: fruit.name,
        amount: fruit.amount,
        image: fruit.image,
      };

    return {
      id: `aeris-${String(index + 1).padStart(2, '0')}`,
      characterId: 'aeris',

      title: `${fruit.name} Delivery`,
      description: `Grandmother Aeris bakes her famous pie. Bring her ${fruit.amount} ${fruit.name}.`,

      requirement,

      condition: {
        label: `Have ${fruit.amount} ${fruit.name}`,
        test: (ctx) =>
          (ctx.inventoryQuantities?.[
            fruit.id
          ] ??
            0) >= fruit.amount,
      },

      reward: {
        ...emptyReward(),
        coins: rewardCoins,
      },

      inventoryCost: [
        {
          id: fruit.id,
          name: fruit.name,
          quantity: fruit.amount,
        },
      ],
    };
  },
);
