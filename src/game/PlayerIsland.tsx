// Land piece image – replace this file to change the land piece:
// public/assets/land-tile.png
const LAND_PIECE_IMAGE = '/assets/land-tile.png';

// Each land piece has an invisible 3x3 grid (9 usable slots) for logic only
const INNER_GRID = 3;
const PIECE_SIZE = 200;

interface PlayerIslandProps {
  level: number;
  playerX?: number;
  playerY?: number;
}

/**
 * Season 1 - Beginner land layout:
 *
 * [ LAND ][ LAND ][ LOCK ]
 *
 * - 2 active land pieces (land-piece.png) side by side, no borders/outlines
 * - 1 locked piece shown as dashed outline + Unlock button
 * - Each active piece has an invisible 3x3 grid (9 slots) for future items
 */
export function PlayerIsland({ level }: PlayerIslandProps) {
  // Season 1 (level 1): 2 active + 1 locked.
  // Future seasons expand from here based on level (logic only, not shown in UI).
  const activePieces = level >= 2 ? 3 : 2;
  const totalPieces = 3;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        gap: 0, // pieces sit flush together
      }}
    >
      {Array.from({ length: totalPieces }, (_, index) => {
        const isActive = index < activePieces;

        if (!isActive) {
          // Locked piece – dashed outline + Unlock button only
          return (
            <div
              key={index}
              data-piece={index}
              data-locked="true"
              style={{
                width: PIECE_SIZE,
                height: PIECE_SIZE,
                border: '3px dashed rgba(255, 215, 0, 0.5)',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.15)',
                gap: 8,
              }}
            >
              <span style={{ color: 'rgba(255, 215, 0, 0.6)', fontSize: '1.5rem' }}>🔒</span>
              <button
                // Stub: connect to an item-consume unlock system later.
                onClick={() => {
                  // TODO: unlock item system
                  console.log(`[PlayerIsland] unlock requested for piece #${index}`);
                }}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: 6,
                  border: '1px solid rgba(255, 215, 0, 0.5)',
                  background: 'rgba(255, 215, 0, 0.12)',
                  color: '#ffd700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Unlock
              </button>
            </div>
          );
        }

        // Active piece – full land-piece.png image, no borders/outlines
        return (
          <div
            key={index}
            data-piece={index}
            style={{
              position: 'relative',
              width: PIECE_SIZE,
              height: PIECE_SIZE,
              backgroundImage: `url(${LAND_PIECE_IMAGE})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              imageRendering: 'pixelated',
            }}
          >
            {/* Invisible 3x3 grid (9 slots) – logic only, not visible */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                gridTemplateColumns: `repeat(${INNER_GRID}, 1fr)`,
                gridTemplateRows: `repeat(${INNER_GRID}, 1fr)`,
                pointerEvents: 'none',
              }}
            >
              {Array.from({ length: INNER_GRID * INNER_GRID }, (_, slot) => (
                <div
                  key={slot}
                  data-piece={index}
                  data-slot={slot}
                  style={{ opacity: 0 }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}