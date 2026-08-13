import { useEffect, useState } from 'react';
import { GRID_SIZE } from '../placementGridUtil';
import {
  useOrionStore,
  ORION_MAX_LEVEL,
  type OrionRace,
} from '../orionStore';

interface HospitalProps {
  x: number;
  y: number;
}

const HOSPITAL_IMAGE =
  '/assets/orion-hospital.png';

const WIDTH = 10;
const HEIGHT = 10;

/*
 * Default treatment time.
 * Later the battle system can pass a specific treatment duration.
 */
const DEFAULT_TREATMENT_MS =
  30 * 60 * 1000;

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

const RACE_EMOJI: Record<
  OrionRace,
  string
> = {
  water: '💧',
  air: '🌪',
  earth: '🌍',
  fire: '🔥',
  asil: '👑',
};

function formatTime(
  ms: number
): string {
  const totalSeconds = Math.max(
    0,
    Math.ceil(ms / 1000)
  );

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  return `${String(hours).padStart(
    2,
    '0'
  )}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(
    2,
    '0'
  )}`;
}

function getTreatmentRemaining(
  hospitalStartedAt?: number,
  hospitalEndsAt?: number,
  now?: number
): number {
  if (
    typeof hospitalEndsAt === 'number'
  ) {
    return Math.max(
      0,
      hospitalEndsAt -
        (now ?? Date.now())
    );
  }

  if (
    typeof hospitalStartedAt ===
    'number'
  ) {
    return Math.max(
      0,
      hospitalStartedAt +
        DEFAULT_TREATMENT_MS -
        (now ?? Date.now())
    );
  }

  return 0;
}

