// Player island image – replace this file to change the island:
// public/assets/player-island.png
const PLAYER_ISLAND_IMAGE = '/assets/player-island.png';

interface PlayerIslandProps {
  level: number;
  playerX?: number;
  playerY?: number;
}

/**
 * Player's land island rendered from a pixel-art image.
 * The image is centered in the game world and ready for future
 * pixel sprites to be placed on top of it.
 */
export function PlayerIsland({ level }: PlayerIslandProps) {
  // Island grows with player level (kept for future logic):
  // Level 1 → small, Level 2 → medium, Level 3+ → large
  const scale = level >= 3 ? 1.2 : level === 2 ? 1.1 : 1;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}
    >
      <img
        src={PLAYER_ISLAND_IMAGE}
        alt="Player Island"
        draggable={false}
        style={{
          maxWidth: '90vw',
          maxHeight: '70vh',
          width: 'auto',
          height: 'auto',
          transform: `scale(${scale})`,
          imageRendering: 'pixelated',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}