import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useResourceStore } from '../economy/resourceStore';
import { useGemStore } from '../economy/gemStore';
import { OrionTokenIcon } from './OrionTokenIcon';
import { BuyGemsPanel } from './BuyGemsPanel';

/**
 * Vertical resource stack shown at the top-left of the screen.
 * Displays 🪙 Coins, Orion Token, and 💎 Gems stacked vertically,
 * each with its own small Buy/Add button. No borders or background.
 */
export function ResourceDisplay() {
  const { resources, addCoins, addTokens } = useResourceStore((s) => s);
  const gems = useGemStore((s) => s.gems);
  const [gemsOpen, setGemsOpen] = useState(false);

  const stackStyle: CSSProperties = {
    position: 'fixed',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'row',
    gap: '1.5rem',
  };

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#f3f6ff',
    fontSize: '0.85rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };

  const buyBtnStyle: CSSProperties = {
    marginLeft: '0.4rem',
    border: 'none',
    borderRadius: 4,
    padding: '0.15rem 0.4rem',
    fontSize: '0.65rem',
    fontWeight: 700,
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    lineHeight: 1,
  };

  return (
    <>
      <div style={stackStyle}>
        {/* Coins */}
        <div style={rowStyle}>
          <span aria-hidden>🪙</span>
          <span>{resources.coins.toLocaleString()}</span>
          <button
            onClick={() => addCoins(100)}
            style={buyBtnStyle}
            title="Add 100 Coins (demo)"
          >
            +100
          </button>
        </div>

        {/* Orion Token */}
        <div style={rowStyle}>
          <OrionTokenIcon size={16} />
          <span>{resources.tokens.toLocaleString()}</span>
          <button
            onClick={() => addTokens(10)}
            style={buyBtnStyle}
            title="Add 10 Tokens (demo)"
          >
            +10
          </button>
        </div>

        {/* Gems */}
        <div style={rowStyle}>
          <span aria-hidden>💎</span>
          <span style={{ color: '#c4b5fd' }}>{gems.toLocaleString()}</span>
          <button
            onClick={() => setGemsOpen(true)}
            style={{ ...buyBtnStyle, background: 'rgba(138,92,245,0.35)' }}
            title="Buy Gems with TON"
          >
            Buy
          </button>
        </div>
      </div>

      <BuyGemsPanel open={gemsOpen} onClose={() => setGemsOpen(false)} />
    </>
  );
}

