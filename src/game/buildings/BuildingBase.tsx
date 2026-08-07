import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePlacementGrid } from '../PlacementGrid';
import { canPlaceItem, GRID_SIZE } from '../placementGridUtil';

// ===========================================================================
// BuildingBase — a reusable island building.
//
// Handles the shared behaviour of every building:
//   * renders the building image at a grid position,
//   * registers/keeps its occupied tiles in the PlacementGrid,
//   * lets the player click it (not drag) to open a modal whose body is
//     provided via `children`.
//
// Default footprint is 3×3 tiles (matches the current buildings / assets).
// ===========================================================================

interface BuildingBaseProps {
  id: string;
  image: string;
  alt: string;
  title: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children?: ReactNode;
}

export function BuildingBase({
  id,
  image,
  alt,
  title,
  x = 0,
  y = 0,
  width = 3,
  height = 3,
  children,
}: BuildingBaseProps) {
  const placement = usePlacementGrid();

  const [position, setPosition] = useState({ x, y });
  const oldPosition = useRef({ x, y });
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const occupied = placement?.occupied ?? [];

  useEffect(() => {
    placement?.registerItem(id, position.x, position.y, { width, height });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pointerDown(e: React.PointerEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    timer.current = window.setTimeout(() => {
      oldPosition.current = { ...position };
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }, 500);
  }

  function pointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const gridLayer = e.currentTarget.parentElement?.parentElement;
    if (!gridLayer) return;
    const rect = gridLayer.getBoundingClientRect();
    const slotW = rect.width / GRID_SIZE;
    const slotH = rect.height / GRID_SIZE;

    let gx = Math.round((e.clientX - rect.left - dragOffset.current.x) / slotW);
    let gy = Math.round((e.clientY - rect.top - dragOffset.current.y) / slotH);

    gx = Math.max(0, Math.min(GRID_SIZE - width, gx));
    gy = Math.max(0, Math.min(GRID_SIZE - height, gy));
    setPosition({ x: gx, y: gy });
  }

  function pointerUp(e: React.PointerEvent) {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (dragging) {
      const canPlace = canPlaceItem(
        position.x,
        position.y,
        { width, height },
        occupied.filter(
          (slot) =>
            !(
              slot.x >= oldPosition.current.x &&
              slot.x < oldPosition.current.x + width &&
              slot.y >= oldPosition.current.y &&
              slot.y < oldPosition.current.y + height
            ),
        ),
      );

      if (!canPlace) {
        setPosition({ ...oldPosition.current });
      } else {
        placement?.registerItem(id, position.x, position.y, { width, height });
      }

      setDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    } else {
      setOpen(true);
    }
  }

  return (
    <>
      <div
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        style={{
          position: 'absolute',
          left: `${(position.x / GRID_SIZE) * 100}%`,
          top: `${(position.y / GRID_SIZE) * 100}%`,
          width: `${(width / GRID_SIZE) * 100}%`,
          height: `${(height / GRID_SIZE) * 100}%`,
          zIndex: 3,
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        <img
          src={image}
          alt={alt}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(520px, 100%)',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'rgba(10,14,26,0.96)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 16,
              boxShadow: '0 0 40px rgba(0,0,0,0.6)',
              padding: '1.25rem',
              color: '#f3f6ff',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ffd700' }}>{title}</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#f3f6ff',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {children}
          </div>
        </div>
      )}
    </>
  );
}

