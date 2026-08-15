import { useEffect, useState } from 'react';

import {
  useIncubatorStore,
  INCUBATOR_MAX_LEVEL,
  INCUBATOR_SLOT_COSTS,
} from '../incubatorStore';

import { getEggById } from '../eggCatalog';
import type { EggRarity } from '../eggCatalog';

import {
  hatchTimeMs,
  rarityColor,
} from '../orionCatalog';

import { useGameStore } from '../useGameStore';
import { useGemStore } from '../../economy/gemStore';
import { useResourceStore } from '../../economy/resourceStore';

import { GRID_SIZE } from '../placementGridUtil';

import { useOrionStore } from '../orionStore';
import type { OrionRace } from '../orionStore';

const INCUBATOR_IMAGE =
  '/assets/orion-incubator.png';

const GEM_IMAGE =
  '/assets/currency_gem.png';

const COIN_IMAGE =
  '/assets/currency_coin.png';

const TOKEN_IMAGE =
  '/assets/currency_token.png';

const WIDTH = 10;
const HEIGHT = 10;

const EMPTY_INVENTORY: any[] = [];

const RARITY_TO_RACE: Record<
  EggRarity,
  OrionRace
> = {
  common: 'water',
  rare: 'air',
  epic: 'earth',
  legendary: 'fire',
  mythic: 'asil',
};

function formatMs(ms: number): string {
  const total =
    Math.floor(ms / 1000);

  const m =
    Math.floor(total / 60);

  const s =
    total % 60;

  return `${m}:${s
    .toString()
    .padStart(2, '0')}`;
}

function CurrencyIcon({
  src,
  size = 18,
}: {
  src: string;
  size?: number;
}) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display:
          'inline-block',
        verticalAlign:
          'middle',
        imageRendering: 'auto',
        flexShrink: 0,
      }}
    />
  );
}

// ============================================================================
// COST DISPLAY
// ============================================================================

interface CostDisplayProps {
  cost: {
    coins?: number;
    tokens?: number;
    wood?: number;
    stone?: number;
    iron?: number;
    gold?: number;
    crystal?: number;
    gems?: number;
  };
}

