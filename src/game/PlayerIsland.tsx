import { useState } from 'react';
import { OrionHouse } from './OrionHouse';
import { PlacementGrid } from './PlacementGrid';
import { SeedNest } from './SeedNest';
import { EggNest } from './EggNest';

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
          width: 'min(90vw, 90vh)',
          maxWidth: '1400px',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
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


        <div
          style={{
            position: 'absolute',
            inset: 0,

            width: '100%',
            height: '100%',
          }}
        >

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


            <SeedNest
              x={3}
              y={3}
            />


            <EggNest
              x={9}
              y={3}
            />

          </PlacementGrid>


        </div>

      </div>

    </div>
  );
}