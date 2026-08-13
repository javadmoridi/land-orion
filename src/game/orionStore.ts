import { create } from 'zustand';

export type OrionRace =
  | 'water'
  | 'air'
  | 'earth'
  | 'fire'
  | 'asil';

export interface OrionUnit {
  id: string;
  race: OrionRace;
  level: number;
}

export const ORION_RACES: OrionRace[] = [
  'water',
  'air',
  'earth',
  'fire',
  'asil',
];

export const ORION_MAX_LEVEL = 100;

interface OrionStoreState {
  orions: OrionUnit[];

  addOrion: (race: OrionRace) => void;

  mergeOrions: (id1: string, id2: string) => boolean;

  removeOrion: (id: string) => void;

  reset: () => void;
}

export const useOrionStore = create<OrionStoreState>((set) => ({
  orions: [],

  addOrion: (race) =>
    set((state) => ({
      orions: [
        ...state.orions,
        {
          id: crypto.randomUUID(),
          race,
          level: 1,
        },
      ],
    })),

  mergeOrions: (id1, id2) => {
    let merged = false;

    set((state) => {
      const first = state.orions.find((orion) => orion.id === id1);
      const second = state.orions.find((orion) => orion.id === id2);

      if (!first || !second) {
        return state;
      }

      // فقط دو اوریون از یک نژاد و یک Level می‌توانند ترکیب شوند.
      if (
        first.race !== second.race ||
        first.level !== second.level
      ) {
        return state;
      }

      // Level 100 آخرین Level است.
      if (first.level >= ORION_MAX_LEVEL) {
        return state;
      }

      const newOrion: OrionUnit = {
        id: crypto.randomUUID(),
        race: first.race,
        level: first.level + 1,
      };

      merged = true;

      return {
        orions: [
          ...state.orions.filter(
            (orion) =>
              orion.id !== id1 &&
              orion.id !== id2
          ),
          newOrion,
        ],
      };
    });

    return merged;
  },

  removeOrion: (id) =>
    set((state) => ({
      orions: state.orions.filter(
        (orion) => orion.id !== id
      ),
    })),

    reset: () =>
    set({
      orions: [],
    }),
}));
