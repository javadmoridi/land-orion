import { useRef, useState, useCallback } from 'react';

// Orion House building sprite
const ORION_HOUSE_IMAGE = '/assets/orion-house.png';

// Building size in grid tiles (max 2x2)
const HOUSE_TILES = 2;
// The land grid is 5x5
const GRID_SIZE = 5;

interface OrionHouseProps {
  // Grid position (top-left tile of the 2x2 building)
  gridX: number;
  gridY: number;
  // Callback when the house is moved (for future save system)
  onMove?: (gridX: number, gridY: number) => void;
}

/**
 * Movable Orion House building.
 * - Long-press + drag to move.
 * - Snaps to the land grid (2x2 tiles max).
 * - Position is kept in grid coordinates for future save system.
 * - Uses percentage-based sizing so it works with responsive land grid.
 */
export function OrionHouse({ gridX, gridY, onMove }: OrionHouseProps) {
  const [pos, setPos] = useState({ x: gridX, y: gridY });
  const [isDragging, setIsDragging] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Long-press detection (500ms) then enable drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    longPressTimer.current = window.setTimeout(() => {
      setIsDragging(true);
    }, 500);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const tileSize = rect.width / GRID_SIZE;

      // Position relative to container top-left, centered on cursor
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      // Snap to grid (top-left of the 2x2 building centered on cursor)
      const snappedX = Math.floor((relX - (HOUSE_TILES * tileSize) / 2) / tileSize);
      const snappedY = Math.floor((relY - (HOUSE_TILES * tileSize) / 2) / tileSize);

      // Clamp to bounds: keep 2x2 within the 5x5 grid
      const clampedX = Math.max(0, Math.min(snappedX, GRID_SIZE - HOUSE_TILES));
      const clampedY = Math.max(0, Math.min(snappedY, GRID_SIZE - HOUSE_TILES));

      setPos({ x: clampedX, y: clampedY });
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isDragging) {
      setIsDragging(false);
      // Keep position ready for future save system
      onMove?.(pos.x, pos.y);
    }
  }, [isDragging, pos, onMove]);

  const handlePointerCancel = useCallback(() => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // Percentage-based size for responsiveness
  const houseSizePercent = (HOUSE_TILES / GRID_SIZE) * 100;
  const posXPercent = (pos.x / GRID_SIZE) * 100;
  const posYPercent = (pos.y / GRID_SIZE) * 100;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // land grid still receives clicks
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          position: 'absolute',
          left: `${posXPercent}%`,
          top: `${posYPercent}%`,
          width: `${houseSizePercent}%`,
          height: `${houseSizePercent}%`,
          backgroundImage: `url(${ORION_HOUSE_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          imageRendering: 'pixelated',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
          pointerEvents: 'auto',
          transition: isDragging ? 'none' : 'left 0.15s, top 0.15s',
          zIndex: 5,
        }}
      />
    </div>
  );
}