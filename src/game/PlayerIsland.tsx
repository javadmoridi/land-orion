import { useState } from 'react';
import { OrionHouse } from './OrionHouse';
import { OrionCharacter } from './OrionCharacter';
import { PlacementGrid } from './PlacementGrid';

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
      {/* Island container: about 90% of the displayable area, square (1:1),
          centered on screen, never clipped and never stretched.
          Layering (z-index): background 0 < island 1 < placement grid 2
          < buildings/items (house) < characters < UI. */}
      <div
        style={{
          position: 'relative',
          width: 'min(90vw, 86vh)',
          maxWidth: '1400px',
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

        {/* Item placement layer (grid + buildings/items). */}
        <PlacementGrid>
          {/* Orion House – draggable via long-press, movement limited to the island.
              Kept inside the placement layer so it is coordinated with the grid. */}
          <OrionHouse
            subX={housePosition.x}
            subY={housePosition.y}
            onMove={(x, y) => {
              setHousePosition({ x, y });
            }}
          />
        </PlacementGrid>

        {/* Orion Character – rendered above the grid/buildings layer. */}
        <OrionCharacter leftPercent={70} topPercent={35} sizePercent={30} />
      </div>
    </div>
  );
}


