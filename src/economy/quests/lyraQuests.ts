import type {
  Quest,
  QuestRequirement,
} from './questTypes';
import type { PlayerResources } from '../resourceStore';

/*
|--------------------------------------------------------------------------
| LYRA — PRINCESS (شاه دخت)
|
| غذا (بخارپز شده در آشپزخانه) می‌گیرد و سکه می‌دهد.
| پاداش = ارزش غذا × 1.6 (حداکثر 1000 سکه)
| ارزش هر غذا = gemCost × 60
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

interface FoodSpec {
  id: string;
  name: string;
  image: string;
  gemCost: number;
  amount: number;
}

const FOODS: FoodSpec[] = [
  { id: 'star-plum-bowl', name: 'Star Plum Bowl', image: '/assets/star-plum.png', gemCost: 3, amount: 3 },
  { id: 'star-plum-bowl', name: 'Star Plum Bowl', image: '/assets/star-plum.png', gemCost: 3, amount: 1 },
  { id: 'crystal-pear-salad', name: 'Crystal Pear Salad', image: '/assets/crystal-pear.png', gemCost: 3, amount: 3 },
  { id: 'crystal-pear-salad', name: 'Crystal Pear Salad', image: '/assets/crystal-pear.png', gemCost: 3, amount: 2 },
  { id: 'moon-apple-juice', name: 'Moon Apple Juice', image: '/assets/moon-apple.png', gemCost: 4, amount: 2 },
  { id: 'cosmic-peach-bowl', name: 'Cosmic Peach Bowl', image: '/assets/cosmic-peach.png', gemCost: 4, amount: 2 },
  { id: 'nova-berry-mix', name: 'Nova Berry Mix', image: '/assets/nova-berry.png', gemCost: 5, amount: 2 },
  { id: 'nebula-orange-salad', name: 'Nebula Orange Salad', image: '/assets/nebula-orange.png', gemCost: 6, amount: 1 },
  { id: 'galaxy-mango-dessert', name: 'Galaxy Mango Dessert', image: '/assets/galaxy-mango.png', gemCost: 6, amount: 1 },
  { id: 'solar-peach-salad', name: 'Solar Peach Salad', image: '/assets/cosmic-peach.png', gemCost: 7, amount: 1 },
  { id: 'celestial-melon-bowl', name: 'Celestial Melon Bowl', image: '/assets/celestial-melon.png', gemCost: 8, amount: 1 },
  { id: 'solar-dragon-feast', name: 'Solar Dragon Feast', image: '/assets/solar-dragon-fruit.png', gemCost: 9, amount: 1 },
  { id: 'nova-crystal-dessert', name: 'Nova Crystal Dessert', image: '/assets/nova-berry.png', gemCost: 10, amount: 1 },
  { id: 'moon-galaxy-pudding', name: 'Moon Galaxy Pudding', image: '/assets/moon-apple.png', gemCost: 11, amount: 1 },
  { id: 'celestial-solar-bowl', name: 'Celestial Solar Bowl', image: '/assets/celestial-melon.png', gemCost: 12, amount: 1 },
];

export const LYRA_QUESTS: Quest[] = FOODS.map(
  (food, index) => {
    const rewardCoins = Math.min(
      1000,
      Math.ceil(
        food.gemCost *
          60 *
          food.amount *
          1.6,
      ),
    );

    const inventoryId =
      `food:${food.id}`;

    const requirement: QuestRequirement =
      {
        kind: 'inventory',
        id: inventoryId,
        name: food.name,
        amount: food.amount,
        image: food.image,
      };

    return {
      id: `lyra-${String(index + 1).padStart(2, '0')}`,
      characterId: 'lyra',

      title: `Royal ${food.name} Order`,
      description: `Princess Lyra is hungry for a royal treat. Deliver ${food.amount} ${food.name}.`,

      requirement,

      condition: {
        label: `Have ${food.amount} ${food.name}`,
        test: (ctx) =>
          (ctx.inventoryQuantities?.[
            inventoryId
          ] ??
            0) >= food.amount,
      },

      reward: {
        ...emptyReward(),
        coins: rewardCoins,
      },

      inventoryCost: [
        {
          id: inventoryId,
          name: food.name,
          quantity: food.amount,
        },
      ],
    };
  },
);
