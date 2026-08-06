import { useState } from 'react';
import { OrionHouse } from './OrionHouse';
import { OrionCharacter } from './OrionCharacter';

// Single full island image – the whole map is one image (no slicing / unlocking).
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Island container: one complete image, ~20% smaller than the background
          (constrains by width AND height so it is ALWAYS fully visible and never
          clipped), kept square (1:1) and centered on screen. */}
      <div
        style={{
          position: 'relative',
          width: 'min(80vw, 80vh)',
          maxWidth: '900px',
          aspectRatio: '1 / 1',
          zIndex: 1,
        }}
      >
        {/* The entire island rendered as a real <img> with object-fit: contain
            (never stretched, whole island always visible). */}
        <img
          src={LAND_MAP_IMAGE}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />

        {/* Orion House – draggable via long-press, movement limited to the island. */}
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

        {/* Orion Character – placed beside the house, idle animation preserved. */}
        <OrionCharacter leftPercent={70} topPercent={35} sizePercent={30} />
      </div>
    </div>
  );
}

