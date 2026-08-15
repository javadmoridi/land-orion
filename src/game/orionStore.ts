import { create } from 'zustand';

import type { OrionUnitRuntime } from '../types';

export type OrionRace =
  | 'water'
  | 'air'
  | 'earth'
  | 'fire'
  | 'asil';

export interface OrionStats {
  attack: number;
  hp: number;
}

export type OrionUnitStatus =
  | 'ready'
  | 'battle'
  | 'hospital';

export interface OrionUnit {
  id: string;
  race: OrionRace;
  level: number;
  status?: OrionUnitStatus;
}

export const ORION_RACES: OrionRace[] = [
  'water',
  'air',
  'earth',
  'fire',
  'asil',
];

export const DEFAULT_BATTLE_DURATION_MS =
  5 * 60 * 1000;

export const DEFAULT_HOSPITAL_DURATION_MS =
  15 * 60 * 1000;

export const ORION_MAX_LEVEL = 100;

const ORION_STORAGE_KEY =
  'land-orion-orions';

const ORION_RUNTIME_STORAGE_KEY =
  'land-orion-orion-runtime';

// ================================================================
// BASE STATS
// ================================================================

export const ORION_BASE_STATS: Record<
  OrionRace,
  number
> = {
  water: 10,
  air: 20,
  earth: 40,
  fire: 100,
  asil: 200,
};

export function getOrionStats(
  race: OrionRace,
  level: number
): OrionStats {
  const safeLevel = Math.max(
    1,
    Math.min(
      ORION_MAX_LEVEL,
      Math.floor(level)
    )
  );

  const base =
    ORION_BASE_STATS[race];

  const value =
    base *
    Math.pow(
      1.5,
      safeLevel - 1
    );

  return {
    attack: Number(
      value.toFixed(2)
    ),
    hp: Number(
      value.toFixed(2)
    ),
  };
}

export function getOrionAttack(
  race: OrionRace,
  level: number
): number {
  return getOrionStats(
    race,
    level
  ).attack;
}

export function getOrionHp(
  race: OrionRace,
  level: number
): number {
  return getOrionStats(
    race,
    level
  ).hp;
}

// ================================================================
// STORAGE
// ================================================================

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
      JSON.parse(
        raw
      ) as Partial<OrionSaveData>;

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

function loadRuntime(): Record<
  string,
  OrionUnitRuntime
> {
  if (
    typeof window === 'undefined'
  ) {
    return {};
  }

  const raw =
    window.localStorage.getItem(
      ORION_RUNTIME_STORAGE_KEY
    );

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(
      raw
    ) as Record<
      string,
      OrionUnitRuntime
    >;
  } catch {
    return {};
  }
}

function saveRuntime(
  runtime: Record<
    string,
    OrionUnitRuntime
  >
): void {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  window.localStorage.setItem(
    ORION_RUNTIME_STORAGE_KEY,
    JSON.stringify(runtime)
  );
}

// ================================================================
// STORE
// ================================================================

interface OrionStoreState {
  orions: OrionUnit[];

  runtime: Record<
    string,
    OrionUnitRuntime
  >;

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

  sendToBattle: (
    orionId: string,
    durationMs?: number
  ) => boolean;

  sendToHospital: (
    orionId: string,
    durationMs?: number
  ) => boolean;

  dischargeFromHospital: (
    orionId: string
  ) => boolean;

  tickRuntime: () => void;

  getReadyOrions: () => OrionUnit[];

  getBattleOrions: () => OrionUnit[];

  getHospitalOrions: () => OrionUnit[];

  reset: () => void;
}

// ================================================================
// ZUSTAND STORE
// ================================================================

