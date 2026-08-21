import type { InventoryItem } from '../types';

export type FoodMaterialType =
  | 'resource'
  | 'inventory';

export interface FoodMaterial {
  id: string;
  name: string;
  type: FoodMaterialType;
  quantity: number;
  image?: string;
}

export interface FoodDefinition {
  id: string;
  name: string;
  image: string;
  xp: number;
  timeMinutes: number;
  gemCost: number;
  ingredients: FoodMaterial[];
}

export const FOOD_CATALOG: FoodDefinition[] = [
  {
    id: 'sun-berry-bowl',
    name: 'Sun Berry Bowl',
    image: '/assets/sun-berry.png',
    xp: 10,
    timeMinutes: 12,
    gemCost: 1,
    ingredients: [
      {
        id: 'sun-berry',
        name: 'Sun Berry',
        type: 'inventory',
        quantity: 2,
        image: '/assets/sun-berry.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 1,
      },
    ],
  },

  {
    id: 'crystal-pear-salad',
    name: 'Crystal Pear Salad',
    image: '/assets/crystal-pear.png',
    xp: 12,
    timeMinutes: 14,
    gemCost: 1,
    ingredients: [
      {
        id: 'crystal-pear',
        name: 'Crystal Pear',
        type: 'inventory',
        quantity: 2,
        image: '/assets/crystal-pear.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 1,
      },
    ],
  },

  {
    id: 'crystal-apple-juice',
    name: 'Crystal Apple Juice',
    image: '/assets/crystal-apple.png',
    xp: 14,
    timeMinutes: 16,
    gemCost: 1,
    ingredients: [
      {
        id: 'crystal-apple',
        name: 'Crystal Apple',
        type: 'inventory',
        quantity: 2,
        image: '/assets/crystal-apple.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 2,
      },
    ],
  },

  {
    id: 'three-fruit-salad',
    name: 'Three Fruit Salad',
    image: '/assets/sun-berry.png',
    xp: 18,
    timeMinutes: 20,
    gemCost: 2,
    ingredients: [
      {
        id: 'sun-berry',
        name: 'Sun Berry',
        type: 'inventory',
        quantity: 1,
        image: '/assets/sun-berry.png',
      },
      {
        id: 'crystal-pear',
        name: 'Crystal Pear',
        type: 'inventory',
        quantity: 1,
        image: '/assets/crystal-pear.png',
      },
      {
        id: 'crystal-apple',
        name: 'Crystal Apple',
        type: 'inventory',
        quantity: 1,
        image: '/assets/crystal-apple.png',
      },
    ],
  },

  {
    id: 'moon-pear-dessert',
    name: 'Moon Pear Dessert',
    image: '/assets/ancient-moon-fruit.png',
    xp: 25,
    timeMinutes: 24,
    gemCost: 2,
    ingredients: [
      {
        id: 'ancient-moon-fruit',
        name: 'Ancient Moon Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/ancient-moon-fruit.png',
      },
      {
        id: 'crystal-pear',
        name: 'Crystal Pear',
        type: 'inventory',
        quantity: 1,
        image: '/assets/crystal-pear.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 2,
      },
    ],
  },

  {
    id: 'moon-berry-compote',
    name: 'Moon Berry Compote',
    image: '/assets/ancient-moon-fruit.png',
    xp: 28,
    timeMinutes: 26,
    gemCost: 2,
    ingredients: [
      {
        id: 'ancient-moon-fruit',
        name: 'Ancient Moon Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/ancient-moon-fruit.png',
      },
      {
        id: 'sun-berry',
        name: 'Sun Berry',
        type: 'inventory',
        quantity: 2,
        image: '/assets/sun-berry.png',
      },
    ],
  },

  {
    id: 'shadow-apple-jam',
    name: 'Shadow Apple Jam',
    image: '/assets/shadow-berry.png',
    xp: 32,
    timeMinutes: 30,
    gemCost: 3,
    ingredients: [
      {
        id: 'shadow-berry',
        name: 'Shadow Berry',
        type: 'inventory',
        quantity: 1,
        image: '/assets/shadow-berry.png',
      },
      {
        id: 'crystal-apple',
        name: 'Crystal Apple',
        type: 'inventory',
        quantity: 2,
        image: '/assets/crystal-apple.png',
      },
    ],
  },

  {
    id: 'shadow-moon-salad',
    name: 'Shadow Moon Salad',
    image: '/assets/shadow-berry.png',
    xp: 36,
    timeMinutes: 34,
    gemCost: 3,
    ingredients: [
      {
        id: 'shadow-berry',
        name: 'Shadow Berry',
        type: 'inventory',
        quantity: 1,
        image: '/assets/shadow-berry.png',
      },
      {
        id: 'ancient-moon-fruit',
        name: 'Ancient Moon Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/ancient-moon-fruit.png',
      },
      {
        id: 'crystal-pear',
        name: 'Crystal Pear',
        type: 'inventory',
        quantity: 1,
        image: '/assets/crystal-pear.png',
      },
    ],
  },

  {
    id: 'golden-root-stew',
    name: 'Golden Root Stew',
    image: '/assets/golden-root-fruit.png',
    xp: 45,
    timeMinutes: 40,
    gemCost: 4,
    ingredients: [
      {
        id: 'golden-root-fruit',
        name: 'Golden Root Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/golden-root-fruit.png',
      },
      {
        id: 'ancient-moon-fruit',
        name: 'Ancient Moon Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/ancient-moon-fruit.png',
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'resource',
        quantity: 3,
      },
    ],
  },

  {
    id: 'energy-pear-soup',
    name: 'Energy Pear Soup',
    image: '/assets/energy-core-fruit.png',
    xp: 50,
    timeMinutes: 44,
    gemCost: 4,
    ingredients: [
      {
        id: 'energy-core-fruit',
        name: 'Energy Core Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/energy-core-fruit.png',
      },
      {
        id: 'crystal-pear',
        name: 'Crystal Pear',
        type: 'inventory',
        quantity: 2,
        image: '/assets/crystal-pear.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 3,
      },
    ],
  },

  {
    id: 'golden-shadow-cake',
    name: 'Golden Shadow Cake',
    image: '/assets/golden-root-fruit.png',
    xp: 56,
    timeMinutes: 48,
    gemCost: 5,
    ingredients: [
      {
        id: 'golden-root-fruit',
        name: 'Golden Root Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/golden-root-fruit.png',
      },
      {
        id: 'shadow-berry',
        name: 'Shadow Berry',
        type: 'inventory',
        quantity: 2,
        image: '/assets/shadow-berry.png',
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 1,
      },
    ],
  },

  {
    id: 'energy-moon-pudding',
    name: 'Energy Moon Pudding',
    image: '/assets/energy-core-fruit.png',
    xp: 62,
    timeMinutes: 52,
    gemCost: 5,
    ingredients: [
      {
        id: 'energy-core-fruit',
        name: 'Energy Core Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/energy-core-fruit.png',
      },
      {
        id: 'ancient-moon-fruit',
        name: 'Ancient Moon Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/ancient-moon-fruit.png',
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 2,
      },
    ],
  },

  {
    id: 'celestial-fruit-bowl',
    name: 'Celestial Fruit Bowl',
    image: '/assets/celestial-star-fruit.png',
    xp: 72,
    timeMinutes: 58,
    gemCost: 6,
    ingredients: [
      {
        id: 'celestial-star-fruit',
        name: 'Celestial Star Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/celestial-star-fruit.png',
      },
      {
        id: 'golden-root-fruit',
        name: 'Golden Root Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/golden-root-fruit.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 4,
      },
    ],
  },

  {
    id: 'fire-bloom-jelly',
    name: 'Fire Bloom Jelly',
    image: '/assets/fire-bloom-fruit.png',
    xp: 78,
    timeMinutes: 64,
    gemCost: 6,
    ingredients: [
      {
        id: 'fire-bloom-fruit',
        name: 'Fire Bloom Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/fire-bloom-fruit.png',
      },
      {
        id: 'shadow-berry',
        name: 'Shadow Berry',
        type: 'inventory',
        quantity: 2,
        image: '/assets/shadow-berry.png',
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 2,
      },
    ],
  },

  {
    id: 'celestial-energy-pie',
    name: 'Celestial Energy Pie',
    image: '/assets/celestial-star-fruit.png',
    xp: 84,
    timeMinutes: 70,
    gemCost: 7,
    ingredients: [
      {
        id: 'celestial-star-fruit',
        name: 'Celestial Star Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/celestial-star-fruit.png',
      },
      {
        id: 'energy-core-fruit',
        name: 'Energy Core Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/energy-core-fruit.png',
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 2,
      },
    ],
  },

  {
    id: 'fire-golden-feast',
    name: 'Fire Golden Feast',
    image: '/assets/fire-bloom-fruit.png',
    xp: 92,
    timeMinutes: 76,
    gemCost: 7,
    ingredients: [
      {
        id: 'fire-bloom-fruit',
        name: 'Fire Bloom Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/fire-bloom-fruit.png',
      },
      {
        id: 'golden-root-fruit',
        name: 'Golden Root Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/golden-root-fruit.png',
      },
      {
        id: 'crystal-apple',
        name: 'Crystal Apple',
        type: 'inventory',
        quantity: 2,
        image: '/assets/crystal-apple.png',
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 3,
      },
    ],
  },

  {
    id: 'eternal-moon-dessert',
    name: 'Eternal Moon Dessert',
    image: '/assets/eternal-crystal-fruit.png',
    xp: 105,
    timeMinutes: 84,
    gemCost: 8,
    ingredients: [
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/eternal-crystal-fruit.png',
      },
      {
        id: 'ancient-moon-fruit',
        name: 'Ancient Moon Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/ancient-moon-fruit.png',
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 4,
      },
    ],
  },

  {
    id: 'eternal-celestial-cake',
    name: 'Eternal Celestial Cake',
    image: '/assets/eternal-crystal-fruit.png',
    xp: 118,
    timeMinutes: 92,
    gemCost: 9,
    ingredients: [
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/eternal-crystal-fruit.png',
      },
      {
        id: 'celestial-star-fruit',
        name: 'Celestial Star Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/celestial-star-fruit.png',
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 3,
      },
    ],
  },

  {
    id: 'eternal-fire-pudding',
    name: 'Eternal Fire Pudding',
    image: '/assets/eternal-crystal-fruit.png',
    xp: 132,
    timeMinutes: 100,
    gemCost: 10,
    ingredients: [
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/eternal-crystal-fruit.png',
      },
      {
        id: 'fire-bloom-fruit',
        name: 'Fire Bloom Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/fire-bloom-fruit.png',
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 4,
      },
    ],
  },

  {
    id: 'eternal-shadow-feast',
    name: 'Eternal Shadow Feast',
    image: '/assets/eternal-crystal-fruit.png',
    xp: 148,
    timeMinutes: 110,
    gemCost: 10,
    ingredients: [
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/eternal-crystal-fruit.png',
      },
      {
        id: 'shadow-berry',
        name: 'Shadow Berry',
        type: 'inventory',
        quantity: 2,
        image: '/assets/shadow-berry.png',
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 5,
      },
    ],
  },

  {
    id: 'celestial-eternal-feast',
    name: 'Celestial Eternal Feast',
    image: '/assets/eternal-crystal-fruit.png',
    xp: 165,
    timeMinutes: 120,
    gemCost: 12,
    ingredients: [
      {
        id: 'celestial-star-fruit',
        name: 'Celestial Star Fruit',
        type: 'inventory',
        quantity: 2,
        image: '/assets/celestial-star-fruit.png',
      },
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/eternal-crystal-fruit.png',
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 5,
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 5,
      },
    ],
  },

  {
    id: 'ultimate-fruit-feast',
    name: 'Ultimate Orion Fruit Feast',
    image: '/assets/eternal-crystal-fruit.png',
    xp: 200,
    timeMinutes: 140,
    gemCost: 15,
    ingredients: [
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/eternal-crystal-fruit.png',
      },
      {
        id: 'celestial-star-fruit',
        name: 'Celestial Star Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/celestial-star-fruit.png',
      },
      {
        id: 'fire-bloom-fruit',
        name: 'Fire Bloom Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/fire-bloom-fruit.png',
      },
      {
        id: 'golden-root-fruit',
        name: 'Golden Root Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/golden-root-fruit.png',
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 8,
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 5,
      },
    ],
  },
];

/* ================================================================
   HELPERS
================================================================ */

export function getFoodById(
  id: string,
): FoodDefinition | undefined {
  return FOOD_CATALOG.find(
    (food) => food.id === id,
  );
}

export function getFoodInventoryId(
  foodId: string,
): string {
  return `food:${foodId}`;
}

export function createFoodInventoryItem(
  food: FoodDefinition,
  quantity = 1,
): InventoryItem {
  return {
    id: getFoodInventoryId(food.id),
    name: food.name,
    type: 'food',
    quantity,
    rarity:
      food.id === 'ultimate-fruit-feast' ||
      food.id === 'celestial-eternal-feast'
        ? 'mythic'
        : food.id.includes('eternal')
          ? 'legendary'
          : food.id.includes('celestial') ||
              food.id.includes('fire-bloom')
            ? 'epic'
            : food.id.includes('golden') ||
                food.id.includes('energy')
              ? 'rare'
              : food.id.includes('moon') ||
                  food.id.includes('shadow')
                ? 'rare'
                : 'common',
    image: food.image,
  };
}