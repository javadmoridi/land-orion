export interface Seed {
  id: string;
  name: string;
  /** Icon used in the shop & inventory (seed packet). */
  image: string;
  /** Icon used when the fruit is harvested (defaults to the seed image). */
  fruitImage: string;
  price: number;      // Coin
  growTime: number;   // seconds
}

export const SEEDS: Seed[] = [
  { id:'seed-1', name:'Crystal Seed', image:'/assets/seed-1.png', fruitImage:'/assets/seed-1.png', price:1, growTime:60 },
  { id:'seed-2', name:'Fire Seed', image:'/assets/seed-2.png', fruitImage:'/assets/seed-2.png', price:2, growTime:900 },
  { id:'seed-3', name:'Ice Seed', image:'/assets/seed-3.png', fruitImage:'/assets/seed-3.png', price:5, growTime:1800 },
  { id:'seed-4', name:'Light Seed', image:'/assets/seed-4.png', fruitImage:'/assets/seed-4.png', price:10, growTime:3600 },
  { id:'seed-5', name:'Shadow Seed', image:'/assets/seed-5.png', fruitImage:'/assets/seed-5.png', price:20, growTime:7200 },
  { id:'seed-6', name:'Forest Seed', image:'/assets/seed-6.png', fruitImage:'/assets/seed-6.png', price:50, growTime:14400 },
  { id:'seed-7', name:'Moon Seed', image:'/assets/seed-7.png', fruitImage:'/assets/seed-7.png', price:100, growTime:28800 },
  { id:'seed-8', name:'Star Seed', image:'/assets/seed-8.png', fruitImage:'/assets/seed-8.png', price:200, growTime:43200 },
  { id:'seed-9', name:'Ancient Seed', image:'/assets/seed-9.png', fruitImage:'/assets/seed-9.png', price:500, growTime:54000 },
  { id:'seed-10', name:'Orion Seed', image:'/assets/seed-10.png', fruitImage:'/assets/seed-10.png', price:1000, growTime:86400 },
];

export function getSeedById(id: string): Seed | undefined {
  return SEEDS.find((s) => s.id === id);
}