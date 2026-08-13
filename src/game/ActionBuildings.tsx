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

// One complete mining cycle = exactly 3 hours.
const MINER_CYCLE_MS =
  3 * 60 * 60 * 1000;

// Upgrade multiplier.
const MINER_UPGRADE_MULTIPLIER = 1.2;

const MINER_STORAGE_KEY =
  'land-orion-miner';

interface MinerSaveData {
  unlockedLevel: number;
  lastCollectedAt: number | null;
}

const DEFAULT_MINER_DATA: MinerSaveData = {
  unlockedLevel: 0,
  lastCollectedAt: null,
};

function loadMinerData(): MinerSaveData {
  if (typeof window === 'undefined') {
    return DEFAULT_MINER_DATA;
  }

  try {
    const raw =
      window.localStorage.getItem(
        MINER_STORAGE_KEY
      );

    if (!raw) {
      return DEFAULT_MINER_DATA;
    }

    const parsed =
      JSON.parse(raw) as Partial<MinerSaveData>;

    return {
      unlockedLevel:
        typeof parsed.unlockedLevel === 'number'
          ? Math.max(
              0,
              Math.min(
                MINER_MAX_LEVEL,
                Math.floor(parsed.unlockedLevel)
              )
            )
          : 0,

      lastCollectedAt:
        typeof parsed.lastCollectedAt === 'number'
          ? parsed.lastCollectedAt
          : null,
    };
  } catch {
    return DEFAULT_MINER_DATA;
  }
}

function saveMinerData(
  data: MinerSaveData
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    MINER_STORAGE_KEY,
    JSON.stringify(data)
  );
}

/**
 * Upgrade cost:
 *
 * Level 1 = 1
 * Level 2 = 1.2
 * Level 3 = 1.44
 * Level 4 = 1.728
 *
 * Formula:
 * 1.2^(level - 1)
 */
