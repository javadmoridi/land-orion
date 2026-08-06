// ---------------------------------------------------------------------------
// Item Placement Grid — coordinate model for placing buildings / items on the
// island. The island is divided into a square grid of slots; every slot has an
// (x, y) coordinate so the house, trees, rocks, buildings and other items can
// be placed on it later.
// ---------------------------------------------------------------------------

// 14 x 14 = 196 slots (~200). A square grid that matches the square island.
export const GRID_SIZE = 14;
export const GRID_SLOTS = GRID_SIZE * GRID_SIZE;

export interface GridSlot {
  x: number;
  y: number;
  id: string;
}

export interface GridPoint {
  x: number;
  y: number;
}

/** Build the full list of slots for the grid (row-major: y outer, x inner). */
export function createPlacementGrid(size: number = GRID_SIZE): GridSlot[] {
  const slots: GridSlot[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      slots.push({ x, y, id: `slot-${x}-${y}` });
    }
  }
  return slots;
}

/** Convert a slot coordinate into a percentage position within the island. */
export function gridSlotToPercent(
  x: number,
  y: number,
  size: number = GRID_SIZE,
): GridPoint {
  return { x: (x / size) * 100, y: (y / size) * 100 };
}

/**
 * Map a pointer position (relative to the island rect) to the grid slot
 * underneath it. Used for picking where a building / item should be placed.
 */
export function pointerToGridSlot(
  rect: DOMRect,
  clientX: number,
  clientY: number,
  size: number = GRID_SIZE,
): GridSlot {
  const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  const x = Math.min(size - 1, Math.floor(px * size));
  const y = Math.min(size - 1, Math.floor(py * size));
  return { x, y, id: `slot-${x}-${y}` };
}
