import { useRef, useState } from 'react';

const ORION_HOUSE_IMAGE = '/assets/orion-house.png';

const MAP_GRID = 5;
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
  const areaRef = useRef<HTMLDivElement>(null);

  function startDrag(e: React.PointerEvent) {
    e.preventDefault();

    timer.current = window.setTimeout(() => {
      setDragging(true);
    }, 500);
  }


  function moveHouse(e: React.PointerEvent) {
    if (!dragging || !areaRef.current) return;

    const box = areaRef.current.getBoundingClientRect();

    const tileW = box.width / MAP_GRID;
    const tileH = box.height / MAP_GRID;

    const mouseX = e.clientX - box.left;
    const mouseY = e.clientY - box.top;


    let newLandX = Math.floor(mouseX / tileW);
    let newLandY = Math.floor(mouseY / tileH);


    newLandX = Math.max(0, Math.min(4, newLandX));
    newLandY = Math.max(0, Math.min(4, newLandY));


    // اگر زمین باز نیست، حرکت نکن
    const allowed = unlockedLands.some(
      land =>
        land.x === newLandX &&
        land.y === newLandY
    );

    if (!allowed) return;


    const insideX = mouseX - newLandX * tileW;
    const insideY = mouseY - newLandY * tileH;


    let newSubX = Math.floor(
      insideX / (tileW / SUB_GRID)
    );

    let newSubY = Math.floor(
      insideY / (tileH / SUB_GRID)
    );


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


  function endDrag() {
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


  const tilePercent = 100 / MAP_GRID;

  const size =
    tilePercent * (HOUSE_SIZE / SUB_GRID);


  const left =
    position.landX * tilePercent +
    position.subX * (tilePercent / SUB_GRID);


  const top =
    position.landY * tilePercent +
    position.subY * (tilePercent / SUB_GRID);


  return (
    <div
      ref={areaRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <div
        onPointerDown={startDrag}
        onPointerMove={moveHouse}
        onPointerUp={endDrag}
        style={{
          position: 'absolute',

          left: `${left}%`,
          top: `${top}%`,

          width: `${size}%`,
          height: `${size}%`,

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

          zIndex: 20,
        }}
      />
    </div>
  );
}