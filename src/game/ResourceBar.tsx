import { useState } from 'react';
import type { CSSProperties } from 'react';

import { useResourceStore } from '../economy/resourceStore';
import {
  useGemStore,
  MIN_GEM_PURCHASE,
  gemsToTon,
} from '../economy/gemStore';
import type { GemPaymentResult } from '../economy/tonVerificationService';

import { CurrencyIcon } from './currencyIcons';
import { InventoryPanel } from './InventoryPanel';
import { QuestPanel } from './QuestPanel';

const COINS_PER_ORION = 100;
const ORION_PER_GEM = 10;

type BuyMode =
  | 'coins'
  | 'orion'
  | 'gems'
  | null;

function fmt(n: number): string {
  const abs = Math.abs(n);

  if (
    abs >=
    1_000_000_000_000
  ) {
    return `${(
      n / 1_000_000_000_000
    ).toFixed(2)}T`;
  }

  if (
    abs >=
    1_000_000_000
  ) {
    return `${(
      n / 1_000_000_000
    ).toFixed(2)}B`;
  }

  if (
    abs >= 1_000_000
  ) {
    return `${(
      n / 1_000_000
    ).toFixed(2)}M`;
  }

  if (
    abs >= 1_000
  ) {
    return `${(
      n / 1_000
    ).toFixed(1)}K`;
  }

  return n.toLocaleString();
}

