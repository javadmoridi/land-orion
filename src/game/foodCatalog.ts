import type { InventoryItem } from '../types';

export type FoodMaterialType = 'inventory';

export interface FoodMaterial {
  id: string;
  name: string;
  type: FoodMaterialType;
  quantity: number;
  image?: string;
}

export type FoodRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export interface FoodDefinition {
  id: string;
  name: string;
  image: string;
  rarity: FoodRarity;
  xp: number;
  timeMinutes: number;
  gemCost: number;
  ingredients: FoodMaterial[];
}

/**
 * Cooking time per rarity tier, in minutes.
 * The base (common) is 10 minutes and every rarer tier is 1.8x the previous one.
 */
export const FOOD_COOK_MINUTES_BY_RARITY: Record<
  FoodRarity,
  number
> = {
  common: 10,
  uncommon: 18,
  rare: 32,
  epic: 58,
  legendary: 105,
  mythic: 189,
};

const FRUITS = {
  starPlum: {
    id: 'star-plum',
    name: 'Star Plum',
    image: '/assets/star-plum.png',
  },
  solarDragonFruit: {
    id: 'solar-dragon-fruit',
    name: 'Solar Dragon Fruit',
    image: '/assets/solar-dragon-fruit.png',
  },
  orionEternalFruit: {
    id: 'orion-eternal-fruit',
    name: 'Orion Eternal Fruit',
    image: '/assets/orion-eternal-fruit.png',
  },
  novaBerry: {
    id: 'nova-berry',
    name: 'Nova Berry',
    image: '/assets/nova-berry.png',
  },
  nebulaOrange: {
    id: 'nebula-orange',
    name: 'Nebula Orange',
    image: '/assets/nebula-orange.png',
  },
  moonApple: {
    id: 'moon-apple',
    name: 'Moon Apple',
    image: '/assets/moon-apple.png',
  },
  galaxyMango: {
    id: 'galaxy-mango',
    name: 'Galaxy Mango',
    image: '/assets/galaxy-mango.png',
  },
  crystalPear: {
    id: 'crystal-pear',
    name: 'Crystal Pear',
    image: '/assets/crystal-pear.png',
  },
  cosmicPeach: {
    id: 'cosmic-peach',
    name: 'Cosmic Peach',
    image: '/assets/cosmic-peach.png',
  },
  celestialMelon: {
    id: 'celestial-melon',
    name: 'Celestial Melon',
    image: '/assets/celestial-melon.png',
  },
} as const;

function fruit(
  item: (typeof FRUITS)[keyof typeof FRUITS],
  quantity: number,
): FoodMaterial {
  return {
    id: item.id,
    name: item.name,
    type: 'inventory',
    quantity,
    image: item.image,
  };
}

