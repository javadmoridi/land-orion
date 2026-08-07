import { useState } from 'react';
import { BuildingBase } from './BuildingBase';
import { EGGS, type EggDef } from '../eggCatalog';
import { useResourceStore } from '../../economy/resourceStore';
import { useGameStore } from '../useGameStore';
import type { InventoryItem } from '../../types';

const EGG_SHOP_IMAGE = '/assets/orion-barracks.png';

interface EggShopProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * Egg Shop building. Clicking it opens a shop panel where the player can buy
 * Orion eggs with Coins. Purchased eggs are added to the player inventory.
 */
export function EggShop({ x = 3, y = 9, width = 3, height = 3 }: EggShopProps) {
  const coins = useResourceStore((s) => s.resources.coins);
  const spendCoins = useResourceStore((s) => s.spendCoins);
  const addToInventory = useGameStore((s) => s.addToInventory);

  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function buyEgg(egg: EggDef) {
    if (!spendCoins(egg.price)) {
      setMessage({ ok: false, text: `Not enough Coins. Need 🪙 ${egg.price}.` });
      return;
    }
    const item: InventoryItem = {
      id: egg.id,
      name: egg.name,
      type: 'egg',
      quantity: 1,
      rarity: egg.rarity,
    };
    addToInventory(item);
    setMessage({ ok: true, text: `${egg.name} added to your inventory!` });
  }

  return (
    <BuildingBase
      id="egg-shop"
      image={EGG_SHOP_IMAGE}
      alt="Egg Shop"
      title="🥚 Egg Shop"
      x={x}
      y={y}
      width={width}
      height={height}
    >
      <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#9fb0d0' }}>
        🪙 Your Coins: <strong style={{ color: '#ffd700' }}>{coins.toLocaleString()}</strong>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {EGGS.map((egg) => {
          const affordable = coins >= egg.price;
          return (
            <div
              key={egg.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <img
                src={egg.image}
                alt={egg.name}
                draggable={false}
                style={{
                  width: 56,
                  height: 56,
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#f3f6ff' }}>{egg.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#9fb0d0' }}>Rarity: {egg.rarity}</div>
                <div style={{ fontSize: '0.85rem', color: '#ffd700' }}>🪙 {egg.price}</div>
              </div>
              <button
                onClick={() => buyEgg(egg)}
                disabled={!affordable}
                style={{
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.45rem 0.8rem',
                  fontWeight: 700,
                  background: affordable ? '#ffd700' : 'rgba(255,255,255,0.1)',
                  color: affordable ? '#0b1220' : '#9fb0d0',
                  cursor: affordable ? 'pointer' : 'not-allowed',
                }}
              >
                Buy
              </button>
            </div>
          );
        })}
      </div>

      {message && (
        <p
          style={{
            marginTop: '0.9rem',
            padding: '0.65rem',
            borderRadius: 8,
            fontSize: '0.85rem',
            background: message.ok ? 'rgba(46,160,67,0.12)' : 'rgba(255,80,80,0.12)',
            border: `1px solid ${message.ok ? 'rgba(46,160,67,0.4)' : 'rgba(255,80,80,0.4)'}`,
            color: message.ok ? '#4cd07d' : '#ff6b6b',
          }}
        >
          {message.text}
        </p>
      )}
    </BuildingBase>
  );
}
