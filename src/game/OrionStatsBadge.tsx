import { useState } from 'react';
import {
  getOrionStats,
} from './orionStore';

import type {
  OrionRace,
} from './orionStore';

interface OrionStatsBadgeProps {
  race: OrionRace;
  level: number;
}

const RACE_NAMES: Record<
  OrionRace,
  string
> = {
  water: 'Water',
  air: 'Air',
  earth: 'Earth',
  fire: 'Fire',
  asil: 'Asil',
};

export function OrionStatsBadge({
  race,
  level,
}: OrionStatsBadgeProps) {
  const [open, setOpen] =
    useState(false);

  const stats =
    getOrionStats(
      race,
      level
    );

  return (
    <>
      {/* کوچک‌ترین دایره بالا سمت راست Orion */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        title="Show Orion stats"
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border:
            '1px solid rgba(255,215,0,.65)',
          background:
            'rgba(5,10,20,.9)',
          color: '#ffd700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
          fontSize: 13,
          fontWeight: 900,
          boxShadow:
            '0 0 10px rgba(0,0,0,.55)',
        }}
      >
        ⚔
      </button>

      {open && (
        <div
          onClick={() =>
            setOpen(false)
          }
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 20000,
            background:
              'rgba(0,0,0,.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width:
                'min(360px, 92vw)',
              background:
                'linear-gradient(180deg, #111827, #05070c)',
              border:
                '1px solid rgba(255,215,0,.3)',
              borderRadius: 16,
              padding: 20,
              color: '#fff',
              boxShadow:
                '0 0 40px rgba(0,0,0,.7)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      '1.05rem',
                    fontWeight: 900,
                  }}
                >
                  {RACE_NAMES[race]}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    color: '#ffd700',
                    fontWeight: 800,
                    fontSize:
                      '0.82rem',
                  }}
                >
                  Level {level}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                style={{
                  border: 'none',
                  background:
                    'rgba(255,255,255,.08)',
                  color: '#fff',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                }}
              >
                X
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 10,
                marginTop: 18,
              }}
            >
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background:
                    'rgba(239,68,68,.08)',
                  border:
                    '1px solid rgba(239,68,68,.22)',
                }}
              >
                <div
                  style={{
                    color: '#fca5a5',
                    fontSize:
                      '0.72rem',
                  }}
                >
                  ATTACK
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize:
                      '1.15rem',
                    fontWeight: 900,
                  }}
                >
                  {stats.attack.toLocaleString(
                    'en-US',
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background:
                    'rgba(34,197,94,.08)',
                  border:
                    '1px solid rgba(34,197,94,.22)',
                }}
              >
                <div
                  style={{
                    color: '#86efac',
                    fontSize:
                      '0.72rem',
                  }}
                >
                  HP
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize:
                      '1.15rem',
                    fontWeight: 900,
                  }}
                >
                  {stats.hp.toLocaleString(
                    'en-US',
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 11,
                borderRadius: 10,
                background:
                  'rgba(255,255,255,.04)',
                color: '#9fb0d0',
                fontSize:
                  '0.74rem',
                textAlign: 'center',
              }}
            >
              Attack and HP increase by 50%
              with every level.
            </div>
          </div>
        </div>
      )}
    </>
  );
}