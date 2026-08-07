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

  const dragOffset = useRef({
    x: 0,
    y: 0,
  });

  function pointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const target = e.currentTarget;

    const rect = target.getBoundingClientRect();

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    timer.current = window.setTimeout(() => {
      setDragging(true);
      target.setPointerCapture(e.pointerId);
    }, 500);
  }

  function pointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;

    const gridLayer =
      e.currentTarget.parentElement?.parentElement;

    if (!gridLayer) return;

    const rect = gridLayer.getBoundingClientRect();

    const slotWidth = rect.width / GRID_SIZE;
    const slotHeight = rect.height / GRID_SIZE;

    const houseWidth = slotWidth * HOUSE_WIDTH;
    const houseHeight = slotHeight * HOUSE_HEIGHT;

    let pixelX =
      e.clientX -
      rect.left -
      dragOffset.current.x;

    let pixelY =
      e.clientY -
      rect.top -
      dragOffset.current.y;

    pixelX = Math.max(
      0,
      Math.min(
        rect.width - houseWidth,
        pixelX
      )
    );

    pixelY = Math.max(
      0,
      Math.min(
        rect.height - houseHeight,
        pixelY
      )
    );

    let gridX = Math.round(
      pixelX / slotWidth
    );

    let gridY = Math.round(
      pixelY / slotHeight
    );

    gridX = Math.max(
      0,
      Math.min(
        GRID_SIZE - HOUSE_WIDTH,
        gridX
      )
    );

    gridY = Math.max(
      0,
      Math.min(
        GRID_SIZE - HOUSE_HEIGHT,
        gridY
      )
    );

    setPosition({
      x: gridX,
      y: gridY,
    });
  }

  function pointerUp(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (dragging) {
      setDragging(false);

      e.currentTarget.releasePointerCapture(
        e.pointerId
      );

      onMove?.(
        position.x,
        position.y
      );
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
        pointerEvents: 'none',
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
          pointerEvents: 'auto',
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