// ===========================================================================
// Orion Egg catalog — the purchasable eggs sold in the Egg Shop.
//
// Every egg hatches in the Orion Incubator into a dedicated FRUIT (see the
// `fruit` field). A common egg hatches in 25 game ticks; rarer eggs take 50.
// Eggs are bought with Orion Coins (💎 / Tokens) at a flat 20 Coins per egg.
// ===========================================================================

/** Rarity used to tag the resulting inventory items and hatch tier. */
export type EggRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

/** A fruit produced when an egg hatches — has its own icon. */
export interface EggFruit {
  id: string;
  name: string;
  /** Icon shown for the ripe fruit. */
  image: string;
}

export interface EggDef {
  id: string;
  name: string;
  image: string;
    /** Price in Orion Coins (🪙). Flat 10 per egg; buy any quantity (group) at once. */
  price: number;
  rarity: EggRarity;
  /** The fruit this egg hatches into (with its own fruit image). */
  fruit: EggFruit;
}

export const EGGS: EggDef[] = [
  {
    id: 'orion-seed-egg',
    name: 'Orion Seed Egg',
    image: '/assets/orion-seed-egg.png',
    price: 10,
    rarity: 'common',
    fruit: {
      id: 'sun-berry',
      name: 'Sun Berry',
      image: '/assets/sun-berry.png',
    },
  },
  {
    id: 'orion-crystal-egg',
    name: 'Orion Crystal Egg',
    image: '/assets/orion-crystal-egg.png',
    price: 100,
    rarity: 'rare',
    fruit: {
      id: 'crystal-apple',
      name: 'Crystal Apple',
      image: '/assets/crystal-apple.png',
    },
  },
  {
    id: 'orion-ancient-egg',
    name: 'Orion Ancient Egg',
    image: '/assets/orion-ancient-egg.png',
    price: 1000,
    rarity: 'epic',
    fruit: {
      id: 'ancient-moon-fruit',
      name: 'Ancient Moon Fruit',
      image: '/assets/ancient-moon-fruit.png',
    },
  },
  {
    id: 'orion-celestial-egg',
    name: 'Orion Celestial Egg',
    image: '/assets/orion-celestial-egg.png',
    price: 10000,
    rarity: 'legendary',
    fruit: {
      id: 'celestial-star-fruit',
      name: 'Celestial Star Fruit',
      image: '/assets/celestial-star-fruit.png',
    },
  },
  {
    id: 'orion-eternal-egg',
    name: 'Orion Eternal Egg',
    image: '/assets/orion-eternal-egg.png',
    price: 100000,
    rarity: 'mythic',
    fruit: {
      id: 'eternal-crystal-fruit',
      name: 'Eternal Crystal Fruit',
      image: '/assets/eternal-crystal-fruit.png',
    },
  },
  {
    id: 'orion-flame-egg',
    name: 'Orion Flame Egg',
    image: '/assets/orion-flame-egg.png',
    price: 100,
    rarity: 'rare',
    fruit: {
      id: 'fire-bloom-fruit',
      name: 'Fire Bloom Fruit',
      image: '/assets/fire-bloom-fruit.png',
    },
  },
  {
    id: 'orion-nature-egg',
    name: 'Orion Nature Egg',
    image: '/assets/orion-nature-egg.png',
    price: 100,
    rarity: 'rare',
    fruit: {
      id: 'green-life-fruit',
      name: 'Green Life Fruit',
      image: '/assets/green-life-fruit.png',
    },
  },
  {
    id: 'orion-shadow-egg',
    name: 'Orion Shadow Egg',
    image: '/assets/orion-shadow-egg.png',
    price: 1000,
    rarity: 'epic',
    fruit: {
      id: 'shadow-berry',
      name: 'Shadow Berry',
      image: '/assets/shadow-berry.png',
    },
  },
  {
    id: 'orion-energy-egg',
    name: 'Orion Energy Egg',
    image: '/assets/orion-energy-egg.png',
    price: 1000,
    rarity: 'epic',
    fruit: {
      id: 'energy-core-fruit',
      name: 'Energy Core Fruit',
      image: '/assets/energy-core-fruit.png',
    },
  },
  {
    id: 'orion-golden-egg',
    name: 'Orion Golden Egg',
    image: '/assets/orion-golden-egg.png',
    price: 10000,
    rarity: 'legendary',
    fruit: {
      id: 'golden-root-fruit',
      name: 'Golden Root Fruit',
      image: '/assets/golden-root-fruit.png',
    },
  },
];

/** Find an egg definition by its id. */
export function getEggById(id: string): EggDef | undefined {
  return EGGS.find((egg) => egg.id === id);
}
