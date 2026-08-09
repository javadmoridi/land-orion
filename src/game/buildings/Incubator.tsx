import { useState } from 'react';
import { useIncubatorStore } from '../incubatorStore';
import { getEggById } from '../eggCatalog';
import { useGameStore } from '../useGameStore';

const INCUBATOR_IMAGE = '/assets/orion-incubator.png';

const GRID_SIZE = 14;

const X = 9;
const Y = 4;

const WIDTH = 4;
const HEIGHT = 4;

const EMPTY_INVENTORY: any[] = [];

export function Incubator() {

  const [open, setOpen] = useState(false);

  const level = useIncubatorStore((s) => s.level);
  const slots = useIncubatorStore((s) => s.slots);
  const placeEgg = useIncubatorStore((s) => s.placeEgg);
  const removeEgg = useIncubatorStore((s) => s.removeEgg);

  const inventory = useGameStore(
    (s) => s.gameState?.inventory ?? EMPTY_INVENTORY
  );

  const ownedEggs = inventory.filter(
    (item) => item.type === 'egg'
  );

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',

          left: `${(X / GRID_SIZE) * 100}%`,
          top: `${(Y / GRID_SIZE) * 100}%`,

          width: `${(WIDTH / GRID_SIZE) * 100}%`,
          height: `${(HEIGHT / GRID_SIZE) * 100}%`,

          zIndex: 3,
          cursor: 'pointer',
        }}
      >
        <img
          src={INCUBATOR_IMAGE}
          alt="Incubator"
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


      {open && (
        <div
          onClick={() => setOpen(false)}
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
              width: 400,
            }}
          >

            <h2>Incubator</h2>

            <p>
              Level {level} · {slots.length} egg slots
            </p>


            {slots.map((slot) => {
              const placed = getEggById(slot.eggId);

              return (
                <div key={slot.id}>

                  {placed ? (
                    <>
                      <img
                        src={placed.image}
                        alt={placed.name}
                        width={72}
                        height={72}
                      />

                      <div>
                        {placed.name}
                      </div>

                      <button
                        onClick={() => removeEgg(slot.id)}
                      >
                        Take out
                      </button>
                    </>
                  ) : (
                    'Empty'
                  )}

                </div>
              );
            })}


            <h3>
              Your Eggs
            </h3>


            {ownedEggs.map((egg) => {
              const def = getEggById(egg.id);

              return (
                <button
                  key={egg.id}
                  onClick={() =>
                    placeEgg(
                      slots[0]?.id ?? 1,
                      egg.id
                    )
                  }
                >
                  {def?.name} ×{egg.quantity}
                </button>
              );
            })}


            <br />

            <button
              onClick={() => setOpen(false)}
            >
              Exit
            </button>

          </div>

        </div>
      )}

    </>
  );
}