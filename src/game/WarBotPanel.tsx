import { useMemo, useState } from 'react';

import type { WarState } from '../types';

import { useGameStore } from './useGameStore';

import {
  useOrionStore,
  getOrionStats,
} from './orionStore';

import type { OrionUnit } from './orionStore';

import { useResourceStore } from '../economy/resourceStore';

import { OrionTokenIcon } from './OrionTokenIcon';

import {
  WAR_MAX_LEVEL,
  robotPowerForLevel,
  troopsAllowedForLevel,
  warRewardTokens,
  formatWarNumber,
} from './warConfig';

// ============================================================================
// BOT WAR PANEL
//
// Simple PvE mode: the player fights robots across 666 levels.
//   - Robot power starts at 1 and is multiplied by 1.9 every level.
//   - The player may select troops (Orions): 1 troop for levels 1-10,
//     2 troops for levels 11-20, ... (+1 slot every 10 levels).
//   - Clearing a level grants Orion tokens: 1 * 1.4^(level - 1).
//
// All progression is stored in gameState.war and persisted to Supabase
// through useGameStore.setWarState() -> saveGame().
// ============================================================================

interface WarBotPanelProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_WAR: WarState = {
  currentLevel: 1,
  highestLevel: 0,
  wins: 0,
  losses: 0,
  totalRewardTokens: 0,
};

const RACE_ICON: Record<
  OrionUnit['race'],
  string
> = {
  water: '💧',
  air: '🌪️',
  earth: '⛰️',
  fire: '🔥',
  asil: '👑',
};

type BattleResult =
  | null
  | {
      won: boolean;
      level: number;
      playerPower: number;
      robotPower: number;
      reward: number;
    };