function CostDisplay({
  cost,
}: CostDisplayProps) {
  const items: Array<{
    key: string;
    value: number;
    image?: string;
    emoji?: string;
  }> = [];

  if (cost.coins) {
    items.push({
      key: 'coins',
      value: cost.coins,
      image: COIN_IMAGE,
    });
  }

  if (cost.tokens) {
    items.push({
      key: 'tokens',
      value: cost.tokens,
      image: TOKEN_IMAGE,
    });
  }

  if (cost.wood) {
    items.push({
      key: 'wood',
      value: cost.wood,
      emoji: '🪵',
    });
  }

  if (cost.stone) {
    items.push({
      key: 'stone',
      value: cost.stone,
      emoji: '🪨',
    });
  }

  if (cost.iron) {
    items.push({
      key: 'iron',
      value: cost.iron,
      emoji: '⚙️',
    });
  }

  if (cost.gold) {
    items.push({
      key: 'gold',
      value: cost.gold,
      emoji: '🟡',
    });
  }

  if (cost.crystal) {
    items.push({
      key: 'crystal',
      value: cost.crystal,
      emoji: '💠',
    });
  }

  if (cost.gems) {
    items.push({
      key: 'gems',
      value: cost.gems,
      image: GEM_IMAGE,
    });
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          marginTop: 8,
          color: '#888',
          fontSize: 11,
        }}
      >
        No cost
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(2, minmax(0, 1fr))',
        gap: 5,
        width: '100%',
        marginTop: 8,
      }}
    >
      {items.map((item) => (
        <div
          key={item.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
            gap: 5,
            padding:
              '4px 5px',
            minWidth: 0,
            borderRadius: 6,
            background:
              'rgba(255,255,255,.05)',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace:
              'nowrap',
            overflow: 'hidden',
          }}
        >
          {item.image ? (
            <CurrencyIcon
              src={item.image}
              size={16}
            />
          ) : (
            <span
              style={{
                fontSize: 15,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {item.emoji}
            </span>
          )}

          <span
            style={{
              overflow:
                'hidden',
              textOverflow:
                'ellipsis',
            }}
          >
            {item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// INCUBATOR
// ============================================================================

interface IncubatorProps {
  x?: number;
  y?: number;
}

export function Incubator({
  x = 16,
  y = 13,
}: IncubatorProps) {
  const [open, setOpen] =
    useState(false);

  const [now, setNow] =
    useState(() =>
      Date.now()
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setNow(Date.now());
      }, 1000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [open]);

  const slots =
    useIncubatorStore(
      (s) => s.slots
    );

  const unlockSlot =
    useIncubatorStore(
      (s) => s.unlockSlot
    );

  const placeEgg =
    useIncubatorStore(
      (s) => s.placeEgg
    );

  const hatchEgg =
    useIncubatorStore(
      (s) => s.hatchEgg
    );

  const gems =
    useGemStore(
      (s) => s.gems
    );

  const spendGems =
    useGemStore(
      (s) => s.spendGems
    );

  const coins =
    useResourceStore(
      (s) => s.resources.coins
    );

  const tokens =
    useResourceStore(
      (s) => s.resources.tokens
    );

  const inventory =
    useGameStore(
      (s) =>
        s.gameState?.inventory ??
        EMPTY_INVENTORY
    );

  const eggs =
    inventory.filter(
      (item) =>
        item.type === 'egg'
    );

  const addOrion =
    useOrionStore(
      (s) => s.addOrion
    );

  return (
    <>
      {/* ============================================================
          INCUBATOR BUILDING
      ============================================================ */}

      <div
        onClick={() =>
          setOpen(true)
        }
        style={{
          position: 'absolute',
          left: `${
            (x / GRID_SIZE) *
            100
          }%`,
          top: `${
            (y / GRID_SIZE) *
            100
          }%`,
          width: `${
            (WIDTH / GRID_SIZE) *
            100
          }%`,
          height: `${
            (HEIGHT / GRID_SIZE) *
            100
          }%`,
          cursor: 'pointer',
          zIndex: 3,
        }}
      >
        <img
          src={INCUBATOR_IMAGE}
          alt="Incubator"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering:
              'pixelated',
          }}
        />
      </div>

      {/* ============================================================
          INCUBATOR WINDOW
      ============================================================ */}

      {open && (
        <div
          onClick={() =>
            setOpen(false)
          }
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,.65)',
            zIndex: 10000,
            display: 'flex',
            justifyContent:
              'center',
            alignItems: 'center',
            padding: 16,
            boxSizing:
              'border-box',
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              background:
                '#151515',
              padding: 20,
              borderRadius: 14,
              color: 'white',
              width:
                'min(700px, 95vw)',
              maxHeight: '90vh',
              overflowY:
                'auto',
              boxSizing:
                'border-box',
              border:
                '1px solid rgba(255,255,255,.12)',
              boxShadow:
                '0 20px 60px rgba(0,0,0,.55)',
            }}
          >
            {/* =====================================================
                SLOTS
            ====================================================== */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(5, minmax(0, 1fr))',
                gap: 10,
                width: '100%',
              }}
            >
              {Array.from(
                {
                  length:
                    INCUBATOR_MAX_LEVEL,
                },
                (_, i) =>
                  i + 1
              ).map(
                (slotId) => {
                  const slot =
                    slots.find(
                      (s) =>
                        s.id ===
                        slotId
                    );

                  if (!slot) {
                    return null;
                  }

                  {/* =================================================
                      LOCKED SLOT
                  ================================================== */}

                  if (
                    !slot.unlocked
                  ) {
                    const cost =
                      INCUBATOR_SLOT_COSTS[
                        slotId - 1
                      ];

                    return (
                      <button
                        type="button"
                        key={slotId}
                        onClick={() =>
                          unlockSlot(
                            slotId
                          )
                        }
                        style={{
                          minHeight: 155,
                          minWidth: 0,
                          borderRadius: 10,
                          border:
                            '1px solid #555',
                          background:
                            'rgba(255,255,255,.05)',
                          color: 'white',
                          cursor:
                            'pointer',
                          padding: 8,
                          boxSizing:
                            'border-box',
                          overflow:
                            'hidden',
                          display:
                            'flex',
                          flexDirection:
                            'column',
                          alignItems:
                            'center',
                          justifyContent:
                            'flex-start',
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              13,
                            fontWeight:
                              700,
                          }}
                        >
                          🔒 Slot{' '}
                          {slotId}
                        </div>

                        {cost ? (
                          <CostDisplay
                            cost={
                              cost
                            }
                          />
                        ) : (
                          <div
                            style={{
                              marginTop:
                                8,
                              color:
                                '#888',
                              fontSize:
                                11,
                            }}
                          >
                            No cost
                          </div>
                        )}
                      </button>
                    );
                  }

                  {/* =================================================
                      EMPTY SLOT
                  ================================================== */}

                  const egg =
                    slot.eggId
                      ? getEggById(
                          slot.eggId
                        )
                      : null;

                  if (!egg) {
                    return (
                      <div
                        key={slotId}
                        style={{
                          minHeight:
                            155,
                          minWidth: 0,
                          border:
                            '1px dashed #777',
                          borderRadius:
                            10,
                          display:
                            'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          color:
                            '#888',
                          fontSize:
                            12,
                          boxSizing:
                            'border-box',
                        }}
                      >
                        Empty
                      </div>
                    );
                  }

                  {/* =================================================
                      EGG / HATCH SLOT
                  ================================================== */}

                  const duration =
                    hatchTimeMs(
                      egg.rarity
                    );

                  const placedAt =
                    slot.placedAt
                      ? new Date(
                          slot.placedAt
                        ).getTime()
                      : Date.now();

                  const end =
                    placedAt +
                    duration;

                  const remain =
                    Math.max(
                      0,
                      end - now
                    );

                  const ready =
                    remain <= 0;

                  /*
                   * هر ۵ دقیقه = ۱ Gem
                   */
                  const gemCost =
                    Math.max(
                      1,
                      Math.ceil(
                        remain /
                          300000
                      )
                    );

                  return (
                    <div
                      key={slotId}
                      style={{
                        minHeight:
                          165,
                        minWidth: 0,
                        border:
                          `1px solid ${rarityColor(
                            egg.rarity
                          )}`,
                        borderRadius:
                          10,
                        textAlign:
                          'center',
                        padding: 6,
                        boxSizing:
                          'border-box',
                        overflow:
                          'hidden',
                        display:
                          'flex',
                        flexDirection:
                          'column',
                        alignItems:
                          'center',
                        justifyContent:
                          'space-between',
                        background:
                          'rgba(255,255,255,.025)',
                      }}
                    >
                      <img
                        src={
                          egg.image
                        }
                        alt=""
                        draggable={
                          false
                        }
                        width={50}
                        height={50}
                        style={{
                          width: 50,
                          height: 50,
                          objectFit:
                            'contain',
                          imageRendering:
                            'pixelated',
                          flexShrink:
                            0,
                        }}
                      />

                      {!ready ? (
                        <div
                          style={{
                            fontSize:
                              12,
                            fontWeight:
                              700,
                            color:
                              '#fff',
                            lineHeight:
                              1,
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {formatMs(
                            remain
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize:
                              11,
                            fontWeight:
                              700,
                            color:
                              '#90ee90',
                          }}
                        >
                          Ready
                        </div>
                      )}

                      {!ready ? (
                        <button
                          type="button"
                          disabled={
                            gems <
                            gemCost
                          }
                          onClick={() => {
                            if (
                              spendGems(
                                gemCost
                              )
                            ) {
                              const ok =
                                hatchEgg(
                                  slotId,
                                  true
                                );

                              if (ok) {
                                addOrion(
                                  RARITY_TO_RACE[
                                    egg.rarity
                                  ]
                                );
                              }
                            }
                          }}
                          style={{
                            width:
                              '100%',
                            maxWidth:
                              110,
                            minWidth:
                              0,
                            height:
                              34,
                            padding:
                              '4px 6px',
                            boxSizing:
                              'border-box',
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            gap: 5,
                            borderRadius:
                              7,
                            border:
                              '1px solid rgba(255,255,255,.2)',
                            background:
                              gems <
                              gemCost
                                ? '#444'
                                : '#242038',
                            color:
                              'white',
                            cursor:
                              gems <
                              gemCost
                                ? 'not-allowed'
                                : 'pointer',
                            fontWeight:
                              700,
                            fontSize:
                              12,
                            overflow:
                              'hidden',
                          }}
                          title={`Hatch for ${gemCost} Gems`}
                        >
                          <CurrencyIcon
                            src={
                              GEM_IMAGE
                            }
                            size={18}
                          />

                          <span
                            style={{
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {gemCost}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const ok =
                              hatchEgg(
                                slotId,
                                true
                              );

                            if (ok) {
                              addOrion(
                                RARITY_TO_RACE[
                                  egg.rarity
                                ]
                              );
                            }
                          }}
                          style={{
                            width:
                              '100%',
                            maxWidth:
                              110,
                            height:
                              34,
                            padding:
                              '4px 8px',
                            boxSizing:
                              'border-box',
                            borderRadius:
                              7,
                            border:
                              '1px solid #90ee90',
                            background:
                              'rgba(46,160,67,.25)',
                            color:
                              '#90ee90',
                            cursor:
                              'pointer',
                            fontWeight:
                              700,
                            fontSize:
                              12,
                          }}
                        >
                          Hatch
                        </button>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            {/* =====================================================
                INVENTORY EGGS
            ====================================================== */}

            <div
              style={{
                marginTop: 15,
                display: 'flex',
                flexWrap:
                  'wrap',
                gap: 8,
              }}
            >
              {eggs.map(
                (egg) => {
                  const def =
                    getEggById(
                      egg.id
                    );

                  const hasEmptySlot =
                    slots.some(
                      (s) =>
                        s.unlocked &&
                        !s.eggId
                    );

                  return (
                    <button
                      type="button"
                      key={egg.id}
                      disabled={
                        egg.quantity <=
                          0 ||
                        !hasEmptySlot
                      }
                      onClick={() => {
                        const empty =
                          slots.find(
                            (s) =>
                              s.unlocked &&
                              !s.eggId
                          );

                        if (
                          empty
                        ) {
                          placeEgg(
                            empty.id,
                            egg.id
                          );
                        }
                      }}
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: 5,
                        padding:
                          '5px 8px',
                        borderRadius:
                          7,
                        border:
                          '1px solid #555',
                        background:
                          'rgba(255,255,255,.05)',
                        color:
                          'white',
                        cursor:
                          egg.quantity <=
                            0 ||
                          !hasEmptySlot
                            ? 'not-allowed'
                            : 'pointer',
                        opacity:
                          egg.quantity <=
                            0 ||
                          !hasEmptySlot
                            ? 0.5
                            : 1,
                      }}
                    >
                      {def?.image && (
                        <img
                          src={
                            def.image
                          }
                          alt=""
                          width={28}
                          height={28}
                          draggable={
                            false
                          }
                          style={{
                            objectFit:
                              'contain',
                            imageRendering:
                              'pixelated',
                          }}
                        />
                      )}

                      ×
                      {egg.quantity}
                    </button>
                  );
                }
              )}
            </div>

            {/* =====================================================
                CURRENT CURRENCIES
            ====================================================== */}

            <div
              style={{
                marginTop: 14,
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                flexWrap:
                  'wrap',
                gap: 14,
                padding: 8,
                borderRadius: 8,
                background:
                  'rgba(255,255,255,.04)',
              }}
            >
              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: 5,
                }}
              >
                <CurrencyIcon
                  src={
                    COIN_IMAGE
                  }
                  size={22}
                />

                <span>
                  {coins.toLocaleString()}
                </span>
              </div>

              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: 5,
                }}
              >
                <CurrencyIcon
                  src={
                    TOKEN_IMAGE
                  }
                  size={22}
                />

                <span>
                  {tokens.toLocaleString()}
                </span>
              </div>

              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: 5,
                }}
              >
                <CurrencyIcon
                  src={
                    GEM_IMAGE
                  }
                  size={22}
                />

                <span>
                  {gems.toLocaleString()}
                </span>
              </div>
            </div>

            {/* =====================================================
                CLOSE
            ====================================================== */}

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              style={{
                marginTop: 12,
                width: '100%',
                height: 36,
                borderRadius: 8,
                border:
                  '1px solid #555',
                background:
                  'rgba(255,255,255,.06)',
                color: 'white',
                cursor:
                  'pointer',
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