import { useRef, useState, useCallback } from 'react';

// Orion House building sprite
const ORION_HOUSE_IMAGE = '/assets/orion-house.png';

// Each land tile has a 3x3 sub-grid
const SUB_GRID = 3;
// Building occupies 2x2 sub-cells inside one land tile
const HOUSE_SUB_SIZE = 2;
// Max position in sub-grid (3 - 2 = 1)
const MAX_SUB_POS = SUB_GRID - HOUSE_SUB_SIZE; // 1

interface OrionHouseProps {
  // Sub-grid position inside the owning land tile (0 or 1 on each axis)
  subX: number;
  subY: number;
  // Callback when the house is moved (for future save system)
  onMove?: (subX: number, subY: number) => void;
}

/**
 * Movable Orion House building.
 * - Lives INSIDE one land tile (rendered as a child of that tile).
 * - Occupies 2x2 sub-cells of the tile's 3x3 sub-grid.
 * - Long-press + drag to move, snaps to the tile sub-grid.
 * - Position stored as sub-grid coords for future save system.
 */
export function OrionHouse({ subX, subY, onMove }: OrionHouseProps) {
  const [pos, setPos] = useState({ x: subX, y: subY });
  const [isDragging, setIsDragging] = useState(false);
  const [longPressActivated, setLongPressActivated] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Long-press detection (500ms) then enable drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[OrionHouse] pointerDown received, pointerId:', e.pointerId);

    // Capture pointer so we receive events even outside the element
    const target = e.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(e.pointerId);
      console.log('[OrionHouse] pointerCapture set');
    } catch (err) {
      console.warn('[OrionHouse] setPointerCapture failed:', err);
    }

    longPressTimer.current = window.setTimeout(() => {
      console.log('[OrionHouse] longPress activated, starting drag');
      setLongPressActivated(true);
      setIsDragging(true);
    }, 500);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();

      // Cancel long-press timer if finger moves before 500ms
      if (!longPressActivated && longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        return;
      }

      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      // Size of one sub-cell inside the owning tile
      const subCellSize = rect.width / SUB_GRID;

      // Position relative to tile top-left
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      // Snap to sub-grid (top-left of 2x2 house centered on cursor)
      const snappedX = Math.floor((relX - (HOUSE_SUB_SIZE * subCellSize) / 2) / subCellSize);
      const snappedY = Math.floor((relY - (HOUSE_SUB_SIZE * subCellSize) / 2) / subCellSize);

      // Clamp to 0..MAX_SUB_POS
      const clampedX = Math.max(0, Math.min(snappedX, MAX_SUB_POS));
      const clampedY = Math.max(0, Math.min(snappedY, MAX_SUB_POS));

      setPos({ x: clampedX, y: clampedY });
    },
    [isDragging, longPressActivated],
  );

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isDragging) {
      setIsDragging(false);
      setLongPressActivated(false);
      // Keep position ready for future save system
      onMove?.(pos.x, pos.y);
    } else {
      setLongPressActivated(false);
    }
  }, [isDragging, pos, onMove]);

  const handlePointerCancel = useCallback(() => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsDragging(false);
    setLongPressActivated(false);
  }, []);

  // Percentage sizes relative to the owning land tile
  const houseSizePercent = (HOUSE_SUB_SIZE / SUB_GRID) * 100; // 66.666%
  const posXPercent = (pos.x / SUB_GRID) * 100;
  const posYPercent = (pos.y / SUB_GRID) * 100;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
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
          zIndex: isDragging ? 100 : 5,
        }}
      />
    </div>
  );
}