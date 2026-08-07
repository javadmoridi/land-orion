import { useEffect, useRef, useState } from 'react';
import { usePlacementGrid } from './PlacementGrid';

const IMAGE = '/assets/egg-nest.png';

const GRID_SIZE = 14;

const WIDTH = 2;
const HEIGHT = 2;

interface Props {
  x?: number;
  y?: number;
}

export function EggNest({
  x = 9,
  y = 3,
}: Props) {

  const placement = usePlacementGrid();

  const [position, setPosition] = useState({
    x,
    y,
  });

  const [dragging, setDragging] = useState(false);
  const [openShop, setOpenShop] = useState(false);

  const timer = useRef<number | null>(null);

  const offset = useRef({
    x: 0,
    y: 0,
  });


  useEffect(() => {
    placement?.registerItem(
      position.x,
      position.y,
      {
        width: WIDTH,
        height: HEIGHT,
      }
    );
  }, []);


  function pointerDown(e: React.PointerEvent) {

    const rect =
      e.currentTarget.getBoundingClientRect();

    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };


    timer.current = window.setTimeout(() => {

      setDragging(true);

      e.currentTarget.setPointerCapture(
        e.pointerId
      );

    }, 500);
  }


  function pointerMove(e: React.PointerEvent) {

    if (!dragging) return;


    const grid =
      e.currentTarget.parentElement?.parentElement;

    if (!grid) return;


    const rect =
      grid.getBoundingClientRect();


    const slotWidth =
      rect.width / GRID_SIZE;

    const slotHeight =
      rect.height / GRID_SIZE;


    let newX = Math.floor(
      (e.clientX - rect.left - offset.current.x)
      / slotWidth
    );

    let newY = Math.floor(
      (e.clientY - rect.top - offset.current.y)
      / slotHeight
    );


    newX = Math.max(
      0,
      Math.min(GRID_SIZE - WIDTH, newX)
    );


    newY = Math.max(
      0,
      Math.min(GRID_SIZE - HEIGHT, newY)
    );


    setPosition({
      x: newX,
      y: newY,
    });
  }


  function pointerUp(e: React.PointerEvent) {

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }


    if (dragging) {

      setDragging(false);

      e.currentTarget.releasePointerCapture(
        e.pointerId
      );

    } else {

      setOpenShop(true);

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

          width: `${(WIDTH / GRID_SIZE) * 100}%`,
          height: `${(HEIGHT / GRID_SIZE) * 100}%`,

          zIndex: 3,

          cursor: dragging
            ? 'grabbing'
            : 'grab',

          touchAction: 'none',
        }}
      >

        <img
          src={IMAGE}
          alt="Egg Shop"
          draggable={false}

          style={{
            width: '100%',
            height: '100%',

            objectFit: 'contain',

            imageRendering: 'pixelated',

            display: 'block',
          }}
        />

      </div>


      {openShop && (
        <div
          onClick={() => setOpenShop(false)}

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
              Egg Shop
            </h2>

            <p>
              Orion eggs coming soon...
            </p>

            <button
              onClick={() =>
                setOpenShop(false)
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