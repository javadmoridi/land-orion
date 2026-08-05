import { useState } from 'react';
import { OrionHouse } from './OrionHouse';

// Single land image – centered in the background
const LAND_MAP_IMAGE = '/assets/land-map (2).png';

interface PlayerIslandProps {
  level: number;
  resources?: Record<string, number>;
  inventory?: Array<{ id: string; quantity: number }>;
}

export function PlayerIsland(_props: PlayerIslandProps) {
  const [housePosition, setHousePosition] = useState({
    x: 0,
    y: 0,
  });

  // Single land – 85% of the background (15% smaller)
  const landSize = 'min(85vw, 85vh)';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: landSize,
          height: landSize,
          overflow: 'hidden',
          backgroundImage: `url(${LAND_MAP_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      >
        <OrionHouse
          subX={housePosition.x}
          subY={housePosition.y}
          onMove={(x, y) => {
            setHousePosition({ x, y });
          }}
        />
      </div>
    </div>
  );
}