import { useState } from 'react';
import type { CSSProperties } from 'react';

import { useResourceStore } from '../economy/resourceStore';
import { useGemStore } from '../economy/gemStore';

import { CurrencyIcon } from './currencyIcons';
import { InventoryPanel } from './InventoryPanel';
import { QuestPanel } from './QuestPanel';

const COINS_PER_ORION = 100;
const ORION_PER_GEM = 10;
const TON_PER_GEM = 0.01;

type BuyMode = 'coins' | 'orion' | 'gems' | null;

function fmt(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function ResourceBar() {
  const { resources, addCoins, addTokens, spendTokens } =
    useResourceStore((s) => s);
  const { gems, addGems, spendGems } = useGemStore((s) => s);

  const [invOpen, setInvOpen] = useState(false);
  const [questOpen, setQuestOpen] = useState(false);
  const [buyMode, setBuyMode] = useState<BuyMode>(null);

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const barStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 9000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.6rem 0.35rem',
  };

  const itemStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.2rem',
    color: '#f3f6ff',
    fontSize: '0.72rem',
    fontWeight: 600,
  };

  const iconBtnStyle: CSSProperties = {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.08)',
  };

  const plusBtnStyle: CSSProperties = {
    width: 20,
    height: 20,
    border: 'none',
    borderRadius: 50,
    background: '#2ecc71',
    cursor: 'pointer',
  };

  function openBuy(mode: Exclude<BuyMode, null>) {
    setBuyMode(mode);
    setAmount('');
    setMessage(null);
  }

  function requiredFor(coins: number) {
    return coins / COINS_PER_ORION;
  }

  function doBuy(mode: Exclude<BuyMode, null>) {
    setMessage(null);

    const n = Number(amount);

    if (!Number.isFinite(n) || n <= 0) {
      setMessage({ ok: false, text: 'Enter valid number.' });
      return;
    }

    if (mode === 'coins') {
      const tokenCost = n / COINS_PER_ORION;

      if (!spendTokens(tokenCost)) {
        setMessage({ ok: false, text: 'Not enough Orion.' });
        return;
      }

      addCoins(n);
      setMessage({ ok: true, text: `Bought ${n} coins.` });

    } else if (mode === 'orion') {

      const gemCost = n / ORION_PER_GEM;

      if (!spendGems(gemCost)) {
        setMessage({ ok: false, text: 'Not enough Gems.' });
        return;
      }

      addTokens(n);
      setMessage({ ok: true, text: `Bought ${n} Orion.` });

    } else {

      addGems(n);

      setMessage({
        ok: true,
        text: `Bought ${n} Gems.`,
      });
    }
  }  return (
    <>
      <div style={barStyle}>

        <button
          onClick={() => setInvOpen(true)}
          style={iconBtnStyle}
          title="Inventory"
        >
          <img
            src="/assets/inventory-icon.png"
            alt="Inventory"
            style={{ width: 32, height: 32 }}
          />
        </button>

        <button
          onClick={() => setQuestOpen(true)}
          style={iconBtnStyle}
          title="Quests"
        >
          📜
        </button>


        {/* Coins */}
        <div style={itemStyle}>
          <CurrencyIcon type="coin" size={18} />

          <span>
            {fmt(resources.coins)}
          </span>

          <button
            style={plusBtnStyle}
            onClick={() => openBuy('coins')}
          >
            +
          </button>
        </div>


        {/* Orion Token */}
        <div style={itemStyle}>
          <CurrencyIcon type="token" size={18} />

          <span>
            {fmt(resources.tokens)}
          </span>

          <button
            style={plusBtnStyle}
            onClick={() => openBuy('orion')}
          >
            +
          </button>
        </div>


        {/* Gems */}
        <div style={itemStyle}>
          <CurrencyIcon type="gem" size={18} />

          <span>
            {fmt(gems)}
          </span>

          <button
            style={plusBtnStyle}
            onClick={() => openBuy('gems')}
          >
            +
          </button>
        </div>

      </div>


      <InventoryPanel
        open={invOpen}
        onClose={() => setInvOpen(false)}
      />


      <QuestPanel
        open={questOpen}
        onClose={() => setQuestOpen(false)}
      />


      {buyMode && (
        <div
          onClick={() => setBuyMode(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:'#111827',
              padding:'20px',
              borderRadius:'12px',
            }}
          >

            <h2>
              Buy
            </h2>


            <input
              type="number"
              value={amount}
              onChange={(e)=>setAmount(e.target.value)}
            />


            <button
              onClick={() => doBuy(buyMode)}
            >
              Confirm
            </button>


            {message && (
              <p>
                {message.text}
              </p>
            )}

          </div>

        </div>
      )}

    </>
  );
}