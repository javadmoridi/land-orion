// Land piece image – replace this file to change the land piece:
// public/assets/land-tile.png
const LAND_PIECE_IMAGE = '/assets/land-tile.png';

// Each land piece has an invisible 3x3 grid (9 usable slots) for logic only
const INNER_GRID = 3;
const PIECE_SIZE = 200;

// ---------------------------------------------------------------------------
// EXPANSION PATTERN (center-out square grid, max 5x5 = 25 pieces)
// Spiral order starting from the center (2,2).
// ---------------------------------------------------------------------------
const SPIRAL: Array<[number, number]> = [
  [2, 2], // 1
  [3, 2], // 2
  [3, 3], // 3
  [2, 3], // 4
  [1, 3], // 5
  [1, 2], // 6
  [1, 1], // 7
  [2, 1], // 8
  [3, 1], // 9
  [4, 1], // 10
  [4, 2], // 11
  [4, 3], // 12
  [4, 4], // 13
  [3, 4], // 14
  [2, 4], // 15
  [1, 4], // 16
  [0, 4], // 17
  [0, 3], // 18
  [0, 2], // 19
  [0, 1], // 20
  [0, 0], // 21
  [1, 0], // 22
  [2, 0], // 23
  [3, 0], // 24
  [4, 0], // 25
];

const MAX_PIECES = 25;

// ---------------------------------------------------------------------------
// UNLOCK CONDITION ARCHITECTURE
// Each land piece defines its own unlock requirements.
// A piece unlocks ONLY when ALL conditions are satisfied.
// ---------------------------------------------------------------------------
export interface UnlockResourceRequirement {
  resource: string; // e.g. 'wood', 'stone', 'food', 'ton'
  amount: number;
}

export interface UnlockItemRequirement {
  itemId: string; // e.g. 'land-key', 'blueprint', 'shovel'
  quantity: number;
}

export interface UnlockCondition {
  // Player must be at least this level (0 = no level requirement)
  minLevel: number;
  // Required resources (empty = no resource requirement)
  resources: UnlockResourceRequirement[];
  // Required items in inventory (empty = no item requirement)
  items: UnlockItemRequirement[];
}

// Per-piece unlock conditions. Index 0 = piece #1 (already unlocked at start).
// Configure each land's requirements here.
export const UNLOCK_CONDITIONS: UnlockCondition[] = [
  // Piece 1 – starting land (no conditions)
  { minLevel: 0, resources: [], items: [] },
  // Piece 2 – starting land (no conditions)
  { minLevel: 0, resources: [], items: [] },
  // Piece 3 – first expandable land
  { minLevel: 2, resources: [{ resource: 'wood', amount: 20 }], items: [] },
  // Piece 4
  { minLevel: 3, resources: [{ resource: 'wood', amount: 40 }, { resource: 'stone', amount: 10 }], items: [] },
  // Piece 5
  { minLevel: 3, resources: [{ resource: 'stone', amount: 25 }], items: [{ itemId: 'land-key', quantity: 1 }] },
  // Piece 6
  { minLevel: 4, resources: [{ resource: 'food', amount: 30 }], items: [] },
  // Piece 7
  { minLevel: 4, resources: [{ resource: 'wood', amount: 60 }, { resource: 'stone', amount: 30 }], items: [] },
  // Piece 8
  { minLevel: 5, resources: [{ resource: 'ton', amount: 10 }], items: [] },
  // Piece 9
  { minLevel: 5, resources: [{ resource: 'wood', amount: 80 }], items: [{ itemId: 'land-key', quantity: 2 }] },
  // Pieces 10–25: progressively harder requirements
  { minLevel: 6, resources: [{ resource: 'stone', amount: 50 }, { resource: 'food', amount: 40 }], items: [] },
  { minLevel: 6, resources: [{ resource: 'ton', amount: 20 }], items: [] },
  { minLevel: 6, resources: [{ resource: 'wood', amount: 100 }], items: [{ itemId: 'land-key', quantity: 1 }] },
  { minLevel: 7, resources: [{ resource: 'stone', amount: 70 }], items: [] },
  { minLevel: 7, resources: [{ resource: 'ton', amount: 30 }], items: [{ itemId: 'blueprint', quantity: 1 }] },
  { minLevel: 7, resources: [{ resource: 'food', amount: 80 }], items: [] },
  { minLevel: 8, resources: [{ resource: 'wood', amount: 150 }, { resource: 'stone', amount: 50 }], items: [] },
  { minLevel: 8, resources: [{ resource: 'ton', amount: 40 }], items: [] },
  { minLevel: 8, resources: [{ resource: 'wood', amount: 120 }, { resource: 'stone', amount: 80 }], items: [{ itemId: 'land-key', quantity: 2 }] },
  { minLevel: 9, resources: [{ resource: 'food', amount: 120 }, { resource: 'wood', amount: 100 }], items: [] },
  { minLevel: 9, resources: [{ resource: 'ton', amount: 50 }], items: [{ itemId: 'blueprint', quantity: 2 }] },
  { minLevel: 10, resources: [{ resource: 'stone', amount: 120 }, { resource: 'wood', amount: 180 }], items: [] },
  { minLevel: 10, resources: [{ resource: 'ton', amount: 60 }], items: [] },
  { minLevel: 10, resources: [{ resource: 'food', amount: 180 }], items: [{ itemId: 'land-key', quantity: 3 }] },
  { minLevel: 10, resources: [{ resource: 'ton', amount: 80 }, { resource: 'wood', amount: 200 }], items: [] },
];

