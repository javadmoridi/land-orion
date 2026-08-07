import { useRef, useState } from 'react';

const ORION_HOUSE_IMAGE = '/assets/orion-house.png';

// Island grid
const GRID_SIZE = 14;

// House takes 3x3 slots from the 196 slots
const HOUSE_WIDTH = 3;
const HOUSE_HEIGHT = 3;

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
    x: subX,
    y: subY,
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

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let gridX = Math.floor(
      x / (rect.width / GRID_SIZE),
    );

    let gridY = Math.floor(
      y / (rect.height / GRID_SIZE),
    );

    // keep house inside 14x14 grid
    gridX = Math.max(
      0,
      Math.min(GRID_SIZE - HOUSE_WIDTH, gridX),
    );

    gridY = Math.max(
      0,
      Math.min(GRID_SIZE - HOUSE_HEIGHT, gridY),
    );

    setPosition({
      x: gridX,
      y: gridY,
    });
  }

  function pointerUp() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (dragging) {
      setDragging(false);
      onMove?.(position.x, position.y);
    }
  }

  // Size based on occupied grid slots
  const widthPercent =
    (HOUSE_WIDTH / GRID_SIZE) * 100;

  const heightPercent =
    (HOUSE_HEIGHT / GRID_SIZE) * 100;

  const leftPercent =
    (position.x / GRID_SIZE) * 100;

  const topPercent =
    (position.y / GRID_SIZE) * 100;

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

          left: `${leftPercent}%`,
          top: `${topPercent}%`,

          width: `${widthPercent}%`,
          height: `${heightPercent}%`,

          cursor: dragging
            ? 'grabbing'
            : 'grab',

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
            objectFit: 'contain',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}