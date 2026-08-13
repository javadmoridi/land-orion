import { useState } from 'react';
import { VipPanel } from './VipPanel';

export function xpRequiredForLevel(
  level: number
): number {
  return Math.round(
    20 * Math.pow(1.2, level - 1)
  );
}

const VIP_IMAGE =
  '/assets/orion-vip-button.png';

interface LevelBadgeProps {
  level: number;
  experience: number;
}

export function LevelBadge({
  level: _level,
  experience: _experience,
}: LevelBadgeProps) {
  const [vipOpen, setVipOpen] =
    useState(false);

  const [shopOpen, setShopOpen] =
    useState(false);

  const [battleOpen, setBattleOpen] =
    useState(false);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* VIP */}
        <button
          type="button"
          onClick={() =>
            setVipOpen(true)
          }
          title="VIP"
          style={{
            width: 90,
            height: 90,
            padding: 0,
            border: 'none',
            borderRadius: '50%',
            background:
              'transparent',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <img
            src={VIP_IMAGE}
            alt="VIP"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering:
                'pixelated',
              display: 'block',
            }}
          />
        </button>

        {/* SHOP */}
        <button
          type="button"
          onClick={() =>
            setShopOpen(true)
          }
          title="Shop"
          style={{
            width: 90,
            height: 90,
            padding: 0,
            border: 'none',
            borderRadius: '50%',
            background:
              'transparent',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <img
            src="/assets/orion-shop-button.png"
            alt="Shop"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering:
                'pixelated',
              display: 'block',
            }}
          />
        </button>

        {/* BATTLE */}
        <button
          type="button"
          onClick={() =>
            setBattleOpen(true)
          }
          title="Battle"
          style={{
            width: 90,
            height: 90,
            padding: 0,
            border: 'none',
            borderRadius: '50%',
            background:
              'transparent',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <img
            src="/assets/orion-battle-button.png"
            alt="Battle"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering:
                'pixelated',
              display: 'block',
            }}
          />
        </button>
      </div>

      <VipPanel
        open={vipOpen}
        onClose={() =>
          setVipOpen(false)
        }
      />

      {/* SHOP WINDOW */}
      {shopOpen && (
        <div
          onClick={() =>
            setShopOpen(false)
          }
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background:
              'rgba(0,0,0,.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width:
                'min(700px, 94vw)',
              maxHeight: '88vh',
              overflow: 'auto',
              background:
                '#171717',
              color: '#fff',
              borderRadius: 18,
              padding: 24,
              border:
                '1px solid rgba(255,215,0,.3)',
              boxShadow:
                '0 0 40px rgba(0,0,0,.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
              }}
            >
              <h2
                style={{
                  margin: 0,
                }}
              >
                ORION SHOP
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShopOpen(false)
                }
                style={{
                  border: 'none',
                  borderRadius: 8,
                  padding:
                    '7px 12px',
                  background:
                    'rgba(255,255,255,.08)',
                  color: '#fff',
                  cursor:
                    'pointer',
                  fontWeight: 800,
                }}
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATTLE WINDOW */}
      {battleOpen && (
        <div
          onClick={() =>
            setBattleOpen(false)
          }
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background:
              'rgba(0,0,0,.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width:
                'min(700px, 94vw)',
              maxHeight: '88vh',
              overflow: 'auto',
              background:
                '#171717',
              color: '#fff',
              borderRadius: 18,
              padding: 24,
              border:
                '1px solid rgba(255,90,90,.3)',
              boxShadow:
                '0 0 40px rgba(0,0,0,.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
              }}
            >
              <h2
                style={{
                  margin: 0,
                }}
              >
                ORION BATTLE
              </h2>

              <button
                type="button"
                onClick={() =>
                  setBattleOpen(false)
                }
                style={{
                  border: 'none',
                  borderRadius: 8,
                  padding:
                    '7px 12px',
                  background:
                    'rgba(255,255,255,.08)',
                  color: '#fff',
                  cursor:
                    'pointer',
                  fontWeight: 800,
                }}
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}