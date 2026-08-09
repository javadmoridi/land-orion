import { useEffect, useState } from 'react';
import { usePlacementGrid } from './PlacementGrid';
import { OrionHouseInterior } from './OrionHouseInterior';

const ORION_HOUSE_IMAGE = '/assets/orion-house.png';

const GRID_SIZE = 14;

const HOUSE_WIDTH = 4;
const HOUSE_HEIGHT = 4;

const HOUSE_ID = 'orion-house';

interface OrionHouseProps {
  subX?: number;
  subY?: number;
}

export function OrionHouse({
  subX = 0,
  subY = 0,
}: OrionHouseProps) {

  const [position] = useState({
    x: subX,
    y: subY,
  });

  const [insideHouse, setInsideHouse] = useState(false);

  const placement = usePlacementGrid();

  useEffect(() => {
    placement?.registerItem(
      HOUSE_ID,
      position.x,
      position.y,
      {
        width: HOUSE_WIDTH,
        height: HOUSE_HEIGHT,
      }
    );
  }, []);


  if (insideHouse) {
    return (
      <OrionHouseInterior
        onExit={() => setInsideHouse(false)}
      />
    );
  }


  return (
    <div
      onClick={() => setInsideHouse(true)}
      style={{
        position: 'absolute',

        left: `${(position.x / GRID_SIZE) * 100}%`,
        top: `${(position.y / GRID_SIZE) * 100}%`,

        width: `${(HOUSE_WIDTH / GRID_SIZE) * 100}%`,
        height: `${(HOUSE_HEIGHT / GRID_SIZE) * 100}%`,

        zIndex: 3,
        cursor: 'pointer',
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
          objectFit: 'fill',
          imageRendering: 'pixelated',
          display: 'block',
        }}
      />

    </div>
  );
}