// Land map image – one full image containing all land pieces.
// Replace this file to change the whole land map (1024x1024, 5x5 grid).
const LAND_MAP_IMAGE = '/assets/land-map.png';

// The land map is a 5x5 grid of land pieces
const MAP_GRID_SIZE = 5;

// Each land piece has an invisible 3x3 grid (9 usable slots) for logic only
const INNER_GRID = 3;
// Base piece size (~25% smaller than before). Made responsive below so the
// full 5x5 (25-piece) grid always fits on screen with Orion background visible.
const BASE_PIECE_SIZE = 150;

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

// ---------------------------------------------------------------------------
// SIMPLE 5x5 MAPPING (row-major, NOT spiral)
// Cell index = row * 5 + col
// Cell (row, col) shows slice at (col/5*100%, row/5*100%) of land-map.png
// ---------------------------------------------------------------------------
function cellPosition(cellIndex: number): { row: number; col: number } {
  return {
    row: Math.floor(cellIndex / MAP_GRID_SIZE),
    col: cellIndex % MAP_GRID_SIZE,
  };
}

// background-position for a cell: show only that cell's slice of land-map.png
function backgroundPositionFor(row: number, col: number): string {
  const pctX = (col / MAP_GRID_SIZE) * 100;
  const pctY = (row / MAP_GRID_SIZE) * 100;
  return `${pctX}% ${pctY}%`;
}

// background-size: enlarge the map so only one cell is visible
function backgroundSizeFor(): string {
  return `${100 * MAP_GRID_SIZE}% ${100 * MAP_GRID_SIZE}%`;
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
 * - Only unlocked lands are rendered.
 * - Each unlocked land shows the matching slice of land-map.png (simple 5x5).
 * - Locked lands show NO part of land-map.png (dashed outline + Unlock button).
 * - Only ONE next locked slot is shown.
 * - All future locked slots are hidden.
 * - When 25 lands are reached, no further lock is shown.
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

  // Simple 5x5 grid: first `unlockedCount` cells are active,
  // the next cell (if any) is the lock, rest are hidden.
  const cells = Array.from({ length: MAX_PIECES }, (_, i) => {
    const { row, col } = cellPosition(i);
    return {
      index: i,
      row,
      col,
      isActive: i < unlockedCount,
      isLock: showLock && i === unlockedCount,
    };
  });

  // Responsive piece size: never exceed base, but shrink so the whole grid
  // (up to 5x5) fits within ~85% of the viewport width.
  const pieceSize = `min(${BASE_PIECE_SIZE}px, calc(85vw / ${MAP_GRID_SIZE}))`;

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
          gridTemplateColumns: `repeat(${MAP_GRID_SIZE}, ${pieceSize})`,
          gridTemplateRows: `repeat(${MAP_GRID_SIZE}, ${pieceSize})`,
          gap: 0, // pieces sit flush together
        }}
      >
        {cells.map(({ index, row, col, isActive, isLock }) => {
          if (isActive) {
            // Active piece – show matching slice of land-map.png
            return (
              <div
                key={index}
                data-piece={index}
                style={{
                  position: 'relative',
                  backgroundImage: `url(${LAND_MAP_IMAGE})`,
                  backgroundSize: backgroundSizeFor(),
                  backgroundPosition: backgroundPositionFor(row, col),
                  backgroundRepeat: 'no-repeat',
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
          }

          if (isLock) {
            // Only the NEXT unlockable slot is shown – NO land-map.png
            return (
              <div
                key={index}
                data-piece={index}
                data-locked="true"
                style={{
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
              key={index}
              data-piece={index}
              data-hidden-locked="true"
              style={{
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