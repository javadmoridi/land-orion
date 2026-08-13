import { useState } from 'react';
import {
  GRID_SIZE,
  LOCK_LEFT,
  LOCK_RIGHT,
} from '../placementGridUtil';

import {
  useOrionStore,
  ORION_RACES,
  ORION_MAX_LEVEL,
} from '../orionStore';

import type { OrionRace } from '../orionStore';

import { useResourceStore } from '../../economy/resourceStore';

const BARRACKS_IMAGE =
  '/assets/orion-barracks.png';

interface BarracksProps {
  x?: number;
  y?: number;
}

const WIDTH = 10;
const HEIGHT = 10;

const MERGE_COST = 10;

const COIN_IMAGE =
  '/assets/currency_coin.png';

const RACE_INFO = {
  water: {
    name: 'Water',
    color: '#4f7cff',
  },

  air: {
    name: 'Air',
    color: '#9fe8ff',
  },

  earth: {
    name: 'Earth',
    color: '#4caf50',
  },

  fire: {
    name: 'Fire',
    color: '#ff6b4a',
  },

  asil: {
    name: 'Asil',
    color: '#ffd700',
  },
} as Record<
  OrionRace,
  {
    name: string;
    color: string;
  }
>;

/**
 * Every level of a race uses the same race image.
 *
 * Water -> /assets/orion-water.png
 * Air   -> /assets/orion-air.png
 * Earth -> /assets/orion-earth.png
 * Fire  -> /assets/orion-fire.png
 * Asil  -> /assets/orion-asil.png
 */
function dragonImage(
  race: OrionRace
): string {
  return `/assets/orion-${race}.png`;
}

