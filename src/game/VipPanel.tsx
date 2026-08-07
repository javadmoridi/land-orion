import type { CSSProperties } from 'react';
import { useGemStore } from '../economy/gemStore';
import { VIP_TIERS, useVipStore } from '../economy/vipStore';

interface VipPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * VIP window opened by clicking the Level/XP circle.
 *
 * Only the purchase structure / UI is built for now — the actual VIP benefits
 * will be defined later. Buying a tier spends Gems (from gemStore).
 */
export function VipPanel({ open, onClose }: VipPanelProps) {
  const gems = useGemStore((s) => s.gems);
  const purchaseVip = useVipStore((s) => s.purchaseVip);
  const isVipActive = useVipStore((s) => s.isVipActive);
  const lastPurchase = useVipStore((s) => s.lastPurchase);

  if (!open) return null;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    padding: '1rem',
  };

  const panelStyle: CSSProperties = {
    width: 'min(460px, 100%)',
    maxHeight: '85vh',
    overflowY: 'auto',
    background: 'rgba(10, 14, 26, 0.96)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 215, 0, 0.4)',
    borderRadius: 16,
    boxShadow: '0 0 40px rgba(0,0,0,0.6)',
    padding: '1.25rem',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ffd700' }}>👑 VIP Club</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#f3f6ff', borderRadius: 8, width: 32, height: 32, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#9fb0d0', margin: '0 0 1rem' }}>
          💎 Your Gems: <strong style={{ color: '#8a5cf5' }}>{gems.toLocaleString()}</strong>
          <br />
          VIP benefits are coming soon. Choose a tier — it is purchased with Gems.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {VIP_TIERS.map((tier) => {
            const active = isVipActive(tier.id);
            const affordable = gems >= tier.costGems;
            return (
              <div
                key={tier.id}
                style={{
                  padding: '0.8rem 0.9rem',
                  borderRadius: 10,
                  background: active ? 'rgba(46,160,67,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${active ? 'rgba(46,160,67,0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 700, color: active ? '#4cd07d' : '#f3f6ff' }}>
                    👑 {tier.name}
                  </div>
                  <button
                    disabled={active || !affordable}
                    onClick={() => purchaseVip(tier.id)}
                    style={{
                      border: 'none',
                      borderRadius: 8,
                      padding: '0.45rem 0.8rem',
                      fontWeight: 700,
                      background: active ? 'rgba(46,160,67,0.35)' : affordable ? '#ffd700' : 'rgba(255,255,255,0.1)',
                      color: active || !affordable ? '#9fb0d0' : '#0b1220',
                      cursor: active || !affordable ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {active ? 'Active' : `${tier.costGems.toLocaleString()} 💎`}
                  </button>
                </div>
                <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#9fb0d0' }}>
                  {tier.durationLabel} · {tier.costGems.toLocaleString()} Gems
                </div>
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
              fontWeight: 600,
            }}
          >
            {lastPurchase.ok ? '✅ VIP activated!' : lastPurchase.error ?? '❌ Purchase failed.'}
          </div>
        )}
      </div>
    </div>
  );
}
