import { useState } from 'react';
import { EGGS, type EggDef } from './eggCatalog';
import { useResourceStore } from '../economy/resourceStore';
import { useGameStore } from './useGameStore';
import { Incubator } from './buildings/Incubator';
import type { InventoryItem } from '../types';

const IMAGE = '/assets/egg-nest.png';

const GRID_SIZE = 14;
const WIDTH = 4;
const HEIGHT = 4;

interface Props {
  x?: number;
  y?: number;
}

export function EggShop({ x = 9, y = 3 }: Props) {
  const tokens = useResourceStore((s) => s.resources.tokens);
  const spendTokens = useResourceStore((s) => s.spendTokens);
  const addToInventory = useGameStore((s) => s.addToInventory);

  const [openShop, setOpenShop] = useState(false);
  const [message, setMessage] = useState('');

  function buyEgg(egg: EggDef) {
    if (!spendTokens(egg.price)) {
      setMessage('Not enough Orion Token');
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
    setMessage(`${egg.name} added`);
  }

  return (
    <>
      <div
        onClick={() => setOpenShop(true)}
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
          alt="Egg Shop"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {openShop && (
        <div
          onClick={() => setOpenShop(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.5)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#222',
              color: 'white',
              padding: 20,
              borderRadius: 12,
            }}
          >
            <h2>Egg Shop</h2>

            <p>
              Orion Token: {tokens}
            </p>

            {EGGS.map((egg) => (
              <div
                key={egg.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <img
                  src={egg.image}
                  alt={egg.name}
                  width={50}
                  height={50}
                />

                <span>
                  {egg.name} - Orion Token {egg.price}
                </span>

                <button onClick={() => buyEgg(egg)}>
                  Buy
                </button>
              </div>
            ))}

            <hr />

            <h3>Incubator</h3>
            <Incubator />

            {message && <p>{message}</p>}

            <button onClick={() => setOpenShop(false)}>
              Exit
            </button>
          </div>
        </div>
      )}
    </>
  );
}