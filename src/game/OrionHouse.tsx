import { useEffect, useRef, useState } from 'react';
import { usePlacementGrid } from './PlacementGrid';
import { canPlaceItem } from './placementGridUtil';

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

  const oldPosition = useRef({
    x: subX,
    y: subY,
  });

  const [dragging, setDragging] = useState(false);
  const [openHouse, setOpenHouse] = useState(false);

  const timer = useRef<number | null>(null);

  const dragOffset = useRef({
    x: 0,
    y: 0,
  });

  const placement = usePlacementGrid();

  const occupied = placement?.occupied ?? [];


  useEffect(() => {
    placement?.registerItem(
      position.x,
      position.y,
      {
        width: HOUSE_WIDTH,
        height: HOUSE_HEIGHT,
      }
    );
  }, []);


  function pointerDown(e: React.PointerEvent) {

    const rect =
      e.currentTarget.getBoundingClientRect();

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };


    timer.current = window.setTimeout(() => {

      oldPosition.current = {
        ...position,
      };

      setDragging(true);

      e.currentTarget.setPointerCapture(
        e.pointerId
      );

    }, 500);

  }


  function pointerMove(e: React.PointerEvent) {

    if (!dragging) return;


    const gridLayer =
      e.currentTarget.parentElement?.parentElement;


    if (!gridLayer) return;


    const rect =
      gridLayer.getBoundingClientRect();


    const slotWidth =
      rect.width / GRID_SIZE;

    const slotHeight =
      rect.height / GRID_SIZE;


    let gridX = Math.round(
      (
        e.clientX -
        rect.left -
        dragOffset.current.x
      ) / slotWidth
    );


    let gridY = Math.round(
      (
        e.clientY -
        rect.top -
        dragOffset.current.y
      ) / slotHeight
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


  function pointerUp(e: React.PointerEvent) {

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }


    if (dragging) {

      const canPlace =
        canPlaceItem(
          position.x,
          position.y,
          {
            width: HOUSE_WIDTH,
            height: HOUSE_HEIGHT,
          },
          occupied.filter(
            (slot) =>
              !(
                slot.x >= oldPosition.current.x &&
                slot.x <
                  oldPosition.current.x + HOUSE_WIDTH &&
                slot.y >= oldPosition.current.y &&
                slot.y <
                  oldPosition.current.y + HOUSE_HEIGHT
              )
          )
        );


      if (!canPlace) {

        setPosition({
          ...oldPosition.current,
        });

      } else {

        onMove?.(
          position.x,
          position.y
        );

      }


      setDragging(false);


      e.currentTarget.releasePointerCapture(
        e.pointerId
      );


    } else {

      setOpenHouse(true);

    }

  }


  return (
    <>
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

            left: `${(position.x / GRID_SIZE) * 100}%`,
            top: `${(position.y / GRID_SIZE) * 100}%`,

            width:
              `${(HOUSE_WIDTH / GRID_SIZE) * 100}%`,

            height:
              `${(HOUSE_HEIGHT / GRID_SIZE) * 100}%`,

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


      {openHouse && (
        <div
          onClick={() => setOpenHouse(false)}

          style={{
            position: 'fixed',
            inset: 0,

            background:
              'rgba(0,0,0,0.5)',

            zIndex: 100,

            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }

            style={{
              background: '#222',
              color: 'white',

              padding: 20,

              borderRadius: 12,
            }}
          >

            <h2>
              Orion House
            </h2>

            <p>
              House menu coming soon...
            </p>

            <button
              onClick={() =>
                setOpenHouse(false)
              }
            >
              Exit
            </button>

          </div>

        </div>
      )}

    </>
  );
}