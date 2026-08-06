import { useState } from 'react';
import { OrionHouse } from './OrionHouse';
import { OrionCharacter } from './OrionCharacter';

const LAND_MAP_IMAGE = '/assets/land-map.png';

interface PlayerIslandProps {
  level: number;
  resources?: Record<string, number>;
  inventory?: Array<{ id: string; quantity: number }>;
}

export function PlayerIsland(_props: PlayerIslandProps) {
  const [housePosition, setHousePosition] = useState({
    x: 35,
    y: 45,
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '80%',
          height: '80%',
          maxWidth: '900px',
          maxHeight: '900px',
          backgroundImage: `url("${LAND_MAP_IMAGE}")`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      >
        <OrionHouse
          subX={housePosition.x}
          subY={housePosition.y}
          onMove={(x, y) => {
            setHousePosition({
              x,
              y,
            });
          }}
        />

        <OrionCharacter />
      </div>
    </div>
  );
}