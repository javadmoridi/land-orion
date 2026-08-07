import { useRef, useState } from 'react';

const ORION_HOUSE_IMAGE = '/assets/orion-house.png';

// Island placement grid: 14x14 = 196 slots (~200)
const SUB_GRID = 14;

// Orion house occupies 3x3 slots
const HOUSE_SIZE = 3;

interface OrionHouseProps {
  subX?: number;
  subY?: number;
  onMove?: (x: number, y: number) => void;
}

export function OrionHouse({
  subX = 0,
  subY = 0,
  onMove,
}: OrionHouseProps) {
  const [position, setPosition] = useState({
    subX,
    subY,
  });

  const [dragging, setDragging] = useState(false);

  const timer = useRef<number | null>(null);

  function pointerDown() {
    timer.current = window.setTimeout(() => {
      setDragging(true);
    }, 500);
  }

  function pointerMove(e: React.PointerEvent) {
    if (!dragging) return;

    const map = e.currentTarget.parentElement;
    if (!map) return;

    const rect = map.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let newSubX = Math.floor(mouseX / (rect.width / SUB_GRID));
    let newSubY = Math.floor(mouseY / (rect.height / SUB_GRID));

    // Keep 3x3 house inside 14x14 grid
    newSubX = Math.max(0, Math.min(SUB_GRID - HOUSE_SIZE, newSubX));
    newSubY = Math.max(0, Math.min(SUB_GRID - HOUSE_SIZE, newSubY));

    setPosition({
      subX: newSubX,
      subY: newSubY,
    });
  }

  function pointerUp() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (dragging) {
      setDragging(false);
      onMove?.(position.subX, position.subY);
    }
  }

  // House size = 3 of 14 grid cells
  const size = (HOUSE_SIZE / SUB_GRID) * 100;

  const left = position.subX * (100 / SUB_GRID);
  const top = position.subY * (100 / SUB_GRID);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <div
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        style={{
          position: 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          width: `${size}%`,
          height: `${size}%`,
          cursor: dragging ? 'grabbing' : 'grab',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
      >
        <img
          src={ORION_HOUSE_IMAGE}
          alt="Orion House"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}