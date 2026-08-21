import type { InventoryItem } from '../types';

export interface Seed {
  id: string;
  name: string;
  image: string;
  fruitId: string;
  fruitName: string;
  fruitImage: string;
  price: number;
  growTime: number;
}

export const SEEDS: Seed[] = [
  {
    id: 'seed-1',
    name: 'Crystal Seed',
    image: '/assets/seed-1.png',
    fruitId: 'crystal-pear',
    fruitName: 'Crystal Pear',
    fruitImage: '/assets/crystal-pear.png',
    price: 1,
    growTime: 60,
  },
  {
    id: 'seed-2',
    name: 'Fire Seed',
    image: '/assets/seed-2.png',
    fruitId: 'nova-berry',
    fruitName: 'Nova Berry',
    fruitImage: '/assets/nova-berry.png',
    price: 2,
    growTime: 900,
  },
  {
    id: 'seed-3',
    name: 'Ice Seed',
    image: '/assets/seed-3.png',
    fruitId: 'moon-apple',
    fruitName: 'Moon Apple',
    fruitImage: '/assets/moon-apple.png',
    price: 5,
    growTime: 1800,
  },
  {
    id: 'seed-4',
    name: 'Light Seed',
    image: '/assets/seed-4.png',
    fruitId: 'orion-eternal-fruit',
    fruitName: 'Orion Eternal Fruit',
    fruitImage: '/assets/orion-eternal-fruit.png',
    price: 10,
    growTime: 3600,
  },
  {
    id: 'seed-5',
    name: 'Shadow Seed',
    image: '/assets/seed-5.png',
    fruitId: 'nebula-orange',
    fruitName: 'Nebula Orange',
    fruitImage: '/assets/nebula-orange.png',
    price: 20,
    growTime: 7200,
  },
  {
    id: 'seed-6',
    name: 'Forest Seed',
    image: '/assets/seed-6.png',
    fruitId: 'cosmic-peach',
    fruitName: 'Cosmic Peach',
    fruitImage: '/assets/cosmic-peach.png',
    price: 50,
    growTime: 14400,
  },
  {
    id: 'seed-7',
    name: 'Moon Seed',
    image: '/assets/seed-7.png',
    fruitId: 'galaxy-mango',
    fruitName: 'Galaxy Mango',
    fruitImage: '/assets/galaxy-mango.png',
    price: 100,
    growTime: 28800,
  },
  {
    id: 'seed-8',
    name: 'Star Seed',
    image: '/assets/seed-8.png',
    fruitId: 'star-plum',
    fruitName: 'Star Plum',
    fruitImage: '/assets/star-plum.png',
    price: 200,
    growTime: 43200,
  },
  {
    id: 'seed-9',
    name: 'Ancient Seed',
    image: '/assets/seed-9.png',
    fruitId: 'celestial-melon',
    fruitName: 'Celestial Melon',
    fruitImage: '/assets/celestial-melon.png',
    price: 500,
    growTime: 54000,
  },
  {
    id: 'seed-10',
    name: 'Orion Seed',
    image: '/assets/seed-10.png',
    fruitId: 'solar-dragon-fruit',
    fruitName: 'Solar Dragon Fruit',
    fruitImage: '/assets/solar-dragon-fruit.png',
    price: 1000,
    growTime: 86400,
  },
];

export function getSeedById(id: string): Seed | undefined {
  return SEEDS.find((s) => s.id === id);
}

/* ================================================================
   FRUIT ID NORMALIZATION
   ================================================================
   Previously, harvested fruits were stored in the inventory under
   legacy ids like `fruit-seed-1`, `fruit-seed-2`, ... while food
   recipes reference canonical fruit ids like `crystal-pear`,
   `nova-berry`, ... Because of that mismatch the kitchen could not
   see/use the harvested fruits.

   This helper remaps any legacy fruit id to its canonical id and
   merges duplicated entries so saved games keep working.
   ================================================================ */

export function normalizeFruitInventory(
  inventory: InventoryItem[],
): InventoryItem[] {
  const legacyToCanonical: Record<string, string> = {};

  for (const seed of SEEDS) {
    legacyToCanonical[`fruit-${seed.id}`] = seed.fruitId;
  }

  const merged = new Map<string, InventoryItem>();

  for (const item of inventory ?? []) {
    const canonicalId =
      item.type === 'fruit'
        ? legacyToCanonical[item.id] ?? item.id
        : item.id;

    const key = `${item.type}:${canonicalId}`;

    const existing = merged.get(key);

    if (existing) {
      merged.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        image: item.image ?? existing.image,
        name: item.name ?? existing.name,
      });
    } else {
      merged.set(key, {
        ...item,
        id: canonicalId,
      });
    }
  }

  return Array.from(merged.values());
}