import type { Quest } from './questTypes';

export const AERIS_QUESTS: Quest[] = [
  {
    id: 'aeris-quest-01',
    characterId: 'aeris',
    day: 1,
    title: 'Water Gathering',
    description: 'Collect 100 Water.',
    condition: {
      label: '100 Water',
      test: (ctx) => ctx.water >= 100,
    },
    reward: {
      coins: 0,
      tokens: 1,
      gems: 0,
    },
    cost: {
      water: 100,
    },
  },

  {
    id: 'aeris-quest-02',
    characterId: 'aeris',
    day: 2,
    title: 'Wind and Water',
    description: 'Collect 60 Air and 40 Water.',
    condition: {
      label: '60 Air + 40 Water',
      test: (ctx) =>
        ctx.air >= 60 &&
        ctx.water >= 40,
    },
    reward: {
      coins: 0,
      tokens: 2,
      gems: 0,
    },
    cost: {
      air: 60,
      water: 40,
    },
  },

  {
    id: 'aeris-quest-03',
    characterId: 'aeris',
    day: 3,
    title: 'Wind and Fire',
    description: 'Collect 50 Air and 50 Fire.',
    condition: {
      label: '50 Air + 50 Fire',
      test: (ctx) =>
        ctx.air >= 50 &&
        ctx.fire >= 50,
    },
    reward: {
      coins: 0,
      tokens: 2,
      gems: 0,
    },
    cost: {
      air: 50,
      fire: 50,
    },
  },

  {
    id: 'aeris-quest-04',
    characterId: 'aeris',
    day: 4,
    title: 'Four Elements',
    description: 'Collect 40 Air, 30 Water and 30 Earth.',
    condition: {
      label: '40 Air + 30 Water + 30 Earth',
      test: (ctx) =>
        ctx.air >= 40 &&
        ctx.water >= 30 &&
        ctx.earth >= 30,
    },
    reward: {
      coins: 0,
      tokens: 3,
      gems: 0,
    },
    cost: {
      air: 40,
      water: 30,
      earth: 30,
    },
  },

  {
    id: 'aeris-quest-05',
    characterId: 'aeris',
    day: 5,
    title: 'Fire in the Wind',
    description: 'Collect 75 Air and 25 Fire.',
    condition: {
      label: '75 Air + 25 Fire',
      test: (ctx) =>
        ctx.air >= 75 &&
        ctx.fire >= 25,
    },
    reward: {
      coins: 0,
      tokens: 3,
      gems: 0,
    },
    cost: {
      air: 75,
      fire: 25,
    },
  },

  {
    id: 'aeris-quest-06',
    characterId: 'aeris',
    day: 6,
    title: 'Elemental Current',
    description: 'Collect 80 Air and 40 Earth.',
    condition: {
      label: '80 Air + 40 Earth',
      test: (ctx) =>
        ctx.air >= 80 &&
        ctx.earth >= 40,
    },
    reward: {
      coins: 0,
      tokens: 4,
      gems: 0,
    },
    cost: {
      air: 80,
      earth: 40,
    },
  },

  {
    id: 'aeris-quest-07',
    characterId: 'aeris',
    day: 7,
    title: 'Element Master',
    description: 'Collect 120 Air.',
    condition: {
      label: '120 Air',
      test: (ctx) => ctx.air >= 120,
    },
    reward: {
      coins: 0,
      tokens: 5,
      gems: 0,
    },
    cost: {
      air: 120,
    },
  },
];