export const useOrionStore =
  create<OrionStoreState>(
    (set, get) => ({

      // ============================================================
      // INITIAL STATE
      // ============================================================

      orions:
        loadOrions(),

      runtime:
        loadRuntime(),

      // ============================================================
      // ADD ORION
      // ============================================================

      addOrion: (
        race
      ) => {
        const newOrion: OrionUnit = {
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

        saveOrions(
          nextOrions
        );
      },

      // ============================================================
      // MERGE ORIONS
      // ============================================================

      mergeOrions: (
        id1,
        id2
      ) => {
        let merged = false;

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

          if (
            first.race !==
              second.race ||
            first.level !==
              second.level
          ) {
            return state;
          }

          if (
            first.level >=
            ORION_MAX_LEVEL
          ) {
            return state;
          }

          const newOrion: OrionUnit = {
            id:
              crypto.randomUUID(),

            race:
              first.race,

            level:
              first.level + 1,
          };

          merged = true;

          nextOrions =
            [
              ...state.orions.filter(
                (orion) =>
                  orion.id !== id1 &&
                  orion.id !== id2
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

      // ============================================================
      // REMOVE ORION
      // ============================================================

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

      // ============================================================
      // SEND TO BATTLE
      // ============================================================

      sendToBattle: (
        orionId,
        durationMs
      ) => {
        const now =
          Date.now();

        const battleDuration =
          durationMs ??
          DEFAULT_BATTLE_DURATION_MS;

        const orion =
          get().orions.find(
            (o) =>
              o.id === orionId
          );

        if (!orion) {
          return false;
        }

        const existing =
          get().runtime[
            orionId
          ];

        if (
          existing &&
          (
            existing.status ===
              'battle' ||
            existing.status ===
              'hospital'
          )
        ) {
          if (
            existing.status ===
              'battle' &&
            existing.battleEndsAt &&
            existing.battleEndsAt >
              now
          ) {
            return false;
          }

          if (
            existing.status ===
              'hospital' &&
            existing.hospitalEndsAt &&
            existing.hospitalEndsAt >
              now
          ) {
            return false;
          }
        }

        const runtime:
          OrionUnitRuntime = {
            id:
              orionId,

            status:
              'battle',

            battleStartedAt:
              now,

            battleEndsAt:
              now +
              battleDuration,

            battleDurationMs:
              battleDuration,
          };

        const nextRuntime = {
          ...get().runtime,

          [orionId]:
            runtime,
        };

        const nextOrions =
          get().orions.map(
            (o) =>
              o.id === orionId
                ? {
                    ...o,

                    status:
                      'battle' as OrionUnitStatus,
                  }
                : o
          );

        set({
          runtime:
            nextRuntime,

          orions:
            nextOrions,
        });

        saveRuntime(
          nextRuntime
        );

        saveOrions(
          nextOrions
        );

        return true;
      },

      // ============================================================
      // SEND TO HOSPITAL
      // ============================================================

      sendToHospital: (
        orionId,
        durationMs
      ) => {
        const now =
          Date.now();

        const hospitalDuration =
          durationMs ??
          DEFAULT_HOSPITAL_DURATION_MS;

        const runtime:
          OrionUnitRuntime = {
            id:
              orionId,

            status:
              'hospital',

            hospitalStartedAt:
              now,

            hospitalEndsAt:
              now +
              hospitalDuration,

            hospitalDurationMs:
              hospitalDuration,
          };

        const nextRuntime = {
          ...get().runtime,

          [orionId]:
            runtime,
        };

        const nextOrions =
          get().orions.map(
            (o) =>
              o.id === orionId
                ? {
                    ...o,

                    status:
                      'hospital' as OrionUnitStatus,
                  }
                : o
          );

        set({
          runtime:
            nextRuntime,

          orions:
            nextOrions,
        });

        saveRuntime(
          nextRuntime
        );

        saveOrions(
          nextOrions
        );

        return true;
      },

      // ============================================================
      // DISCHARGE FROM HOSPITAL
      // ============================================================

      dischargeFromHospital: (
        orionId
      ) => {
        const orion =
          get().runtime[
            orionId
          ];

        if (
          !orion ||
          orion.status !==
            'hospital'
        ) {
          return false;
        }

        const nextRuntime = {
          ...get().runtime,

          [orionId]: {
            ...orion,

            status:
              'ready' as OrionUnitStatus,

            hospitalStartedAt:
              undefined,

            hospitalEndsAt:
              undefined,

            hospitalDurationMs:
              undefined,
          },
        };

        const nextOrions =
          get().orions.map(
            (o) =>
              o.id === orionId
                ? {
                    ...o,

                    status:
                      undefined,
                  }
                : o
          );

        set({
          runtime:
            nextRuntime,

          orions:
            nextOrions,
        });

        saveRuntime(
          nextRuntime
        );

        saveOrions(
          nextOrions
        );

        return true;
      },

      // ============================================================
      // TICK RUNTIME
      //
      // Battle finished
      //       ↓
      // Hospital
      //       ↓
      // Ready / Barracks
      // ============================================================

      tickRuntime: () => {
        const now =
          Date.now();

        const runtime =
          get().runtime;

        let changed =
          false;

        const nextRuntime:
          Record<
            string,
            OrionUnitRuntime
          > = {};

        const nextOrions =
          get().orions.map(
            (orion) => {
              const state =
                runtime[
                  orion.id
                ];

              if (
                !state ||
                state.status ===
                  'ready'
              ) {
                return orion;
              }

              let newState:
                OrionUnitRuntime = {
                  ...state,
                };

              // ----------------------------------------------------
              // BATTLE FINISHED → HOSPITAL
              // ----------------------------------------------------

              if (
                state.status ===
                  'battle' &&
                state.battleEndsAt &&
                state.battleEndsAt <=
                  now
              ) {
                const hospitalDuration =
                  state.battleDurationMs ??
                  DEFAULT_HOSPITAL_DURATION_MS;

                newState = {
                  ...newState,

                  status:
                    'hospital',

                  battleStartedAt:
                    undefined,

                  battleEndsAt:
                    undefined,

                  battleDurationMs:
                    undefined,

                  hospitalStartedAt:
                    now,

                  hospitalEndsAt:
                    now +
                    hospitalDuration,

                  hospitalDurationMs:
                    hospitalDuration,
                };

                changed =
                  true;
              }

              // ----------------------------------------------------
              // HOSPITAL FINISHED → READY
              // ----------------------------------------------------

              if (
                newState.status ===
                  'hospital' &&
                newState.hospitalEndsAt &&
                newState.hospitalEndsAt <=
                  now
              ) {
                newState = {
                  ...newState,

                  status:
                    'ready',

                  hospitalStartedAt:
                    undefined,

                  hospitalEndsAt:
                    undefined,

                  hospitalDurationMs:
                    undefined,
                };

                changed =
                  true;
              }

              nextRuntime[
                orion.id
              ] = newState;

              if (
                newState.status ===
                  'ready'
              ) {
                return {
                  ...orion,

                  status:
                    undefined,
                };
              }

              return {
                ...orion,

                status:
                  newState.status,
              };
            }
          );

        if (changed) {
          set({
            runtime:
              nextRuntime,

            orions:
              nextOrions,
          });

          saveRuntime(
            nextRuntime
          );

          saveOrions(
            nextOrions
          );
        }
      },

      // ============================================================
      // GET READY ORIONS
      // ============================================================

      getReadyOrions:
        () => {
          const now =
            Date.now();

          return get().orions.filter(
            (orion) => {
              const state =
                get().runtime[
                  orion.id
                ];

              if (
                !state ||
                state.status ===
                  'ready'
              ) {
                return true;
              }

              if (
                state.status ===
                  'hospital' &&
                state.hospitalEndsAt &&
                state.hospitalEndsAt <=
                  now
              ) {
                return true;
              }

              return false;
            }
          );
        },

      // ============================================================
      // GET BATTLE ORIONS
      // ============================================================

      getBattleOrions:
        () => {
          const now =
            Date.now();

          return get().orions.filter(
            (orion) => {
              const state =
                get().runtime[
                  orion.id
                ];

              return Boolean(
                state &&
                state.status ===
                  'battle' &&
                state.battleEndsAt &&
                state.battleEndsAt >
                  now
              );
            }
          );
        },

      // ============================================================
      // GET HOSPITAL ORIONS
      // ============================================================

      getHospitalOrions:
        () => {
          const now =
            Date.now();

          return get().orions.filter(
            (orion) => {
              const state =
                get().runtime[
                  orion.id
                ];

              if (
                !state ||
                state.status !==
                  'hospital'
              ) {
                return false;
              }

              return Boolean(
                state.hospitalEndsAt &&
                state.hospitalEndsAt >
                  now
              );
            }
          );
        },

      // ============================================================
      // RESET
      // ============================================================

      reset: () => {
        set({
          orions: [],
          runtime: {},
        });

        saveOrions([]);

        saveRuntime({});
      },
    })
  );