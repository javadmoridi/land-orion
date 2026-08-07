import { BuildingBase } from './BuildingBase';
import { useIncubatorStore } from '../incubatorStore';
import { getEggById } from '../eggCatalog';
import { useGameStore } from '../useGameStore';

const INCUBATOR_IMAGE = '/assets/orion-incubator.png';

interface IncubatorProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * Orion Incubator building. Clicking it opens the machine panel.
 *
 * Currently Level 1 with a single egg slot. The player picks a purchased egg
 * from their inventory and places it in the slot. The slot model is already
 * ready for future levels, more slots, timers and a hatch system.
 */
export function Incubator({ x = 10, y = 5, width = 3, height = 3 }: IncubatorProps) {
  const level = useIncubatorStore((s) => s.level);
  const slots = useIncubatorStore((s) => s.slots);
  const placeEgg = useIncubatorStore((s) => s.placeEgg);
  const removeEgg = useIncubatorStore((s) => s.removeEgg);

  const inventory = useGameStore((s) => s.gameState?.inventory ?? []);
  const ownedEggs = inventory.filter((item) => item.type === 'egg');

  return (
    <BuildingBase
      id="incubator"
      image={INCUBATOR_IMAGE}
      alt="Orion Incubator"
      title="🦖 Orion Incubator"
      x={x}
      y={y}
      width={width}
      height={height}
    >
      <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#9fb0d0' }}>
        Level <strong style={{ color: '#ffd700' }}>{level}</strong> ·{' '}
        {slots.length} egg slot{slots.length === 1 ? '' : 's'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {slots.map((slot) => {
          const placed = getEggById(slot.eggId);
          return (
            <div
              key={slot.id}
              style={{
                padding: '0.9rem',
                borderRadius: 12,
                border: '2px dashed rgba(255,215,0,0.4)',
                background: placed ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#8fb5ff', marginBottom: '0.5rem' }}>
                Egg Slot {slot.id}
              </div>

              {placed ? (
                <>
                  <img
                    src={placed.image}
                    alt={placed.name}
                    draggable={false}
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                    }}
                  />
                  <div style={{ fontWeight: 700, color: '#f3f6ff', marginTop: '0.25rem' }}>
                    {placed.name}
                  </div>
                  <button
                    onClick={() => removeEgg(slot.id)}
                    style={{
                      marginTop: '0.5rem',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0.4rem 0.9rem',
                      fontWeight: 700,
                      background: 'rgba(255,80,80,0.2)',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                    }}
                  >
                    Take out
                  </button>
                </>
              ) : (
                <div style={{ color: '#6b7c99', fontSize: '0.85rem', padding: '0.75rem 0' }}>
                  Empty — choose an egg below
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.9rem', color: '#ffd700', fontWeight: 700, marginBottom: '0.5rem' }}>
          Your Eggs
        </div>

        {ownedEggs.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: '#9fb0d0' }}>
            You don&apos;t have any eggs yet. Buy them from the Egg Shop.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {ownedEggs.map((egg) => {
              const def = getEggById(egg.id);
              const used = slots.some((s) => s.eggId === egg.id);
              return (
                <button
                  key={egg.id}
                  onClick={() => placeEgg(slots[0]?.id ?? 1, egg.id)}
                  disabled={used}
                  title={`${egg.name} (x${egg.quantity})`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10,
                    padding: '0.4rem',
                    background: used ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                    cursor: used ? 'not-allowed' : 'pointer',
                  }}
                >
                  {def && (
                    <img
                      src={def.image}
                      alt={def.name}
                      draggable={false}
                      style={{
                        width: 44,
                        height: 44,
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                      }}
                    />
                  )}
                  <span style={{ fontSize: '0.7rem', color: used ? '#6b7c99' : '#f3f6ff' }}>
                    {egg.name.replace('Orion ', '')} ×{egg.quantity}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </BuildingBase>
  );
}