// Fallback for pieces beyond the defined conditions – very hard requirements
function conditionFor(pieceIndex: number): UnlockCondition {
  return (
    UNLOCK_CONDITIONS[pieceIndex] ?? {
      minLevel: 10,
      resources: [{ resource: 'ton', amount: 100 }],
      items: [],
    }
  );
}

export interface PlayerUnlockState {
  level: number;
  resources: Record<string, number>;
  inventory: Array<{ id: string; quantity: number }>;
}

export function meetsUnlockCondition(condition: UnlockCondition, state: PlayerUnlockState): boolean {
  if (state.level < condition.minLevel) return false;

  for (const req of condition.resources) {
    const have = state.resources[req.resource] ?? 0;
    if (have < req.amount) return false;
  }

  for (const req of condition.items) {
    const item = state.inventory.find((i) => i.id === req.itemId);
    const have = item?.quantity ?? 0;
    if (have < req.quantity) return false;
  }

  return true;
}

interface PlayerIslandProps {
  level: number;
  resources?: Record<string, number>;
  inventory?: Array<{ id: string; quantity: number }>;
  playerX?: number;
  playerY?: number;
  onUnlockRequest?: (pieceIndex: number, condition: UnlockCondition) => void;
}

/**
 * Land display + unlock logic:
 * - Only unlocked lands are rendered (land-tile.png images).
 * - Only ONE next locked slot is shown (dashed outline + Unlock button).
 * - All future locked slots are hidden until their level is reached.
 * - Lands expand from the center outward in a square grid (never linear).
 * - When 25 lands are reached, no further lock is shown.
 *
 * Unlock architecture:
 * - Each land has its own unlock condition (level + resources + items).
 * - Player level alone does NOT unlock a land – ALL conditions must be met.
 */
export function PlayerIsland({ level, resources = {}, inventory = [], onUnlockRequest }: PlayerIslandProps) {
  const playerState: PlayerUnlockState = { level, resources, inventory };

  // Determine how many pieces are currently unlocked based on conditions
  let unlockedCount = 0;
  for (let i = 0; i < MAX_PIECES; i++) {
    if (meetsUnlockCondition(conditionFor(i), playerState)) {
      unlockedCount = i + 1;
    } else {
      break; // first unmet condition stops progression
    }
  }

  // Land 1 and 2 are always unlocked at start (conditions minLevel 0)
  const showLock = unlockedCount < MAX_PIECES;
  const nextCondition = showLock ? conditionFor(unlockedCount) : null;
  const totalShown = unlockedCount + (showLock ? 1 : 0);

  // Positions to render: active lands + (optionally) the single next lock
  const shownPositions = SPIRAL.slice(0, totalShown);
  const lockPosition = showLock ? SPIRAL[unlockedCount] : null;

  // Compute bounding box so the grid is always centered around the active land
  const xs = shownPositions.map(([x]) => x);
  const ys = shownPositions.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;

  // Build grid cells (invisible placeholders for future-locked positions)
  const cells: Array<{ x: number; y: number; isActive: boolean; isLock: boolean }> = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const isActive = shownPositions
        .slice(0, unlockedCount)
        .some(([px, py]) => px === x && py === y);
      const isLock = lockPosition ? lockPosition[0] === x && lockPosition[1] === y : false;
      cells.push({ x, y, isActive, isLock });
    }
  }

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${PIECE_SIZE}px)`,
          gridTemplateRows: `repeat(${rows}, ${PIECE_SIZE}px)`,
          gap: 0, // pieces sit flush together
        }}
      >
        {cells.map(({ x, y, isActive, isLock }) => {
          if (isActive) {
            // Active piece – real land image, no borders/outlines
            return (
              <div
                key={`${x}-${y}`}
                data-piece={`${x}-${y}`}
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
                      data-piece={`${x}-${y}`}
                      data-slot={slot}
                      style={{ opacity: 0 }}
                    />
                  ))}
                </div>
              </div>
            );
          }

          if (isLock) {
            // Only the NEXT unlockable slot is shown
            return (
              <div
                key={`${x}-${y}`}
                data-piece={`${x}-${y}`}
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
                  onClick={() => {
                    if (nextCondition) {
                      onUnlockRequest?.(unlockedCount, nextCondition);
                      console.log(
                        `[PlayerIsland] unlock requested for piece ${unlockedCount + 1}`,
                        nextCondition,
                      );
                    }
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

          // Hidden future-locked placeholder – not visible at all
          return (
            <div
              key={`${x}-${y}`}
              data-piece={`${x}-${y}`}
              data-hidden-locked="true"
              style={{
                width: PIECE_SIZE,
                height: PIECE_SIZE,
                background: 'transparent',
                border: 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}