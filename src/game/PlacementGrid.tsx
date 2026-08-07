import type { ReactNode } from 'react';
import { GRID_SIZE, createPlacementGrid } from './placementGridUtil';

interface PlacementGridProps {
  showGrid?: boolean;
  children?: ReactNode;
}

export function PlacementGrid({
  showGrid = false,
  children,
}: PlacementGridProps) {
  const slots = createPlacementGrid();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    >
      {/* 14x14 = 196 placement slots */}
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
              border: showGrid
                ? '1px dashed rgba(255,255,255,0.25)'
                : 'none',
            }}
          />
        ))}
      </div>

      {/* Items / Buildings layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}