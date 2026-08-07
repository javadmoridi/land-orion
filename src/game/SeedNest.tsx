import { useState } from 'react';

const IMAGE = '/assets/seed-nest.png';

const GRID_SIZE = 14;
const SIZE = 2;

interface Props {
  x?: number;
  y?: number;
}

export function SeedNest({
  x = 3,
  y = 3,
}: Props) {
  const [position] = useState({
    x,
    y,
  });

  return (
    <img
      src={IMAGE}
      alt="Seed Nest"
      draggable={false}
      style={{
        position: 'absolute',

        left: `${(position.x / GRID_SIZE) * 100}%`,
        top: `${(position.y / GRID_SIZE) * 100}%`,

        width: `${(SIZE / GRID_SIZE) * 100}%`,
        height: `${(SIZE / GRID_SIZE) * 100}%`,

        objectFit: 'contain',
        imageRendering: 'pixelated',
        zIndex: 3,
      }}
    />
  );
}