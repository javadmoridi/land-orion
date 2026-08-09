import { useState } from 'react';

const TREE_IMAGE = '/assets/tree.png';
const TREE_CUT_IMAGE = '/assets/tree-cut.png';

const GRID_SIZE = 14;

interface Props {
  x: number;
  y: number;
}

const WIDTH = 2;
const HEIGHT = 2;

export function Tree({ x, y }: Props) {

  const [hits, setHits] = useState(0);
  const [cut, setCut] = useState(false);
  const [shake, setShake] = useState(false);

  function hitTree() {
    if (cut) return;

    const next = hits + 1;
    setHits(next);

    setShake(true);

    setTimeout(() => {
      setShake(false);
    }, 150);

    if (next >= 3) {
      setCut(true);
    }
  }

  return (
    <div
      onClick={hitTree}
      style={{
        position: 'absolute',

        left: `${(x / GRID_SIZE) * 100}%`,
        top: `${(y / GRID_SIZE) * 100}%`,

        width: `${(WIDTH / GRID_SIZE) * 100}%`,
        height: `${(HEIGHT / GRID_SIZE) * 100}%`,

        zIndex: 3,
        cursor: 'pointer',

        transform: shake
          ? 'translateX(-4px)'
          : 'translateX(0)',

        transition: 'transform .08s',
      }}
    >
      <img
        src={cut ? TREE_CUT_IMAGE : TREE_IMAGE}
        alt="Tree"
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
  );
}