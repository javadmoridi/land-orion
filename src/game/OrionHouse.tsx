import { useRef, useState } from 'react';

const ORION_HOUSE_IMAGE = '/assets/orion-house.png';

const SUB_GRID = 3;
const HOUSE_SIZE = 2;

interface UnlockedLand {
  index: number;
  x: number;
  y: number;
}

interface OrionHouseProps {
  unlockedLands: UnlockedLand[];

  landX?: number;
  landY?: number;
  subX?: number;
  subY?: number;

  onMove?: (
    landX: number,
    landY: number,
    subX: number,
    subY: number
  ) => void;
}

export function OrionHouse({
  unlockedLands,
  landX = 0,
  landY = 0,
  subX = 0,
  subY = 0,
  onMove,
}: OrionHouseProps) {

  const [position, setPosition] = useState({
    landX,
    landY,
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

    // اندازه یک زمین از نقشه 5x5
    const tileWidth = rect.width / 5;
    const tileHeight = rect.height / 5;


    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;


    const newLandX = Math.floor(mouseX / tileWidth);
    const newLandY = Math.floor(mouseY / tileHeight);


    // فقط زمین های باز
    const opened = unlockedLands.some(
      land =>
        land.x === newLandX &&
        land.y === newLandY
    );


    if (!opened) return;


    // محل داخل همان زمین
    const insideX = mouseX - newLandX * tileWidth;
    const insideY = mouseY - newLandY * tileHeight;


    let newSubX = Math.floor(
      insideX / (tileWidth / SUB_GRID)
    );

    let newSubY = Math.floor(
      insideY / (tileHeight / SUB_GRID)
    );


    // خانه 2x2 جا شود
    newSubX = Math.max(
      0,
      Math.min(1, newSubX)
    );

    newSubY = Math.max(
      0,
      Math.min(1, newSubY)
    );


    setPosition({
      landX: newLandX,
      landY: newLandY,
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

      onMove?.(
        position.landX,
        position.landY,
        position.subX,
        position.subY
      );
    }
  }


  // خانه = 2 قسمت از 3 قسمت یک زمین
  const size = (HOUSE_SIZE / SUB_GRID) * 100;


  // جای خانه داخل زمین خودش
  const left =
    position.landX * 20 +
    position.subX * (20 / SUB_GRID);

  const top =
    position.landY * 20 +
    position.subY * (20 / SUB_GRID);


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

          width: `${size * 0.2}%`,
          height: `${size * 0.2}%`,

          backgroundImage:
            `url(${ORION_HOUSE_IMAGE})`,

          backgroundSize: 'cover',
          backgroundPosition: 'center',

          imageRendering: 'pixelated',

          cursor: dragging
            ? 'grabbing'
            : 'grab',

          pointerEvents: 'auto',
          touchAction: 'none',
        }}
      />
    </div>
  );
}