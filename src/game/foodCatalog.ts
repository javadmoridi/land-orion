import type { InventoryItem } from '../types';

export type FoodMaterialType = 'resource' | 'inventory';

export interface FoodMaterial {
  id: string;
  name: string;
  type: FoodMaterialType;
  quantity: number;
  image?: string;
}

export type FoodRace =
  | 'water'
  | 'air'
  | 'earth'
  | 'fire'
  | 'asil'
  | null;

export interface FoodDefinition {
  id: string;
  name: string;
  image: string;
  level: number;
  xp: number;
  race: FoodRace;
  ingredients: FoodMaterial[];
}

const XP_BY_LEVEL: Record<number, number> = {
  1: 10,
  2: 15,
  3: 22,
  4: 34,
  5: 51,
  6: 76,
  7: 114,
  8: 171,
  9: 256,
  10: 384,
};

export const FOOD_CATALOG: FoodDefinition[] = [
  // ========================================================================
  // LEVEL 1
  // ========================================================================

  {
    id: 'pearl-soup',
    name: 'Pearl Soup',
    image: '/assets/food/pearl-soup.png',
    level: 1,
    xp: XP_BY_LEVEL[1],
    race: null,
    ingredients: [
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 1,
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
    id: 'sun-berry-salad',
    name: 'Sun Berry Salad',
    image: '/assets/food/sun-berry-salad.png',
    level: 1,
    xp: XP_BY_LEVEL[1],
    race: null,
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
    id: 'forest-soup',
    name: 'Forest Soup',
    image: '/assets/food/forest-soup.png',
    level: 1,
    xp: XP_BY_LEVEL[1],
    race: null,
    ingredients: [
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 2,
      },
      {
        id: 'wood',
        name: 'Wood',
        type: 'resource',
        quantity: 1,
      },
    ],
  },

  {
    id: 'earth-salad',
    name: 'Earth Salad',
    image: '/assets/food/earth-salad.png',
    level: 1,
    xp: XP_BY_LEVEL[1],
    race: null,
    ingredients: [
      {
        id: 'earth',
        name: 'Earth',
        type: 'resource',
        quantity: 1,
      },
      {
        id: 'sun-berry',
        name: 'Sun Berry',
        type: 'inventory',
        quantity: 1,
        image: '/assets/sun-berry.png',
      },
    ],
  },

  {
    id: 'fresh-crystal-juice',
    name: 'Fresh Crystal Juice',
    image: '/assets/food/fresh-crystal-juice.png',
    level: 1,
    xp: XP_BY_LEVEL[1],
    race: null,
    ingredients: [
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 2,
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

  // ========================================================================
  // LEVEL 2
  // ========================================================================

  {
    id: 'crystal-apple-pie',
    name: 'Crystal Apple Pie',
    image: '/assets/food/crystal-apple-pie.png',
    level: 2,
    xp: XP_BY_LEVEL[2],
    race: null,
    ingredients: [
      {
        id: 'crystal-apple',
        name: 'Crystal Apple',
        type: 'inventory',
        quantity: 2,
        image: '/assets/crystal-apple.png',
      },
      {
        id: 'wood',
        name: 'Wood',
        type: 'resource',
        quantity: 2,
      },
    ],
  },

  {
    id: 'watermelon-orb',
    name: 'Watermelon Orb',
    image: '/assets/food/watermelon-orb.png',
    level: 2,
    xp: XP_BY_LEVEL[2],
    race: null,
    ingredients: [
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 3,
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
    id: 'stone-stew',
    name: 'Stone Stew',
    image: '/assets/food/stone-stew.png',
    level: 2,
    xp: XP_BY_LEVEL[2],
    race: null,
    ingredients: [
      {
        id: 'stone',
        name: 'Stone',
        type: 'resource',
        quantity: 2,
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
    id: 'golden-fruit-bowl',
    name: 'Golden Fruit Bowl',
    image: '/assets/food/golden-fruit-bowl.png',
    level: 2,
    xp: XP_BY_LEVEL[2],
    race: null,
    ingredients: [
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 1,
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
    id: 'crystal-milk',
    name: 'Crystal Milk',
    image: '/assets/food/crystal-milk.png',
    level: 2,
    xp: XP_BY_LEVEL[2],
    race: null,
    ingredients: [
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 1,
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 2,
      },
    ],
  },

  // ========================================================================
  // LEVEL 3
  // ========================================================================

  {
    id: 'ancient-moon-pudding',
    name: 'Ancient Moon Pudding',
    image: '/assets/food/ancient-moon-pudding.png',
    level: 3,
    xp: XP_BY_LEVEL[3],
    race: null,
    ingredients: [
      {
        id: 'ancient-moon-fruit',
        name: 'Ancient Moon Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/ancient-moon-fruit.png',
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
    id: 'iron-root-soup',
    name: 'Iron Root Soup',
    image: '/assets/food/iron-root-soup.png',
    level: 3,
    xp: XP_BY_LEVEL[3],
    race: null,
    ingredients: [
      {
        id: 'iron',
        name: 'Iron',
        type: 'resource',
        quantity: 2,
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'resource',
        quantity: 2,
      },
    ],
  },

  {
    id: 'moon-fruit-salad',
    name: 'Moon Fruit Salad',
    image: '/assets/food/moon-fruit-salad.png',
    level: 3,
    xp: XP_BY_LEVEL[3],
    race: null,
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
    id: 'crystal-stew',
    name: 'Crystal Stew',
    image: '/assets/food/crystal-stew.png',
    level: 3,
    xp: XP_BY_LEVEL[3],
    race: null,
    ingredients: [
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 2,
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
    id: 'golden-crystal-cake',
    name: 'Golden Crystal Cake',
    image: '/assets/food/golden-crystal-cake.png',
    level: 3,
    xp: XP_BY_LEVEL[3],
    race: null,
    ingredients: [
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 1,
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 2,
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

  // ========================================================================
  // LEVEL 4
  // ========================================================================

  {
    id: 'celestial-star-soup',
    name: 'Celestial Star Soup',
    image: '/assets/food/celestial-star-soup.png',
    level: 4,
    xp: XP_BY_LEVEL[4],
    race: null,
    ingredients: [
      {
        id: 'celestial-star-fruit',
        name: 'Celestial Star Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/celestial-star-fruit.png',
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
    id: 'golden-root-stew',
    name: 'Golden Root Stew',
    image: '/assets/food/golden-root-stew.png',
    level: 4,
    xp: XP_BY_LEVEL[4],
    race: null,
    ingredients: [
      {
        id: 'golden-root-fruit',
        name: 'Golden Root Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/golden-root-fruit.png',
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
    id: 'shadow-berry-jelly',
    name: 'Shadow Berry Jelly',
    image: '/assets/food/shadow-berry-jelly.png',
    level: 4,
    xp: XP_BY_LEVEL[4],
    race: null,
    ingredients: [
      {
        id: 'shadow-berry',
        name: 'Shadow Berry',
        type: 'inventory',
        quantity: 2,
        image: '/assets/shadow-berry.png',
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
    id: 'energy-core-soup',
    name: 'Energy Core Soup',
    image: '/assets/food/energy-core-soup.png',
    level: 4,
    xp: XP_BY_LEVEL[4],
    race: null,
    ingredients: [
      {
        id: 'energy-core-fruit',
        name: 'Energy Core Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/energy-core-fruit.png',
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
    id: 'ancient-crystal-feast',
    name: 'Ancient Crystal Feast',
    image: '/assets/food/ancient-crystal-feast.png',
    level: 4,
    xp: XP_BY_LEVEL[4],
    race: null,
    ingredients: [
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
        quantity: 3,
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 1,
      },
    ],
  },

  // ========================================================================
  // LEVEL 5
  // ========================================================================

  {
    id: 'eternal-crystal-pudding',
    name: 'Eternal Crystal Pudding',
    image: '/assets/food/eternal-crystal-pudding.png',
    level: 5,
    xp: XP_BY_LEVEL[5],
    race: null,
    ingredients: [
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/eternal-crystal-fruit.png',
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
    id: 'star-crystal-cake',
    name: 'Star Crystal Cake',
    image: '/assets/food/star-crystal-cake.png',
    level: 5,
    xp: XP_BY_LEVEL[5],
    race: null,
    ingredients: [
      {
        id: 'celestial-star-fruit',
        name: 'Celestial Star Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/celestial-star-fruit.png',
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 3,
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
    id: 'eternal-moon-feast',
    name: 'Eternal Moon Feast',
    image: '/assets/food/eternal-moon-feast.png',
    level: 5,
    xp: XP_BY_LEVEL[5],
    race: null,
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
    ],
  },

  {
    id: 'energy-golden-soup',
    name: 'Energy Golden Soup',
    image: '/assets/food/energy-golden-soup.png',
    level: 5,
    xp: XP_BY_LEVEL[5],
    race: null,
    ingredients: [
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
        quantity: 3,
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
    id: 'shadow-crystal-dessert',
    name: 'Shadow Crystal Dessert',
    image: '/assets/food/shadow-crystal-dessert.png',
    level: 5,
    xp: XP_BY_LEVEL[5],
    race: null,
    ingredients: [
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
        quantity: 3,
      },
    ],
  },

  // ========================================================================
  // LEVEL 6 - RACE FOODS
  // ========================================================================

  {
    id: 'water-dragon-pearl',
    name: 'Water Dragon Pearl',
    image: '/assets/food/water-dragon-pearl.png',
    level: 6,
    xp: XP_BY_LEVEL[6],
    race: 'water',
    ingredients: [
      {
        id: 'orion-crystal-egg',
        name: 'Crystal Dragon Egg',
        type: 'inventory',
        quantity: 1,
        image: '/assets/orion-crystal-egg.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 5,
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
    id: 'air-dragon-breeze',
    name: 'Air Dragon Breeze',
    image: '/assets/food/air-dragon-breeze.png',
    level: 6,
    xp: XP_BY_LEVEL[6],
    race: 'air',
    ingredients: [
      {
        id: 'orion-celestial-egg',
        name: 'Celestial Dragon Egg',
        type: 'inventory',
        quantity: 1,
        image: '/assets/orion-celestial-egg.png',
      },
      {
        id: 'air',
        name: 'Air',
        type: 'resource',
        quantity: 5,
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
    id: 'earth-dragon-root',
    name: 'Earth Dragon Root',
    image: '/assets/food/earth-dragon-root.png',
    level: 6,
    xp: XP_BY_LEVEL[6],
    race: 'earth',
    ingredients: [
      {
        id: 'orion-nature-egg',
        name: 'Nature Dragon Egg',
        type: 'inventory',
        quantity: 1,
        image: '/assets/orion-nature-egg.png',
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'resource',
        quantity: 5,
      },
      {
        id: 'wood',
        name: 'Wood',
        type: 'resource',
        quantity: 3,
      },
    ],
  },

  {
    id: 'fire-dragon-bloom',
    name: 'Fire Dragon Bloom',
    image: '/assets/food/fire-dragon-bloom.png',
    level: 6,
    xp: XP_BY_LEVEL[6],
    race: 'fire',
    ingredients: [
      {
        id: 'orion-flame-egg',
        name: 'Flame Dragon Egg',
        type: 'inventory',
        quantity: 1,
        image: '/assets/orion-flame-egg.png',
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 5,
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
    id: 'asil-dragon-core',
    name: 'Asil Dragon Core',
    image: '/assets/food/asil-dragon-core.png',
    level: 6,
    xp: XP_BY_LEVEL[6],
    race: 'asil',
    ingredients: [
      {
        id: 'orion-eternal-egg',
        name: 'Eternal Dragon Egg',
        type: 'inventory',
        quantity: 1,
        image: '/assets/orion-eternal-egg.png',
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 5,
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 3,
      },
    ],
  },

  // ========================================================================
  // LEVEL 7
  // ========================================================================

  {
    id: 'water-dragon-soup',
    name: 'Water Dragon Soup',
    image: '/assets/food/water-dragon-soup.png',
    level: 7,
    xp: XP_BY_LEVEL[7],
    race: 'water',
    ingredients: [
      {
        id: 'orion-crystal-egg',
        name: 'Crystal Dragon Egg',
        type: 'inventory',
        quantity: 1,
        image: '/assets/orion-crystal-egg.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 8,
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 3,
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
    id: 'air-dragon-cake',
    name: 'Air Dragon Cake',
    image: '/assets/food/air-dragon-cake.png',
    level: 7,
    xp: XP_BY_LEVEL[7],
    race: 'air',
    ingredients: [
      {
        id: 'orion-celestial-egg',
        name: 'Celestial Dragon Egg',
        type: 'inventory',
        quantity: 1,
        image: '/assets/orion-celestial-egg.png',
      },
      {
        id: 'air',
        name: 'Air',
        type: 'resource',
        quantity: 8,
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 3,
      },
      {
        id: 'celestial-star-fruit',
        name: 'Celestial Star Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/celestial-star-fruit.png',
      },
    ],
  },

  {
    id: 'earth-dragon-feast',
    name: 'Earth Dragon Feast',
    image: '/assets/food/earth-dragon-feast.png',
    level: 7,
    xp: XP_BY_LEVEL[7],
    race: 'earth',
    ingredients: [
      {
        id: 'orion-nature-egg',
        name: 'Nature Dragon Egg',
        type: 'inventory',
        quantity: 1,
        image: '/assets/orion-nature-egg.png',
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'resource',
        quantity: 8,
      },
      {
        id: 'wood',
        name: 'Wood',
        type: 'resource',
        quantity: 5,
      },
      {
        id: 'golden-root-fruit',
        name: 'Golden Root Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/golden-root-fruit.png',
      },
    ],
  },

  {
    id: 'fire-dragon-feast',
    name: 'Fire Dragon Feast',
    image: '/assets/food/fire-dragon-feast.png',
    level: 7,
    xp: XP_BY_LEVEL[7],
    race: 'fire',
    ingredients: [
      {
        id: 'orion-flame-egg',
        name: 'Flame Dragon Egg',
        type: 'inventory',
        quantity: 1,
        image: '/assets/orion-flame-egg.png',
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 8,
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 3,
      },
      {
        id: 'fire-bloom-fruit',
        name: 'Fire Bloom Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/fire-bloom-fruit.png',
      },
    ],
  },

  {
    id: 'asil-dragon-feast',
    name: 'Asil Dragon Feast',
    image: '/assets/food/asil-dragon-feast.png',
    level: 7,
    xp: XP_BY_LEVEL[7],
    race: 'asil',
    ingredients: [
      {
        id: 'orion-eternal-egg',
        name: 'Eternal Dragon Egg',
        type: 'inventory',
        quantity: 1,
        image: '/assets/orion-eternal-egg.png',
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 8,
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 5,
      },
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/eternal-crystal-fruit.png',
      },
    ],
  },

  // ========================================================================
  // LEVEL 8
  // ========================================================================

  {
    id: 'water-dragon-elixir',
    name: 'Water Dragon Elixir',
    image: '/assets/food/water-dragon-elixir.png',
    level: 8,
    xp: XP_BY_LEVEL[8],
    race: 'water',
    ingredients: [
      {
        id: 'orion-crystal-egg',
        name: 'Crystal Dragon Egg',
        type: 'inventory',
        quantity: 2,
        image: '/assets/orion-crystal-egg.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 10,
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
    id: 'air-dragon-elixir',
    name: 'Air Dragon Elixir',
    image: '/assets/food/air-dragon-elixir.png',
    level: 8,
    xp: XP_BY_LEVEL[8],
    race: 'air',
    ingredients: [
      {
        id: 'orion-celestial-egg',
        name: 'Celestial Dragon Egg',
        type: 'inventory',
        quantity: 2,
        image: '/assets/orion-celestial-egg.png',
      },
      {
        id: 'air',
        name: 'Air',
        type: 'resource',
        quantity: 10,
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 5,
      },
    ],
  },

  {
    id: 'earth-dragon-elixir',
    name: 'Earth Dragon Elixir',
    image: '/assets/food/earth-dragon-elixir.png',
    level: 8,
    xp: XP_BY_LEVEL[8],
    race: 'earth',
    ingredients: [
      {
        id: 'orion-nature-egg',
        name: 'Nature Dragon Egg',
        type: 'inventory',
        quantity: 2,
        image: '/assets/orion-nature-egg.png',
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'resource',
        quantity: 10,
      },
      {
        id: 'wood',
        name: 'Wood',
        type: 'resource',
        quantity: 8,
      },
    ],
  },

  {
    id: 'fire-dragon-elixir',
    name: 'Fire Dragon Elixir',
    image: '/assets/food/fire-dragon-elixir.png',
    level: 8,
    xp: XP_BY_LEVEL[8],
    race: 'fire',
    ingredients: [
      {
        id: 'orion-flame-egg',
        name: 'Flame Dragon Egg',
        type: 'inventory',
        quantity: 2,
        image: '/assets/orion-flame-egg.png',
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 10,
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 5,
      },
    ],
  },

  {
    id: 'asil-dragon-elixir',
    name: 'Asil Dragon Elixir',
    image: '/assets/food/asil-dragon-elixir.png',
    level: 8,
    xp: XP_BY_LEVEL[8],
    race: 'asil',
    ingredients: [
      {
        id: 'orion-eternal-egg',
        name: 'Eternal Dragon Egg',
        type: 'inventory',
        quantity: 2,
        image: '/assets/orion-eternal-egg.png',
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 10,
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 8,
      },
    ],
  },

  // ========================================================================
  // LEVEL 9
  // ========================================================================

  {
    id: 'water-dragon-crown',
    name: 'Water Dragon Crown',
    image: '/assets/food/water-dragon-crown.png',
    level: 9,
    xp: XP_BY_LEVEL[9],
    race: 'water',
    ingredients: [
      {
        id: 'orion-crystal-egg',
        name: 'Crystal Dragon Egg',
        type: 'inventory',
        quantity: 2,
        image: '/assets/orion-crystal-egg.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 15,
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 8,
      },
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 1,
        image: '/assets/eternal-crystal-fruit.png',
      },
    ],
  },

  {
    id: 'air-dragon-crown',
    name: 'Air Dragon Crown',
    image: '/assets/food/air-dragon-crown.png',
    level: 9,
    xp: XP_BY_LEVEL[9],
    race: 'air',
    ingredients: [
      {
        id: 'orion-celestial-egg',
        name: 'Celestial Dragon Egg',
        type: 'inventory',
        quantity: 2,
        image: '/assets/orion-celestial-egg.png',
      },
      {
        id: 'air',
        name: 'Air',
        type: 'resource',
        quantity: 15,
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 8,
      },
      {
        id: 'celestial-star-fruit',
        name: 'Celestial Star Fruit',
        type: 'inventory',
        quantity: 2,
        image: '/assets/celestial-star-fruit.png',
      },
    ],
  },

  {
    id: 'earth-dragon-crown',
    name: 'Earth Dragon Crown',
    image: '/assets/food/earth-dragon-crown.png',
    level: 9,
    xp: XP_BY_LEVEL[9],
    race: 'earth',
    ingredients: [
      {
        id: 'orion-nature-egg',
        name: 'Nature Dragon Egg',
        type: 'inventory',
        quantity: 2,
        image: '/assets/orion-nature-egg.png',
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'resource',
        quantity: 15,
      },
      {
        id: 'wood',
        name: 'Wood',
        type: 'resource',
        quantity: 10,
      },
      {
        id: 'golden-root-fruit',
        name: 'Golden Root Fruit',
        type: 'inventory',
        quantity: 2,
        image: '/assets/golden-root-fruit.png',
      },
    ],
  },

  {
    id: 'fire-dragon-crown',
    name: 'Fire Dragon Crown',
    image: '/assets/food/fire-dragon-crown.png',
    level: 9,
    xp: XP_BY_LEVEL[9],
    race: 'fire',
    ingredients: [
      {
        id: 'orion-flame-egg',
        name: 'Flame Dragon Egg',
        type: 'inventory',
        quantity: 2,
        image: '/assets/orion-flame-egg.png',
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 15,
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 8,
      },
      {
        id: 'fire-bloom-fruit',
        name: 'Fire Bloom Fruit',
        type: 'inventory',
        quantity: 2,
        image: '/assets/fire-bloom-fruit.png',
      },
    ],
  },

  {
    id: 'asil-dragon-crown',
    name: 'Asil Dragon Crown',
    image: '/assets/food/asil-dragon-crown.png',
    level: 9,
    xp: XP_BY_LEVEL[9],
    race: 'asil',
    ingredients: [
      {
        id: 'orion-eternal-egg',
        name: 'Eternal Dragon Egg',
        type: 'inventory',
        quantity: 2,
        image: '/assets/orion-eternal-egg.png',
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 15,
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 10,
      },
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 2,
        image: '/assets/eternal-crystal-fruit.png',
      },
    ],
  },

  // ========================================================================
  // LEVEL 10
  // ========================================================================

  {
    id: 'water-dragon-supreme',
    name: 'Water Dragon Supreme',
    image: '/assets/food/water-dragon-supreme.png',
    level: 10,
    xp: XP_BY_LEVEL[10],
    race: 'water',
    ingredients: [
      {
        id: 'orion-crystal-egg',
        name: 'Crystal Dragon Egg',
        type: 'inventory',
        quantity: 3,
        image: '/assets/orion-crystal-egg.png',
      },
      {
        id: 'water',
        name: 'Water',
        type: 'resource',
        quantity: 20,
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 12,
      },
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 2,
        image: '/assets/eternal-crystal-fruit.png',
      },
    ],
  },

  {
    id: 'air-dragon-supreme',
    name: 'Air Dragon Supreme',
    image: '/assets/food/air-dragon-supreme.png',
    level: 10,
    xp: XP_BY_LEVEL[10],
    race: 'air',
    ingredients: [
      {
        id: 'orion-celestial-egg',
        name: 'Celestial Dragon Egg',
        type: 'inventory',
        quantity: 3,
        image: '/assets/orion-celestial-egg.png',
      },
      {
        id: 'air',
        name: 'Air',
        type: 'resource',
        quantity: 20,
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 12,
      },
      {
        id: 'celestial-star-fruit',
        name: 'Celestial Star Fruit',
        type: 'inventory',
        quantity: 3,
        image: '/assets/celestial-star-fruit.png',
      },
    ],
  },

  {
    id: 'earth-dragon-supreme',
    name: 'Earth Dragon Supreme',
    image: '/assets/food/earth-dragon-supreme.png',
    level: 10,
    xp: XP_BY_LEVEL[10],
    race: 'earth',
    ingredients: [
      {
        id: 'orion-nature-egg',
        name: 'Nature Dragon Egg',
        type: 'inventory',
        quantity: 3,
        image: '/assets/orion-nature-egg.png',
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'resource',
        quantity: 20,
      },
      {
        id: 'wood',
        name: 'Wood',
        type: 'resource',
        quantity: 15,
      },
      {
        id: 'golden-root-fruit',
        name: 'Golden Root Fruit',
        type: 'inventory',
        quantity: 3,
        image: '/assets/golden-root-fruit.png',
      },
    ],
  },

  {
    id: 'fire-dragon-supreme',
    name: 'Fire Dragon Supreme',
    image: '/assets/food/fire-dragon-supreme.png',
    level: 10,
    xp: XP_BY_LEVEL[10],
    race: 'fire',
    ingredients: [
      {
        id: 'orion-flame-egg',
        name: 'Flame Dragon Egg',
        type: 'inventory',
        quantity: 3,
        image: '/assets/orion-flame-egg.png',
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 20,
      },
      {
        id: 'gold',
        name: 'Gold',
        type: 'resource',
        quantity: 12,
      },
      {
        id: 'fire-bloom-fruit',
        name: 'Fire Bloom Fruit',
        type: 'inventory',
        quantity: 3,
        image: '/assets/fire-bloom-fruit.png',
      },
    ],
  },

  {
    id: 'asil-dragon-supreme',
    name: 'Asil Dragon Supreme',
    image: '/assets/food/asil-dragon-supreme.png',
    level: 10,
    xp: XP_BY_LEVEL[10],
    race: 'asil',
    ingredients: [
      {
        id: 'orion-eternal-egg',
        name: 'Eternal Dragon Egg',
        type: 'inventory',
        quantity: 3,
        image: '/assets/orion-eternal-egg.png',
      },
      {
        id: 'crystal',
        name: 'Crystal',
        type: 'resource',
        quantity: 20,
      },
      {
        id: 'fire',
        name: 'Fire',
        type: 'resource',
        quantity: 15,
      },
      {
        id: 'eternal-crystal-fruit',
        name: 'Eternal Crystal Fruit',
        type: 'inventory',
        quantity: 3,
        image: '/assets/eternal-crystal-fruit.png',
      },
    ],
  },
];

export function getFoodById(
  id: string
): FoodDefinition | undefined {
  return FOOD_CATALOG.find(
    (food) => food.id === id
  );
}

export function getFoodsByLevel(
  level: number
): FoodDefinition[] {
  return FOOD_CATALOG.filter(
    (food) => food.level === level
  );
}

export function getFoodsByRace(
  race: Exclude<FoodRace, null>
): FoodDefinition[] {
  return FOOD_CATALOG.filter(
    (food) => food.race === race
  );
}

export function getFoodInventoryId(
  foodId: string
): string {
  return `food:${foodId}`;
}

export function createFoodInventoryItem(
  food: FoodDefinition,
  quantity = 1
): InventoryItem {
  return {
    id: getFoodInventoryId(food.id),
    name: food.name,
    type: 'food',
    quantity,
    rarity:
      food.level >= 10
        ? 'mythic'
        : food.level >= 8
          ? 'legendary'
          : food.level >= 6
            ? 'epic'
            : food.level >= 4
              ? 'rare'
              : 'common',
    image: food.image,
  };
}