export function WarBotPanel({
  open,
  onClose,
}: WarBotPanelProps) {
  const gameState = useGameStore(
    (s) => s.gameState,
  );

  const setWarState = useGameStore(
    (s) => s.setWarState,
  );

  const orions = useOrionStore(
    (s) => s.orions,
  );

  const runtime = useOrionStore(
    (s) => s.runtime,
  );

  const addTokens = useResourceStore(
    (s) => s.addTokens,
  );

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [result, setResult] =
    useState<BattleResult>(null);

  const [isFighting, setIsFighting] =
    useState(false);

  // ------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------

  const war: WarState =
    gameState?.war ?? DEFAULT_WAR;

  const level = Math.min(
    Math.max(1, war.currentLevel),
    WAR_MAX_LEVEL,
  );

  const troopsAllowed = useMemo(
    () => troopsAllowedForLevel(level),
    [level],
  );

  const robotPower = useMemo(
    () => robotPowerForLevel(level),
    [level],
  );

  const reward = useMemo(
    () => warRewardTokens(level),
    [level],
  );

  /** Only READY orions can be sent to war. */
  const readySoldiers = useMemo(
    () =>
      orions.filter(
        (orion) =>
          (runtime[orion.id]?.status ??
            'ready') === 'ready',
      ),
    [orions, runtime],
  );

  const soldierPowers = useMemo(() => {
    const map = new Map<string, number>();

    for (const orion of orions) {
      map.set(
        orion.id,
        getOrionStats(orion.race, orion.level)
          .attack,
      );
    }

    return map;
  }, [orions]);

  const playerPower = useMemo(
    () =>
      selectedIds.reduce(
        (total, id) =>
          total +
          (soldierPowers.get(id) ?? 0),
        0,
      ),
    [selectedIds, soldierPowers],
  );

  if (!open) {
    return null;
  }

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const toggleSoldier = (id: string) => {
    setResult(null);

    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (value) => value !== id,
        );
      }

      if (current.length >= troopsAllowed) {
        return current;
      }

      return [...current, id];
    });
  };

  const fight = () => {
    if (isFighting || selectedIds.length === 0) {
      return;
    }

    setIsFighting(true);

    /*
     * Small delay so the FIGHT press feels like a real battle
     * starting before the result banner appears.
     */
    window.setTimeout(() => {
      const won = playerPower >= robotPower;

      const nextWar: WarState = won
        ? {
            ...war,
            currentLevel: Math.min(
              level + 1,
              WAR_MAX_LEVEL,
            ),
            highestLevel: Math.max(
              war.highestLevel,
              level,
            ),
            wins: war.wins + 1,
            losses: war.losses,
            totalRewardTokens:
              war.totalRewardTokens + reward,
          }
        : {
            ...war,
            currentLevel: level,
            highestLevel: war.highestLevel,
            wins: war.wins,
            losses: war.losses + 1,
            totalRewardTokens:
              war.totalRewardTokens,
          };

      if (won) {
        addTokens(reward);
      }

      /*
       * Persist to Supabase via game state save.
       */
      setWarState(nextWar);

      setResult({
        won,
        level,
        playerPower,
        robotPower,
        reward,
      });

      setIsFighting(false);

      if (won) {
        setSelectedIds([]);
      }
    }, 600);
  };

  const nextTroopUnlockLevel =
    (Math.floor((level - 1) / 10) + 1) * 10 + 1;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(4,8,20,.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 20,
          border:
            '2px solid rgba(255,107,107,.45)',
          background:
            'linear-gradient(180deg,#101a33 0%,#0a1122 100%)',
          boxShadow:
            '0 24px 80px rgba(0,0,0,.7)',
          padding: '1.2rem',
          color: '#fff',
        }}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              letterSpacing: '.08em',
              color: '#ff6b6b',
            }}
          >
            🤖 BOT WAR
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              borderRadius: 10,
              width: 34,
              height: 34,
              background:
                'rgba(255,255,255,.08)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* PROGRESS ROW */}

        <div
          style={{
            marginTop: 12,
            display: 'flex',
            gap: 8,
          }}
        >
          <StatChip
            label="LEVEL"
            value={`${level} / ${WAR_MAX_LEVEL}`}
          />
          <StatChip
            label="WINS"
            value={String(war.wins)}
          />
          <StatChip
            label="LOSSES"
            value={String(war.losses)}
          />
        </div>

        {/* ENEMY CARD */}

        <div
          style={{
            marginTop: 14,
            padding: '0.9rem',
            borderRadius: 14,
            border:
              '1px solid rgba(255,107,107,.4)',
            background:
              'rgba(255,107,107,.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontWeight: 900,
                fontSize: '.95rem',
              }}
            >
              🤖 ROBOT LV.{level}
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '.78rem',
                color: '#ffd700',
                fontWeight: 800,
              }}
            >
              REWARD:{' '}
              {formatWarNumber(reward)}{' '}
              <OrionTokenIcon size={14} />
            </span>
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: '.74rem',
              color: '#9fb0d0',
            }}
          >
            Robot power:{' '}
            <b style={{ color: '#ff9b9b' }}>
              {formatWarNumber(robotPower)}
            </b>
          </div>
        </div>

        {/* TROOP SELECTION */}

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: '.72rem',
              letterSpacing: '.1em',
              color: '#9fb0d0',
              marginBottom: 8,
            }}
          >
            SELECT YOUR TROOPS —{' '}
            {selectedIds.length} /{' '}
            {troopsAllowed} chosen
          </div>

          {readySoldiers.length === 0 ? (
            <div
              style={{
                padding: '1rem',
                borderRadius: 12,
                background:
                  'rgba(255,255,255,.05)',
                fontSize: '.78rem',
                color: '#8fa0c0',
                textAlign: 'center',
              }}
            >
              You have no ready soldiers.
              Hatch Orions from eggs in
              the Incubator first! 🥚
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill,minmax(96px,1fr))',
                gap: 8,
              }}
            >
              {readySoldiers.map(
                (soldier) => {
                  const isSelected =
                    selectedIds.includes(
                      soldier.id,
                    );

                  const isLocked =
                    !isSelected &&
                    selectedIds.length >=
                      troopsAllowed;

                  return (
                    <button
                      key={soldier.id}
                      type="button"
                      onClick={() =>
                        toggleSoldier(
                          soldier.id,
                        )
                      }
                      style={{
                        padding:
                          '0.55rem 0.4rem',
                        borderRadius: 12,
                        border: `2px solid ${
                          isSelected
                            ? '#4f7cff'
                            : 'rgba(255,255,255,.14)'
                        }`,
                        background:
                          isSelected
                            ? 'rgba(79,124,255,.22)'
                            : 'rgba(255,255,255,.04)',
                        color: isLocked
                          ? 'rgba(255,255,255,.35)'
                          : '#fff',
                        cursor: isLocked
                          ? 'not-allowed'
                          : 'pointer',
                        opacity: isLocked
                          ? 0.5
                          : 1,
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.3rem',
                        }}
                      >
                        {
                          RACE_ICON[
                            soldier.race
                          ]
                        }
                      </div>

                      <div
                        style={{
                          fontSize: '.62rem',
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '.06em',
                          color: '#9fb0d0',
                        }}
                      >
                        {soldier.race} LV.
                        {soldier.level}
                      </div>

                      <div
                        style={{
                          marginTop: 2,
                          fontSize: '.68rem',
                          fontWeight: 800,
                          color: '#ffd700',
                        }}
                      >
                        ⚔{' '}
                        {formatWarNumber(
                          soldierPowers.get(
                            soldier.id,
                          ) ?? 0,
                        )}
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>

        {/* YOUR POWER + FIGHT */}

        <div
          style={{
            marginTop: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.65rem 0.9rem',
            borderRadius: 12,
            background: 'rgba(79,124,255,.12)',
            border:
              '1px solid rgba(79,124,255,.3)',
          }}
        >
          <span
            style={{
              fontSize: '.75rem',
              color: '#9fb0d0',
            }}
          >
            YOUR ARMY POWER
          </span>

          <b
            style={{
              color: '#7db4ff',
              fontSize: '.95rem',
            }}
          >
            {formatWarNumber(playerPower)}
          </b>
        </div>

        <button
          type="button"
          onClick={fight}
          disabled={
            selectedIds.length === 0 ||
            isFighting
          }
          style={{
            width: '100%',
            marginTop: 12,
            padding: '0.85rem',
            borderRadius: 14,
            border: 'none',
            background:
              selectedIds.length === 0 ||
              isFighting
                ? 'rgba(255,107,107,.25)'
                : 'linear-gradient(135deg,#ff6b6b,#ff9b4f)',
            color: '#fff',
            fontSize: '.95rem',
            fontWeight: 900,
            letterSpacing: '.1em',
            cursor:
              selectedIds.length === 0 ||
              isFighting
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {isFighting
            ? '⚔ FIGHTING...'
            : '⚔ FIGHT'}
        </button>

        <div
          style={{
            marginTop: 8,
            fontSize: '.66rem',
            color: '#6b7c99',
            textAlign: 'center',
          }}
        >
          Next extra troop slot unlocks at
          level {nextTroopUnlockLevel}
        </div>

        {/* RESULT BANNER */}

        {result && (
          <div
            style={{
              marginTop: 12,
              padding: '0.85rem',
              borderRadius: 14,
              textAlign: 'center',
              border: `1px solid ${
                result.won
                  ? 'rgba(80,220,120,.5)'
                  : 'rgba(255,107,107,.5)'
              }`,
              background: result.won
                ? 'rgba(80,220,120,.12)'
                : 'rgba(255,107,107,.12)',
            }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: '.95rem',
                color: result.won
                  ? '#7dff9e'
                  : '#ff9b9b',
              }}
            >
              {result.won
                ? `🏆 VICTORY — LEVEL ${result.level} CLEARED!`
                : `💥 DEFEAT — TRY AGAIN!`}
            </div>

            {result.won ? (
              <div
                style={{
                  marginTop: 4,
                  fontSize: '.74rem',
                  color: '#c9f7d4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                +{' '}
                {formatWarNumber(
                  result.reward,
                )}{' '}
                <OrionTokenIcon
                  size={13}
                />{' '}
                earned!
              </div>
            ) : (
              <div
                style={{
                  marginTop: 4,
                  fontSize: '.74rem',
                  color: '#ffd9d9',
                }}
              >
                Your power{' '}
                {formatWarNumber(
                  result.playerPower,
                )}{' '}
                vs robot{' '}
                {formatWarNumber(
                  result.robotPower,
                )}{' '}
                — level up your Orions or
                pick stronger troops.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================

function StatChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: '0.5rem',
        borderRadius: 10,
        background:
          'rgba(255,255,255,.06)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '.58rem',
          letterSpacing: '.12em',
          color: '#6b7c99',
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: '.8rem',
          fontWeight: 900,
          color: '#dbeafe',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default WarBotPanel;