export const FOOD_CATALOG: FoodDefinition[] = [
  {
    id: 'star-plum-bowl',
    name: 'Star Plum Bowl',
    image: '/assets/star-plum-bowl.png',
    rarity: 'common',
    xp: 35,
    timeMinutes: 12,
    gemCost: 3,
    ingredients: [
      fruit(FRUITS.starPlum, 2),
    ],
  },

  {
    id: 'crystal-pear-salad',
    name: 'Crystal Pear Salad',
    image: '/assets/crystal-pear-salad.png',
    rarity: 'common',
    xp: 42,
    timeMinutes: 14,
    gemCost: 3,
    ingredients: [
      fruit(FRUITS.crystalPear, 2),
    ],
  },

  {
    id: 'moon-apple-juice',
    name: 'Moon Apple Juice',
    image: '/assets/moon-apple-juice.png',
    rarity: 'common',
    xp: 49,
    timeMinutes: 16,
    gemCost: 4,
    ingredients: [
      fruit(FRUITS.moonApple, 2),
    ],
  },

  {
    id: 'cosmic-peach-bowl',
    name: 'Cosmic Peach Bowl',
    image: '/assets/cosmic-peach-bowl.png',
    rarity: 'common',
    xp: 63,
    timeMinutes: 20,
    gemCost: 4,
    ingredients: [
      fruit(FRUITS.cosmicPeach, 2),
      fruit(FRUITS.starPlum, 1),
    ],
  },

  {
    id: 'nova-berry-mix',
    name: 'Nova Berry Mix',
    image: '/assets/nova-berry-mix.png',
    rarity: 'uncommon',
    xp: 87.5,
    timeMinutes: 24,
    gemCost: 5,
    ingredients: [
      fruit(FRUITS.novaBerry, 2),
      fruit(FRUITS.starPlum, 1),
    ],
  },

  {
    id: 'nebula-orange-salad',
    name: 'Nebula Orange Salad',
    image: '/assets/nebula-orange-salad.png',
    rarity: 'uncommon',
    xp: 98,
    timeMinutes: 26,
    gemCost: 6,
    ingredients: [
      fruit(FRUITS.nebulaOrange, 2),
      fruit(FRUITS.crystalPear, 1),
    ],
  },

  {
    id: 'galaxy-mango-dessert',
    name: 'Galaxy Mango Dessert',
    image: '/assets/galaxy-mango-dessert.png',
    rarity: 'uncommon',
    xp: 112,
    timeMinutes: 30,
    gemCost: 6,
    ingredients: [
      fruit(FRUITS.galaxyMango, 2),
      fruit(FRUITS.moonApple, 1),
    ],
  },

  {
    id: 'solar-peach-salad',
    name: 'Solar Peach Salad',
    image: '/assets/solar-peach-salad.png',
    rarity: 'uncommon',
    xp: 126,
    timeMinutes: 34,
    gemCost: 7,
    ingredients: [
      fruit(FRUITS.solarDragonFruit, 1),
      fruit(FRUITS.cosmicPeach, 2),
    ],
  },

  {
    id: 'celestial-melon-bowl',
    name: 'Celestial Melon Bowl',
    image: '/assets/celestial-melon-bowl.png',
    rarity: 'rare',
    xp: 157.5,
    timeMinutes: 40,
    gemCost: 8,
    ingredients: [
      fruit(FRUITS.celestialMelon, 2),
      fruit(FRUITS.nebulaOrange, 1),
    ],
  },

  {
    id: 'solar-dragon-feast',
    name: 'Solar Dragon Feast',
    image: '/assets/solar-dragon-feast.png',
    rarity: 'rare',
    xp: 175,
    timeMinutes: 44,
    gemCost: 9,
    ingredients: [
      fruit(FRUITS.solarDragonFruit, 2),
      fruit(FRUITS.galaxyMango, 1),
    ],
  },

  {
    id: 'nova-crystal-dessert',
    name: 'Nova Crystal Dessert',
    image: '/assets/nova-crystal-dessert.png',
    rarity: 'rare',
    xp: 196,
    timeMinutes: 48,
    gemCost: 10,
    ingredients: [
      fruit(FRUITS.novaBerry, 2),
      fruit(FRUITS.crystalPear, 2),
    ],
  },

  {
    id: 'moon-galaxy-pudding',
    name: 'Moon Galaxy Pudding',
    image: '/assets/moon-galaxy-pudding.png',
    rarity: 'rare',
    xp: 217,
    timeMinutes: 52,
    gemCost: 11,
    ingredients: [
      fruit(FRUITS.moonApple, 2),
      fruit(FRUITS.galaxyMango, 2),
    ],
  },

  {
    id: 'celestial-solar-bowl',
    name: 'Celestial Solar Bowl',
    image: '/assets/celestial-solar-bowl.png',
    rarity: 'epic',
    xp: 252,
    timeMinutes: 58,
    gemCost: 12,
    ingredients: [
      fruit(FRUITS.celestialMelon, 1),
      fruit(FRUITS.solarDragonFruit, 2),
      fruit(FRUITS.starPlum, 1),
    ],
  },

  {
    id: 'cosmic-nova-feast',
    name: 'Cosmic Nova Feast',
    image: '/assets/cosmic-nova-feast.png',
    rarity: 'epic',
    xp: 273,
    timeMinutes: 64,
    gemCost: 13,
    ingredients: [
      fruit(FRUITS.cosmicPeach, 2),
      fruit(FRUITS.novaBerry, 2),
      fruit(FRUITS.nebulaOrange, 1),
    ],
  },

  {
    id: 'nebula-galaxy-pie',
    name: 'Nebula Galaxy Pie',
    image: '/assets/nebula-galaxy-pie.png',
    rarity: 'epic',
    xp: 294,
    timeMinutes: 70,
    gemCost: 14,
    ingredients: [
      fruit(FRUITS.nebulaOrange, 2),
      fruit(FRUITS.galaxyMango, 2),
      fruit(FRUITS.crystalPear, 1),
    ],
  },

  {
    id: 'eternal-celestial-dessert',
    name: 'Eternal Celestial Dessert',
    image: '/assets/eternal-celestial-dessert.png',
    rarity: 'legendary',
    xp: 367.5,
    timeMinutes: 84,
    gemCost: 17,
    ingredients: [
      fruit(FRUITS.orionEternalFruit, 1),
      fruit(FRUITS.celestialMelon, 2),
      fruit(FRUITS.starPlum, 2),
    ],
  },

  {
    id: 'eternal-solar-feast',
    name: 'Eternal Solar Feast',
    image: '/assets/eternal-solar-feast.png',
    rarity: 'legendary',
    xp: 413,
    timeMinutes: 92,
    gemCost: 19,
    ingredients: [
      fruit(FRUITS.orionEternalFruit, 1),
      fruit(FRUITS.solarDragonFruit, 2),
      fruit(FRUITS.moonApple, 2),
    ],
  },

  {
    id: 'eternal-cosmic-pudding',
    name: 'Eternal Cosmic Pudding',
    image: '/assets/eternal-cosmic-pudding.png',
    rarity: 'legendary',
    xp: 462,
    timeMinutes: 100,
    gemCost: 20,
    ingredients: [
      fruit(FRUITS.orionEternalFruit, 1),
      fruit(FRUITS.cosmicPeach, 2),
      fruit(FRUITS.novaBerry, 2),
    ],
  },

  {
    id: 'eternal-galaxy-feast',
    name: 'Eternal Galaxy Feast',
    image: '/assets/eternal-galaxy-feast.png',
    rarity: 'legendary',
    xp: 518,
    timeMinutes: 110,
    gemCost: 22,
    ingredients: [
      fruit(FRUITS.orionEternalFruit, 1),
      fruit(FRUITS.galaxyMango, 2),
      fruit(FRUITS.celestialMelon, 2),
    ],
  },

  {
    id: 'celestial-eternal-feast',
    name: 'Celestial Eternal Feast',
    image: '/assets/celestial-eternal-feast.png',
    rarity: 'mythic',
    xp: 577.5,
    timeMinutes: 120,
    gemCost: 24,
    ingredients: [
      fruit(FRUITS.orionEternalFruit, 1),
      fruit(FRUITS.celestialMelon, 2),
      fruit(FRUITS.solarDragonFruit, 2),
      fruit(FRUITS.starPlum, 2),
    ],
  },

  {
    id: 'ultimate-orion-fruit-feast',
    name: 'Ultimate Orion Fruit Feast',
    image: '/assets/ultimate-orion-fruit-feast.png',
    rarity: 'mythic',
    xp: 700,
    timeMinutes: 140,
    gemCost: 28,
    ingredients: [
      fruit(FRUITS.orionEternalFruit, 2),
      fruit(FRUITS.solarDragonFruit, 1),
      fruit(FRUITS.celestialMelon, 1),
      fruit(FRUITS.galaxyMango, 1),
      fruit(FRUITS.novaBerry, 1),
    ],
  },
];

/* ================================================================
   HELPERS
================================================================ */

export function calculateFoodGemCost(
  timeMinutes: number,
): number {
  return Math.max(
    1,
    Math.ceil(timeMinutes / 5),
  );
}

/**
 * Returns how many minutes a dish takes to cook.
 * The minimum time is 10 minutes and rarer dishes take 1.8x longer.
 */
export function getFoodCookMinutes(
  food: FoodDefinition,
): number {
  return (
    FOOD_COOK_MINUTES_BY_RARITY[food.rarity] ??
    10
  );
}

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
    rarity: food.rarity,
    image: food.image,
  };
}