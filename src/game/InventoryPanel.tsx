import { useState } from 'react';
import { useGameStore } from './useGameStore';
import { useResourceStore } from '../economy/resourceStore';
import { useGemStore } from '../economy/gemStore';
import { RARITY_LABEL, rarityColor } from './orionCatalog';
import type { EggRarity } from './eggCatalog';

const IMAGE = '/assets/inventory-icon.png';

interface InvRow {
  id: string;
  name: string;
  quantity: number;
  rarity?: string;
  level?: number;
  image?: string;
}

export interface InventoryPanelProps {
  /** Controlled open flag. When provided, the panel is controlled by the parent. */
  open?: boolean;
  /** Called when the panel requests to close. */
  onClose?: () => void;
}

export function InventoryPanel({
  open: openProp,
  onClose,
}: InventoryPanelProps = {}) {

  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;

  function toggle() {
    if (openProp !== undefined) return;
    setInternalOpen((o) => !o);
  }

  function close() {
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  }

  const gameState = useGameStore((s) => s.gameState);
  const { coins, tokens } = useResourceStore((s) => s.resources);
  const gems = useGemStore((s) => s.gems);

  const inventory = gameState?.inventory ?? [];
  const harvested = gameState?.resources ?? {};

  const eggs = inventory.filter((i) => i.type === 'egg');
  const orions = inventory.filter((i) => i.type === 'orion');
    const seeds = inventory.filter((i) => i.type === 'seed');
  const tools = inventory.filter((i) => i.type === 'tool');
  const fruits = inventory.filter((i) => i.type === 'fruit');
  const other = inventory.filter(
    (i) =>
      i.type !== 'egg' &&
      i.type !== 'orion' &&
      i.type !== 'seed' &&
      i.type !== 'tool' &&
      i.type !== 'fruit'
  );

  function ItemRow({ item }: { item: InvRow }) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 10,
          padding: '6px 10px',
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            width={36}
            height={36}
            draggable={false}
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            📦
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>
            {item.name}
            {item.level ? ` · Lv.${item.level}` : ''}
          </div>

          {item.rarity && (
            <div
              style={{
                fontSize: '0.7rem',
                color: rarityColor(item.rarity as any),
              }}
            >
              {RARITY_LABEL[item.rarity as EggRarity] ?? item.rarity}
            </div>
          )}
        </div>

        <div style={{ color: '#ffd700', fontWeight: 700 }}>
          ×{item.quantity}
        </div>
      </div>
    );
  }

  function Section({ title, items }: { title: string; items: InvRow[] }) {
    return (
      <section style={{ marginBottom: 14 }}>
        <h3 style={{ margin: '6px 0' }}>{title}</h3>

        {items.length === 0 ? (
          <p style={{ color: '#9fb0d0', fontSize: '0.8rem' }}>Empty</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((item) => (
              <ItemRow key={`${item.id}-${item.name}`} item={item} />
            ))}
          </div>
        )}
      </section>
    );
  }

  const resources: InvRow[] = [
    { id: 'coins', name: '🪙 Coins', quantity: coins },
    { id: 'tokens', name: '💎 Orion Token', quantity: tokens },
    { id: 'gems', name: '💠 Gems', quantity: gems },
    { id: 'wood', name: '🪵 Wood', quantity: harvested.wood ?? 0 },
    { id: 'stone', name: '🪨 Stone', quantity: harvested.stone ?? 0 },
    { id: 'iron', name: '⛏️ Iron', quantity: harvested.iron ?? 0 },
    { id: 'gold', name: '✨ Gold', quantity: harvested.gold ?? 0 },
        { id: 'crystal', name: '🔮 Crystal', quantity: harvested.crystal ?? 0 },
  ];

  return (
    <>
      {openProp === undefined && (
        <div
          onClick={toggle}
          style={{
            position: 'fixed',
            left: 20,
            top: 20,
            width: 95,
            height: 95,
            cursor: 'pointer',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={IMAGE}
            alt="Inventory"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              display: 'block',
            }}
          />
        </div>
      )}


      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.65)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(650px, 94vw)',
              maxHeight: '82vh',
              overflow: 'auto',
              background: '#171717',
              color: 'white',
              padding: 25,
              borderRadius: 16,
              border: '1px solid #444',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Orion Inventory</h2>

            <Section title="💰 Resources" items={resources} />
            <Section title="🛠 Tools" items={tools as any} />
            <Section title="🥚 Eggs" items={eggs as any} />
            <Section title="🐣 Orions" items={orions as any} />
                        <Section title="🌱 Seeds" items={seeds as any} />
            <Section title="🍎 Fruits" items={fruits as any} />
            <Section title="📦 Items" items={other as any} />

            <button
              onClick={close}
              style={{ marginTop: 20, padding: '10px 25px', cursor: 'pointer' }}
            >
              Exit
            </button>

          </div>
        </div>
      )}
    </>
  );
}
