import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useResourceStore } from '../economy/resourceStore';
import { useGemStore } from '../economy/gemStore';
import { OrionTokenIcon } from './OrionTokenIcon';
import { BuyGemsPanel } from './BuyGemsPanel';

/**
 * HUD panel below the Level/XP circle showing the player's balances:
 *   🪙 Coins, Orion Token (dragon icon), 💎 Gems.
 * Includes a Buy Gems button that opens the TON payment panel.
 */
export function ResourceDisplay() {
  const { coins, tokens } = useResourceStore((s) => s.resources);
  const gems = useGemStore((s) => s.gems);
  const [buyOpen, setBuyOpen] = useState(false);

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
    <>
      <div
        style={{
          position: 'fixed',
          top: '9.5rem',
          right: '1rem',
          zIndex: 10,
          minWidth: 160,
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
          <OrionTokenIcon size={18} />
          <span style={labelStyle}>Orion Token</span>
          <span>{tokens.toLocaleString()}</span>
        </div>

        <div style={rowStyle}>
          <span aria-hidden>💎</span>
          <span style={labelStyle}>Gems</span>
          <span style={{ color: '#8a5cf5' }}>{gems.toLocaleString()}</span>
        </div>

        <button
          onClick={() => setBuyOpen(true)}
          style={{
            marginTop: '0.3rem',
            border: 'none',
            borderRadius: 8,
            padding: '0.45rem 0.6rem',
            fontWeight: 700,
            fontSize: '0.8rem',
            background: 'linear-gradient(135deg, #8a5cf5, #4f7cff)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          🛒 Buy Gems
        </button>
      </div>

      <BuyGemsPanel open={buyOpen} onClose={() => setBuyOpen(false)} />
    </>
  );
}

