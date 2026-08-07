import { useEffect, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import type { CSSProperties } from 'react';
import {
  GEM_PACKAGES,
  useGemStore,
  type GemPackage,
} from '../economy/gemStore';
import {
  calcTonAmountForGems,
  gemsToUsd,
  getTonUsdPrice,
} from '../economy/tonPriceService';
import {
  sendGemPaymentAndVerify,
  TON_RECEIVER_ADDRESS,
} from '../economy/tonVerificationService';

interface BuyGemsPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Buy Gems modal. Lets the player pick how many Gems to buy, shows the USD and
 * live TON cost, and sends a real TON payment to the receive address via the
 * connected wallet. Gems are credited only after the transaction is verified
 * on-chain (see gemStore.purchaseGems / tonVerificationService).
 */
export function BuyGemsPanel({ open, onClose }: BuyGemsPanelProps) {
  const [tonConnectUI] = useTonConnectUI();
  const gems = useGemStore((s) => s.gems);
  const buying = useGemStore((s) => s.buying);
  const lastPurchase = useGemStore((s) => s.lastPurchase);
  const purchaseGems = useGemStore((s) => s.purchaseGems);

  const [selected, setSelected] = useState<GemPackage | null>(null);
  const [tonToUsd, setTonToUsd] = useState<number | null>(null);

  // Refresh the live TON price whenever the panel opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void getTonUsdPrice().then((price) => {
      if (!cancelled) setTonToUsd(price.tonToUsd);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    padding: '1rem',
  };

  const panelStyle: CSSProperties = {
    width: 'min(440px, 100%)',
    maxHeight: '85vh',
    overflowY: 'auto',
    background: 'rgba(10, 14, 26, 0.96)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(143, 92, 245, 0.4)',
    borderRadius: 16,
    boxShadow: '0 0 40px rgba(0,0,0,0.6)',
    padding: '1.25rem',
  };

  async function handleBuy(pkg: GemPackage) {
    setSelected(pkg);
    await purchaseGems(pkg.gems, async (gemsToBuy) => {
      // Real TON send + on-chain verification. gemStore only credits Gems
      // after this returns confirmed and the payment is persisted.
      return sendGemPaymentAndVerify(tonConnectUI, gemsToBuy);
    });
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#8a5cf5' }}>🛒 Buy Gems</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#f3f6ff', borderRadius: 8, width: 32, height: 32, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#9fb0d0', margin: '0 0 1rem' }}>
          💎 Your Gems: <strong style={{ color: '#8a5cf5' }}>{gems.toLocaleString()}</strong>
          <br />
          Gems are a special currency for faster progression. 1 Gem = $0.01, paid in Toncoin (TON).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {GEM_PACKAGES.map((pkg) => {
            const usd = gemsToUsd(pkg.gems);
            const ton = tonToUsd ? calcTonAmountForGems(pkg.gems, tonToUsd) : null;
            return (
              <div
                key={pkg.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 10,
                  background: selected?.id === pkg.id ? 'rgba(138, 92, 245, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selected?.id === pkg.id ? 'rgba(138, 92, 245, 0.6)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <div style={{ fontWeight: 700, color: '#f3f6ff' }}>💎 {pkg.gems.toLocaleString()}</div>
                <div style={{ fontSize: '0.78rem', color: '#9fb0d0', textAlign: 'right' }}>
                  ${usd.toFixed(2)} · {ton ? `~${ton.toFixed(4)} TON` : '...'}
                </div>
                <button
                  disabled={buying}
                  onClick={() => handleBuy(pkg)}
                  style={{
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.45rem 0.8rem',
                    fontWeight: 700,
                    background: '#8a5cf5',
                    color: '#fff',
                    cursor: buying ? 'not-allowed' : 'pointer',
                    opacity: buying ? 0.6 : 1,
                  }}
                >
                  {buying && selected?.id === pkg.id ? 'Paying…' : 'Buy'}
                </button>
              </div>
            );
          })}
        </div>

        {lastPurchase && (
          <div
            style={{
              marginTop: '0.9rem',
              padding: '0.7rem',
              borderRadius: 10,
              fontSize: '0.85rem',
              background: lastPurchase.ok ? 'rgba(46,160,67,0.12)' : 'rgba(255,80,80,0.12)',
              border: `1px solid ${lastPurchase.ok ? 'rgba(46,160,67,0.4)' : 'rgba(255,80,80,0.4)'}`,
              color: lastPurchase.ok ? '#4cd07d' : '#ff6b6b',
            }}
          >
            {lastPurchase.ok
              ? `✅ Payment confirmed. ${lastPurchase.gems?.toLocaleString()} Gems added!`
              : lastPurchase.error ?? '❌ Payment was not completed.'}
          </div>
        )}

        <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#6b7c99', wordBreak: 'break-all' }}>
          TON receive address: {TON_RECEIVER_ADDRESS}
        </p>
      </div>
    </div>
  );
}
