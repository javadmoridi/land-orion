// Land piece image – replace this file to change the land piece:
// public/assets/land-piece.png
const LAND_PIECE_IMAGE = '/assets/land-piece.png';

// Each land piece has an invisible 3x3 grid (9 usable slots) for logic only
const INNER_GRID = 3;

// ---------------------------------------------------------------------------
// SEASONS
// ---------------------------------------------------------------------------
export type SeasonName = 'beginner' | 'fast' | 'pro' | 'master';

export interface SeasonConfig {
  name: SeasonName;
  label: string;
  unlockedPieces: number;
  // Grid size the unlocked pieces expand into (square grid, natural expansion)
  gridCols: number;
  gridRows: number;
}

export const SEASONS: Record<SeasonName, SeasonConfig> = {
  beginner: {
    name: 'beginner',
    label: 'Season 1 - Beginner',
    unlockedPieces: 2,
    gridCols: 2,
    gridRows: 2,
  },
  fast: {
    name: 'fast',
    label: 'Season 2 - Fast',
    unlockedPieces: 8,
    gridCols: 3,
    gridRows: 3,
  },
  pro: {
    name: 'pro',
    label: 'Season 3 - Pro',
    unlockedPieces: 13,
    gridCols: 4,
    gridRows: 4,
  },
  master: {
    name: 'master',
    label: 'Season 4 - Master',
    unlockedPieces: 25,
    gridCols: 5,
    gridRows: 5,
  },
};

// Map player level → season
export function getSeasonForLevel(level: number): SeasonConfig {
  if (level >= 6) return SEASONS.master;
  if (level >= 4) return SEASONS.pro;
  if (level >= 2) return SEASONS.fast;
  return SEASONS.beginner;
}

// ---------------------------------------------------------------------------
// PIECE SIZING
// ---------------------------------------------------------------------------
const PIECE_SIZE = 200;

interface PlayerIslandProps {
  level: number;
  playerX?: number;
  playerY?: number;
  seasonOverride?: SeasonName;
}

/**
 * Seasonal land expansion (farming-style grid):
 *
 * Season 1 - Beginner: 2 active pieces
 * Season 2 - Fast:     8 active pieces
 * Season 3 - Pro:      13 active pieces
 * Season 4 - Master:   25 active pieces
 *
 * Pieces always expand into a square/natural grid (never linear).
 * Each active piece is a full land-piece.png image with an invisible
 * 3x3 grid (9 slots) for future item placement.
 *
 * Locked pieces are shown as dashed outlines with an "Unlock" button.
 * The unlock system is stubbed – ready to be connected to an item-consume
 * system in the future.
 */
export function PlayerIsland({ level, seasonOverride }: PlayerIslandProps) {
  const season = seasonOverride ? SEASONS[seasonOverride] : getSeasonForLevel(level);

  const { unlockedPieces, gridCols, gridRows } = season;
  const totalCells = gridCols * gridRows;

  // Build the grid cells (active first, then locked)
  const cells = Array.from({ length: totalCells }, (_, i) => ({
    index: i,
    isActive: i < unlockedPieces,
  }));

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        gap: 12,
      }}
    >
      {/* Season label (debug – can be hidden later) */}
      <div
        style={{
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.6)',
          background: 'rgba(0,0,0,0.4)',
          padding: '0.25rem 0.75rem',
          borderRadius: 999,
        }}
      >
        {season.label}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, ${PIECE_SIZE}px)`,
          gridTemplateRows: `repeat(${gridRows}, ${PIECE_SIZE}px)`,
          gap: 6,
        }}
      >
        {cells.map(({ index, isActive }) => {
          if (!isActive) {
            // Locked piece – dashed outline + Unlock button
            return (
              <div
                key={index}
                data-piece={index}
                data-locked="true"
                style={{
                  width: PIECE_SIZE,
                  height: PIECE_SIZE,
                  border: '3px dashed rgba(255, 215, 0, 0.4)',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.12)',
                  gap: 8,
                }}
              >
                <span style={{ color: 'rgba(255, 215, 0, 0.6)' }}>🔒</span>
                <button
                  // Stub: connect to an item-consume unlock system later.
                  // e.g. onUnlockPiece(pieceIndex) when the player has the required items.
                  onClick={() => {
                    // TODO: season unlock item system
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

          // Active piece – full land-piece.png image
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
                borderRadius: 8,
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
                    style={{
                      // Invisible – only for future item placement logic
                      opacity: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}