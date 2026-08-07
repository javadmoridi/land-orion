import type { CSSProperties } from 'react';
import { useResourceStore } from '../economy/resourceStore';

/**
 * Small HUD panel positioned directly below the Level/XP circle.
 * Shows the player's current coin (🪙) and Orion Token (💎) balances.
 *
 * The balances come from the separate resource store, so they stay in sync
 * with quest rewards / farming without touching the level badge.
 */
export function ResourceDisplay() {
  const { coins, tokens } = useResourceStore((s) => s.resources);

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#f3f6ff',
    whiteSpace: 'nowrap',
  };

  const labelStyle: CSSProperties = {
    color: '#8fb5ff',
    fontWeight: 600,
    marginRight: 'auto',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '9.5rem',
        right: '1rem',
        zIndex: 10,
        minWidth: 150,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        padding: '0.6rem 0.8rem',
        background: 'rgba(10, 14, 26, 0.85)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        border: '1px solid rgba(255, 215, 0, 0.25)',
        boxShadow: '0 0 16px rgba(255, 215, 0, 0.12)',
      }}
    >
      <div style={rowStyle}>
        <span aria-hidden>🪙</span>
        <span style={labelStyle}>Coins</span>
        <span>{coins.toLocaleString()}</span>
      </div>
      <div style={rowStyle}>
        <span aria-hidden>💎</span>
        <span style={labelStyle}>Orion Token</span>
        <span>{tokens.toLocaleString()}</span>
      </div>
    </div>
  );
}
