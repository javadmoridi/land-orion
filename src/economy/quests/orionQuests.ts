import type {
  Quest,
  QuestCharacterId,
  QuestContext,
} from './questTypes';

const CHARACTER_ID: QuestCharacterId = 'orion';

function reward(coins: number): Quest['reward'] {
  return {
    coins,
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

function createQuest(
  day: number,
  id: string,
  title: string,
  description: string,
  requirements: Partial<
    Pick<
      QuestContext,
      | 'water'
      | 'air'
      | 'earth'
      | 'fire'
      | 'wood'
      | 'stone'
      | 'iron'
      | 'gold'
      | 'crystal'
      | 'food'
    >
  >,
  coins: number
): Quest {
  return {
    id,
    characterId: CHARACTER_ID,
    day,
    title,
    description,

    condition: {
      label: Object.entries(requirements)
        .map(
          ([key, value]) =>
            `${value} ${key}`
        )
        .join(' + '),

      test: (ctx: QuestContext) =>
        Object.entries(requirements).every(
          ([key, value]) =>
            ctx[
              key as keyof QuestContext
            ] >= Number(value)
        ),
    },

    reward: reward(coins),
  };
}

export const ORION_QUESTS: Quest[] = [
  createQuest(
    1,
    'orion-mixed-01',
    'First Step',
    'Gather wood and water.',
    {
      wood: 10,
      water: 10,
    },
    500
  ),

  createQuest(
    2,
    'orion-mixed-02',
    'Stone and Wind',
    'Gather stone and air.',
    {
      stone: 5,
      air: 10,
    },
    600
  ),

  createQuest(
    3,
    'orion-mixed-03',
    'Fire and Earth',
    'Gather fire and earth.',
    {
      fire: 10,
      earth: 10,
    },
    700
  ),

  createQuest(
    4,
    'orion-mixed-04',
    'Forest Supplies',
    'Gather wood, stone and water.',
    {
      wood: 20,
      stone: 10,
      water: 15,
    },
    800
  ),

  createQuest(
    5,
    'orion-mixed-05',
    'Elemental Balance',
    'Gather water, air and fire.',
    {
      water: 15,
      air: 15,
      fire: 10,
    },
    900
  ),

  createQuest(
    6,
    'orion-mixed-06',
    'Mineral Expedition',
    'Gather iron, gold and crystal.',
    {
      iron: 3,
      gold: 2,
      crystal: 2,
    },
    1000
  ),

  createQuest(
    7,
    'orion-mixed-07',
    'Colony Supplies',
    'Gather wood, stone, iron and water.',
    {
      wood: 30,
      stone: 15,
      iron: 5,
      water: 20,
    },
    1100
  ),

  createQuest(
    8,
    'orion-mixed-08',
    'Elemental Expedition',
    'Gather all four elements.',
    {
      water: 20,
      air: 20,
      earth: 20,
      fire: 20,
    },
    1200
  ),

  createQuest(
    9,
    'orion-mixed-09',
    'Treasures of Orion',
    'Gather gold and crystal.',
    {
      gold: 3,
      crystal: 2,
    },
    1300
  ),

  createQuest(
    10,
    'orion-mixed-10',
    'Builder’s Supplies',
    'Gather wood, stone and iron.',
    {
      wood: 40,
      stone: 20,
      iron: 6,
    },
    1400
  ),

  createQuest(
    11,
    'orion-mixed-11',
    'Water and Flame',
    'Gather water and fire.',
    {
      water: 30,
      fire: 20,
    },
    1500
  ),

  createQuest(
    12,
    'orion-mixed-12',
    'Wind and Earth',
    'Gather air and earth.',
    {
      air: 30,
      earth: 25,
    },
    1600
  ),

  createQuest(
    13,
    'orion-mixed-13',
    'Three Elements',
    'Gather water, air and earth.',
    {
      water: 25,
      air: 25,
      earth: 25,
    },
    1700
  ),

  createQuest(
    14,
    'orion-mixed-14',
    'Four Elements',
    'Gather water, air, earth and fire.',
    {
      water: 30,
      air: 30,
      earth: 30,
      fire: 30,
    },
    1800
  ),

  createQuest(
    15,
    'orion-mixed-15',
    'Ironworks',
    'Gather iron and wood.',
    {
      iron: 10,
      wood: 50,
    },
    1900
  ),

  createQuest(
    16,
    'orion-mixed-16',
    'Stoneworks',
    'Gather stone and fire.',
    {
      stone: 30,
      fire: 30,
    },
    2000
  ),

  createQuest(
    17,
    'orion-mixed-17',
    'Golden Foundation',
    'Gather gold, stone and wood.',
    {
      gold: 4,
      stone: 25,
      wood: 50,
    },
    2100
  ),

  createQuest(
    18,
    'orion-mixed-18',
    'Crystal Foundation',
    'Gather crystal, iron and earth.',
    {
      crystal: 3,
      iron: 8,
      earth: 30,
    },
    2200
  ),

  createQuest(
    19,
    'orion-mixed-19',
    'River Colony',
    'Gather water, wood and stone.',
    {
      water: 40,
      wood: 60,
      stone: 30,
    },
    2300
  ),

  createQuest(
    20,
    'orion-mixed-20',
    'Sky Colony',
    'Gather air, earth and fire.',
    {
      air: 40,
      earth: 40,
      fire: 30,
    },
    2400
  ),

  createQuest(
    21,
    'orion-mixed-21',
    'Miner’s Journey',
    'Gather iron, gold and crystal.',
    {
      iron: 12,
      gold: 5,
      crystal: 3,
    },
    2500
  ),

  createQuest(
    22,
    'orion-mixed-22',
    'Great Gathering',
    'Gather wood, stone and all elements.',
    {
      wood: 70,
      stone: 35,
      water: 25,
      air: 25,
      earth: 25,
      fire: 25,
    },
    2600
  ),

  createQuest(
    23,
    'orion-mixed-23',
    'Elemental Treasure',
    'Gather elements and gold.',
    {
      water: 40,
      air: 40,
      fire: 40,
      gold: 5,
    },
    2700
  ),

  createQuest(
    24,
    'orion-mixed-24',
    'Crystal Wind',
    'Gather crystal, air and water.',
    {
      crystal: 4,
      air: 50,
      water: 50,
    },
    2800
  ),

  createQuest(
    25,
    'orion-mixed-25',
    'Halfway Expedition',
    'Gather many different resources.',
    {
      wood: 80,
      stone: 40,
      iron: 10,
      water: 30,
      fire: 30,
    },
    2900
  ),

  createQuest(
    26,
    'orion-mixed-26',
    'Ancient Earth',
    'Gather earth, gold and crystal.',
    {
      earth: 60,
      gold: 6,
      crystal: 4,
    },
    3000
  ),

  createQuest(
    27,
    'orion-mixed-27',
    'Storm Supplies',
    'Gather air, water and fire.',
    {
      air: 60,
      water: 50,
      fire: 40,
    },
    3100
  ),

  createQuest(
    28,
    'orion-mixed-28',
    'Great Builder',
    'Gather wood, stone and iron.',
    {
      wood: 100,
      stone: 50,
      iron: 12,
    },
    3200
  ),

  createQuest(
    29,
    'orion-mixed-29',
    'Golden Colony',
    'Gather gold, wood and earth.',
    {
      gold: 7,
      wood: 90,
      earth: 50,
    },
    3300
  ),

  createQuest(
    30,
    'orion-mixed-30',
    'Crystal Colony',
    'Gather crystal, stone and fire.',
    {
      crystal: 5,
      stone: 60,
      fire: 50,
    },
    3400
  ),

  createQuest(
    31,
    'orion-mixed-31',
    'Four Winds',
    'Gather all four elemental resources.',
    {
      water: 60,
      air: 60,
      earth: 60,
      fire: 60,
    },
    3500
  ),

  createQuest(
    32,
    'orion-mixed-32',
    'Mineral Kingdom',
    'Gather iron, gold and crystal.',
    {
      iron: 15,
      gold: 8,
      crystal: 5,
    },
    3600
  ),

  createQuest(
    33,
    'orion-mixed-33',
    'Forest Kingdom',
    'Gather wood, water and earth.',
    {
      wood: 120,
      water: 70,
      earth: 60,
    },
    3700
  ),

  createQuest(
    34,
    'orion-mixed-34',
    'Stone Kingdom',
    'Gather stone, air and fire.',
    {
      stone: 70,
      air: 70,
      fire: 60,
    },
    3800
  ),

  createQuest(
    35,
    'orion-mixed-35',
    'Orion’s Wealth',
    'Gather gold, crystal and iron.',
    {
      gold: 10,
      crystal: 6,
      iron: 18,
    },
    3900
  ),

  createQuest(
    36,
    'orion-mixed-36',
    'Elemental Wealth',
    'Gather water, air, earth and fire.',
    {
      water: 80,
      air: 80,
      earth: 80,
      fire: 80,
    },
    4000
  ),

  createQuest(
    37,
    'orion-mixed-37',
    'Grand Expedition',
    'Gather wood, stone, iron and elements.',
    {
      wood: 130,
      stone: 70,
      iron: 15,
      water: 50,
      air: 50,
    },
    4100
  ),

  createQuest(
    38,
    'orion-mixed-38',
    'Ancient Treasure',
    'Gather gold, crystal and earth.',
    {
      gold: 12,
      crystal: 7,
      earth: 80,
    },
    4200
  ),

  createQuest(
    39,
    'orion-mixed-39',
    'Firestorm',
    'Gather fire, air and water.',
    {
      fire: 100,
      air: 80,
      water: 70,
    },
    4300
  ),

  createQuest(
    40,
    'orion-mixed-40',
    'Great Foundation',
    'Gather wood, stone, iron and gold.',
    {
      wood: 150,
      stone: 80,
      iron: 20,
      gold: 10,
    },
    4400
  ),

  createQuest(
    41,
    'orion-mixed-41',
    'Elemental Foundation',
    'Gather all four elements.',
    {
      water: 90,
      air: 90,
      earth: 90,
      fire: 90,
    },
    4500
  ),

  createQuest(
    42,
    'orion-mixed-42',
    'Crystal Empire',
    'Gather crystal, gold and iron.',
    {
      crystal: 8,
      gold: 12,
      iron: 20,
    },
    4600
  ),

  createQuest(
    43,
    'orion-mixed-43',
    'Royal Resources',
    'Gather wood, stone, water and earth.',
    {
      wood: 160,
      stone: 90,
      water: 80,
      earth: 80,
    },
    4700
  ),

  createQuest(
    44,
    'orion-mixed-44',
    'Royal Elements',
    'Gather air, fire, gold and crystal.',
    {
      air: 100,
      fire: 100,
      gold: 15,
      crystal: 8,
    },
    4800
  ),

  createQuest(
    45,
    'orion-mixed-45',
    'Kingdom Expansion',
    'Gather major colony resources.',
    {
      wood: 180,
      stone: 100,
      iron: 25,
      water: 100,
    },
    4900
  ),

  createQuest(
    46,
    'orion-mixed-46',
    'Elemental Expansion',
    'Gather large quantities of the elements.',
    {
      water: 100,
      air: 100,
      earth: 100,
      fire: 100,
    },
    5000
  ),

  createQuest(
    47,
    'orion-mixed-47',
    'Orion’s Treasury',
    'Gather gold, crystal, iron and wood.',
    {
      gold: 18,
      crystal: 10,
      iron: 25,
      wood: 200,
    },
    5000
  ),

  createQuest(
    48,
    'orion-mixed-48',
    'Great Kingdom',
    'Gather resources from many lands.',
    {
      wood: 200,
      stone: 120,
      water: 100,
      air: 100,
      earth: 100,
    },
    5000
  ),

  createQuest(
    49,
    'orion-mixed-49',
    'Final Expedition',
    'Gather powerful resources from the kingdom.',
    {
      iron: 30,
      gold: 20,
      crystal: 10,
      fire: 120,
      air: 120,
    },
    5000
  ),

  createQuest(
    50,
    'orion-mixed-50',
    'Founder of Orion',
    'Gather a great combination of resources.',
    {
      wood: 250,
      stone: 150,
      iron: 30,
      gold: 20,
      crystal: 10,
      water: 120,
      air: 120,
      earth: 120,
      fire: 120,
    },
    5000
  ),
];