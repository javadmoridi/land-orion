import { useRef, useState } from 'react';

const ORION_HOUSE_IMAGE = '/assets/orion-house.png';

const SUB_GRID = 3;
const HOUSE_SIZE = 2;

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

    // Single land – house moves within the whole land
    let newSubX = Math.floor(mouseX / (rect.width / SUB_GRID));
    let newSubY = Math.floor(mouseY / (rect.height / SUB_GRID));

    // House is 2x2 – keep it inside the land
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

  // House = 2 parts of 3 parts of the land
  const size = (HOUSE_SIZE / SUB_GRID) * 100;

  // House position inside the land
  const left = position.subX * (100 / SUB_GRID);
  const top = position.subY * (100 / SUB_GRID);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 20,
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
          backgroundImage: `url(${ORION_HOUSE_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          imageRendering: 'pixelated',
          cursor: dragging ? 'grabbing' : 'grab',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
      />
    </div>
  );
}