import type { PlayerResources } from '../resourceStore';

export interface NyxQuest {
  id: string;
  characterId: 'nyx';
  title: string;
  description: string;
  day: number;
  condition: {
    label: string;
    test: (ctx: NyxQuestContext) => boolean;
  };
  reward: PlayerResources;
}

export interface NyxQuestContext {
  coins: number;
  tokens: number;
  gems: number;

  water: number;
  air: number;
  earth: number;
  fire: number;

  wood: number;
  stone: number;
  iron: number;
  gold: number;
  crystal: number;

  food: number;
  housesBuilt: number;
  questsClaimed: number;
}

const reward = (
  coins = 0,
  tokens = 0,
  gems = 0
): PlayerResources => ({
  coins,
  tokens,
  gems,

  water: 0,
  air: 0,
  earth: 0,
  fire: 0,

  wood: 0,
  stone: 0,
  iron: 0,
  gold: 0,
  crystal: 0,
});

const quest = (
  day: number,
  id: string,
  title: string,
  description: string,
  label: string,
  test: (ctx: NyxQuestContext) => boolean,
  questReward: PlayerResources
): NyxQuest => ({
  id,
  characterId: 'nyx',
  day,
  title,
  description,
  condition: {
    label,
    test,
  },
  reward: questReward,
});

/*
|--------------------------------------------------------------------------
| NYX — WISE ELDER
|--------------------------------------------------------------------------
|
| Nyx requests elemental resources:
| water, fire, air, earth
|
| Total requested elements:
| 100 items = 0.5 token
| 200 items = 1 token
| 300 items = 1.5 tokens
| 400 items = 2 tokens
| 500 items = 2.5 tokens
| 600 items = 3 tokens
|
| Minimum total: 100
| Maximum reward: 3 tokens
|
| Different combinations are used.
|--------------------------------------------------------------------------
*/

