import type { Quest } from './types';

export const AERIS_QUESTS: Quest[] = [
  {
    id: 'aeris-quest-01',
    characterId: 'aeris',
    day: 1,
    title: 'Wind Gathering',
    description: 'Collect 100 Air.',
    condition: {
      label: '100 Air',
      test: (ctx) => ctx.air >= 100,
    },
    reward: {
      coins: 0,
      tokens: 0.5,
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
    },
  },

  {
    id: 'aeris-quest-02',
    characterId: 'aeris',
    day: 2,
    title: 'Elemental Breeze',
    description: 'Collect 60 Air and 40 Water.',
    condition: {
      label: '60 Air + 40 Water',
      test: (ctx) =>
        ctx.air >= 60 &&
        ctx.water >= 40,
    },
    reward: {
      coins: 0,
      tokens: 0.5,
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
    },
  },

  {
    id: 'aeris-quest-03',
    characterId: 'aeris',
    day: 3,
    title: 'Storm Elements',
    description: 'Collect 50 Air and 50 Fire.',
    condition: {
      label: '50 Air + 50 Fire',
      test: (ctx) =>
        ctx.air >= 50 &&
        ctx.fire >= 50,
    },
    reward: {
      coins: 0,
      tokens: 0.5,
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
    },
  },

  {
    id: 'aeris-quest-04',
    characterId: 'aeris',
    day: 4,
    title: 'Four Winds',
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
      tokens: 0.5,
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
      tokens: 0.5,
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
      tokens: 0.5,
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
    },
  },

  {
    id: 'aeris-quest-07',
    characterId: 'aeris',
    day: 7,
    title: 'Sky Master',
    description: 'Collect 120 Air.',
    condition: {
      label: '120 Air',
      test: (ctx) => ctx.air >= 120,
    },
    reward: {
      coins: 0,
      tokens: 0.5,
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
    },
  },
];