function minerLevelCost(
  level: number
): number {
  if (level <= 0) {
    return 0;
  }

  return Math.pow(
    MINER_UPGRADE_MULTIPLIER,
    level - 1
  );
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

  return `${String(hours).padStart(2, '0')}:${String(
    minutes
  ).padStart(2, '0')}:${String(seconds).padStart(
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

  const [minerData, setMinerData] =
    useState<MinerSaveData>(
      loadMinerData
    );

  const [now, setNow] =
    useState(() => Date.now());

  const [message, setMessage] =
    useState<string | null>(null);

  const tokens =
    useResourceStore(
      (s) => s.resources.tokens
    );

  const spendTokens =
    useResourceStore(
      (s) => s.spendTokens
    );

  const addWater =
    useResourceStore(
      (s) => s.addWater
    );

  const addAir =
    useResourceStore(
      (s) => s.addAir
    );

  const addEarth =
    useResourceStore(
      (s) => s.addEarth
    );

  const addFire =
    useResourceStore(
      (s) => s.addFire
    );

  // --------------------------------------------------------------------------
  // Real clock: updates every second.
  // --------------------------------------------------------------------------

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setNow(Date.now());
      }, 1000);

    return () =>
      window.clearInterval(timer);
  }, []);

  // --------------------------------------------------------------------------
  // Save miner data.
  // --------------------------------------------------------------------------

  useEffect(() => {
    saveMinerData(minerData);
  }, [minerData]);

  // --------------------------------------------------------------------------
  // Repair old miner save data.
  //
  // If the player already has a miner level but old data does not contain
  // lastCollectedAt, start a new 3-hour mining cycle now.
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (
      minerData.unlockedLevel > 0 &&
      minerData.lastCollectedAt === null
    ) {
      const timestamp = Date.now();

      setMinerData((current) => ({
        ...current,
        lastCollectedAt: timestamp,
      }));

      setNow(timestamp);
    }
  }, [
    minerData.unlockedLevel,
    minerData.lastCollectedAt,
  ]);

  const activeLevel =
    minerData.unlockedLevel;

  const hasStarted =
    activeLevel > 0 &&
    minerData.lastCollectedAt !== null;

  const elapsedMs =
    hasStarted
      ? Math.max(
          0,
          now -
            (minerData.lastCollectedAt ?? now)
        )
      : 0;

  const cappedElapsedMs =
    Math.min(
      elapsedMs,
      MINER_CYCLE_MS
    );

  const productionReady =
    activeLevel > 0 &&
    minerData.lastCollectedAt !== null &&
    elapsedMs >= MINER_CYCLE_MS;

  const remainingMs =
    hasStarted
      ? Math.max(
          0,
          MINER_CYCLE_MS - elapsedMs
        )
      : MINER_CYCLE_MS;

  // --------------------------------------------------------------------------
  // LIVE PRODUCTION
  //
  // Level 1:
  //   1 hour = 1
  //   2 hours = 2
  //   3 hours = 3
  //
  // Level 100:
  //   1 hour = 100
  //   2 hours = 200
  //   3 hours = 300
  //
  // The exact same amount is displayed for all 4 elemental resources.
  // --------------------------------------------------------------------------

  const liveAmount =
    activeLevel > 0
      ? Math.min(
          activeLevel * 3,
          (activeLevel *
            cappedElapsedMs) /
            (60 * 60 * 1000)
        )
      : 0;

  const displayAmount =
    Number(
      liveAmount.toFixed(2)
    );

  const cycleReward =
    activeLevel * 3;

  const nextLevel =
    activeLevel + 1;

  const canUpgrade =
    nextLevel <=
    MINER_MAX_LEVEL;

  const upgradeCost =
    canUpgrade
      ? minerLevelCost(nextLevel)
      : 0;

  function openMiner() {
    setMessage(null);
    setUpgradeOpen(false);
    setNow(Date.now());
    setOpen(true);
    onClick?.();
  }

  function collectMiner() {
    if (
      activeLevel <= 0 ||
      minerData.lastCollectedAt === null
    ) {
      setMessage(
        'Unlock Miner Level 1 first.'
      );
      return;
    }

    if (!productionReady) {
      setMessage(
        `Miner is still producing. ${formatClock(
          remainingMs
        )} remaining.`
      );
      return;
    }

    const amount =
      activeLevel * 3;

    addWater(amount);
    addAir(amount);
    addEarth(amount);
    addFire(amount);

    const timestamp =
      Date.now();

    setMinerData(
      (current) => ({
        ...current,
        lastCollectedAt:
          timestamp,
      })
    );

    setNow(timestamp);

    setMessage(
      `Collected ${amount} Water, ${amount} Air, ${amount} Earth and ${amount} Fire.`
    );
  }

  function upgradeMiner() {
    if (!canUpgrade) {
      setMessage(
        'Miner is already Level 100.'
      );
      return;
    }

    if (
      tokens < upgradeCost
    ) {
      setMessage(
        `Not enough game currency. Required: ${formatNumber(
          upgradeCost
        )}.`
      );
      return;
    }

    const spent =
      spendTokens(
        upgradeCost
      );

    if (!spent) {
      setMessage(
        'Not enough game currency.'
      );
      return;
    }

    setMinerData(
      (current) => ({
        ...current,
        unlockedLevel:
          nextLevel,
      })
    );

    setUpgradeOpen(false);
    setNow(Date.now());

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

      {open && (
        <div
          onClick={() => {
            setOpen(false);
            setUpgradeOpen(false);
          }}
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
                'min(820px, 94vw)',
              background:
                'linear-gradient(180deg, #111827, #05070c)',
              border:
                '1px solid rgba(255,215,0,.25)',
              borderRadius: 20,
              boxShadow:
                '0 0 50px rgba(0,0,0,.65)',
              color: '#fff',
              overflow: 'hidden',
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

              {/* UPGRADE BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setUpgradeOpen(
                    true
                  );
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
                  borderRadius:
                    12,
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

            {/* FOUR RESOURCE BOXES */}
            <div
              style={{
                padding:
                  '22px 28px 12px',
                display:
                  'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: 18,
              }}
            >
              <ElementBox
                label="Water"
                icon="💧"
                amount={displayAmount}
                capacity={cycleReward}
                border="rgba(96,165,250,.35)"
                background="linear-gradient(145deg, rgba(37,99,235,.16), rgba(10,15,30,.82))"
              />

              <ElementBox
                label="Air"
                icon="🌪"
                amount={displayAmount}
                capacity={cycleReward}
                border="rgba(125,211,252,.35)"
                background="linear-gradient(145deg, rgba(14,116,144,.16), rgba(10,15,30,.82))"
              />

              <ElementBox
                label="Earth"
                icon="🪨"
                amount={displayAmount}
                capacity={cycleReward}
                border="rgba(132,204,22,.35)"
                background="linear-gradient(145deg, rgba(63,98,18,.18), rgba(10,15,30,.82))"
              />

              <ElementBox
                label="Fire"
                icon="🔥"
                amount={displayAmount}
                capacity={cycleReward}
                border="rgba(248,113,113,.35)"
                background="linear-gradient(145deg, rgba(153,27,27,.18), rgba(10,15,30,.82))"
              />
            </div>

            {/* LIVE STATUS */}
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
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  gap: 12,
                  flexWrap:
                    'wrap',
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
                    Every 3 hours: {cycleReward} of each element
                  </div>
                </div>

                <div
                  style={{
                    textAlign:
                      'right',
                  }}
                >
                  <div
                    style={{
                      color:
                        productionReady
                          ? '#86efac'
                          : '#fbbf24',
                      fontWeight:
                        900,
                      fontSize:
                        '0.82rem',
                    }}
                  >
                    {productionReady
                      ? 'READY TO COLLECT'
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
                      ? '00:00:00'
                      : `Time remaining: ${formatClock(
                          remainingMs
                        )}`}
                  </div>
                </div>
              </div>
            </div>

            {/* COLLECT */}
            <div
              style={{
                padding:
                  '0 28px 22px',
                display:
                  'flex',
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
                  borderRadius:
                    12,
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
                  fontWeight:
                    1000,
                  fontSize:
                    '0.95rem',
                }}
              >
                COLLECT
              </button>
            </div>

            {/* UPGRADE WINDOW */}
            {upgradeOpen && (
              <div
                onClick={() =>
                  setUpgradeOpen(
                    false
                  )
                }
                style={{
                  position:
                    'fixed',
                  inset: 0,
                  zIndex: 10001,
                  background:
                    'rgba(0,0,0,.7)',
                  display:
                    'flex',
                  alignItems:
                    'center',
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
                    borderRadius:
                      16,
                    boxShadow:
                      '0 0 40px rgba(0,0,0,.7)',
                    padding: 22,
                    color: '#fff',
                  }}
                >
                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'center',
                      marginBottom:
                        18,
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          '1.1rem',
                        fontWeight:
                          1000,
                      }}
                    >
                      UPGRADE MINER
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setUpgradeOpen(
                          false
                        )
                      }
                      style={{
                        border: 'none',
                        background:
                          'rgba(255,255,255,.08)',
                        color: '#fff',
                        borderRadius:
                          8,
                        padding:
                          '6px 10px',
                        cursor:
                          'pointer',
                      }}
                    >
                      X
                    </button>
                  </div>

                  <div
                    style={{
                      display:
                        'grid',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        padding:
                          '12px 14px',
                        borderRadius:
                          10,
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
                          marginTop:
                            4,
                          fontSize:
                            '1.1rem',
                          fontWeight:
                            900,
                        }}
                      >
                        {activeLevel}
                      </div>
                    </div>

                    <div
                      style={{
                        padding:
                          '12px 14px',
                        borderRadius:
                          10,
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
                          marginTop:
                            4,
                          fontSize:
                            '1.1rem',
                          fontWeight:
                            900,
                        }}
                      >
                        {canUpgrade
                          ? nextLevel
                          : 'MAX'}
                      </div>
                    </div>

                    <div
                      style={{
                        padding:
                          '14px',
                        borderRadius:
                          10,
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
                          marginTop:
                            6,
                          color:
                            '#ffd700',
                          fontSize:
                            '1.25rem',
                          fontWeight:
                            1000,
                        }}
                      >
                        {canUpgrade
                          ? formatNumber(
                              upgradeCost
                            )
                          : 'MAX'}
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
                      width:
                        '100%',
                      marginTop:
                        18,
                      border: 'none',
                      borderRadius:
                        11,
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
                      fontWeight:
                        1000,
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
        Stored
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

export function BattleButton({
  x,
  y,
  onClick,
}: BattleButtonProps) {
  return (
    <ActionBuilding
      x={x}
      y={y}
      image="/assets/orion-battle-button.png"
      alt="Battle"
      size={7}
      onClick={onClick}
    />
  );
}