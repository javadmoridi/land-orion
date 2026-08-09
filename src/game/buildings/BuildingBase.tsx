import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePlacementGrid } from '../PlacementGrid';
import { canPlaceItem, GRID_SIZE } from '../placementGridUtil';

interface BuildingBaseProps {
  id: string;
  image: string;
  alt: string;
  title: string;
  x?: number;
  y?: number;
  children?: ReactNode;
}

const BUILDING_WIDTH = 4;
const BUILDING_HEIGHT = 4;

export function BuildingBase({
  id,
  image,
  alt,
  title,
  x = 0,
  y = 0,
  children,
}: BuildingBaseProps) {

  const placement = usePlacementGrid();

  const [position, setPosition] = useState({ x, y });
  const oldPosition = useRef({ x, y });

  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);

  const timer = useRef<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const occupied = placement?.occupied ?? [];

  useEffect(() => {
    placement?.registerItem(
      id,
      position.x,
      position.y,
      {
        width: BUILDING_WIDTH,
        height: BUILDING_HEIGHT,
      }
    );
  }, []);

  function pointerDown(e: React.PointerEvent) {

    const rect = e.currentTarget.getBoundingClientRect();

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    timer.current = window.setTimeout(() => {

      oldPosition.current = { ...position };

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

    const slotW =
      rect.width / GRID_SIZE;

    const slotH =
      rect.height / GRID_SIZE;


    let gx =
      Math.round(
        (e.clientX - rect.left - dragOffset.current.x) / slotW
      );

    let gy =
      Math.round(
        (e.clientY - rect.top - dragOffset.current.y) / slotH
      );


    gx = Math.max(
      0,
      Math.min(
        GRID_SIZE - BUILDING_WIDTH,
        gx
      )
    );


    gy = Math.max(
      0,
      Math.min(
        GRID_SIZE - BUILDING_HEIGHT,
        gy
      )
    );


    setPosition({
      x: gx,
      y: gy,
    });
  }


  function pointerUp(e: React.PointerEvent) {

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }


    if (dragging) {

      const allowed =
        canPlaceItem(
          position.x,
          position.y,
          {
            width: BUILDING_WIDTH,
            height: BUILDING_HEIGHT,
          },
          occupied
        );


      if (!allowed) {

        setPosition({
          ...oldPosition.current,
        });

      } else {

        placement?.registerItem(
          id,
          position.x,
          position.y,
          {
            width: BUILDING_WIDTH,
            height: BUILDING_HEIGHT,
          }
        );
      }


      setDragging(false);

      e.currentTarget.releasePointerCapture(
        e.pointerId
      );

    } else {

      setOpen(true);

    }
  }


  return (
    <>
      <div
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}

        style={{
          position:'absolute',

          left:
          `${(position.x / GRID_SIZE) * 100}%`,

          top:
          `${(position.y / GRID_SIZE) * 100}%`,

          width:
          `${(BUILDING_WIDTH / GRID_SIZE) * 100}%`,

          height:
          `${(BUILDING_HEIGHT / GRID_SIZE) * 100}%`,

          zIndex:3,

          cursor:
          dragging ? 'grabbing' : 'grab',

          touchAction:'none',
        }}
      >

        <img
          src={image}
          alt={alt}
          draggable={false}

          style={{
            width:'100%',
            height:'100%',
            objectFit:'contain',
            imageRendering:'pixelated',
            display:'block',
            pointerEvents:'none',
          }}
        />

      </div>


      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:'fixed',
            inset:0,
            background:'rgba(0,0,0,.55)',
            zIndex:100,
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
          }}
        >
          <div
            onClick={(e)=>e.stopPropagation()}
            style={{
              background:'#111',
              color:'white',
              padding:20,
              borderRadius:12,
            }}
          >

            <h2>{title}</h2>

            {children}

          </div>
        </div>
      )}

    </>
  );
}