import { useRef, useState } from 'react';

const ORION_HOUSE_IMAGE = '/assets/orion-house.png';

const GRID_SIZE = 14;

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

    const gridLayer =
      e.currentTarget.parentElement?.parentElement;

    if (!gridLayer) return;

    const rect = gridLayer.getBoundingClientRect();

    const slotWidth = rect.width / GRID_SIZE;
    const slotHeight = rect.height / GRID_SIZE;

    let x = Math.floor(
      (e.clientX - rect.left) / slotWidth
    );

    let y = Math.floor(
      (e.clientY - rect.top) / slotHeight
    );

    x = Math.max(
      0,
      Math.min(GRID_SIZE - HOUSE_WIDTH, x)
    );

    y = Math.max(
      0,
      Math.min(GRID_SIZE - HOUSE_HEIGHT, y)
    );

    setPosition({
      x,
      y,
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