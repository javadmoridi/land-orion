import { useState } from 'react';
import { OrionHouse } from './OrionHouse';

const LAND_MAP_IMAGE = '/assets/land-map.png';

const MAP_GRID_SIZE = 5;
const MAX_PIECES = 25;
const BASE_PIECE_SIZE = 150;

export interface UnlockResourceRequirement {
  resource: string;
  amount: number;
}

export interface UnlockItemRequirement {
  itemId: string;
  quantity: number;
}

export interface UnlockCondition {
  minLevel: number;
  resources: UnlockResourceRequirement[];
  items: UnlockItemRequirement[];
}

export const UNLOCK_CONDITIONS: UnlockCondition[] = [
  { minLevel: 0, resources: [], items: [] },
  { minLevel: 0, resources: [], items: [] },
  { minLevel: 2, resources: [{ resource: 'wood', amount: 20 }], items: [] },
  { minLevel: 3, resources: [{ resource: 'wood', amount: 40 }], items: [] },
  { minLevel: 3, resources: [{ resource: 'stone', amount: 25 }], items: [] },
  { minLevel: 4, resources: [{ resource: 'food', amount: 30 }], items: [] },
  { minLevel: 4, resources: [{ resource: 'wood', amount: 60 }], items: [] },
  { minLevel: 5, resources: [{ resource: 'stone', amount: 50 }], items: [] },
  { minLevel: 5, resources: [{ resource: 'wood', amount: 80 }], items: [] },
];

function conditionFor(index: number): UnlockCondition {
  return (
    UNLOCK_CONDITIONS[index] ?? {
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

export function meetsUnlockCondition(
  condition: UnlockCondition,
  state: PlayerUnlockState,
) {
  if (state.level < condition.minLevel) return false;

  for (const r of condition.resources) {
    if ((state.resources[r.resource] ?? 0) < r.amount) {
      return false;
    }
  }

  for (const item of condition.items) {
    const found = state.inventory.find(
      (i) => i.id === item.itemId,
    );

    if ((found?.quantity ?? 0) < item.quantity) {
      return false;
    }
  }

  return true;
}

function cellPosition(index: number) {
  return {
    row: Math.floor(index / MAP_GRID_SIZE),
    col: index % MAP_GRID_SIZE,
  };
}

function backgroundPositionFor(row: number, col: number) {
  return `${(col / MAP_GRID_SIZE) * 100}% ${(row / MAP_GRID_SIZE) * 100}%`;
}

function backgroundSizeFor() {
  return `${MAP_GRID_SIZE * 100}% ${MAP_GRID_SIZE * 100}%`;
}interface PlayerIslandProps {
  level: number;
  resources?: Record<string, number>;
  inventory?: Array<{ id: string; quantity: number }>;
  onUnlockRequest?: (
    pieceIndex: number,
    condition: UnlockCondition,
  ) => void;
}

export function PlayerIsland({
  level,
  resources = {},
  inventory = [],
  onUnlockRequest,
}: PlayerIslandProps) {

  const [houseLand, setHouseLand] = useState(0);

  const [housePosition, setHousePosition] = useState({
    x: 0,
    y: 0,
  });

  const playerState: PlayerUnlockState = {
    level,
    resources,
    inventory,
  };


  let unlockedCount = 0;

  for (let i = 0; i < MAX_PIECES; i++) {
    if (
      meetsUnlockCondition(
        conditionFor(i),
        playerState,
      )
    ) {
      unlockedCount = i + 1;
    } else {
      break;
    }
  }


  const cells = Array.from(
    { length: MAX_PIECES },
    (_, index) => {

      const { row, col } = cellPosition(index);

      return {
        index,
        row,
        col,
        active: index < unlockedCount,
        lock: index === unlockedCount,
      };
    },
  );


  const pieceSize =
    `min(${BASE_PIECE_SIZE}px, calc(85vw / 5))`;


  return (
    <div
      style={{
        display:'flex',
        justifyContent:'center',
      }}
    >

      <div
        style={{
          display:'grid',
          gridTemplateColumns:
            `repeat(5, ${pieceSize})`,
          gridTemplateRows:
            `repeat(5, ${pieceSize})`,
        }}
      >

        {cells.map(
          ({
            index,
            row,
            col,
            active,
            lock,
          }) => {


          if(active){

            return (
              <div
                key={index}
                style={{
                  position:'relative',
                  backgroundImage:
                    `url(${LAND_MAP_IMAGE})`,
                  backgroundSize:
                    backgroundSizeFor(),
                  backgroundPosition:
                    backgroundPositionFor(row,col),
                  backgroundRepeat:'no-repeat',
                  imageRendering:'pixelated',
                }}
              >

                {/*
                  خانه فقط روی زمین های باز شده وجود دارد
                */}
                {index === houseLand && (
                  <OrionHouse
                    subX={housePosition.x}
                    subY={housePosition.y}

                    onMove={(x,y)=>{

                      setHousePosition({
                        x,
                        y,
                      });

                    }}

                  />
                )}


                {/*
                  با کلیک روی هر زمین باز،
                  خانه به آن زمین منتقل می شود
                */}
                <div
                  onClick={()=>{

                    setHouseLand(index);

                  }}

                  style={{
                    position:'absolute',
                    inset:0,
                    zIndex:1,
                  }}
                />

              </div>
            );
          }          if(lock){

            const condition = conditionFor(index);

            return (
              <div
                key={index}
                style={{
                  border:
                    '3px dashed rgba(255,215,0,.5)',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  flexDirection:'column',
                  gap:8,
                }}
              >

                <span>
                  🔒
                </span>

                <button
                  onClick={()=>{
                    onUnlockRequest?.(
                      index,
                      condition,
                    );
                  }}
                >
                  Unlock
                </button>

              </div>
            );
          }


          return (
            <div
              key={index}
              style={{
                width:'100%',
                height:'100%',
              }}
            />
          );

        })}

      </div>

    </div>
  );
}