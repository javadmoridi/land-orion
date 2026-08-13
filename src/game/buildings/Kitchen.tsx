import { useState } from 'react';
import { GRID_SIZE } from '../placementGridUtil';

const KITCHEN_IMAGE = '/assets/orion-kitchen.png';

const X = 5;
const Y = 4;

const WIDTH = 10;
const HEIGHT = 10;

export function Kitchen() {

  const [open, setOpen] = useState(false);

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
          src={KITCHEN_IMAGE}
          alt="Orion Kitchen"
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
            }}
          >

            <h2>
              🍳 Orion Kitchen
            </h2>

            <p>
              Cooking system coming soon...
            </p>

            <button onClick={() => setOpen(false)}>
              Exit
            </button>

          </div>

        </div>
      )}

    </>
  );
}