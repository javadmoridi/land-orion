import { useEffect, useState } from 'react';

import { GRID_SIZE } from './placementGridUtil';
import { useResourceStore } from '../economy/resourceStore';

interface ActionBuildingProps {
  x: number;
  y: number;
  image: string;
  alt: string;
  size?: number;
  onClick?: () => void;
}

function ActionBuilding({
  x,
  y,
  image,
  alt,
  size = 5,
  onClick,
}: ActionBuildingProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${(x / GRID_SIZE) * 100}%`,
        top: `${(y / GRID_SIZE) * 100}%`,
        width: `${(size / GRID_SIZE) * 100}%`,
        height: `${(size / GRID_SIZE) * 100}%`,
        padding: 0,
        margin: 0,
        border: 'none',
        background: 'transparent',
        zIndex: 5,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <img
        src={image}
        alt={alt}
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
  );
}

// ============================================================================
// MINER
// ============================================================================

const MINER_IMAGE =
  '/assets/orion-four-element-miner.png';

const MINER_MAX_LEVEL = 100;

/**
 * The miner can only be claimed once per full 3-hour cycle.
 * At level L it extracts `L` of every element per hour, so a full
 * cycle yields `L * 3` of each element (at level 100 -> 300 each).
 */
const MINER_CYCLE_MS =
  3 * 60 * 60 * 1000;

const MINER_STORAGE_KEY =
  'land-orion-miner-state';

interface MinerSaveData {
  level: number;
  lastCollectedAt: number;
  fractionalWater: number;
  fractionalAir: number;
  fractionalEarth: number;
  fractionalFire: number;
}

function createDefaultMinerData(): MinerSaveData {
  return {
    level: 1,
    lastCollectedAt: Date.now(),
    fractionalWater: 0,
    fractionalAir: 0,
    fractionalEarth: 0,
    fractionalFire: 0,
  };
}

function loadMinerData(): MinerSaveData {
  if (
    typeof window === 'undefined'
  ) {
    return createDefaultMinerData();
  }

  const raw =
    window.localStorage.getItem(
      MINER_STORAGE_KEY
    );

  if (!raw) {
    return createDefaultMinerData();
  }

  try {
    const parsed =
      JSON.parse(raw) as Partial<MinerSaveData>;

    const level = Math.max(
      1,
      Math.min(
        MINER_MAX_LEVEL,
        Math.floor(
          Number(parsed.level) || 1
        )
      )
    );

    return {
      level,
      lastCollectedAt:
        typeof parsed.lastCollectedAt ===
          'number'
          ? parsed.lastCollectedAt
          : Date.now(),

      fractionalWater:
        typeof parsed.fractionalWater ===
          'number'
          ? parsed.fractionalWater
          : 0,

      fractionalAir:
        typeof parsed.fractionalAir ===
          'number'
          ? parsed.fractionalAir
          : 0,

      fractionalEarth:
        typeof parsed.fractionalEarth ===
          'number'
          ? parsed.fractionalEarth
          : 0,

      fractionalFire:
        typeof parsed.fractionalFire ===
          'number'
          ? parsed.fractionalFire
          : 0,
    };
  } catch {
    return createDefaultMinerData();
  }
}

function saveMinerData(
  data: MinerSaveData
): void {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  window.localStorage.setItem(
    MINER_STORAGE_KEY,
    JSON.stringify(data)
  );
}

// Cost to upgrade to the next level.
function minerUpgradeCost(
  currentLevel: number
): number {
  if (currentLevel <= 0) {
    return 0;
  }

  if (
    currentLevel >=
    MINER_MAX_LEVEL
  ) {
    return Infinity;
  }

  return Math.floor(
    100 *
      Math.pow(
        1.15,
        currentLevel - 1
      )
  );
}

// Level L = L of each element per hour.
function minerRate(
  level: number
): number {
  return Math.max(
    0,
    Math.min(
      MINER_MAX_LEVEL,
      Math.floor(level)
    )
  );
}

// Per-second production: the miner level is the hourly yield, so the
// per-second rate is level / 3600. At level 100 that is 0.027777...
// items/s, which produces exactly 300 of every element per 3h cycle.
function minerRatePerSecond(
  level: number
): number {
  return minerRate(level) / 3600;
}

interface MinerYield {
  water: number;
  air: number;
  earth: number;
  fire: number;

  newFracWater: number;
  newFracAir: number;
  newFracEarth: number;
  newFracFire: number;

  elapsedMs: number;

  /** Number of complete 3-hour cycles since the last claim. */
  cycles: number;
}

function calcMinerYield(
  level: number,
  lastCollectedAt: number,
  fractionalWater: number,
  fractionalAir: number,
  fractionalEarth: number,
  fractionalFire: number,
  now: number
): MinerYield {
  const elapsedMs = Math.max(
    0,
    now - lastCollectedAt
  );

  const ratePerSecond =
    minerRatePerSecond(level);

  // Produce continuously, second by second, carrying the leftover
  // fraction forward so the total is exact (no drift).
  const produced =
    (elapsedMs / 1000) * ratePerSecond;

  const totalWater =
    fractionalWater + produced;
  const totalAir =
    fractionalAir + produced;
  const totalEarth =
    fractionalEarth + produced;
  const totalFire =
    fractionalFire + produced;

  const water = Math.floor(totalWater);
  const air = Math.floor(totalAir);
  const earth = Math.floor(totalEarth);
  const fire = Math.floor(totalFire);

  // One claim is allowed per full 3-hour cycle, but the accrued
  // amount now ticks up live (level 100 reaches 300 at the 3h mark).
  const cycles = Math.floor(
    elapsedMs / MINER_CYCLE_MS
  );

  return {
    water,
    air,
    earth,
    fire,

    newFracWater: totalWater - water,
    newFracAir: totalAir - air,
    newFracEarth: totalEarth - earth,
    newFracFire: totalFire - fire,

    elapsedMs,
    cycles,
  };
}

function formatNumber(
  value: number
): string {
  return value.toLocaleString(
    'en-US',
    {
      maximumFractionDigits: 2,
    }
  );
}

function formatClock(
  ms: number
): string {
  const totalSeconds =
    Math.max(
      0,
      Math.ceil(ms / 1000)
    );

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
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

interface MinerProps {
  x: number;
  y: number;
  onClick?: () => void;
}

export function Miner({
  x,
  y,
  onClick,
}: MinerProps) {
  const [open, setOpen] =
    useState(false);

  const [upgradeOpen, setUpgradeOpen] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [now, setNow] =
    useState(() => Date.now());

  const [minerData, setMinerData] =
    useState<MinerSaveData>(
      loadMinerData
    );

  // Miner upgrades are paid with the Orion token (NOT coins).
  const tokens = useResourceStore(
    (state) => state.resources.tokens
  );

  const spendTokens = useResourceStore(
    (state) => state.spendTokens
  );

  const addWater = useResourceStore(
    (state) => state.addWater
  );

  const addAir = useResourceStore(
    (state) => state.addAir
  );

  const addEarth = useResourceStore(
    (state) => state.addEarth
  );

  const addFire = useResourceStore(
    (state) => state.addFire
  );

  useEffect(() => {
    // Always tick so the countdown stays live even when the
    // miner modal is closed (badge on the building updates too).
    const timer =
      window.setInterval(() => {
        setNow(Date.now());
      }, 1000);

    return () =>
      window.clearInterval(timer);
  }, []);

  const yieldData =
    calcMinerYield(
      minerData.level,
      minerData.lastCollectedAt,
      minerData.fractionalWater,
      minerData.fractionalAir,
      minerData.fractionalEarth,
      minerData.fractionalFire,
      now
    );

  const activeLevel =
    minerData.level;

  const rate =
    minerRate(activeLevel);

  const upgradeCost =
    minerUpgradeCost(activeLevel);

  const nextLevel =
    Math.min(
      MINER_MAX_LEVEL,
      activeLevel + 1
    );

  const canUpgrade =
    activeLevel <
    MINER_MAX_LEVEL;

  const productionReady =
    yieldData.cycles >= 1;

  const displayAmount =
    Math.max(
      yieldData.water,
      yieldData.air,
      yieldData.earth,
      yieldData.fire
    );

  // Amount produced per element per full 3-hour cycle.
  const cycleReward =
    rate * 3;

  // Real-time countdown to the next claimable cycle.
  const elapsedProgress =
    yieldData.elapsedMs % MINER_CYCLE_MS;

  const remainingMs =
    productionReady
      ? 0
      : MINER_CYCLE_MS -
        elapsedProgress;

  function collectMiner() {
    const collected =
      calcMinerYield(
        minerData.level,
        minerData.lastCollectedAt,
        minerData.fractionalWater,
        minerData.fractionalAir,
        minerData.fractionalEarth,
        minerData.fractionalFire,
        Date.now()
      );

    if (
      collected.cycles < 1 ||
      (collected.water <= 0 &&
        collected.air <= 0 &&
        collected.earth <= 0 &&
        collected.fire <= 0)
    ) {
      setMessage(
        'No resources are ready to collect yet.'
      );
      return;
    }

    const collectedAt =
      Date.now();

    const nextData:
      MinerSaveData = {
        ...minerData,

        lastCollectedAt:
          collectedAt,

        fractionalWater:
          collected.newFracWater,

        fractionalAir:
          collected.newFracAir,

        fractionalEarth:
          collected.newFracEarth,

        fractionalFire:
          collected.newFracFire,
      };

    if (collected.water > 0) {
      addWater(collected.water);
    }

    if (collected.air > 0) {
      addAir(collected.air);
    }

    if (collected.earth > 0) {
      addEarth(collected.earth);
    }

    if (collected.fire > 0) {
      addFire(collected.fire);
    }

    setMinerData(nextData);
    saveMinerData(nextData);
    setNow(collectedAt);

    setMessage(
      `Collected ${formatNumber(
        collected.water
      )} Water, ${formatNumber(
        collected.air
      )} Air, ${formatNumber(
        collected.earth
      )} Earth and ${formatNumber(
        collected.fire
      )} Fire.`
    );
  }

  function openMiner() {
    setMessage(null);
    setUpgradeOpen(false);
    setNow(Date.now());
    setOpen(true);
    onClick?.();
  }

  function closeMiner() {
    setOpen(false);
    setUpgradeOpen(false);
    setMessage(null);
  }

  function upgradeMiner() {
    if (!canUpgrade) {
      setMessage(
        'Miner is already Level 100.'
      );
      return;
    }

    if (
      tokens <
      upgradeCost
    ) {
      setMessage(
        `Not enough Orion tokens. Required: ${formatNumber(
          upgradeCost
        )}.`
      );
      return;
    }

    const spent =
      spendTokens(upgradeCost);

    if (!spent) {
      setMessage(
        'Not enough Orion tokens.'
      );
      return;
    }

    const upgradedAt =
      Date.now();

    const nextData:
      MinerSaveData = {
        ...minerData,

        level:
          nextLevel,

        lastCollectedAt:
          upgradedAt,

        fractionalWater: 0,
        fractionalAir: 0,
        fractionalEarth: 0,
        fractionalFire: 0,
      };

    setMinerData(nextData);
    saveMinerData(nextData);

    setUpgradeOpen(false);
    setNow(upgradedAt);

    setMessage(
      `Miner upgraded to Level ${nextLevel}.`
    );
  }

  return (
    <>
      <ActionBuilding
        x={x}
        y={y}
        image={MINER_IMAGE}
        alt="Miner"
        size={9}
        onClick={openMiner}
      />

      {/* Live countdown badge floating above the miner */}
      <div
        style={{
          position: 'absolute',
          left: `${(x / GRID_SIZE) * 100}%`,
          top: `${(y / GRID_SIZE) * 100}%`,
          transform: 'translate(-55%, -112%)',
          zIndex: 7,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: productionReady
              ? 'linear-gradient(135deg,#22c55e,#16a34a)'
              : 'rgba(8,8,10,.82)',
            color: '#fff',
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: '.74rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            border:
              '1px solid rgba(255,255,255,.3)',
            boxShadow:
              '0 4px 14px rgba(0,0,0,.55)',
          }}
        >
          {productionReady
            ? '✓ 3H CLAIM'
            : `⛏ ${formatClock(remainingMs)}`}
        </div>
      </div>

      {open && (
        <div
          onClick={closeMiner}
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
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width:
                'min(820px, 94vw)',
              maxHeight: '94vh',
              overflowY: 'auto',
              background:
                'linear-gradient(180deg, #111827, #05070c)',
              border:
                '1px solid rgba(255,215,0,.25)',
              borderRadius: 20,
              boxShadow:
                '0 0 50px rgba(0,0,0,.65)',
              color: '#fff',
              overflowX: 'hidden',
            }}
          >
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
                ORION MINER
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
                Miner Level {activeLevel}
              </div>

              <button
                type="button"
                onClick={() => {
                  setUpgradeOpen(true);
                  setMessage(null);
                }}
                disabled={
                  !canUpgrade
                }
                title="Upgrade Miner"
                style={{
                  position:
                    'absolute',
                  top: 14,
                  right: 16,
                  width: 50,
                  height: 50,
                  border: 'none',
                  borderRadius: 12,
                  background:
                    canUpgrade
                      ? '#22c55e'
                      : '#374151',
                  color:
                    canUpgrade
                      ? '#061a0a'
                      : '#9ca3af',
                  fontSize:
                    '1.7rem',
                  fontWeight: 1000,
                  cursor:
                    canUpgrade
                      ? 'pointer'
                      : 'not-allowed',
                  boxShadow:
                    canUpgrade
                      ? '0 0 20px rgba(34,197,94,.3)'
                      : 'none',
                }}
              >
                ↑
              </button>
            </div>

            {message && (
              <div
                style={{
                  margin:
                    '12px 18px 0',
                  padding:
                    '9px 12px',
                  borderRadius: 10,
                  background:
                    'rgba(255,215,0,.08)',
                  border:
                    '1px solid rgba(255,215,0,.2)',
                  color:
                    '#ffd700',
                  fontSize:
                    '0.82rem',
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            )}

            <div
              style={{
                padding:
                  '22px 28px 12px',
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: 18,
              }}
            >
              <ElementBox
                label="Water"
                icon="💧"
                amount={
                  yieldData.water
                }
                capacity={
                  cycleReward
                }
                border="rgba(96,165,250,.35)"
                background="linear-gradient(145deg, rgba(37,99,235,.16), rgba(10,15,30,.82))"
              />

              <ElementBox
                label="Air"
                icon="🌪"
                amount={
                  yieldData.air
                }
                capacity={
                  cycleReward
                }
                border="rgba(125,211,252,.35)"
                background="linear-gradient(145deg, rgba(14,116,144,.16), rgba(10,15,30,.82))"
              />

              <ElementBox
                label="Earth"
                icon="🪨"
                amount={
                  yieldData.earth
                }
                capacity={
                  cycleReward
                }
                border="rgba(132,204,22,.35)"
                background="linear-gradient(145deg, rgba(63,98,18,.18), rgba(10,15,30,.82))"
              />

              <ElementBox
                label="Fire"
                icon="🔥"
                amount={
                  yieldData.fire
                }
                capacity={
                  cycleReward
                }
                border="rgba(248,113,113,.35)"
                background="linear-gradient(145deg, rgba(153,27,27,.18), rgba(10,15,30,.82))"
              />
            </div>

            <div
              style={{
                margin:
                  '4px 28px 18px',
                padding:
                  '14px 16px',
                borderRadius: 12,
                background:
                  'rgba(255,255,255,.035)',
                border:
                  '1px solid rgba(255,255,255,.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 900,
                    }}
                  >
                    Level {activeLevel}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      color:
                        '#9ca3af',
                      fontSize:
                        '0.78rem',
                    }}
                  >
                    Production: {rate}/h · {' '}
                    {(rate / 3600).toFixed(4)}/s · {cycleReward}
                    per 3h
                  </div>
                </div>

                <div
                  style={{
                    textAlign: 'right',
                  }}
                >
                  <div
                    style={{
                      color:
                        productionReady
                          ? '#86efac'
                          : '#fbbf24',
                      fontWeight: 900,
                      fontSize:
                        '0.82rem',
                    }}
                  >
                    {productionReady
                      ? 'CLAIM READY'
                      : 'MINING'}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      color:
                        '#9ca3af',
                      fontSize:
                        '0.78rem',
                    }}
                  >
                    {productionReady
                      ? '3-hour claim ready'
                      : `Next claim: ${formatClock(
                          remainingMs
                        )}`}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding:
                  '0 28px 22px',
                display: 'flex',
                justifyContent:
                  'center',
              }}
            >
              <button
                type="button"
                onClick={
                  collectMiner
                }
                disabled={
                  !productionReady
                }
                style={{
                  width:
                    'min(420px, 100%)',
                  border: 'none',
                  borderRadius: 12,
                  padding:
                    '13px 20px',
                  background:
                    productionReady
                      ? '#22c55e'
                      : 'rgba(255,255,255,.08)',
                  color:
                    productionReady
                      ? '#04130a'
                      : '#777',
                  cursor:
                    productionReady
                      ? 'pointer'
                      : 'not-allowed',
                  fontWeight: 1000,
                  fontSize:
                    '0.95rem',
                }}
              >
                COLLECT 3H · ×{displayAmount}{' '}
                each
              </button>
            </div>

            {upgradeOpen && (
              <div
                onClick={() =>
                  setUpgradeOpen(false)
                }
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 10001,
                  background:
                    'rgba(0,0,0,.7)',
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
                      'min(430px, 92vw)',
                    background:
                      '#111827',
                    border:
                      '1px solid rgba(34,197,94,.3)',
                    borderRadius: 16,
                    boxShadow:
                      '0 0 40px rgba(0,0,0,.7)',
                    padding: 22,
                    color: '#fff',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          '1.1rem',
                        fontWeight: 1000,
                      }}
                    >
                      UPGRADE MINER
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setUpgradeOpen(false)
                      }
                      style={{
                        border: 'none',
                        background:
                          'rgba(255,255,255,.08)',
                        color: '#fff',
                        borderRadius: 8,
                        padding:
                          '6px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      X
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        padding:
                          '12px 14px',
                        borderRadius: 10,
                        background:
                          'rgba(255,255,255,.04)',
                      }}
                    >
                      <div
                        style={{
                          color:
                            '#9ca3af',
                          fontSize:
                            '0.78rem',
                        }}
                      >
                        Current Level
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          fontSize:
                            '1.1rem',
                          fontWeight: 900,
                        }}
                      >
                        {activeLevel}
                      </div>
                    </div>

                    <div
                      style={{
                        padding:
                          '12px 14px',
                        borderRadius: 10,
                        background:
                          'rgba(255,255,255,.04)',
                      }}
                    >
                      <div
                        style={{
                          color:
                            '#9ca3af',
                          fontSize:
                            '0.78rem',
                        }}
                      >
                        Next Level
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          fontSize:
                            '1.1rem',
                          fontWeight: 900,
                        }}
                      >
                        {canUpgrade
                          ? nextLevel
                          : 'MAX'}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        border:
                          '1px solid rgba(255,215,0,.25)',
                        background:
                          'rgba(255,215,0,.06)',
                      }}
                    >
                      <div
                        style={{
                          color:
                            '#9ca3af',
                          fontSize:
                            '0.78rem',
                        }}
                      >
                        Upgrade Cost
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          color:
                            '#ffd700',
                          fontSize:
                            '1.25rem',
                          fontWeight: 1000,
                        }}
                      >
                        {canUpgrade
                          ? formatNumber(
                              upgradeCost
                            )
                          : 'MAX'}
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          color:
                            '#9ca3af',
                          fontSize:
                            '0.75rem',
                        }}
                      >
                        Your Orion:{' '}
                        {formatNumber(
                          tokens
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      upgradeMiner
                    }
                    disabled={
                      !canUpgrade ||
                      tokens <
                        upgradeCost
                    }
                    style={{
                      width: '100%',
                      marginTop: 18,
                      border: 'none',
                      borderRadius: 11,
                      padding:
                        '12px 16px',
                      background:
                        canUpgrade &&
                        tokens >=
                          upgradeCost
                          ? '#22c55e'
                          : 'rgba(255,255,255,.08)',
                      color:
                        canUpgrade &&
                        tokens >=
                          upgradeCost
                          ? '#04130a'
                          : '#777',
                      cursor:
                        canUpgrade &&
                        tokens >=
                          upgradeCost
                          ? 'pointer'
                          : 'not-allowed',
                      fontWeight: 1000,
                    }}
                  >
                    UPGRADE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// ELEMENT BOX
// ============================================================================

interface ElementBoxProps {
  label: string;
  icon: string;
  amount: number;
  capacity: number;
  border: string;
  background: string;
}

function ElementBox({
  label,
  icon,
  amount,
  capacity,
  border,
  background,
}: ElementBoxProps) {
  return (
    <div
      style={{
        minHeight: 145,
        borderRadius: 16,
        border: `1px solid ${border}`,
        background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
      }}
    >
      <div
        style={{
          fontSize: '1.1rem',
          fontWeight: 900,
        }}
      >
        {icon} {label}
      </div>

      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 1000,
        }}
      >
        {formatNumber(amount)}
        {' / '}
        {formatNumber(capacity)}
      </div>

      <div
        style={{
          color: '#9ca3af',
          fontSize: '0.75rem',
        }}
      >
        Stored / Hour
      </div>
    </div>
  );
}

// ============================================================================
// SHOP
// ============================================================================

interface ShopButtonProps {
  x: number;
  y: number;
  onClick?: () => void;
}

export function ShopButton({
  x,
  y,
  onClick,
}: ShopButtonProps) {
  return (
    <ActionBuilding
      x={x}
      y={y}
      image="/assets/orion-shop-button.png"
      alt="Shop"
      size={7}
      onClick={onClick}
    />
  );
}

// ============================================================================
// BATTLE
// ============================================================================

interface BattleButtonProps {
  x: number;
  y: number;
  onClick?: () => void;
}

function BattlePage({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundImage:
          "linear-gradient(rgba(4,7,16,.18), rgba(4,7,16,.4)), url('/assets/battle-menu-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 48,
          height: 48,
          border:
            '1px solid rgba(255,255,255,.28)',
          borderRadius: 12,
          background:
            'rgba(0,0,0,.65)',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 20,
          fontWeight: 900,
          zIndex: 5,
        }}
      >
        X
      </button>

      <div
        style={{
          width:
            'min(430px, 86vw)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize:
                'clamp(2rem, 6vw, 3.5rem)',
              fontWeight: 1000,
              letterSpacing: '.14em',
              color: '#ffd700',
              textShadow:
                '0 4px 20px rgba(0,0,0,.9)',
            }}
          >
            BATTLE
          </div>

          <div
            style={{
              marginTop: 8,
              color:
                'rgba(255,255,255,.82)',
              fontSize: '.78rem',
              letterSpacing: '.12em',
            }}
          >
            CHOOSE YOUR BATTLE
          </div>
        </div>

        <BattleMenuButton
          title="BATTLE VS BOT"
          onClick={() => {
            console.log(
              'BATTLE VS BOT'
            );
          }}
        />

        <BattleMenuButton
          title="ONLINE BATTLE"
          onClick={() => {
            console.log(
              'ONLINE BATTLE'
            );
          }}
        />

        <BattleMenuButton
          title="CLAN BATTLE"
          onClick={() => {
            console.log(
              'CLAN BATTLE'
            );
          }}
        />
      </div>
    </div>
  );
}

export function BattleButton({
  x,
  y,
  onClick,
}: BattleButtonProps) {
  const [open, setOpen] =
    useState(false);

  function openBattle() {
    setOpen(true);
    onClick?.();
  }

  function closeBattle() {
    setOpen(false);
  }

  if (open) {
    return (
      <BattlePage
        onClose={
          closeBattle
        }
      />
    );
  }

  return (
    <ActionBuilding
      x={x}
      y={y}
      image="/assets/orion-battle-button.png"
      alt="Battle"
      size={7}
      onClick={
        openBattle
      }
    />
  );
}

// ============================================================================
// BATTLE MENU BUTTON
// ============================================================================

interface BattleMenuButtonProps {
  title: string;
  onClick: () => void;
}

function BattleMenuButton({
  title,
  onClick,
}: BattleMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 78,
        padding: '18px 20px',
        border:
          '2px solid rgba(255,215,0,.48)',
        borderRadius: 14,
        background:
          'rgba(0,0,0,.7)',
        color: '#ffd700',
        fontSize: '1.05rem',
        fontWeight: 900,
        letterSpacing: '.06em',
        cursor: 'pointer',
        boxShadow:
          '0 8px 25px rgba(0,0,0,.45)',
        backdropFilter:
          'blur(6px)',
        transition:
          'transform .15s ease, border-color .15s ease',
      }}
      onMouseEnter={(
        event
      ) => {
        event.currentTarget.style.borderColor =
          'rgba(255,215,0,.9)';

        event.currentTarget.style.transform =
          'scale(1.02)';
      }}
      onMouseLeave={(
        event
      ) => {
        event.currentTarget.style.borderColor =
          'rgba(255,215,0,.48)';

        event.currentTarget.style.transform =
          'scale(1)';
      }}
    >
      {title}
    </button>
  );
}