export function Barracks({
  x = 22,
  y = 4,
}: BarracksProps) {
  const [open, setOpen] =
    useState(false);

  const [selectedRace, setSelectedRace] =
    useState<OrionRace | null>(null);

  const [msg, setMsg] =
    useState<string | null>(null);

  const orions =
    useOrionStore(
      (s) => s.orions
    );

  const mergeOrions =
    useOrionStore(
      (s) => s.mergeOrions
    );

  const coins =
    useResourceStore(
      (s) => s.resources.coins
    );

  const spendCoins =
    useResourceStore(
      (s) => s.spendCoins
    );

  const positionX = Math.max(
    LOCK_LEFT,
    Math.min(
      x,
      GRID_SIZE -
        LOCK_RIGHT -
        WIDTH
    )
  );

  const positionY = Math.max(
    0,
    Math.min(
      y,
      GRID_SIZE - HEIGHT
    )
  );

  const raceCounts =
    ORION_RACES.map(
      (race) => ({
        race,
        count:
          orions.filter(
            (o) =>
              o.race === race
          ).length,
      })
    );

  const selectedOrions =
    selectedRace
      ? orions
          .filter(
            (o) =>
              o.race ===
              selectedRace
          )
          .slice()
          .sort(
            (a, b) =>
              a.level -
              b.level
          )
      : [];

  function doMerge(
    race: OrionRace,
    level: number
  ) {
    const candidates =
      orions.filter(
        (o) =>
          o.race === race &&
          o.level === level
      );

    if (
      candidates.length < 2
    ) {
      setMsg(
        'Need at least 2 Orions of the same race and level.'
      );
      return;
    }

    if (
      level >=
      ORION_MAX_LEVEL
    ) {
      setMsg(
        'Already at max level.'
      );
      return;
    }

    if (
      !spendCoins(
        MERGE_COST
      )
    ) {
      setMsg(
        'Not enough coins to merge.'
      );
      return;
    }

    const ok =
      mergeOrions(
        candidates[0].id,
        candidates[1].id
      );

    setMsg(
      ok
        ? `Merged into Lv ${
            level + 1
          } ${
            RACE_INFO[race]
              .name
          }!`
        : 'Merge failed.'
    );
  }

  function openBarracks() {
    setOpen(true);
    setSelectedRace(null);
    setMsg(null);
  }

  return (
    <>
      {/* BARRACKS */}

      <button
        type="button"
        onClick={
          openBarracks
        }
        style={{
          position:
            'absolute',

          left: `${
            (positionX /
              GRID_SIZE) *
            100
          }%`,

          top: `${
            (positionY /
              GRID_SIZE) *
            100
          }%`,

          width: `${
            (WIDTH /
              GRID_SIZE) *
            100
          }%`,

          height: `${
            (HEIGHT /
              GRID_SIZE) *
            100
          }%`,

          padding: 0,
          margin: 0,

          border: 'none',

          background:
            'transparent',

          zIndex: 6,

          cursor:
            'pointer',
        }}
      >
        <img
          src={
            BARRACKS_IMAGE
          }
          alt="Barracks"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit:
              'contain',
            imageRendering:
              'pixelated',
            display: 'block',
          }}
        />
      </button>

      {/* BARRACKS WINDOW */}

      {open && (
        <div
          onClick={() =>
            setOpen(false)
          }
          style={{
            position: 'fixed',
            inset: 0,

            background:
              'rgba(0,0,0,.72)',

            zIndex: 10000,

            display: 'flex',

            justifyContent:
              'center',

            alignItems:
              'center',

            padding: 20,
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              background:
                '#171717',

              color: '#fff',

              padding: 20,

              borderRadius: 16,

              width:
                'min(900px, 94vw)',

              maxHeight:
                '90vh',

              overflow:
                'auto',

              border:
                '1px solid rgba(255,215,0,.35)',

              boxShadow:
                '0 0 40px rgba(255,215,0,.18)',
            }}
          >
            {/* HEADER */}

            <div
              style={{
                display: 'flex',

                justifyContent:
                  'space-between',

                alignItems:
                  'center',

                marginBottom: 10,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  letterSpacing:
                    0.5,
                }}
              >
                ORION BARRACKS
              </h2>

              <button
                type="button"
                onClick={() =>
                  setOpen(
                    false
                  )
                }
                style={{
                  cursor:
                    'pointer',

                  background:
                    'rgba(255,255,255,.08)',

                  color: '#fff',

                  border: 'none',

                  borderRadius: 8,

                  padding:
                    '7px 13px',

                  fontWeight: 700,
                }}
              >
                EXIT
              </button>
            </div>

            {msg && (
              <div
                style={{
                  margin:
                    '8px 0 12px',

                  padding:
                    '8px 12px',

                  borderRadius: 8,

                  background:
                    'rgba(255,215,0,.12)',

                  color:
                    '#ffd700',

                  fontWeight: 600,

                  fontSize:
                    '0.85rem',
                }}
              >
                {msg}
              </div>
            )}

            {/* RACE SELECT */}

            {!selectedRace ? (
              <>
                <p
                  style={{
                    marginTop: 4,

                    fontSize:
                      '0.9rem',

                    color:
                      '#cbd5e1',
                  }}
                >
                  Select a tribe to
                  view its Orions.
                </p>

                <div
                  style={{
                    display:
                      'grid',

                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(160px, 1fr))',

                    gap: 12,

                    marginTop: 10,
                  }}
                >
                  {raceCounts.map(
                    ({
                      race,
                      count,
                    }) => {
                      const info =
                        RACE_INFO[
                          race
                        ];

                      return (
                        <button
                          type="button"
                          key={race}
                          onClick={() => {
                            setSelectedRace(
                              race
                            );

                            setMsg(
                              null
                            );
                          }}
                          style={{
                            cursor:
                              'pointer',

                            display:
                              'flex',

                            flexDirection:
                              'column',

                            alignItems:
                              'center',

                            gap: 8,

                            padding:
                              '14px 12px',

                            borderRadius:
                              14,

                            border: `2px solid ${info.color}`,

                            background: `linear-gradient(160deg, ${info.color}26, transparent)`,

                            color:
                              '#fff',
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                '1rem',

                              fontWeight:
                                800,

                              color:
                                info.color,
                            }}
                          >
                            {
                              info.name
                            }
                          </div>

                          <div
                            style={{
                              fontSize:
                                '0.8rem',

                              color:
                                '#9fb0d0',
                            }}
                          >
                            {count}{' '}
                            owned
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </>
            ) : (
              <>
                {/* SELECTED RACE */}

                <div
                  style={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    gap: 10,

                    margin:
                      '4px 0 14px',

                    flexWrap:
                      'wrap',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRace(
                        null
                      );

                      setMsg(
                        null
                      );
                    }}
                    style={{
                      cursor:
                        'pointer',

                      background:
                        'rgba(255,255,255,.08)',

                      color:
                        '#fff',

                      border:
                        'none',

                      borderRadius: 8,

                      padding:
                        '6px 12px',

                      fontWeight:
                        700,
                    }}
                  >
                    BACK
                  </button>

                  <div
                    style={{
                      fontWeight:
                        800,

                      fontSize:
                        '1.05rem',

                      color:
                        RACE_INFO[
                          selectedRace
                        ].color,
                    }}
                  >
                    {
                      RACE_INFO[
                        selectedRace
                      ].name
                    }{' '}
                    TRIBE
                  </div>

                  <div
                    style={{
                      color:
                        '#9fb0d0',

                      fontWeight:
                        600,

                      fontSize:
                        '0.8rem',
                    }}
                  >
                    -
                    {' '}
                    {
                      selectedOrions.length
                    }{' '}
                    Orions
                  </div>
                </div>

                {/* ORION CARDS */}

                {selectedOrions.length ===
                0 ? (
                  <div
                    style={{
                      padding: 30,

                      textAlign:
                        'center',

                      color:
                        '#9fb0d0',

                      border:
                        '1px dashed #444',

                      borderRadius:
                        12,
                    }}
                  >
                    No Orions in this
                    tribe yet.
                  </div>
                ) : (
                  <div
                    style={{
                      display:
                        'grid',

                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(190px, 1fr))',

                      gap: 14,
                    }}
                  >
                    {selectedOrions.map(
                      (orion) => {
                        /*
                         * Important:
                         * level does NOT change the image.
                         * Every level uses the image of its race.
                         */
                        const src =
                          dragonImage(
                            orion.race
                          );

                        const info =
                          RACE_INFO[
                            orion.race
                          ];

                        return (
                          <div
                            key={
                              orion.id
                            }
                            style={{
                              display:
                                'flex',

                              flexDirection:
                                'column',

                              alignItems:
                                'center',

                              gap: 8,

                              padding: 12,

                              borderRadius:
                                14,

                              background:
                                'rgba(255,255,255,.04)',

                              border: `1px solid ${info.color}44`,
                            }}
                          >
                            {/* RACE IMAGE */}

                            <div
                              style={{
                                width:
                                  '100%',

                                aspectRatio:
                                  '1 / 1',

                                borderRadius:
                                  12,

                                overflow:
                                  'hidden',

                                position:
                                  'relative',

                                background:
                                  `${info.color}12`,
                              }}
                            >
                              <img
                                src={
                                  src
                                }
                                alt={`${info.name} Lv.${orion.level}`}
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display =
                                    'none';
                                }}
                                style={{
                                  width:
                                    '100%',

                                  height:
                                    '100%',

                                  objectFit:
                                    'contain',

                                  imageRendering:
                                    'pixelated',

                                  display:
                                    'block',
                                }}
                              />
                            </div>

                            <div
                              style={{
                                fontWeight:
                                  900,

                                fontSize:
                                  '1rem',

                                color:
                                  '#fff',
                              }}
                            >
                              {
                                info.name
                              }
                            </div>

                            <div
                              style={{
                                fontSize:
                                  '0.8rem',

                                color:
                                  info.color,

                                fontWeight:
                                  800,
                              }}
                            >
                              Lv.
                              {
                                orion.level
                              }
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                {/* MERGE */}

                <div
                  style={{
                    marginTop: 16,

                    padding: 14,

                    borderRadius: 12,

                    border:
                      '1px solid rgba(255,215,0,.25)',

                    background:
                      'rgba(255,215,0,.05)',
                  }}
                >
                  <div
                    style={{
                      display:
                        'flex',

                      alignItems:
                        'center',

                      gap: 6,

                      fontWeight:
                        800,

                      marginBottom:
                        10,

                      color:
                        '#ffd700',
                    }}
                  >
                    MERGE

                    <img
                      src={
                        COIN_IMAGE
                      }
                      width={16}
                      height={16}
                      alt="coin"
                      style={{
                        imageRendering:
                          'pixelated',
                      }}
                    />

                    {MERGE_COST}
                  </div>

                  {(() => {
                    const byLevel =
                      new Map<
                        number,
                        number
                      >();

                    selectedOrions.forEach(
                      (o) =>
                        byLevel.set(
                          o.level,
                          (byLevel.get(
                            o.level
                          ) ?? 0) + 1
                        )
                    );

                    const mergable =
                      Array.from(
                        byLevel.entries()
                      )
                        .filter(
                          ([, cnt]) =>
                            cnt >= 2
                        )
                        .filter(
                          ([lvl]) =>
                            lvl <
                            ORION_MAX_LEVEL
                        );

                    if (
                      mergable.length ===
                      0
                    ) {
                      return (
                        <div
                          style={{
                            fontSize:
                              '0.85rem',

                            color:
                              '#9fb0d0',
                          }}
                        >
                          Need two same-level
                          Orions to merge.
                        </div>
                      );
                    }

                    return (
                      <div
                        style={{
                          display:
                            'flex',

                          flexWrap:
                            'wrap',

                          gap: 8,
                        }}
                      >
                        {mergable.map(
                          ([
                            lvl,
                            cnt,
                          ]) => (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() =>
                                doMerge(
                                  selectedRace,
                                  lvl
                                )
                              }
                              disabled={
                                coins <
                                MERGE_COST
                              }
                              style={{
                                cursor:
                                  coins <
                                  MERGE_COST
                                    ? 'not-allowed'
                                    : 'pointer',

                                padding:
                                  '7px 12px',

                                borderRadius:
                                  8,

                                border:
                                  'none',

                                fontWeight:
                                  700,

                                background:
                                  coins <
                                  MERGE_COST
                                    ? 'rgba(255,255,255,.08)'
                                    : 'linear-gradient(135deg, #ffd700, #8a5cf5)',

                                color:
                                  coins <
                                  MERGE_COST
                                    ? '#888'
                                    : '#111',
                              }}
                            >
                              {cnt}x
                              {' '}
                              Lv.
                              {lvl}
                              {' → '}
                              Lv.
                              {lvl + 1}
                            </button>
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}