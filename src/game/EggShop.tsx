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
  const [message, setMessage] = useState('');

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

      setMessage(
        `🥚 ${egg.name} added`
      );
    } else {
      setMessage(
        `❌ Not enough TOKEN - need ${total}, have ${tokens}`
      );
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
      {/* =========================================================
          EGG SHOP BUILDING
          فقط روی لایه زمین قرار دارد
         ========================================================= */}

      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',

          left: `${(x / GRID_SIZE) * 100}%`,
          top: `${(y / GRID_SIZE) * 100}%`,

          width: `${(WIDTH / GRID_SIZE) * 100}%`,
          height: `${(HEIGHT / GRID_SIZE) * 100}%`,

          /*
           * مهم:
           * خود ساختمان نباید z-index خیلی بالا داشته باشد.
           */
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

      {/* =========================================================
          EGG SHOP MODAL
         ========================================================= */}

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,

            background: 'rgba(0,0,0,.6)',

            /*
             * این z-index فقط برای پنجره بازشونده است.
             * ساختمان خودش z-index:3 دارد.
             */
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

              background: '#0d0f16',

              border: '2px solid #ff9e60',
              borderRadius: 16,

              padding: '1.25rem',

              color: 'white',
            }}
          >
            {/* HEADER */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: '#ffd700',
                }}
              >
                Egg Shop
              </h2>

              <button
                onClick={() => setOpen(false)}
                style={{
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* TOKEN BALANCE */}

            <div
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
                width={22}
                height={22}
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

            {/* EGGS */}

            <div
              style={{
                display: 'grid',

                gridTemplateColumns:
                  'repeat(auto-fill,minmax(180px,1fr))',

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
                        'rgba(255,255,255,.05)',

                      border:
                        '1px solid rgba(255,255,255,.1)',

                      borderRadius: 10,

                      padding: 10,

                      textAlign: 'center',
                    }}
                  >
                    {/* EGG IMAGE */}

                    <img
                      src={egg.image}
                      alt={egg.name}
                      width={60}
                      height={60}
                      draggable={false}
                      style={{
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                      }}
                    />

                    {/* NAME */}

                    <div
                      style={{
                        marginTop: 5,
                        fontWeight: 600,
                      }}
                    >
                      {egg.name}
                    </div>

                    {/* TOKEN PRICE */}

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

                    {/* RARITY */}

                    <div
                      style={{
                        marginTop: 4,
                      }}
                    >
                      {RARITY_LABEL[egg.rarity]}
                    </div>

                    {/* HATCH TIME */}

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

                    {/* BUY */}

                    <button
                      onClick={() => buy(egg)}
                      disabled={!canBuy}
                      style={{
                        width: '100%',

                        marginTop: 10,

                        padding: '7px 10px',

                        border: 'none',
                        borderRadius: 6,

                        background: canBuy
                          ? '#ff9e60'
                          : '#555',

                        color: '#0d0f16',

                        fontWeight: 700,

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

            {/* MESSAGE */}

            {message && (
              <div
                style={{
                  marginTop: 15,

                  padding: 10,

                  borderRadius: 8,

                  background:
                    message.startsWith('❌')
                      ? 'rgba(255,80,80,.15)'
                      : 'rgba(46,160,67,.15)',

                  color:
                    message.startsWith('❌')
                      ? '#ff8080'
                      : '#90ee90',
                }}
              >
                {message}
              </div>
            )}

            {/* CLOSE */}

            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 15,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}