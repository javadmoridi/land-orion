import { useEffect } from 'react';
import { usePlacementGrid } from './PlacementGrid';

const IMAGE = '/assets/egg-nest.png';

const GRID_SIZE = 14;
const SIZE = 3;

interface Props {
  x?: number;
  y?: number;
}

export function EggNest({
  x = 9,
  y = 3,
}: Props) {

  const placement = usePlacementGrid();


  useEffect(() => {

    placement?.registerItem(
      x,
      y,
      {
        width: SIZE,
        height: SIZE,
      }
    );

  }, []);


  return (
    <img
      src={IMAGE}
      alt="Egg Nest"
      draggable={false}

      style={{
        position: 'absolute',

        left: `${(x / GRID_SIZE) * 100}%`,
        top: `${(y / GRID_SIZE) * 100}%`,

        width: `${(SIZE / GRID_SIZE) * 100}%`,
        height: `${(SIZE / GRID_SIZE) * 100}%`,

        objectFit: 'contain',

        imageRendering: 'pixelated',

        zIndex: 3,
      }}
    />
  );
}