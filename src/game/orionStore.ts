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

const ORION_STORAGE_KEY =
  'land-orion-orions';

interface OrionSaveData {
  orions: OrionUnit[];
}

function loadOrions(): OrionUnit[] {
  if (
    typeof window === 'undefined'
  ) {
    return [];
  }

  const raw =
    window.localStorage.getItem(
      ORION_STORAGE_KEY
    );

  if (!raw) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(raw) as Partial<OrionSaveData>;

    if (
      !Array.isArray(
        parsed.orions
      )
    ) {
      return [];
    }

    return parsed.orions.filter(
      (orion) =>
        orion &&
        typeof orion.id ===
          'string' &&
        ORION_RACES.includes(
          orion.race
        ) &&
        Number.isInteger(
          orion.level
        ) &&
        orion.level >= 1 &&
        orion.level <=
          ORION_MAX_LEVEL
    );
  } catch {
    return [];
  }
}

function saveOrions(
  orions: OrionUnit[]
): void {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  const data: OrionSaveData = {
    orions,
  };

  window.localStorage.setItem(
    ORION_STORAGE_KEY,
    JSON.stringify(data)
  );
}

interface OrionStoreState {
  orions: OrionUnit[];

  addOrion: (
    race: OrionRace
  ) => void;

  mergeOrions: (
    id1: string,
    id2: string
  ) => boolean;

  removeOrion: (
    id: string
  ) => void;

  reset: () => void;
}

export const useOrionStore =
  create<OrionStoreState>(
    (set, get) => ({
      // Load existing Orions immediately.
      orions:
        loadOrions(),

      // ================================================================
      // ADD ORION
      // ================================================================

      addOrion: (
        race
      ) => {
        const newOrion: OrionUnit =
          {
            id:
              crypto.randomUUID(),

            race,

            level: 1,
          };

        const nextOrions = [
          ...get().orions,
          newOrion,
        ];

        set({
          orions:
            nextOrions,
        });

        /*
         * IMPORTANT:
         * Save immediately after hatching.
         */
        saveOrions(
          nextOrions
        );
      },

      // ================================================================
      // MERGE ORIONS
      // ================================================================

      mergeOrions: (
        id1,
        id2
      ) => {
        let merged =
          false;

        let nextOrions:
          OrionUnit[] | null =
          null;

        set((state) => {
          const first =
            state.orions.find(
              (orion) =>
                orion.id === id1
            );

          const second =
            state.orions.find(
              (orion) =>
                orion.id === id2
            );

          if (
            !first ||
            !second
          ) {
            return state;
          }

          /*
           * Same race + same level only.
           */
          if (
            first.race !==
              second.race ||
            first.level !==
              second.level
          ) {
            return state;
          }

          /*
           * Level 100 is the maximum.
           */
          if (
            first.level >=
            ORION_MAX_LEVEL
          ) {
            return state;
          }

          const newOrion: OrionUnit =
            {
              id:
                crypto.randomUUID(),

              race:
                first.race,

              level:
                first.level + 1,
            };

          merged = true;

          nextOrions = [
            ...state.orions.filter(
              (orion) =>
                orion.id !==
                  id1 &&
                orion.id !==
                  id2
            ),

            newOrion,
          ];

          return {
            orions:
              nextOrions,
          };
        });

        if (
          merged &&
          nextOrions
        ) {
          saveOrions(
            nextOrions
          );
        }

        return merged;
      },

      // ================================================================
      // REMOVE ORION
      // ================================================================

      removeOrion: (
        id
      ) => {
        const nextOrions =
          get().orions.filter(
            (orion) =>
              orion.id !== id
          );

        set({
          orions:
            nextOrions,
        });

        saveOrions(
          nextOrions
        );
      },

      // ================================================================
      // RESET
      // ================================================================

      reset: () => {
        set({
          orions: [],
        });

        saveOrions([]);
      },
    })
  );