export const NYX_QUESTS: NyxQuest[] = [
  quest(
    1,
    'nyx-001',
    'Flame and Water',
    'Gather 50 fire and 50 water.',
    '50 fire + 50 water',
    (ctx) =>
      ctx.fire >= 50 &&
      ctx.water >= 50,
    reward(0, 0.5, 0)
  ),

  quest(
    2,
    'nyx-002',
    'Wind and Earth',
    'Gather 60 air and 40 earth.',
    '60 air + 40 earth',
    (ctx) =>
      ctx.air >= 60 &&
      ctx.earth >= 40,
    reward(0, 0.5, 0)
  ),

  quest(
    3,
    'nyx-003',
    'Elemental Balance',
    'Gather 25 water, 25 fire, 25 air and 25 earth.',
    '25 water + 25 fire + 25 air + 25 earth',
    (ctx) =>
      ctx.water >= 25 &&
      ctx.fire >= 25 &&
      ctx.air >= 25 &&
      ctx.earth >= 25,
    reward(0, 0.5, 0)
  ),

  quest(
    4,
    'nyx-004',
    'Fire Storm',
    'Gather 100 fire and 100 air.',
    '100 fire + 100 air',
    (ctx) =>
      ctx.fire >= 100 &&
      ctx.air >= 100,
    reward(0, 1, 0)
  ),

  quest(
    5,
    'nyx-005',
    'Earth and Water',
    'Gather 120 earth and 80 water.',
    '120 earth + 80 water',
    (ctx) =>
      ctx.earth >= 120 &&
      ctx.water >= 80,
    reward(0, 1, 0)
  ),

  quest(
    6,
    'nyx-006',
    'Four Elements',
    'Gather 75 water, 75 fire, 75 air and 75 earth.',
    '75 water + 75 fire + 75 air + 75 earth',
    (ctx) =>
      ctx.water >= 75 &&
      ctx.fire >= 75 &&
      ctx.air >= 75 &&
      ctx.earth >= 75,
    reward(0, 1.5, 0)
  ),

  quest(
    7,
    'nyx-007',
    'Ancient Element',
    'Gather 150 fire and 150 earth.',
    '150 fire + 150 earth',
    (ctx) =>
      ctx.fire >= 150 &&
      ctx.earth >= 150,
    reward(0, 1.5, 0)
  ),

  quest(
    8,
    'nyx-008',
    'Storm and Flame',
    'Gather 200 air and 100 fire.',
    '200 air + 100 fire',
    (ctx) =>
      ctx.air >= 200 &&
      ctx.fire >= 100,
    reward(0, 1.5, 0)
  ),

  quest(
    9,
    'nyx-009',
    'Earth Guardian',
    'Gather 250 earth and 50 water.',
    '250 earth + 50 water',
    (ctx) =>
      ctx.earth >= 250 &&
      ctx.water >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    10,
    'nyx-010',
    'Elemental Trial',
    'Gather 100 of each element.',
    '100 water + 100 fire + 100 air + 100 earth',
    (ctx) =>
      ctx.water >= 100 &&
      ctx.fire >= 100 &&
      ctx.air >= 100 &&
      ctx.earth >= 100,
    reward(0, 2, 0)
  ),

  quest(
    11,
    'nyx-011',
    'Water Spirit',
    'Gather 300 water.',
    '300 water',
    (ctx) => ctx.water >= 300,
    reward(0, 1.5, 0)
  ),

  quest(
    12,
    'nyx-012',
    'Fire Spirit',
    'Gather 300 fire.',
    '300 fire',
    (ctx) => ctx.fire >= 300,
    reward(0, 1.5, 0)
  ),

  quest(
    13,
    'nyx-013',
    'Wind Spirit',
    'Gather 300 air.',
    '300 air',
    (ctx) => ctx.air >= 300,
    reward(0, 1.5, 0)
  ),

  quest(
    14,
    'nyx-014',
    'Earth Spirit',
    'Gather 300 earth.',
    '300 earth',
    (ctx) => ctx.earth >= 300,
    reward(0, 1.5, 0)
  ),

  quest(
    15,
    'nyx-015',
    'Elemental Path',
    'Gather 150 water and 150 air.',
    '150 water + 150 air',
    (ctx) =>
      ctx.water >= 150 &&
      ctx.air >= 150,
    reward(0, 1.5, 0)
  ),

  quest(
    16,
    'nyx-016',
    'Flame and Earth',
    'Gather 150 fire and 150 earth.',
    '150 fire + 150 earth',
    (ctx) =>
      ctx.fire >= 150 &&
      ctx.earth >= 150,
    reward(0, 1.5, 0)
  ),

  quest(
    17,
    'nyx-017',
    'Sky and Flame',
    'Gather 175 air and 125 fire.',
    '175 air + 125 fire',
    (ctx) =>
      ctx.air >= 175 &&
      ctx.fire >= 125,
    reward(0, 1.5, 0)
  ),

  quest(
    18,
    'nyx-018',
    'Deep Earth',
    'Gather 200 earth and 100 water.',
    '200 earth + 100 water',
    (ctx) =>
      ctx.earth >= 200 &&
      ctx.water >= 100,
    reward(0, 1.5, 0)
  ),

  quest(
    19,
    'nyx-019',
    'Elemental Circle',
    'Gather 50 of each element.',
    '50 water + 50 fire + 50 air + 50 earth',
    (ctx) =>
      ctx.water >= 50 &&
      ctx.fire >= 50 &&
      ctx.air >= 50 &&
      ctx.earth >= 50,
    reward(0, 1, 0)
  ),

  quest(
    20,
    'nyx-020',
    'Ancient Storm',
    'Gather 250 air and 50 earth.',
    '250 air + 50 earth',
    (ctx) =>
      ctx.air >= 250 &&
      ctx.earth >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    21,
    'nyx-021',
    'Burning River',
    'Gather 200 fire and 100 water.',
    '200 fire + 100 water',
    (ctx) =>
      ctx.fire >= 200 &&
      ctx.water >= 100,
    reward(0, 1.5, 0)
  ),

  quest(
    22,
    'nyx-022',
    'Wind and Earth II',
    'Gather 200 air and 100 earth.',
    '200 air + 100 earth',
    (ctx) =>
      ctx.air >= 200 &&
      ctx.earth >= 100,
    reward(0, 1.5, 0)
  ),

  quest(
    23,
    'nyx-023',
    'Elemental Wisdom',
    'Gather 150 water and 150 earth.',
    '150 water + 150 earth',
    (ctx) =>
      ctx.water >= 150 &&
      ctx.earth >= 150,
    reward(0, 1.5, 0)
  ),

  quest(
    24,
    'nyx-024',
    'Flame Wind',
    'Gather 150 fire and 150 air.',
    '150 fire + 150 air',
    (ctx) =>
      ctx.fire >= 150 &&
      ctx.air >= 150,
    reward(0, 1.5, 0)
  ),

  quest(
    25,
    'nyx-025',
    'Four Winds',
    'Gather 125 water, 75 fire, 50 air and 50 earth.',
    '125 water + 75 fire + 50 air + 50 earth',
    (ctx) =>
      ctx.water >= 125 &&
      ctx.fire >= 75 &&
      ctx.air >= 50 &&
      ctx.earth >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    26,
    'nyx-026',
    'Elemental Depth',
    'Gather 250 water and 50 fire.',
    '250 water + 50 fire',
    (ctx) =>
      ctx.water >= 250 &&
      ctx.fire >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    27,
    'nyx-027',
    'Elemental Heat',
    'Gather 250 fire and 50 air.',
    '250 fire + 50 air',
    (ctx) =>
      ctx.fire >= 250 &&
      ctx.air >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    28,
    'nyx-028',
    'Elemental Sky',
    'Gather 250 air and 50 water.',
    '250 air + 50 water',
    (ctx) =>
      ctx.air >= 250 &&
      ctx.water >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    29,
    'nyx-029',
    'Elemental Stone',
    'Gather 250 earth and 50 fire.',
    '250 earth + 50 fire',
    (ctx) =>
      ctx.earth >= 250 &&
      ctx.fire >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    30,
    'nyx-030',
    'Mystic Balance',
    'Gather 100 water, 100 fire and 100 earth.',
    '100 water + 100 fire + 100 earth',
    (ctx) =>
      ctx.water >= 100 &&
      ctx.fire >= 100 &&
      ctx.earth >= 100,
    reward(0, 1.5, 0)
  ),

  quest(
    31,
    'nyx-031',
    'Mystic Wind',
    'Gather 100 water, 100 air and 100 earth.',
    '100 water + 100 air + 100 earth',
    (ctx) =>
      ctx.water >= 100 &&
      ctx.air >= 100 &&
      ctx.earth >= 100,
    reward(0, 1.5, 0)
  ),

  quest(
    32,
    'nyx-032',
    'Mystic Flame',
    'Gather 100 water, 100 fire and 100 air.',
    '100 water + 100 fire + 100 air',
    (ctx) =>
      ctx.water >= 100 &&
      ctx.fire >= 100 &&
      ctx.air >= 100,
    reward(0, 1.5, 0)
  ),

  quest(
    33,
    'nyx-033',
    'Mystic Earth',
    'Gather 100 fire, 100 air and 100 earth.',
    '100 fire + 100 air + 100 earth',
    (ctx) =>
      ctx.fire >= 100 &&
      ctx.air >= 100 &&
      ctx.earth >= 100,
    reward(0, 1.5, 0)
  ),

  quest(
    34,
    'nyx-034',
    'Elemental 400',
    'Gather 400 elemental resources.',
    '100 water + 100 fire + 100 air + 100 earth',
    (ctx) =>
      ctx.water >= 100 &&
      ctx.fire >= 100 &&
      ctx.air >= 100 &&
      ctx.earth >= 100,
    reward(0, 2, 0)
  ),

  quest(
    35,
    'nyx-035',
    'Water and Fire',
    'Gather 175 water and 125 fire.',
    '175 water + 125 fire',
    (ctx) =>
      ctx.water >= 175 &&
      ctx.fire >= 125,
    reward(0, 1.5, 0)
  ),

  quest(
    36,
    'nyx-036',
    'Air and Earth',
    'Gather 175 air and 125 earth.',
    '175 air + 125 earth',
    (ctx) =>
      ctx.air >= 175 &&
      ctx.earth >= 125,
    reward(0, 1.5, 0)
  ),

  quest(
    37,
    'nyx-037',
    'Three Elements',
    'Gather 150 water, 100 air and 50 fire.',
    '150 water + 100 air + 50 fire',
    (ctx) =>
      ctx.water >= 150 &&
      ctx.air >= 100 &&
      ctx.fire >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    38,
    'nyx-038',
    'Earth and Flame',
    'Gather 150 earth, 100 fire and 50 air.',
    '150 earth + 100 fire + 50 air',
    (ctx) =>
      ctx.earth >= 150 &&
      ctx.fire >= 100 &&
      ctx.air >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    39,
    'nyx-039',
    'Water and Wind',
    'Gather 150 water, 100 air and 50 earth.',
    '150 water + 100 air + 50 earth',
    (ctx) =>
      ctx.water >= 150 &&
      ctx.air >= 100 &&
      ctx.earth >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    40,
    'nyx-040',
    'Fire and Earth',
    'Gather 150 fire, 100 earth and 50 water.',
    '150 fire + 100 earth + 50 water',
    (ctx) =>
      ctx.fire >= 150 &&
      ctx.earth >= 100 &&
      ctx.water >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    41,
    'nyx-041',
    'Elemental 500',
    'Gather 125 of each element.',
    '125 water + 125 fire + 125 air + 125 earth',
    (ctx) =>
      ctx.water >= 125 &&
      ctx.fire >= 125 &&
      ctx.air >= 125 &&
      ctx.earth >= 125,
    reward(0, 2.5, 0)
  ),

  quest(
    42,
    'nyx-042',
    'Elemental 600',
    'Gather 150 of each element.',
    '150 water + 150 fire + 150 air + 150 earth',
    (ctx) =>
      ctx.water >= 150 &&
      ctx.fire >= 150 &&
      ctx.air >= 150 &&
      ctx.earth >= 150,
    reward(0, 3, 0)
  ),

  quest(
    43,
    'nyx-043',
    'Ancient Water',
    'Gather 275 water and 25 earth.',
    '275 water + 25 earth',
    (ctx) =>
      ctx.water >= 275 &&
      ctx.earth >= 25,
    reward(0, 1.5, 0)
  ),

  quest(
    44,
    'nyx-044',
    'Ancient Fire',
    'Gather 275 fire and 25 air.',
    '275 fire + 25 air',
    (ctx) =>
      ctx.fire >= 275 &&
      ctx.air >= 25,
    reward(0, 1.5, 0)
  ),

  quest(
    45,
    'nyx-045',
    'Ancient Wind',
    'Gather 275 air and 25 water.',
    '275 air + 25 water',
    (ctx) =>
      ctx.air >= 275 &&
      ctx.water >= 25,
    reward(0, 1.5, 0)
  ),

  quest(
    46,
    'nyx-046',
    'Ancient Earth',
    'Gather 275 earth and 25 fire.',
    '275 earth + 25 fire',
    (ctx) =>
      ctx.earth >= 275 &&
      ctx.fire >= 25,
    reward(0, 1.5, 0)
  ),

  quest(
    47,
    'nyx-047',
    'Elemental Harmony',
    'Gather 200 water and 100 air.',
    '200 water + 100 air',
    (ctx) =>
      ctx.water >= 200 &&
      ctx.air >= 100,
    reward(0, 1.5, 0)
  ),

  quest(
    48,
    'nyx-048',
    'Elemental Fury',
    'Gather 200 fire and 100 earth.',
    '200 fire + 100 earth',
    (ctx) =>
      ctx.fire >= 200 &&
      ctx.earth >= 100,
    reward(0, 1.5, 0)
  ),

  quest(
    49,
    'nyx-049',
    'Elder Trial',
    'Gather 200 water, 50 fire and 50 air.',
    '200 water + 50 fire + 50 air',
    (ctx) =>
      ctx.water >= 200 &&
      ctx.fire >= 50 &&
      ctx.air >= 50,
    reward(0, 1.5, 0)
  ),

  quest(
    50,
    'nyx-050',
    'Grand Elemental Trial',
    'Gather 150 water, 150 fire, 150 air and 150 earth.',
    '150 water + 150 fire + 150 air + 150 earth',
    (ctx) =>
      ctx.water >= 150 &&
      ctx.fire >= 150 &&
      ctx.air >= 150 &&
      ctx.earth >= 150,
    reward(0, 3, 0)
  ),
];

export default NYX_QUESTS;