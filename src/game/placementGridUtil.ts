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

export interface ItemSize {
  width: number;
  height: number;
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


// Get all slots occupied by an item
export function getOccupiedSlots(
  x: number,
  y: number,
  item: ItemSize,
): GridSlot[] {
  const slots: GridSlot[] = [];

  for (let row = 0; row < item.height; row++) {
    for (let col = 0; col < item.width; col++) {
      slots.push({
        x: x + col,
        y: y + row,
        id: `slot-${x + col}-${y + row}`,
      });
    }
  }

  return slots;
}


// Check item stays inside 14x14 island
export function isInsideGrid(
  x: number,
  y: number,
  item: ItemSize,
): boolean {
  return (
    x >= 0 &&
    y >= 0 &&
    x + item.width <= GRID_SIZE &&
    y + item.height <= GRID_SIZE
  );
}


// Check if item can be placed
export function canPlaceItem(
  x: number,
  y: number,
  item: ItemSize,
  occupied: GridSlot[],
): boolean {

  if (!isInsideGrid(x, y, item)) {
    return false;
  }

  const newSlots = getOccupiedSlots(
    x,
    y,
    item,
  );

  return !newSlots.some((newSlot) =>
    occupied.some(
      (slot) =>
        slot.x === newSlot.x &&
        slot.y === newSlot.y,
    ),
  );
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