export function Hospital({
  x,
  y,
}: HospitalProps) {
  const [open, setOpen] =
    useState(false);

  const [now, setNow] =
    useState(() => Date.now());

  const [message, setMessage] =
    useState<string | null>(null);

  const orions =
    useOrionStore(
      (s) => s.orions
    );

  const maxLevel =
    ORION_MAX_LEVEL;

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setNow(Date.now());
      }, 1000);

    return () =>
      window.clearInterval(timer);
  }, []);

  /*
   * Hospital units are the Orion units whose runtime state
   * is marked as "hospital".
   *
   * The current orionStore will be extended with these states
   * when the battle system is connected.
   */
  const hospitalOrions =
    orions.filter(
      (orion) =>
        (
          orion as typeof orion & {
            status?: string;
          }
        ).status === 'hospital'
    );

  function openHospital() {
    setMessage(null);
    setNow(Date.now());
    setOpen(true);
  }

  function closeHospital() {
    setOpen(false);
    setMessage(null);
  }

  const size = WIDTH;

  return (
    <>
      <button
        type="button"
        onClick={openHospital}
        style={{
          position: 'absolute',
          left: `${(x / GRID_SIZE) * 100}%`,
          top: `${(y / GRID_SIZE) * 100}%`,
          width: `${(size / GRID_SIZE) * 100}%`,
          height: `${(HEIGHT / GRID_SIZE) * 100}%`,
          padding: 0,
          margin: 0,
          border: 'none',
          background: 'transparent',
          zIndex: 6,
          cursor: 'pointer',
        }}
      >
        <img
          src={HOSPITAL_IMAGE}
          alt="Hospital"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            display: 'block',
          }}
        />
      </button>

      {open && (
        <div
          onClick={closeHospital}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background:
              'rgba(0,0,0,.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
            padding: 20,
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width:
                'min(850px, 94vw)',
              maxHeight:
                '88vh',
              overflow: 'auto',
              background:
                'linear-gradient(180deg, #111827, #05070c)',
              border:
                '1px solid rgba(255,255,255,.12)',
              borderRadius: 20,
              boxShadow:
                '0 0 50px rgba(0,0,0,.65)',
              color: '#fff',
            }}
          >
            {/* HEADER */}
            <div
              style={{
                position: 'relative',
                padding:
                  '18px 20px',
                borderBottom:
                  '1px solid rgba(255,255,255,.08)',
              }}
            >
              <div
                style={{
                  fontSize:
                    '1.25rem',
                  fontWeight: 900,
                }}
              >
                ORION HOSPITAL
              </div>

              <div
                style={{
                  marginTop: 4,
                  color:
                    '#9ca3af',
                  fontSize:
                    '0.8rem',
                }}
              >
                Recover returning Orions before
                they can fight again.
              </div>

              <button
                type="button"
                onClick={closeHospital}
                style={{
                  position:
                    'absolute',
                  top: 14,
                  right: 16,
                  border: 'none',
                  borderRadius: 10,
                  padding:
                    '8px 12px',
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

            {message && (
              <div
                style={{
                  margin:
                    '12px 20px 0',
                  padding:
                    '10px 12px',
                  borderRadius: 10,
                  background:
                    'rgba(34,197,94,.08)',
                  border:
                    '1px solid rgba(34,197,94,.2)',
                  color:
                    '#86efac',
                  fontWeight: 700,
                  fontSize:
                    '0.82rem',
                }}
              >
                {message}
              </div>
            )}

            {/* HOSPITAL LIST */}
            <div
              style={{
                padding: 20,
              }}
            >
              {hospitalOrions.length ===
              0 ? (
                <div
                  style={{
                    minHeight: 220,
                    borderRadius: 14,
                    border:
                      '1px dashed rgba(255,255,255,.12)',
                    display:
                      'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    textAlign:
                      'center',
                    color:
                      '#9ca3af',
                    padding: 30,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize:
                          '2rem',
                        marginBottom:
                          10,
                      }}
                    >
                      +
                    </div>

                    <div
                      style={{
                        fontWeight:
                          800,
                        color:
                          '#fff',
                      }}
                    >
                      No Orions in hospital
                    </div>

                    <div
                      style={{
                        marginTop:
                          6,
                        fontSize:
                          '0.82rem',
                      }}
                    >
                      Orions returning from battle
                      will appear here.
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: 14,
                  }}
                >
                  {hospitalOrions.map(
                    (orion) => {
                      const runtime =
                        orion as typeof orion & {
                          hospitalStartedAt?: number;
                          hospitalEndsAt?: number;
                        };

                      const remaining =
                        getTreatmentRemaining(
                          runtime.hospitalStartedAt,
                          runtime.hospitalEndsAt,
                          now
                        );

                      const healed =
                        remaining <= 0;

                      return (
                        <div
                          key={orion.id}
                          style={{
                            padding: 14,
                            borderRadius:
                              14,
                            border: healed
                              ? '1px solid rgba(34,197,94,.35)'
                              : '1px solid rgba(255,255,255,.08)',
                            background:
                              healed
                                ? 'rgba(34,197,94,.06)'
                                : 'rgba(255,255,255,.035)',
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'space-between',
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                fontSize:
                                  '1.3rem',
                              }}
                            >
                              {
                                RACE_EMOJI[
                                  orion.race
                                ]
                              }
                            </div>

                            <div
                              style={{
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight:
                                    900,
                                }}
                              >
                                {
                                  RACE_NAMES[
                                    orion.race
                                  ]
                                }
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    3,
                                  color:
                                    '#9ca3af',
                                  fontSize:
                                    '0.75rem',
                                }}
                              >
                                Lv.
                                {Math.min(
                                  orion.level,
                                  maxLevel
                                )}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop:
                                14,
                              padding:
                                '10px 12px',
                              borderRadius:
                                10,
                              background:
                                'rgba(0,0,0,.2)',
                            }}
                          >
                            <div
                              style={{
                                color:
                                  healed
                                    ? '#86efac'
                                    : '#fbbf24',
                                fontWeight:
                                  900,
                                fontSize:
                                  '0.8rem',
                              }}
                            >
                              {healed
                                ? 'HEALED'
                                : 'RECOVERING'}
                            </div>

                            <div
                              style={{
                                marginTop:
                                  5,
                                fontSize:
                                  '1.05rem',
                                fontWeight:
                                  900,
                              }}
                            >
                              {healed
                                ? '00:00:00'
                                : formatTime(
                                    remaining
                                  )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* INFO */}
            <div
              style={{
                padding:
                  '0 20px 20px',
              }}
            >
              <div
                style={{
                  padding:
                    '12px 14px',
                  borderRadius: 12,
                  background:
                    'rgba(255,255,255,.035)',
                  border:
                    '1px solid rgba(255,255,255,.06)',
                  color:
                    '#9ca3af',
                  fontSize:
                    '0.78rem',
                }}
              >
                An Orion in hospital is not available
                in the barracks until recovery is complete.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}