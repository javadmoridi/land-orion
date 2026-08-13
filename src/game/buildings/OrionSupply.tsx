import { useState } from 'react';
import { GRID_SIZE } from '../placementGridUtil';
import { TOOLS, type ToolDef } from '../toolCatalog';
import { useGameStore } from '../useGameStore';
import { useResourceStore } from '../../economy/resourceStore';

const IMAGE = '/assets/orion-supply.png';

const WIDTH = 10;
const HEIGHT = 10;

interface Props {
  x?: number;
  y?: number;
}

/** Orion Supply — the Tool Shop. */
export function OrionSupply({ x = 20, y = 11 }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const coins = useResourceStore((s) => s.resources.coins);
  const spendCoins = useResourceStore((s) => s.spendCoins);
  const gameState = useGameStore((s) => s.gameState);
  const addToInventory = useGameStore((s) => s.addToInventory);
  const spendResource = useGameStore((s) => s.spendResource);

  const resources = gameState?.resources ?? {};

  function canAfford(cost: ToolDef['cost']): boolean {
    if (coins < (cost.coins ?? 0)) return false;
    if ((resources.wood ?? 0) < (cost.wood ?? 0)) return false;
    if ((resources.stone ?? 0) < (cost.stone ?? 0)) return false;
    if ((resources.iron ?? 0) < (cost.iron ?? 0)) return false;
    if ((resources.gold ?? 0) < (cost.gold ?? 0)) return false;
    return true;
  }

  function buy(tool: ToolDef) {
    if (!canAfford(tool.cost)) {
      setMessage('Not enough resources.');
      return;
    }

    if (tool.cost.coins) spendCoins(tool.cost.coins);
    if (tool.cost.wood) spendResource('wood', tool.cost.wood);
    if (tool.cost.stone) spendResource('stone', tool.cost.stone);
    if (tool.cost.iron) spendResource('iron', tool.cost.iron);
    if (tool.cost.gold) spendResource('gold', tool.cost.gold);

    addToInventory({
      id: tool.id,
      name: tool.name,
      type: 'tool',
      quantity: 1,
      image: tool.image,
    });

    setMessage(`${tool.name} purchased!`);
  }

  function costText(cost: ToolDef['cost']): string {
    const parts: string[] = [];
    if (cost.coins) parts.push(`${cost.coins} Coins`);
    if (cost.wood) parts.push(`${cost.wood} Wood`);
    if (cost.stone) parts.push(`${cost.stone} Stone`);
    if (cost.iron) parts.push(`${cost.iron} Iron`);
    if (cost.gold) parts.push(`${cost.gold} Gold`);
    return parts.join(' + ');
  }

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',
          left: `${(x / GRID_SIZE) * 100}%`,
          top: `${(y / GRID_SIZE) * 100}%`,
          width: `${(WIDTH / GRID_SIZE) * 100}%`,
          height: `${(HEIGHT / GRID_SIZE) * 100}%`,
          zIndex: 3,
          cursor: 'pointer',
        }}
      >
        <img
          src={IMAGE}
          alt="Orion Supply"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.6)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#171717',
              color: 'white',
              padding: 25,
              borderRadius: 15,
              width: 'min(560px, 94vw)',
              maxHeight: '88vh',
              overflow: 'auto',
            }}
          >
            <h2 style={{ marginTop: 0 }}>🛠 Orion Supply — Tools</h2>

            <p style={{ fontSize: '0.8rem', color: '#9fb0d0' }}>
              🪙 {coins} · 🪵 Wood {resources.wood ?? 0} · 🪨 Stone{' '}
              {resources.stone ?? 0} · ⛏️ Iron {resources.iron ?? 0} · ✨ Gold{' '}
              {resources.gold ?? 0}
            </p>

            {TOOLS.map((tool) => (
              <div
                key={tool.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 12,
                  padding: '8px 12px',
                  marginBottom: 8,
                }}
              >
                <img
                  src={tool.image}
                  alt={tool.name}
                  width={48}
                  height={48}
                  draggable={false}
                  style={{ imageRendering: 'pixelated' }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{tool.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#ffd700' }}>
                    {costText(tool.cost)}
                  </div>
                </div>

                <button
                  disabled={!canAfford(tool.cost)}
                  onClick={() => buy(tool)}
                  style={{
                    cursor: canAfford(tool.cost) ? 'pointer' : 'not-allowed',
                    padding: '6px 16px',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 700,
                    background: canAfford(tool.cost) ? '#ffd700' : 'rgba(255,255,255,0.1)',
                    color: canAfford(tool.cost) ? '#0b1220' : '#9fb0d0',
                  }}
                >
                  Buy
                </button>
              </div>
            ))}

            {message && (
              <p style={{ color: '#ffd700', margin: '8px 0' }}>{message}</p>
            )}

            <button
              onClick={() => setOpen(false)}
              style={{ marginTop: 10, padding: '8px 20px', cursor: 'pointer' }}
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </>
  );
}