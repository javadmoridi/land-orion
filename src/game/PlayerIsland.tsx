// Land tile image – replace this file to change the land tile:
// public/assets/land-tile.png
const LAND_TILE_IMAGE = '/assets/land-tile.png';

// Each land tile has an inner 3x3 usable grid (9 slots)
const INNER_GRID = 3;
const SLOT_SIZE = 40;

interface PlayerIslandProps {
  level: number;
  playerX?: number;
  playerY?: number;
}

/**
 * Player's land system:
 * - 2 active land tiles (from land-tile.png) side by side → one unified land
 * - 1 locked tile shown as a dashed outline (future unlock)
 * - Each active tile has an inner 3x3 usable grid (9 slots) for future sprites
 */
export function PlayerIsland({ level }: PlayerIslandProps) {
  // Unlock more tiles as level increases:
  // Level 1 → 2 active + 1 locked
  // Level 2+ → 3 active (all unlocked)
  const activeTiles = level >= 2 ? 3 : 2;
  const totalTiles = 3;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      {Array.from({ length: totalTiles }, (_, tileIndex) => {
        const isActive = tileIndex < activeTiles;

        if (!isActive) {
          // Locked tile – dashed outline, no items inside
          return (
            <div
              key={tileIndex}
              style={{
                width: 200,
                height: 200,
                border: '3px dashed rgba(255, 215, 0, 0.5)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.15)',
                color: 'rgba(255, 215, 0, 0.6)',
                fontSize: '0.85rem',
                textAlign: 'center',
                padding: '0.5rem',
              }}
            >
              🔒<br />Unlocks with level
            </div>
          );
        }

        // Active tile – land-tile.png with inner 3x3 empty grid
        return (
          <div
            key={tileIndex}
            style={{
              position: 'relative',
              width: 200,
              height: 200,
              backgroundImage: `url(${LAND_TILE_IMAGE})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              imageRendering: 'pixelated',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Inner 3x3 usable grid (9 empty slots) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${INNER_GRID}, ${SLOT_SIZE}px)`,
                gridTemplateRows: `repeat(${INNER_GRID}, ${SLOT_SIZE}px)`,
                gap: 2,
              }}
            >
              {Array.from({ length: INNER_GRID * INNER_GRID }, (_, slot) => (
                <div
                  key={slot}
                  data-tile={tileIndex}
                  data-slot={slot}
                  style={{
                    width: SLOT_SIZE,
                    height: SLOT_SIZE,
                    background: 'rgba(0,0,0,0.08)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}