import type { CSSProperties } from 'react';
import { QUESTS, useResourceStore } from '../economy/resourceStore';
import { useGameStore } from './useGameStore';

interface QuestPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal window that lists every available quest, its condition, its reward,
 * and lets the player claim the reward once the condition is met.
 *
 * Rewards (+Coins / +Orion Token) are credited to the resource store, which
 * keeps the ResourceDisplay HUD in sync.
 */
export function QuestPanel({ open, onClose }: QuestPanelProps) {
  const {
    claimQuest,
    canClaimQuest,
    claimedQuestIds,
  } = useResourceStore();

  // Subscribe to game state so the claimable status re-renders when the
  // player harvests wood/stone/food.
  useGameStore((s) => s.gameState);

  if (!open) return null;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.55)',
    padding: '1rem',
  };

  const panelStyle: CSSProperties = {
    width: 'min(480px, 100%)',
    maxHeight: '80vh',
    overflowY: 'auto',
    background: 'rgba(10, 14, 26, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: 16,
    boxShadow: '0 0 40px rgba(0, 0, 0, 0.6)',
    padding: '1.25rem',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ffd700' }}>
            📜 Quests
          </h2>
          <button
            onClick={onClose}
            aria-label="Close quests"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#f3f6ff',
              borderRadius: 8,
              width: 32,
              height: 32,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {QUESTS.map((quest) => {
            const claimed = claimedQuestIds.includes(quest.id);
            const claimable = canClaimQuest(quest.id);

            return (
              <div
                key={quest.id}
                style={{
                  padding: '0.9rem',
                  borderRadius: 12,
                  background: claimed
                    ? 'rgba(46, 160, 67, 0.12)'
                    : claimable
                      ? 'rgba(255, 215, 0, 0.08)'
                      : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${
                    claimed
                      ? 'rgba(46, 160, 67, 0.4)'
                      : claimable
                        ? 'rgba(255, 215, 0, 0.4)'
                        : 'rgba(255,255,255,0.08)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 700, color: '#f3f6ff' }}>{quest.title}</div>
                  {claimed && <span style={{ color: '#2ea043', fontWeight: 700 }}>✓ Claimed</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9fb0d0', marginTop: '0.2rem' }}>
                  {quest.description}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#8fb5ff', marginTop: '0.4rem' }}>
                  ✦ {quest.condition.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#ffd700', marginTop: '0.25rem' }}>
                  🪙 +{quest.reward.coins} &nbsp; 💎 +{quest.reward.tokens} Orion Token
                </div>

                <button
                  disabled={claimed || !claimable}
                  onClick={() => claimQuest(quest.id)}
                  style={{
                    marginTop: '0.7rem',
                    width: '100%',
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: claimed || !claimable ? 'not-allowed' : 'pointer',
                    background: claimed
                      ? 'rgba(46, 160, 67, 0.35)'
                      : claimable
                        ? '#ffd700'
                        : 'rgba(255,255,255,0.1)',
                    color: claimed || !claimable ? '#9fb0d0' : '#0b1220',
                  }}
                >
                  {claimed ? 'Claimed' : claimable ? 'Claim Reward' : 'Locked'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
