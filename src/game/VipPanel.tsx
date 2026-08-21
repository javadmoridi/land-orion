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

import { useGameStore } from './useGameStore';

import {
  getMyReferralCode,
} from '../economy/playerApi';

import {
  TonConnectButton,
  useTonAddress,
} from '@tonconnect/ui-react';

import { formatWalletAddress } from '../wallet/walletService';

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
    totalSeconds %
    60;

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

  const walletAddress =
    useGameStore(
      (s) =>
        s.playerProfile?.walletAddress ??
        null
    );

  const bindWallet =
    useGameStore(
      (s) => s.bindWallet
    );

  const tonAddress =
    useTonAddress();

  const isWalletConnected =
    Boolean(tonAddress);

  const [
    walletStatus,
    setWalletStatus,
  ] =
    useState<string | null>(
      null
    );

  const [
    myReferralCode,
    setMyReferralCode,
  ] =
    useState<string | null>(
      null
    );

  const [
    copiedType,
    setCopiedType,
  ] =
    useState<
      'code' | 'link' | null
    >(null);

  useEffect(() => {
    if (
      open &&
      myReferralCode === null
    ) {
      void getMyReferralCode().then(
        (code) => {
          if (code) {
            setMyReferralCode(
              code
            );
          }
        }
      );
    }
  }, [
    open,
    myReferralCode,
  ]);

  useEffect(() => {
    if (
      !open ||
      !isWalletConnected ||
      !tonAddress ||
      walletStatus === 'bound'
    ) {
      return;
    }

    if (
      walletAddress ===
      tonAddress
    ) {
      setWalletStatus(
        'bound'
      );
      return;
    }

    setWalletStatus(
      'binding'
    );

    void bindWallet(
      tonAddress
    ).then(() => {
      setWalletStatus(
        'bound'
      );
    });
  }, [
    open,
    isWalletConnected,
    tonAddress,
    walletAddress,
    bindWallet,
    walletStatus,
  ]);

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
          ).getTime() -
            now
        )
      : 0;

  const vipCurrentlyActive =
    activeVip !== null &&
    remainingMs > 0;

  const referralLink =
    myReferralCode
      ? `${window.location.origin}/?ref=${myReferralCode}`
      : '';

  const copyReferralCode =
    () => {
      if (!myReferralCode) {
        return;
      }

      void navigator.clipboard
        ?.writeText(
          myReferralCode
        )
        .then(() => {
          setCopiedType(
            'code'
          );

          window.setTimeout(
            () => {
              setCopiedType(
                null
              );
            },
            2000
          );
        });
    };

  const copyReferralLink =
    () => {
      if (!referralLink) {
        return;
      }

      void navigator.clipboard
        ?.writeText(
          referralLink
        )
        .then(() => {
          setCopiedType(
            'link'
          );

          window.setTimeout(
            () => {
              setCopiedType(
                null
              );
            },
            2000
          );
        });
    };

  const shareReferralLink =
    () => {
      if (!referralLink) {
        return;
      }

      if (
        navigator.share
      ) {
        void navigator.share({
          title:
            'Join Land Orion',
          text:
            'Join me in Land Orion using my referral link.',
          url:
            referralLink,
        });
      } else {
        copyReferralLink();
      }
    };

  const overlayStyle:
    CSSProperties = {
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

  const panelStyle:
    CSSProperties = {
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

        {/* REFERRAL */}

        <div
          style={{
            marginBottom: 18,
            padding: 16,
            borderRadius: 12,
            background:
              'rgba(138,92,245,.07)',
            border:
              '1px solid rgba(138,92,245,.25)',
          }}
        >
          <div
            style={{
              fontSize:
                '0.9rem',
              fontWeight: 900,
              color:
                '#a78bfa',
              marginBottom: 6,
            }}
          >
            REFERRAL
          </div>

          <div
            style={{
              fontSize:
                '0.72rem',
              color:
                '#9fb0d0',
              marginBottom: 14,
            }}
          >
            Invite a new player with
            your personal referral
            link.
          </div>

          {myReferralCode ? (
            <>
              {/* PERSONAL REFERRAL CODE */}

              <div
                style={{
                  fontSize:
                    '0.7rem',
                  color:
                    '#9fb0d0',
                  marginBottom: 5,
                }}
              >
                YOUR REFERRAL CODE
              </div>

              <div
                style={{
                  display:
                    'flex',
                  gap: 8,
                  alignItems:
                    'center',
                  marginBottom: 12,
                }}
              >
                <code
                  style={{
                    flex: 1,
                    padding:
                      '0.7rem',
                    borderRadius: 8,
                    background:
                      'rgba(0,0,0,.35)',
                    border:
                      '1px solid rgba(167,139,250,.3)',
                    color:
                      '#d8b4fe',
                    fontWeight:
                      900,
                    letterSpacing:
                      '0.12em',
                    textAlign:
                      'center',
                    fontSize:
                      '1rem',
                  }}
                >
                  {myReferralCode}
                </code>

                <button
                  type="button"
                  onClick={
                    copyReferralCode
                  }
                  style={{
                    border:
                      'none',
                    borderRadius:
                      8,
                    padding:
                      '0.7rem 0.8rem',
                    background:
                      'rgba(138,92,245,.35)',
                    color:
                      '#fff',
                    fontWeight:
                      800,
                    cursor:
                      'pointer',
                  }}
                >
                  {copiedType ===
                  'code'
                    ? 'Copied ✓'
                    : 'Copy'}
                </button>
              </div>

              {/* PERSONAL REGISTRATION LINK */}

              <div
                style={{
                  fontSize:
                    '0.7rem',
                  color:
                    '#9fb0d0',
                  marginBottom: 5,
                }}
              >
                YOUR INVITE LINK
              </div>

              <div
                style={{
                  display:
                    'flex',
                  gap: 8,
                  alignItems:
                    'center',
                }}
              >
                <code
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding:
                      '0.65rem',
                    borderRadius: 8,
                    background:
                      'rgba(0,0,0,.35)',
                    border:
                      '1px solid rgba(79,124,255,.25)',
                    color:
                      '#93c5fd',
                    fontSize:
                      '0.72rem',
                    wordBreak:
                      'break-all',
                  }}
                >
                  {referralLink}
                </code>

                <button
                  type="button"
                  onClick={
                    copyReferralLink
                  }
                  style={{
                    border:
                      'none',
                    borderRadius:
                      8,
                    padding:
                      '0.65rem 0.8rem',
                    background:
                      'rgba(79,124,255,.3)',
                    color:
                      '#dbeafe',
                    fontWeight:
                      800,
                    cursor:
                      'pointer',
                  }}
                >
                  {copiedType ===
                  'link'
                    ? 'Copied ✓'
                    : 'Copy'}
                </button>
              </div>

              <button
                type="button"
                onClick={
                  shareReferralLink
                }
                style={{
                  width:
                    '100%',
                  marginTop: 10,
                  border:
                    'none',
                  borderRadius: 8,
                  padding:
                    '0.7rem',
                  background:
                    '#8b5cf6',
                  color:
                    '#fff',
                  fontWeight:
                    900,
                  cursor:
                    'pointer',
                }}
              >
                SHARE INVITE LINK
              </button>

              <div
                style={{
                  marginTop: 10,
                  fontSize:
                    '0.68rem',
                  color:
                    '#6b7c99',
                  textAlign:
                    'center',
                }}
              >
                Send this link to a new
                player so the referral
                code is automatically
                included during
                registration.
              </div>
            </>
          ) : (
            <div
              style={{
                padding:
                  '0.8rem',
                borderRadius: 8,
                background:
                  'rgba(255,255,255,.04)',
                color:
                  '#6b7c99',
                fontSize:
                  '0.72rem',
                textAlign:
                  'center',
              }}
            >
              Loading your personal
              referral code…
            </div>
          )}
        </div>

        {/* CONNECT WALLET */}

        <div
          style={{
            marginBottom: 18,
            padding: 16,
            borderRadius: 12,
            background:
              'rgba(138,92,245,.06)',
            border:
              '1px solid rgba(138,92,245,.25)',
          }}
        >
          <div
            style={{
              fontSize:
                '0.8rem',
              fontWeight: 900,
              color:
                '#a78bfa',
              marginBottom: 8,
            }}
          >
            CONNECT WALLET (TON)
          </div>

          {walletAddress && (
            <div
              style={{
                marginBottom: 10,
                fontSize:
                  '0.72rem',
                color:
                  '#9fb0d0',
                wordBreak:
                  'break-all',
              }}
            >
              Saved under:
              <br />

              <strong
                style={{
                  color:
                    '#e9d5ff',
                }}
              >
                {formatWalletAddress(
                  walletAddress
                )}
              </strong>

              <br />

              <span
                style={{
                  color:
                    '#86efac',
                }}
              >
                Progress and items are
                stored under this
                wallet.
              </span>
            </div>
          )}

          {walletStatus ===
          'bound' ? (
            <div
              style={{
                padding:
                  '0.5rem',
                borderRadius: 8,
                background:
                  'rgba(34,197,94,.12)',
                border:
                  '1px solid rgba(34,197,94,.35)',
                color:
                  '#86efac',
                fontSize:
                  '0.78rem',
                fontWeight: 800,
                textAlign:
                  'center',
              }}
            >
              Wallet linked —
              progress & items now
              save under your wallet.
            </div>
          ) : (
            <>
              <div
                style={{
                  marginBottom: 6,
                }}
              >
                <TonConnectButton />
              </div>

              {walletStatus ===
              'binding' ? (
                <div
                  style={{
                    fontSize:
                      '0.72rem',
                    color:
                      '#a78bfa',
                  }}
                >
                  Linking wallet…
                  migrating progress
                  & items.
                </div>
              ) : (
                <div
                  style={{
                    fontSize:
                      '0.7rem',
                    color:
                      '#6b7c99',
                  }}
                >
                  Connect your TON
                  wallet to save your
                  progress and items
                  under your wallet
                  address.
                </div>
              )}
            </>
          )}
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
                fontWeight:
                  900,
                fontSize:
                  '0.85rem',
              }}
            >
              ACTIVE VIP
            </div>

            <div
              style={{
                marginTop: 5,
                fontWeight:
                  900,
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
                fontWeight:
                  900,
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
            display:
              'flex',
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
            Another VIP cannot be
            purchased until the
            current VIP expires.
          </div>
        )}
      </div>
    </div>
  );
}