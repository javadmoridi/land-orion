import type { ReactNode } from 'react';
import { GRID_SIZE, createPlacementGrid } from './placementGridUtil';

interface PlacementGridProps {
  /** When true, draw a faint border around every slot (useful while developing). */
  showGrid?: boolean;
  /** Buildings / items rendered on top of the slots (e.g. OrionHouse). */
  children?: ReactNode;
}

/**
 * Item placement layer over the island.
 *
 * Layering:
 *   Background -> Island Image -> Placement Grid (slots) -> Buildings/Items -> Characters -> UI
 *
 * Renders a square grid of ~200 slots; every slot carries an (x, y) coordinate
 * and is ready to receive a building / item later. Slots are hidden by default
 * (pass showGrid to preview them).
 */
export function PlacementGrid({ showGrid = false, children }: PlacementGridProps) {
  const slots = createPlacementGrid();

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      {/* Slot layer — square grid, each cell is a coordinate-ready placement target. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          pointerEvents: 'none',
        }}
      >
        {slots.map((slot) => (
          <div
            key={slot.id}
            data-x={slot.x}
            data-y={slot.y}
            data-slot={slot.id}
            style={{
              boxSizing: 'border-box',
              border: showGrid ? '1px dashed rgba(255, 255, 255, 0.22)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Buildings / items are rendered here so they sit above the slots. */}
      {children}
    </div>
  );
}
