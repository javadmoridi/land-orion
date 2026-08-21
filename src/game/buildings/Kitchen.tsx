import { create } from 'zustand';

import { useGameStore } from '../game/useGameStore';
import { useResourceStore } from './resourceStore';
import { useVipStore } from './vipStore';

import {
  getFoodById,
  createFoodInventoryItem,
  type FoodDefinition,
} from './foodCatalog';

export interface CookingJob {
  id: string;
  foodId: string;
  queuedAt: number;
  startedAt: number | null;
  finishAt: number | null;
  completed: boolean;
}

interface FoodCookingStoreState {
  jobs: CookingJob[];

  cookFood: (food: FoodDefinition) => boolean;
  quickCook: (jobId: string) => boolean;
  collectFinishedFood: (jobId: string) => boolean;

  getJob: (jobId: string) => CookingJob | undefined;
  isFinished: (jobId: string) => boolean;

  getRemainingSeconds: (jobId: string) => number;
  getQuickCookCost: (timeMinutes: number) => number;

  reset: () => void;
}

const STORAGE_KEY = 'land-orion-food-cooking';

function loadJobs(): CookingJob[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function saveJobs(jobs: CookingJob[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(jobs),
  );
}

function getInventory() {
  return (
    useGameStore.getState().gameState?.inventory ??
    useGameStore.getState().playerProfile?.inventory ??
    []
  );
}

function hasInventoryIngredient(
  id: string,
  quantity: number,
) {
  const item = getInventory().find(
    (entry) => entry.id === id,
  );

  return !!item && item.quantity >= quantity;
}

function removeInventoryIngredient(
  id: string,
  quantity: number,
) {
  return useGameStore
    .getState()
    .removeFromInventory(id, quantity);
}

function getResourceAmount(id: string) {
  const resources =
    useResourceStore.getState().resources;

  return (
    resources[
      id as keyof typeof resources
    ] ?? 0
  );
}

function hasResourceIngredient(
  id: string,
  quantity: number,
) {
  return getResourceAmount(id) >= quantity;
}

function removeResourceIngredient(
  id: string,
  quantity: number,
) {
  const store =
    useResourceStore.getState();

  switch (id) {
    case 'wood':
      return store.spendWood(quantity);

    case 'stone':
      return store.spendStone(quantity);

    case 'iron':
      return store.spendIron(quantity);

    case 'gold':
      return store.spendGold(quantity);

    case 'crystal':
      return store.spendCrystal(quantity);

    default:
      return useGameStore
        .getState()
        .spendResource(id, quantity);
  }
}
function hasAllIngredients(
  food: FoodDefinition,
) {
  return food.ingredients.every(
    (ingredient) =>
      ingredient.type === 'inventory'
        ? hasInventoryIngredient(
            ingredient.id,
            ingredient.quantity,
          )
        : hasResourceIngredient(
            ingredient.id,
            ingredient.quantity,
          ),
  );
}

function removeAllIngredients(
  food: FoodDefinition,
) {
  for (const ingredient of food.ingredients) {
    const result =
      ingredient.type === 'inventory'
        ? removeInventoryIngredient(
            ingredient.id,
            ingredient.quantity,
          )
        : removeResourceIngredient(
            ingredient.id,
            ingredient.quantity,
          );

    if (!result) {
      return false;
    }
  }

  return true;
}

export const useFoodCookingStore =
  create<FoodCookingStoreState>(
    (set, get) => ({
      jobs: loadJobs(),

      cookFood: (food) => {
        const vip =
          useVipStore
            .getState()
            .isVipActive();

        const maxQueue =
          vip ? 5 : 1;

        const jobs =
          get().jobs;

        if (jobs.length >= maxQueue) {
          return false;
        }

        if (!hasAllIngredients(food)) {
          return false;
        }

        if (!removeAllIngredients(food)) {
          return false;
        }

        const now =
          Date.now();

        const newJob: CookingJob = {
          id:
            `cooking-${food.id}-${now}`,

          foodId:
            food.id,

          queuedAt:
            now,

          startedAt:
            now,

          finishAt:
            now +
            food.timeMinutes * 60 * 1000,

          completed:
            false,
        };

        const updatedJobs = [
          newJob,
        ];

        saveJobs(updatedJobs);

        set({
          jobs: updatedJobs,
        });

        return true;
      },

      quickCook: (jobId) => {
        const job =
          get().getJob(jobId);

        if (!job) {
          return false;
        }

        const remaining =
          get()
            .getRemainingSeconds(jobId);

        if (remaining <= 0) {
          return get()
            .collectFinishedFood(jobId);
        }

        const cost =
          get()
            .getQuickCookCost(
              Math.ceil(
                remaining / 60,
              ),
            );

        const spent =
          useResourceStore
            .getState()
            .spendGems(cost);

        if (!spent) {
          return false;
        }

        const jobs =
          get().jobs.map((item) =>
            item.id === jobId
              ? {
                  ...item,
                  finishAt:
                    Date.now(),
                }
              : item,
          );

        saveJobs(jobs);

        set({
          jobs,
        });

        return true;
      },
            collectFinishedFood: (jobId) => {
        const job =
          get().getJob(jobId);

        if (!job) {
          return false;
        }

        if (
          job.finishAt === null ||
          Date.now() < job.finishAt
        ) {
          return false;
        }

        const food =
          getFoodById(
            job.foodId,
          );

        if (!food) {
          return false;
        }

        useGameStore
          .getState()
          .addToInventory(
            createFoodInventoryItem(
              food,
              1,
            ),
          );

        const jobs =
          get().jobs.filter(
            (item) =>
              item.id !== jobId,
          );

        saveJobs(jobs);

        set({
          jobs,
        });

        return true;
      },


      getJob: (jobId) => {
        return get()
          .jobs
          .find(
            (job) =>
              job.id === jobId,
          );
      },


      isFinished: (jobId) => {
        const job =
          get().getJob(jobId);

        return !!(
          job &&
          job.finishAt !== null &&
          Date.now() >= job.finishAt
        );
      },


      getRemainingSeconds: (jobId) => {
        const job =
          get().getJob(jobId);

        if (
          !job ||
          job.finishAt === null
        ) {
          return 0;
        }

        return Math.max(
          0,
          Math.ceil(
            (
              job.finishAt -
              Date.now()
            ) / 1000,
          ),
        );
      },


      getQuickCookCost: (
        timeMinutes,
      ) => {
        return Math.ceil(
          timeMinutes / 5,
        );
      },


      reset: () => {
        saveJobs([]);

        set({
          jobs: [],
        });
      },
    }),
  );