export function ResourceBar() {
  const {
    resources,
    addCoins,
    addTokens,
    spendTokens,
  } =
    useResourceStore(
      (s) => s
    );

  const {
    gems,
    spendGems,
    purchaseGems,
  } =
    useGemStore(
      (s) => s
    );

  const [
    invOpen,
    setInvOpen,
  ] = useState(false);

  const [
    questOpen,
    setQuestOpen,
  ] = useState(false);

  const [
    buyMode,
    setBuyMode,
  ] = useState<BuyMode>(
    null
  );

  const [
    amount,
    setAmount,
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const barStyle: CSSProperties =
    {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 9000,
      display: 'flex',
      flexDirection:
        'column',
      alignItems: 'center',
      gap: '0.6rem',
      padding:
        '0.6rem 0.35rem',
    };

  const itemStyle: CSSProperties =
    {
      display: 'flex',
      flexDirection:
        'column',
      alignItems: 'center',
      gap: '0.2rem',
      color: '#f3f6ff',
      fontSize: '0.72rem',
      fontWeight: 600,
    };

  const iconBtnStyle: CSSProperties =
    {
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent:
        'center',
      cursor: 'pointer',
      border: 'none',
      borderRadius: 10,
      background:
        'rgba(255,255,255,0.08)',
    };

  const plusBtnStyle: CSSProperties =
    {
      width: 20,
      height: 20,
      border: 'none',
      borderRadius: 50,
      background: '#2ecc71',
      cursor: 'pointer',
      color: '#061a0a',
      fontWeight: 900,
    };

  function openBuy(
    mode: Exclude<
      BuyMode,
      null
    >
  ) {
    setBuyMode(mode);
    setAmount('');
    setMessage(null);
  }

  async function doBuy(
    mode: Exclude<
      BuyMode,
      null
    >
  ) {
    setMessage(null);

    const n = Number(
      amount
    );

    // ================================================================
    // COINS
    // ================================================================

    if (mode === 'coins') {
      if (
        !Number.isFinite(n) ||
        n <= 0
      ) {
        setMessage({
          ok: false,
          text:
            'Enter valid number.',
        });
        return;
      }

      const tokenCost =
        n /
        COINS_PER_ORION;

      if (
        !spendTokens(
          tokenCost
        )
      ) {
        setMessage({
          ok: false,
          text:
            'Not enough Orion.',
        });
        return;
      }

      addCoins(n);

      setMessage({
        ok: true,
        text:
          `Bought ${n} coins.`,
      });

      return;
    }

    // ================================================================
    // ORION TOKEN
    // ================================================================

    if (mode === 'orion') {
      if (
        !Number.isFinite(n) ||
        n <= 0
      ) {
        setMessage({
          ok: false,
          text:
            'Enter valid number.',
        });
        return;
      }

      const gemCost =
        n /
        ORION_PER_GEM;

      if (
        !spendGems(
          gemCost
        )
      ) {
        setMessage({
          ok: false,
          text:
            'Not enough Gems.',
        });
        return;
      }

      addTokens(n);

      setMessage({
        ok: true,
        text:
          `Bought ${n} Orion.`,
      });

      return;
    }

    // ================================================================
    // GEMS
    // ================================================================

    if (
      !Number.isInteger(n) ||
      n < MIN_GEM_PURCHASE
    ) {
      setMessage({
        ok: false,
        text:
          'Minimum purchase is 100 Gems.',
      });
      return;
    }

    const tonAmount =
      gemsToTon(n);

    setMessage({
      ok: false,
      text:
        `Payment required: ${tonAmount} TON`,
    });

    const success =
      await purchaseGems(
        n,
        async () => {
          // Currency purchase is currently locked — no payment is sent.
          const result: GemPaymentResult = {
            confirmed: false,
            reason: 'Currency purchase is temporarily locked.',
            gems: 0,
            tonAmount: 0,
            usdAmount: 0,
            tonPrice: { usd: 0 },
          };
          return result;
        }
      );

    if (
      success
    ) {
      setMessage({
        ok: true,
        text:
          `${n} Gems purchased for ${tonAmount} TON.`,
      });

      setAmount('');
      return;
    }

    const last =
      useGemStore.getState()
        .lastPurchase;

    setMessage({
      ok: false,
      text:
        last?.error ??
        'Gem purchase failed.',
    });
  }

  const requestedGems =
    Number(amount);

  const gemTonPreview =
    Number.isInteger(
      requestedGems
    ) &&
    requestedGems >=
      MIN_GEM_PURCHASE
      ? gemsToTon(
          requestedGems
        )
      : 0;

  return (
    <>
      {/* ============================================================
          LEFT RESOURCE BAR
      ============================================================ */}

      <div
        style={barStyle}
      >
        {/* Inventory */}

        <button
          type="button"
          onClick={() =>
            setInvOpen(true)
          }
          style={iconBtnStyle}
          title="Inventory"
        >
          <img
            src="/assets/inventory-icon.png"
            alt="Inventory"
            style={{
              width: 32,
              height: 32,
            }}
          />
        </button>

        {/* Quests */}

        <button
          type="button"
          onClick={() =>
            setQuestOpen(
              true
            )
          }
          style={iconBtnStyle}
          title="Quests"
        >
          📜
        </button>

        {/* Coins */}

        <div
          style={itemStyle}
        >
          <CurrencyIcon
            type="coin"
            size={18}
          />

          <span>
            {fmt(
              resources.coins
            )}
          </span>

          <button
            type="button"
            style={
              plusBtnStyle
            }
            onClick={() =>
              openBuy(
                'coins'
              )
            }
          >
            +
          </button>
        </div>

        {/* Orion Token */}

        <div
          style={itemStyle}
        >
          <CurrencyIcon
            type="token"
            size={18}
          />

          <span>
            {fmt(
              resources.tokens
            )}
          </span>

          <button
            type="button"
            style={
              plusBtnStyle
            }
            onClick={() =>
              openBuy(
                'orion'
              )
            }
          >
            +
          </button>
        </div>

        {/* Gems */}

        <div
          style={itemStyle}
        >
          <CurrencyIcon
            type="gem"
            size={18}
          />

          <span>
            {fmt(gems)}
          </span>

          <button
            type="button"
            style={
              plusBtnStyle
            }
            onClick={() =>
              openBuy(
                'gems'
              )
            }
          >
            +
          </button>
        </div>
      </div>

      {/* ============================================================
          PANELS
      ============================================================ */}

      <InventoryPanel
        open={invOpen}
        onClose={() =>
          setInvOpen(false)
        }
      />

      <QuestPanel
        open={questOpen}
        onClose={() =>
          setQuestOpen(false)
        }
      />

      {/* ============================================================
          BUY WINDOW
      ============================================================ */}

      {buyMode && (
        <div
          onClick={() =>
            setBuyMode(null)
          }
          style={{
            position:
              'fixed',
            inset: 0,
            zIndex: 10000,
            background:
              'rgba(0,0,0,.7)',
            display: 'flex',
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
                'min(430px, 94vw)',
              background:
                '#111827',
              color: '#fff',
              padding: 24,
              borderRadius: 16,
              border:
                '1px solid rgba(255,215,0,.25)',
              boxShadow:
                '0 0 40px rgba(0,0,0,.55)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 18,
              }}
            >
              {buyMode ===
              'gems'
                ? 'BUY GEMS'
                : buyMode ===
                  'coins'
                ? 'BUY COINS'
                : 'BUY ORION'}
            </h2>

            <input
              type="number"
              min={
                buyMode ===
                'gems'
                  ? MIN_GEM_PURCHASE
                  : 1
              }
              step={
                buyMode ===
                'gems'
                  ? 1
                  : 1
              }
              value={amount}
              onChange={(
                event
              ) =>
                setAmount(
                  event.target
                    .value
                )
              }
              placeholder={
                buyMode ===
                'gems'
                  ? 'Minimum: 100 Gems'
                  : 'Amount'
              }
              style={{
                width: '100%',
                boxSizing:
                  'border-box',
                padding:
                  '11px 12px',
                borderRadius: 9,
                border:
                  '1px solid rgba(255,255,255,.15)',
                background:
                  '#0b1220',
                color: '#fff',
                outline: 'none',
              }}
            />

            {/* GEM PRICE */}

            {buyMode ===
              'gems' && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 10,
                  background:
                    'rgba(255,215,0,.07)',
                  border:
                    '1px solid rgba(255,215,0,.18)',
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
                  Price
                </div>

                <div
                  style={{
                    marginTop: 5,
                    color:
                      '#ffd700',
                    fontSize:
                      '1.15rem',
                    fontWeight: 900,
                  }}
                >
                  {gemTonPreview >
                  0
                    ? `${fmt(
                        requestedGems
                      )} Gems = ${gemTonPreview} TON`
                    : '100 Gems = 1 TON'}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    color:
                      '#9ca3af',
                    fontSize:
                      '0.72rem',
                  }}
                >
                  1 Gem = 0.01 TON
                </div>
              </div>
            )}

            {message && (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 9,
                  background:
                    message.ok
                      ? 'rgba(34,197,94,.1)'
                      : 'rgba(239,68,68,.1)',
                  border:
                    message.ok
                      ? '1px solid rgba(34,197,94,.25)'
                      : '1px solid rgba(239,68,68,.25)',
                  color:
                    message.ok
                      ? '#86efac'
                      : '#fca5a5',
                  fontSize:
                    '0.8rem',
                  fontWeight: 700,
                }}
              >
                {
                  message.text
                }
              </div>
            )}

            <button
              type="button"
              disabled
              title="Currency purchase is currently locked"
              onClick={() =>
                void doBuy(
                  buyMode
                )
              }
              style={{
                width: '100%',
                marginTop: 18,
                padding:
                  '12px 16px',
                border: 'none',
                borderRadius: 10,
                background:
                  '#22c55e',
                color:
                  '#04130a',
                cursor:
                  'not-allowed',
                opacity: 0.55,
                fontWeight: 900,
              }}
            >
              🔒 PURCHASE LOCKED
            </button>

            <button
              type="button"
              onClick={() =>
                setBuyMode(
                  null
                )
              }
              style={{
                width: '100%',
                marginTop: 8,
                padding:
                  '10px 16px',
                border: 'none',
                borderRadius: 10,
                background:
                  'rgba(255,255,255,.07)',
                color: '#fff',
                cursor:
                  'pointer',
                fontWeight: 700,
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </>
  );
}