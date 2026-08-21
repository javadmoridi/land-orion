import { create } from 'zustand';
import { useGameStore } from './useGameStore';
import { getSeedById } from './seedCatalog';
import type { InventoryItem } from '../types';

export interface FarmTile {
  id: string;
  x: number;
  y: number;
  seedId: string | null;
  plantedAt: number | null;
  readyAt: number | null;
}

export interface FarmState {
  tiles: FarmTile[];
  message: string | null;

  plantSeed: (
    tileId: string,
    seedId: string
  ) => boolean;

  harvestFruit: (
    tileId: string
  ) => boolean;

  clearMessage: () => void;
}

export const FARMLAND_SIZE = 2;

const FARM_STORAGE_KEY = 'land-orion-farm';

interface FarmSaveData {
  tiles: FarmTile[];
}

function makeTiles(): FarmTile[] {
  const tiles: FarmTile[] = [];

  let idx = 0;

  const COLUMNS = 4;
  const ROWS = 6;

  const START_X = 30;
  const START_Y = 2;

  const GAP_X = 2;
  const GAP_Y = 2;

  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      tiles.push({
        id: `farm-${idx++}`,
        x: START_X + column * GAP_X,
        y: START_Y + row * GAP_Y,
        seedId: null,
        plantedAt: null,
        readyAt: null,
      });
    }
  }

  return tiles;
}

function loadFarmData(): FarmTile[] {
  if (typeof window === 'undefined') {
    return makeTiles();
  }

  const raw = window.localStorage.getItem(FARM_STORAGE_KEY);

  if (!raw) {
    return makeTiles();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FarmSaveData>;

    if (!Array.isArray(parsed.tiles)) {
      return makeTiles();
    }

    const defaults = makeTiles();

    return defaults.map((defaultTile) => {
      const saved = parsed.tiles?.find(
        (tile) => tile.id === defaultTile.id
      );

      if (!saved) {
        return defaultTile;
      }

      return {
        ...defaultTile,
        seedId:
          typeof saved.seedId === 'string'
            ? saved.seedId
            : null,

        plantedAt:
          typeof saved.plantedAt === 'number'
            ? saved.plantedAt
            : null,

        readyAt:
          typeof saved.readyAt === 'number'
            ? saved.readyAt
            : null,
      };
    });

  } catch {
    return makeTiles();
  }
}

function saveFarmData(tiles: FarmTile[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    FARM_STORAGE_KEY,
    JSON.stringify({ tiles })
  );
}

export const useFarmStore = create<FarmState>(
  (set, get) => ({

    tiles: loadFarmData(),

    message: null,


    plantSeed: (tileId, seedId) => {

      const seed = getSeedById(seedId);

      if (!seed) {
        return false;
      }

      const tile = get().tiles.find(
        (item) => item.id === tileId
      );

      if (!tile || tile.seedId) {
        return false;
      }

      const game = useGameStore.getState();

      if (!game.hasItem(seedId)) {
        return false;
      }

      if (!game.removeFromInventory(seedId, 1)) {
        return false;
      }

      const now = Date.now();

      const nextTiles = get().tiles.map(
        (item) =>
          item.id === tileId
            ? {
                ...item,
                seedId,
                plantedAt: now,
                readyAt:
                  now + seed.growTime * 1000,
              }
            : item
      );


      set({
        tiles: nextTiles,
        message: `${seed.name} planted!`,
      });


      saveFarmData(nextTiles);

      return true;
    },


    harvestFruit: (tileId) => {

      const tile = get().tiles.find(
        (item) => item.id === tileId
      );

      if (
        !tile ||
        !tile.seedId ||
        !tile.readyAt
      ) {
        return false;
      }


      if (Date.now() < tile.readyAt) {
        return false;
      }


      const seed = getSeedById(tile.seedId);

      if (!seed) {
        return false;
      }


      const fruit: InventoryItem = {

        /*
         * Use the canonical fruit id (e.g. `crystal-pear`) so the
         * kitchen recipes can find and consume this fruit.
         * Legacy ids like `fruit-seed-1` never matched any recipe
         * ingredient and made cooking impossible.
         */
        id: seed.fruitId || `fruit-${seed.id}`,

        name:
          seed.fruitName ||
          `${seed.name.replace(' Seed', '')} Fruit`,

        type: 'fruit',

        quantity: 1,

        image:
          seed.fruitImage || seed.image,
      };


      useGameStore
        .getState()
        .addToInventory(fruit);



      const nextTiles =
        get().tiles.map(
          (item) =>
            item.id === tileId
              ? {
                  ...item,
                  seedId: null,
                  plantedAt: null,
                  readyAt: null,
                }
              : item
        );


      set({
        tiles: nextTiles,
        message:
          `+1 ${fruit.name}`,
      });


      saveFarmData(nextTiles);

      return true;
    },


    clearMessage: () => {
      set({
        message: null,
      });
    },

  })
);


export function isFarmReady(
  tile: FarmTile,
  now: number
): boolean {

  return (
    tile.seedId !== null &&
    tile.readyAt !== null &&
    now >= tile.readyAt
  );
}


export function isFarmGrowing(
  tile: FarmTile,
  now: number
): boolean {

  return (
    tile.seedId !== null &&
    tile.readyAt !== null &&
    now < tile.readyAt
  );
}