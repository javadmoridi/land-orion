import { useState } from 'react';
import { useGameStore } from './useGameStore';
import { useResourceStore } from '../economy/resourceStore';

const IMAGE = '/assets/inventory-icon.png';

const RESOURCE_IMAGES: Record<string, string> = {
  wood: '/assets/wood.png',
  stone: '/assets/stone.png',
  iron: '/assets/iron.png',
  gold: '/assets/gold.png',
  crystal: '/assets/crystal.png',
  water: '/assets/orion-element-water.png',
  air: '/assets/orion-element-air.png',
  earth: '/assets/orion-element-earth.png',
  fire: '/assets/orion-element-fire.png',
};

interface InvRow {
  id: string;
  name: string;
  quantity: number;
  image?: string;
}

export interface InventoryPanelProps {
  open?: boolean;
  onClose?: () => void;
}

export function InventoryPanel({
  open: openProp,
  onClose,
}: InventoryPanelProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = openProp ?? internalOpen;

  const gameState = useGameStore((s) => s.gameState);

  // Resources from the economy/resource store
  const playerResources = useResourceStore(
    (s) => s.resources
  );

  /*
   * IMPORTANT:
   * Harvested resources are currently stored in:
   * gameState.resources
   *
   * while some other resources are stored in:
   * resourceStore.resources
   *
   * Therefore we read BOTH.
   */
  const harvestedResources =
    gameState?.resources ?? {};

  const inventory =
    gameState?.inventory ?? [];

  const seeds = inventory.filter(
    (i) => i.type === 'seed'
  );

  const tools = inventory.filter(
    (i) => i.type === 'tool'
  );

  const fruits = inventory.filter(
    (i) => i.type === 'fruit'
  );

  function toggle() {
    if (openProp !== undefined) return;

    setInternalOpen((value) => !value);
  }

  function close() {
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  }

  /*
   * Get the real amount of a resource.
   *
   * It combines:
   *
   * resourceStore.resources
   *
   * +
   *
   * gameState.resources
   *
   * This is necessary because harvesting currently writes
   * into gameState.resources.
   */
  function getResourceAmount(
    key: 'wood' | 'stone' | 'iron' | 'gold' | 'crystal'
  ): number {
    const economyAmount =
      Number(
        playerResources?.[key] ?? 0
      );

    const harvestedAmount =
      Number(
        (harvestedResources as Record<string, unknown>)[
          key
        ] ?? 0
      );

    return economyAmount + harvestedAmount;
  }

  function ItemRow({
    item,
  }: {
    item: InvRow;
  }) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background:
            'rgba(255,255,255,0.04)',
          borderRadius: 10,
          padding: '6px 10px',
          minHeight: 48,
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            width={36}
            height={36}
            draggable={false}
            style={{
              imageRendering: 'pixelated',
              objectFit: 'contain',
              display: 'block',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background:
                'rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}
          />
        )}

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: '#fff',
            }}
          >
            {item.name}
          </div>
        </div>

        <div
          style={{
            color: '#ffd700',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          ×{item.quantity}
        </div>
      </div>
    );
  }

  function Section({
    title,
    items,
  }: {
    title: string;
    items: InvRow[];
  }) {
    return (
      <section
        style={{
          marginBottom: 14,
        }}
      >
        <h3
          style={{
            margin: '6px 0 8px',
            color: '#fff',
          }}
        >
          {title}
        </h3>

        {items.length === 0 ? (
          <p
            style={{
              color: '#9fb0d0',
              fontSize: '0.8rem',
              margin: '6px 0',
            }}
          >
            Empty
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {items.map((item) => (
              <ItemRow
                key={`${item.id}-${item.name}`}
                item={item}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  /*
   * REAL RESOURCE INVENTORY
   */
  const resources: InvRow[] = [
    {
      id: 'water',
      name: 'Water',
      quantity: Number(playerResources?.water ?? 0),
      image: RESOURCE_IMAGES.water,
    },

    {
      id: 'air',
      name: 'Wind',
      quantity: Number(playerResources?.air ?? 0),
      image: RESOURCE_IMAGES.air,
    },

    {
      id: 'earth',
      name: 'Earth',
      quantity: Number(playerResources?.earth ?? 0),
      image: RESOURCE_IMAGES.earth,
    },

    {
      id: 'fire',
      name: 'Fire',
      quantity: Number(playerResources?.fire ?? 0),
      image: RESOURCE_IMAGES.fire,
    },

    {
      id: 'wood',
      name: 'Wood',
      quantity: getResourceAmount('wood'),
      image: RESOURCE_IMAGES.wood,
    },

    {
      id: 'stone',
      name: 'Stone',
      quantity: getResourceAmount('stone'),
      image: RESOURCE_IMAGES.stone,
    },

    {
      id: 'iron',
      name: 'Iron',
      quantity: getResourceAmount('iron'),
      image: RESOURCE_IMAGES.iron,
    },

    {
      id: 'gold',
      name: 'Gold',
      quantity: getResourceAmount('gold'),
      image: RESOURCE_IMAGES.gold,
    },

    {
      id: 'crystal',
      name: 'Crystal',
      quantity: getResourceAmount('crystal'),
      image: RESOURCE_IMAGES.crystal,
    },
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
            background:
              'rgba(0,0,0,.65)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: 'min(650px, 94vw)',
              maxHeight: '82vh',
              overflow: 'auto',
              background: '#171717',
              color: 'white',
              padding: 25,
              borderRadius: 16,
              border: '1px solid #444',
              boxSizing: 'border-box',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 20,
              }}
            >
              Orion Inventory
            </h2>

            <Section
              title="Resources"
              items={resources}
            />

            <Section
              title="Tools"
              items={tools as InvRow[]}
            />

            <Section
              title="Seeds"
              items={seeds as InvRow[]}
            />

            <Section
              title="Fruits"
              items={fruits as InvRow[]}
            />

            <button
              type="button"
              onClick={close}
              style={{
                marginTop: 20,
                padding: '10px 25px',
                cursor: 'pointer',
                borderRadius: 8,
                border: '1px solid #555',
                background: '#252525',
                color: '#fff',
              }}
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </>
  );
}