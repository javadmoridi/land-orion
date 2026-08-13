import { create } from 'zustand';
import { useGameStore } from './useGameStore';
import { getSeedById } from './seedCatalog';
import type { InventoryItem } from '../types';

export interface FarmTile {
  id: string;

  /** Top-left corner of the 2x2 plot (grid cells). */
  x: number;
  y: number;

  /** Id of the planted seed, or null when the plot is raw/empty. */
  seedId: string | null;

  plantedAt: number | null;
  readyAt: number | null;
}

export interface FarmState {
  tiles: FarmTile[];
  message: string | null;

  /** Plant a seed on a raw plot. Consumes the seed from inventory. */
  plantSeed: (tileId: string, seedId: string) => boolean;

  /** Harvest a ripe fruit. Resets the plot to raw. */
  harvestFruit: (tileId: string) => boolean;

  clearMessage: () => void;
}

/** Each farmland plot is 2x2 grid cells. */
export const FARMLAND_SIZE = 2;


/*
 * ============================================================================
 * FARMLAND LAYOUT
 * ============================================================================
 *
 * Exactly 24 farmland plots.
 *
 * 4 columns
 * 6 rows
 *
 * Layout:
 *
 *   [01] [02] [03] [04]
 *   [05] [06] [07] [08]
 *   [09] [10] [11] [12]
 *   [13] [14] [15] [16]
 *   [17] [18] [19] [20]
 *   [21] [22] [23] [24]
 *
 * Each plot is 2x2 grid cells.
 *
 * The plots are placed close together so the whole farming area
 * looks compact and approximately square.
 *
 * x: 30, 32, 34, 36
 * y: 2, 4, 6, 8, 10, 12
 *
 * No 25th plot.
 * ============================================================================
 */

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


export const useFarmStore = create<FarmState>((set, get) => ({
  tiles: makeTiles(),

  message: null,


  plantSeed: (tileId, seedId) => {
    const seed = getSeedById(seedId);

    if (!seed) return false;


    const tile = get().tiles.find(
      (t) => t.id === tileId
    );

    // Only an empty/raw plot can be planted.
    if (!tile || tile.seedId) {
      return false;
    }


    const game = useGameStore.getState();


    // The plot only works once the player has
    // bought at least one seed.
    if (!game.hasItem(seedId)) {
      return false;
    }


    if (!game.removeFromInventory(seedId, 1)) {
      return false;
    }


    const now = Date.now();


    set({
      tiles: get().tiles.map((t) =>
        t.id === tileId
          ? {
              ...t,
              seedId,
              plantedAt: now,
              readyAt:
                now + seed.growTime * 1000,
            }
          : t
      ),

      message: `${seed.name} planted!`,
    });


    return true;
  },


  harvestFruit: (tileId) => {
    const tile = get().tiles.find(
      (t) => t.id === tileId
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
      id: `fruit-${seed.id}`,

      name: `${seed.name} Fruit`,

      type: 'fruit',

      quantity: 1,

      image: seed.fruitImage,
    };


    useGameStore
      .getState()
      .addToInventory(fruit);


    set({
      tiles: get().tiles.map((t) =>
        t.id === tileId
          ? {
              ...t,
              seedId: null,
              plantedAt: null,
              readyAt: null,
            }
          : t
      ),

      message: `+1 ${seed.name} Fruit`,
    });


    return true;
  },


  clearMessage: () => {
    set({
      message: null,
    });
  },
}));


/**
 * True when a planted plot's fruit
 * is ready to harvest.
 */
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


/**
 * True while a planted plot is still growing.
 */
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