const TILE = 56;
const GAP = 2;

// Island grows with player level:
// Level 1 → 3x3 small island
// Level 2 → 5x5 more space
// Level 3 → 7x7 bigger island
const ISLAND_SIZES: Record<number, number> = {
  1: 3,
  2: 5,
  3: 7,
};

interface PlayerIslandProps {
  level: number;
  playerX?: number;
  playerY?: number;
}

/**
 * Raw pixel-art island. Empty tiles only – ready for future sprites.
 * Pixel-art depth is built with stacked box-shadows (dirt → stone → shadow),
 * giving a 3D floating-island edge without any sprites/emojis inside.
 */
export function PlayerIsland({ level, playerX, playerY }: PlayerIslandProps) {
  const grid = ISLAND_SIZES[level] ?? 5;
  const total = grid * grid;

  const tiles = Array.from({ length: total }, (_, i) => {
    const x = i % grid;
    const y = Math.floor(i / grid);
    const isPlayer = playerX === x && playerY === y;

    return (
      <div
        key={i}
        data-tile-x={x}
        data-tile-y={y}
        style={{
          width: TILE,
          height: TILE,
          // Subtle checkerboard so each tile is clearly distinct
          background: (x + y) % 2 === 0 ? '#57a34a' : '#4d9a3f',
          boxShadow:
            'inset 2px 2px 0 rgba(255,255,255,0.06), inset -2px -2px 0 rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
        }}
      >
        {isPlayer ? '🧑‍🌾' : null}
      </div>
    );
  });

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        // Reserve space for the pixel-art edge layers (dirt/stone/shadow offset)
        margin: '0 30px 30px 0',
        imageRendering: 'pixelated',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${grid}, ${TILE}px)`,
          gap: GAP,
          padding: 4,
          background: '#55a544', // grass surface
          // Pixel-art "underground" edges visible on bottom/right:
          // dirt → dark soil → stone → shadow
          boxShadow: `
            0 6px 0 #7a5230,
            0 12px 0 #5c4030,
            0 18px 0 #3a3a3a,
            0 26px 0 rgba(0,0,0,0.55),
            6px 6px 0 #7a5230,
            6px 12px 0 #5c4030,
            6px 18px 0 #3a3a3a,
            6px 26px 0 rgba(0,0,0,0.55)
          `,
        }}
      >
        {tiles}
      </div>
    </div>
  );
}