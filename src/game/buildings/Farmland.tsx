import { useState } from 'react';
import { useFarmStore, isFarmReady, isFarmGrowing } from '../farmStore';
import { getSeedById } from '../seedCatalog';
import { useGameStore } from '../useGameStore';
import { formatDuration, useNow } from '../resourceNodesStore';
import { GRID_SIZE } from '../placementGridUtil';
import { FARMLAND_SIZE } from '../farmStore';

const RAW_IMAGE = '/assets/orion-farmland.png';
const PLANTED_IMAGE = '/assets/orion-planted-farmland.png';

interface Props {
  tileId: string;
}

export function Farmland({ tileId }: Props) {
  const tile = useFarmStore((s) =>
    s.tiles.find((t) => t.id === tileId)
  );

  const plantSeed = useFarmStore((s) => s.plantSeed);
  const harvestFruit = useFarmStore((s) => s.harvestFruit);

  const gameState = useGameStore((s) => s.gameState);
  const inventory = gameState?.inventory ?? [];

  const ownedSeeds = inventory.filter(
    (i) => i.type === 'seed' && i.quantity > 0
  );

  const now = useNow(1000);
  const [showPlant, setShowPlant] = useState(false);

  if (!tile) return null;

  const seed = tile.seedId
    ? getSeedById(tile.seedId)
    : undefined;

  const ready = isFarmReady(tile, now);
  const growing = isFarmGrowing(tile, now);

  const remaining = tile.readyAt
    ? tile.readyAt - now
    : 0;

  let image = RAW_IMAGE;

  if (tile.seedId) {
    if (ready && seed?.fruitImage) {
      image = seed.fruitImage;
    } else {
      image = PLANTED_IMAGE;
    }
  }

  return (
    <>
      <div
        onClick={() => {
          if (growing) return;

          if (!tile.seedId) {
            setShowPlant(true);
          } else if (ready) {
            harvestFruit(tile.id);
          }
        }}
        style={{
          position: 'absolute',
          left: `${(tile.x / GRID_SIZE) * 100}%`,
          top: `${(tile.y / GRID_SIZE) * 100}%`,
          width: `${(FARMLAND_SIZE / GRID_SIZE) * 100}%`,
          height: `${(FARMLAND_SIZE / GRID_SIZE) * 100}%`,
          zIndex: 3,
          cursor:
            !tile.seedId || ready
              ? 'pointer'
              : 'default',
          opacity: growing ? 0.65 : 1,
        }}
      >
        <img
          src={image}
          alt="farm"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            display: 'block',
          }}
        />

        {growing && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              textAlign: 'center',
              fontSize: '0.6rem',
              color: 'white',
              textShadow: '0 0 3px black',
              background: 'rgba(0,0,0,.5)',
              borderRadius: 4,
            }}
          >
            ⏳ {formatDuration(remaining)}
          </div>
        )}

        {ready && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              textAlign: 'center',
              fontSize: '0.6rem',
              color: '#90ee90',
              textShadow: '0 0 3px black',
              background: 'rgba(0,0,0,.5)',
              borderRadius: 4,
            }}
          >
            🪓 Ready!
          </div>
        )}
      </div>

      {showPlant && (
        <div
          onClick={() => setShowPlant(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.6)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#171717',
              color: 'white',
              padding: 20,
              borderRadius: 14,
              width: 'min(520px,94vw)',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <h2>
              Plant a Seed
            </h2>

            {ownedSeeds.length === 0 ? (
              <p>
                No seeds — buy some at the Seed Shop
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(3,1fr)',
                  gap: 12,
                }}
              >
                {ownedSeeds.map((item) => {
                  const def =
                    getSeedById(item.id);

                  if (!def) return null;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (
                          plantSeed(
                            tile.id,
                            def.id
                          )
                        ) {
                          setShowPlant(false);
                        }
                      }}
                    >
                      <img
                        src={def.image}
                        alt={def.name}
                        width={42}
                        height={42}
                        draggable={false}
                        style={{
                          imageRendering:
                            'pixelated',
                        }}
                      />

                      <div>
                        {def.name} ×{item.quantity}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() =>
                setShowPlant(false)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}