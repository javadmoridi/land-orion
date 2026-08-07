// Item placement system
// Island = 14 x 14 = 196 slots

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

// Create all 196 land slots
export function createPlacementGrid(
  size: number = GRID_SIZE,
): GridSlot[] {
  const slots: GridSlot[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      slots.push({
        x,
        y,
        id: `slot-${x}-${y}`,
      });
    }
  }

  return slots;
}

// Convert grid position to percent
// Example: item at x=3 y=3 on 14x14 grid
export function gridSlotToPercent(
  x: number,
  y: number,
  size: number = GRID_SIZE,
): GridPoint {
  return {
    x: (x / size) * 100,
    y: (y / size) * 100,
  };
}

// Convert mouse/touch position to grid slot
export function pointerToGridSlot(
  rect: DOMRect,
  clientX: number,
  clientY: number,
  size: number = GRID_SIZE,
): GridSlot {
  const relativeX = Math.max(
    0,
    Math.min(1, (clientX - rect.left) / rect.width),
  );

  const relativeY = Math.max(
    0,
    Math.min(1, (clientY - rect.top) / rect.height),
  );

  const x = Math.floor(relativeX * size);
  const y = Math.floor(relativeY * size);

  return {
    x,
    y,
    id: `slot-${x}-${y}`,
  };
}