// ===========================================================================
// Orion Egg catalog — the purchasable eggs sold in the Egg Shop.
// ===========================================================================

/** Rarity used to tag the resulting inventory items. */
export type EggRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface EggDef {
  id: string;
  name: string;
  image: string;
  /** Price in Coins (🪙). */
  price: number;
  rarity: EggRarity;
}

export const EGGS: EggDef[] = [
  {
    id: 'orion-seed-egg',
    name: 'Orion Seed Egg',
    image: '/assets/orion-seed-egg.png',
    price: 10,
    rarity: 'common',
  },
  {
    id: 'orion-crystal-egg',
    name: 'Orion Crystal Egg',
    image: '/assets/orion-crystal-egg.png',
    price: 50,
    rarity: 'rare',
  },
  {
    id: 'orion-ancient-egg',
    name: 'Orion Ancient Egg',
    image: '/assets/orion-ancient-egg.png',
    price: 100,
    rarity: 'epic',
  },
  {
    id: 'orion-celestial-egg',
    name: 'Orion Celestial Egg',
    image: '/assets/orion-celestial-egg.png',
    price: 500,
    rarity: 'epic',
  },
  {
    id: 'orion-eternal-egg',
    name: 'Orion Eternal Egg',
    image: '/assets/orion-eternal-egg.png',
    price: 1000,
    rarity: 'legendary',
  },
];

/** Find an egg definition by its id. */
export function getEggById(id: string): EggDef | undefined {
  return EGGS.find((egg) => egg.id === id);
}
