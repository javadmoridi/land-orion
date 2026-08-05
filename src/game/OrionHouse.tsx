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
  landX: number;
  landY: number;
  subX: number;
  subY: number;
  unlockedLands: UnlockedLand[];

  onMove?: (
    landX: number,
    landY: number,
    subX: number,
    subY: number
  ) => void;
}

export function OrionHouse({
  landX,
  landY,
  subX,
  subY,
  unlockedLands,
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
  const startPoint = useRef({ x: 0, y: 0 });

  function pointerDown(e: React.PointerEvent) {
    e.preventDefault();

    startPoint.current = {
      x: e.clientX,
      y: e.clientY,
    };

    timer.current = window.setTimeout(() => {
      setDragging(true);
    }, 500);
  }


  function pointerMove(e: React.PointerEvent) {
    if (!dragging) return;

    const element = e.currentTarget.parentElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    // اندازه هر زمین
    const tileWidth = rect.width / 5;
    const tileHeight = rect.height / 5;


    // پیدا کردن زمین مقصد
    const mapX = e.clientX - rect.left;
    const mapY = e.clientY - rect.top;


    const newLandX = Math.floor(mapX / tileWidth);
    const newLandY = Math.floor(mapY / tileHeight);


    // فقط زمین های باز
    const canMove = unlockedLands.some(
      land =>
        land.x === newLandX &&
        land.y === newLandY
    );


    if (!canMove) return;


    // محل داخل همان زمین
    const insideX = mapX - newLandX * tileWidth;
    const insideY = mapY - newLandY * tileHeight;


    let newSubX = Math.floor(
      insideX / (tileWidth / SUB_GRID)
    );

    let newSubY = Math.floor(
      insideY / (tileHeight / SUB_GRID)
    );


    newSubX = Math.max(0, Math.min(1, newSubX));
    newSubY = Math.max(0, Math.min(1, newSubY));


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


  // اندازه مثل قبل: 2 خانه از 3 خانه
  const size = (HOUSE_SIZE / SUB_GRID) * 100;


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

          // زمین فعلی + جای خانه داخل همان زمین
          left:
            `${position.landX * 20 + position.subX * 6.66}%`,

          top:
            `${position.landY * 20 + position.subY * 6.66}%`,


          // اندازه یک زمین تقسیم بر 5
          width:
            `${size * 0.2}%`,

          height:
            `${size * 0.2}%`,


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

          userSelect: 'none',
        }}
      />

    </div>
  );
}