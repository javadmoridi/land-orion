export type EggRarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';


export interface EggOrion {
  id: string;
  name: string;
  image: string;
  race: string;
}


export interface EggDef {
  id: string;
  name: string;
  image: string;
  price: number;
  rarity: EggRarity;
  orion: EggOrion;
}


export const EGGS: EggDef[] = [

  {
    id: 'orion-seed-egg',
    name: 'Fire Orion Egg',
    image: '/assets/orion-seed-egg.png',
    price: 100,
    rarity: 'rare',

    orion: {
      id: 'fire-orion',
      name: 'Fire Orion',
      image: '/assets/orion-fire.png',
      race: 'fire',
    },
  },


  {
    id: 'orion-crystal-egg',
    name: 'Water Orion Egg',
    image: '/assets/orion-crystal-egg.png',
    price: 100,
    rarity: 'rare',

    orion: {
      id: 'water-orion',
      name: 'Water Orion',
      image: '/assets/orion-water.png',
      race: 'water',
    },
  },


  {
    id: 'orion-ancient-egg',
    name: 'Earth Orion Egg',
    image: '/assets/orion-ancient-egg.png',
    price: 1000,
    rarity: 'epic',

    orion: {
      id: 'earth-orion',
      name: 'Earth Orion',
      image: '/assets/orion-earth.png',
      race: 'earth',
    },
  },


  {
    id: 'orion-celestial-egg',
    name: 'Air Orion Egg',
    image: '/assets/orion-celestial-egg.png',
    price: 1000,
    rarity: 'epic',

    orion: {
      id: 'air-orion',
      name: 'Air Orion',
      image: '/assets/orion-air.png',
      race: 'air',
    },
  },


  {
    id: 'orion-eternal-egg',
    name: 'Pure Orion Egg',
    image: '/assets/orion-eternal-egg.png',
    price: 10000,
    rarity: 'legendary',

    orion: {
      id: 'pure-orion',
      name: 'Pure Orion',
      image: '/assets/orion-asil.png',
      race: 'asil',
    },
  },

];


export function getEggById(
  id: string
): EggDef | undefined {

  return EGGS.find(
    (egg) => egg.id === id
  );

}