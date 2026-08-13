import {
  useEffect,
  useState,
} from 'react';

import type {
  CSSProperties,
} from 'react';

import { useGemStore } from '../economy/gemStore';

import {
  VIP_TIERS,
  useVipStore,
} from '../economy/vipStore';

interface VipPanelProps {
  open: boolean;
  onClose: () => void;
}

function formatRemaining(
  milliseconds: number
): string {
  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        milliseconds / 1000
      )
    );

  const days =
    Math.floor(
      totalSeconds / 86400
    );

  const hours =
    Math.floor(
      (totalSeconds % 86400) /
        3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  const seconds =
    totalSeconds % 60;

  return `${days}d ${String(
    hours
  ).padStart(
    2,
    '0'
  )}:${String(
    minutes
  ).padStart(
    2,
    '0'
  )}:${String(
    seconds
  ).padStart(
    2,
    '0'
  )}`;
}

export function VipPanel({
  open,
  onClose,
}: VipPanelProps) {
  const gems =
    useGemStore(
      (s) => s.gems
    );

  const purchaseVip =
    useVipStore(
      (s) => s.purchaseVip
    );

  const isVipActive =
    useVipStore(
      (s) => s.isVipActive
    );

  const activeVip =
    useVipStore(
      (s) => s.activeVip
    );

  const lastPurchase =
    useVipStore(
      (s) => s.lastPurchase
    );

  const [
    now,
    setNow,
  ] = useState(
    () => Date.now()
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setNow(
            Date.now()
          );
        },
        1000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [open]);

  if (!open) {
    return null;
  }

  const remainingMs =
    activeVip
      ? Math.max(
          0,
          new Date(
            activeVip.expiresAt
          ).getTime() - now
        )
      : 0;

  const vipCurrentlyActive =
    activeVip !== null &&
    remainingMs > 0;

  const overlayStyle: CSSProperties =
    {
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems:
        'center',
      justifyContent:
        'center',
      background:
        'rgba(0,0,0,.72)',
      padding: '1rem',
    };

  const panelStyle: CSSProperties =
    {
      width:
        'min(500px, 96vw)',
      maxHeight: '88vh',
      overflowY: 'auto',
      background:
        'linear-gradient(180deg, #111827, #05070c)',
      border:
        '1px solid rgba(255,215,0,.35)',
      borderRadius: 18,
      boxShadow:
        '0 0 45px rgba(0,0,0,.7)',
      padding:
        '1.25rem',
      color: '#fff',
    };

  return (
    <div
      style={overlayStyle}
      onClick={onClose}
    >
      <div
        style={panelStyle}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'space-between',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize:
                  '1.25rem',
                color:
                  '#ffd700',
              }}
            >
              VIP CLUB
            </h2>

            <div
              style={{
                marginTop: 4,
                color:
                  '#9fb0d0',
                fontSize:
                  '0.78rem',
              }}
            >
              Gems:{' '}
              <strong
                style={{
                  color:
                    '#a78bfa',
                }}
              >
                {gems.toLocaleString()}
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background:
                'rgba(255,255,255,.08)',
              border: 'none',
              color: '#fff',
              borderRadius: 8,
              width: 34,
              height: 34,
              cursor:
                'pointer',
              fontWeight: 900,
            }}
          >
            X
          </button>
        </div>

        {/* ACTIVE VIP */}

        {vipCurrentlyActive && (
          <div
            style={{
              marginBottom: 14,
              padding: 14,
              borderRadius: 12,
              background:
                'rgba(34,197,94,.08)',
              border:
                '1px solid rgba(34,197,94,.3)',
            }}
          >
            <div
              style={{
                color:
                  '#86efac',
                fontWeight: 900,
                fontSize:
                  '0.85rem',
              }}
            >
              ACTIVE VIP
            </div>

            <div
              style={{
                marginTop: 5,
                fontWeight: 900,
                fontSize:
                  '1.05rem',
              }}
            >
              {activeVip?.name}
            </div>

            <div
              style={{
                marginTop: 8,
                color:
                  '#fbbf24',
                fontSize:
                  '1.15rem',
                fontWeight: 900,
              }}
            >
              {formatRemaining(
                remainingMs
              )}
            </div>

            <div
              style={{
                marginTop: 4,
                color:
                  '#9fb0d0',
                fontSize:
                  '0.72rem',
              }}
            >
              Remaining time
            </div>

            <div
              style={{
                marginTop: 8,
                color:
                  '#9fb0d0',
                fontSize:
                  '0.72rem',
              }}
            >
              Expires:{' '}
              {activeVip
                ? new Date(
                    activeVip.expiresAt
                  ).toLocaleString()
                : '-'}
            </div>
          </div>
        )}

        {!vipCurrentlyActive && (
          <div
            style={{
              marginBottom: 14,
              padding:
                '10px 12px',
              borderRadius: 10,
              background:
                'rgba(255,255,255,.04)',
              border:
                '1px solid rgba(255,255,255,.08)',
              color:
                '#9fb0d0',
              fontSize:
                '0.78rem',
            }}
          >
            No active VIP.
            Choose one tier below.
          </div>
        )}

        {/* VIP TIERS */}

        <div
          style={{
            display: 'flex',
            flexDirection:
              'column',
            gap: '0.7rem',
          }}
        >
          {VIP_TIERS.map(
            (tier) => {
              const active =
                isVipActive(
                  tier.id
                );

              const affordable =
                gems >=
                tier.costGems;

              /*
               * When any VIP is active,
               * all other VIP tiers are locked.
               */
              const lockedByOtherVip =
                vipCurrentlyActive &&
                !active;

              const disabled =
                active ||
                lockedByOtherVip ||
                !affordable;

              return (
                <div
                  key={tier.id}
                  style={{
                    padding:
                      '0.9rem',
                    borderRadius: 12,

                    background:
                      active
                        ? 'rgba(34,197,94,.10)'
                        : lockedByOtherVip
                        ? 'rgba(255,255,255,.025)'
                        : 'rgba(255,255,255,.05)',

                    border:
                      active
                        ? '1px solid rgba(34,197,94,.35)'
                        : lockedByOtherVip
                        ? '1px solid rgba(255,255,255,.05)'
                        : '1px solid rgba(255,255,255,.1)',

                    opacity:
                      lockedByOtherVip
                        ? 0.55
                        : 1,
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
                      gap: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight:
                            900,
                          color:
                            active
                              ? '#86efac'
                              : '#fff',
                        }}
                      >
                        {tier.name}
                      </div>

                      <div
                        style={{
                          marginTop:
                            4,
                          color:
                            '#9fb0d0',
                          fontSize:
                            '0.75rem',
                        }}
                      >
                        {
                          tier.durationLabel
                        }
                        {' · '}
                        {tier.costGems.toLocaleString()}
                        {' Gems'}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={
                        disabled
                      }
                      onClick={() =>
                        purchaseVip(
                          tier.id
                        )
                      }
                      style={{
                        border:
                          'none',
                        borderRadius:
                          8,
                        padding:
                          '0.5rem 0.8rem',
                        minWidth:
                          90,
                        fontWeight:
                          800,

                        background:
                          active
                            ? 'rgba(34,197,94,.35)'
                            : lockedByOtherVip
                            ? 'rgba(255,255,255,.06)'
                            : affordable
                            ? '#ffd700'
                            : 'rgba(255,255,255,.1)',

                        color:
                          active
                            ? '#86efac'
                            : lockedByOtherVip ||
                              !affordable
                            ? '#6b7280'
                            : '#0b1220',

                        cursor:
                          disabled
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                    >
                      {active
                        ? 'ACTIVE'
                        : lockedByOtherVip
                        ? 'LOCKED'
                        : affordable
                        ? `${tier.costGems.toLocaleString()} 💎`
                        : 'NOT ENOUGH'}
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* PURCHASE MESSAGE */}

        {lastPurchase && (
          <div
            style={{
              marginTop:
                '0.9rem',
              padding:
                '0.7rem',
              borderRadius:
                10,
              fontSize:
                '0.82rem',
              background:
                lastPurchase.ok
                  ? 'rgba(46,160,67,.12)'
                  : 'rgba(255,80,80,.12)',
              border:
                `1px solid ${
                  lastPurchase.ok
                    ? 'rgba(46,160,67,.4)'
                    : 'rgba(255,80,80,.4)'
                }`,
              color:
                lastPurchase.ok
                  ? '#4cd07d'
                  : '#ff6b6b',
              fontWeight:
                700,
            }}
          >
            {lastPurchase.ok
              ? 'VIP activated!'
              : lastPurchase.error ??
                'Purchase failed.'}
          </div>
        )}

        {/* LOCK MESSAGE */}

        {vipCurrentlyActive && (
          <div
            style={{
              marginTop: 12,
              padding:
                '10px 12px',
              borderRadius: 10,
              background:
                'rgba(255,215,0,.06)',
              border:
                '1px solid rgba(255,215,0,.15)',
              color:
                '#d1d5db',
              fontSize:
                '0.74rem',
              textAlign:
                'center',
            }}
          >
            Another VIP cannot be purchased
            until the current VIP expires.
          </div>
        )}
      </div>
    </div>
  );
}