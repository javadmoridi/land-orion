import { useState } from 'react';
import { OrionHouse } from './OrionHouse';
import { OrionCharacter } from './OrionCharacter';
import { PlacementGrid } from './PlacementGrid';

const LAND_MAP_IMAGE = '/assets/land-map.png';

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
          width: 'min(95vw, 90vh)',
          maxWidth: '1400px',
          aspectRatio: '1 / 1',
          zIndex: 1,
        }}
      >
        <img
          src={LAND_MAP_IMAGE}
          alt="Island"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />

        <PlacementGrid>
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
        </PlacementGrid>

        <OrionCharacter
          leftPercent={70}
          topPercent={35}
          sizePercent={30}
        />
      </div>
    </div>
  );
}