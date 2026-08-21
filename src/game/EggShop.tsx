import { useState } from 'react';
import { useResourceStore } from '../economy/resourceStore';
import { useGameStore } from './useGameStore';
import type { InventoryItem } from '../types';
import { GRID_SIZE } from './placementGridUtil';
import { EGGS, type EggDef } from './eggCatalog';
import { RARITY_LABEL, HATCH_TIME_TICKS } from './orionCatalog';

const IMAGE = '/assets/egg-nest.png';
const TOKEN_IMAGE = '/assets/currency_token.png';

const WIDTH = 10;
const HEIGHT = 10;

interface Props {
  x?: number;
  y?: number;
}

export function EggShop({ x = 0, y = 4 }: Props) {
  const [open, setOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const tokens = useResourceStore(
    (s) => s.resources.tokens
  );

  const spendTokens = useResourceStore(
    (s) => s.spendTokens
  );

  const addToInventory = useGameStore(
    (s) => s.addToInventory
  );

  function buy(egg: EggDef) {
    const total = egg.price;

    if (spendTokens(total)) {
      const item: InventoryItem = {
        id: egg.id,
        name: egg.name,
        type: 'egg',
        quantity: 1,
        rarity: egg.rarity,
        image: egg.image,
      };

      addToInventory(item);
    }
  }

  function formatHatchTime(ticks: number) {
    const hours = ticks / 20 / 3600;

    if (hours >= 24) {
      return `${(hours / 24).toFixed(0)}d ${(hours % 24).toFixed(0)}h`;
    }

    return `${hours.toFixed(0)}h`;
  }

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',

          left: `${(x / GRID_SIZE) * 100}%`,
          top: `${(y / GRID_SIZE) * 100}%`,

          width: `${(WIDTH / GRID_SIZE) * 100}%`,
          height: `${(HEIGHT / GRID_SIZE) * 100}%`,

          zIndex: 3,

          cursor: 'pointer',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imgFailed ? (
          <div
            style={{
              color: 'white',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            Egg Shop
          </div>
        ) : (
          <img
            src={IMAGE}
            alt="Egg Shop"
            draggable={false}
            onError={() => {
              console.error(
                '[EggShop] Failed to load:',
                IMAGE
              );

              setImgFailed(true);
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              display: 'block',
            }}
          />
        )}
      </div>


      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,

            background: 'rgba(0,0,0,.6)',

            zIndex: 100,

            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',

            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(720px,95%)',

              maxHeight: '88vh',

              overflowY: 'auto',

              scrollbarWidth: 'none',
              msOverflowStyle: 'none',

              background: '#2e0736',

              border: '2px solid #070707',

              borderRadius: 100,

              padding: '1.25rem',

              color: 'white',
            }}
          >

            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: '#e4dfdf',
                }}
              >
                Egg Shop
              </h2>

              <button
                onClick={() => setOpen(false)}
                style={{
                  position: 'absolute',
                  right: 30,
                  top: 20,
                  width: 50,
                  height: 50,

                  borderRadius: '50%',

                  border: 'none',

                  background: '#f70909',

                  color: '#fffdfd',

                  fontSize: 22,

                  fontWeight: 'bold',

                  cursor: 'pointer',

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  boxShadow:
                    '0 0 30px rgb(135, 255, 111)',
                }}
              >
                ✕
              </button>
            </div>            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,

                marginTop: 15,
                marginBottom: 15,
              }}
            >
              <img
                src={TOKEN_IMAGE}
                alt="Token"

                width={50}
                height={50}

                draggable={false}

                style={{
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                }}
              />

              <span>
                TOKEN:
              </span>

              <strong>
                {tokens}
              </strong>
            </div>


            <div
              style={{
                display: 'grid',

                gridTemplateColumns:
                  'repeat(2, 1fr)',

                gap: 12,
              }}
            >
              {EGGS.map((egg) => {
                const total = egg.price;

                const ticks =
                  HATCH_TIME_TICKS[egg.rarity];

                const canBuy =
                  tokens >= total;

                return (
                  <div
                    key={egg.id}
                    style={{
                      background:
                        'rgba(253,7,7,0.05)',

                      border:
                        '1px solid rgba(255,255,255,.1)',

                      borderRadius: 80,

                      padding: 30,

                      textAlign: 'center',
                    }}
                  >

                    <img
                      src={egg.image}

                      alt={egg.name}

                      width={160}

                      height={160}

                      draggable={false}

                      style={{
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                      }}
                    />


                    <div
                      style={{
                        marginTop: 5,
                        fontWeight: 600,
                      }}
                    >
                      {egg.name}
                    </div>


                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',

                        gap: 5,

                        margin: '8px',
                      }}
                    >
                      <img
                        src={TOKEN_IMAGE}

                        alt="Token"

                        width={18}

                        height={18}

                        draggable={false}

                        style={{
                          objectFit: 'contain',
                          imageRendering: 'pixelated',
                        }}
                      />

                      <span>
                        {total}
                      </span>
                    </div>


                    <div
                      style={{
                        marginTop: 4,
                      }}
                    >
                      {RARITY_LABEL[egg.rarity]}
                    </div>


                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        color: '#aaa',
                      }}
                    >
                      Hatch:{' '}
                      {formatHatchTime(ticks)}
                    </div>


                    <button
                      onClick={() => buy(egg)}

                      disabled={!canBuy}

                      style={{
                        width: '100%',

                        marginTop: 10,

                        padding: '10px',

                        border: 'none',

                        borderRadius: 100,

                        background: canBuy
                          ? '#23fdd9'
                          : '#eb0f0f',

                        color: '#0d0f16',

                        fontWeight: 800,

                        cursor: canBuy
                          ? 'pointer'
                          : 'not-allowed',
                      }}
                    >
                      Buy
                    </button>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
}