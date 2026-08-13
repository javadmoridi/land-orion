import {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';

import {
  GRID_SIZE,
  LOCK_LEFT,
  LOCK_RIGHT,
  canPlaceItem,
  type GridSlot,
  type ItemSize,
  getOccupiedSlots,
} from './placementGridUtil';


interface PlacementGridProps {
  showGrid?: boolean;
  children?: ReactNode;
}


interface PlacedItem {
  id: string;
  x: number;
  y: number;
  size: ItemSize;
}


interface PlacementContextType {
  occupied: GridSlot[];

  items: PlacedItem[];

  registerItem(
    id: string,
    x: number,
    y: number,
    size: ItemSize
  ): void;

  removeItem(id: string): void;
}


const PlacementContext =
  createContext<PlacementContextType | null>(null);


export function usePlacementGrid() {
  return useContext(PlacementContext);
}



export function PlacementGrid({
  showGrid = false,
  children,
}: PlacementGridProps) {


  const [items, setItems] =
    useState<PlacedItem[]>([]);



  const occupied = useMemo(
    () =>
      items.flatMap(item =>
        getOccupiedSlots(
          item.x,
          item.y,
          item.size
        )
      ),
    [items]
  );



  const registerItem =
    useCallback(
      (
        id: string,
        x: number,
        y: number,
        size: ItemSize
      ) => {

        setItems(old => {

          const otherItems =
            old.filter(
              item => item.id !== id
            );


          const allowed =
            canPlaceItem(
              x,
              y,
              size,
              otherItems
            );


          if (!allowed) {
            return old;
          }


          return [
            ...otherItems,
            {
              id,
              x,
              y,
              size,
            }
          ];

        });

      },
      []
    );



  const removeItem =
    useCallback(
      (id: string) => {

        setItems(old =>
          old.filter(
            item => item.id !== id
          )
        );

      },
      []
    );



  const contextValue = useMemo(
    () => ({
      occupied,
      items,
      registerItem,
      removeItem,
    }),
    [
      occupied,
      items,
      registerItem,
      removeItem,
    ]
  );



  return (

    <PlacementContext.Provider
      value={contextValue}
    >


      <div
        style={{
          position:'absolute',
          inset:0,

          display:'grid',

          gridTemplateColumns:
            `repeat(${GRID_SIZE},1fr)`,

          gridTemplateRows:
            `repeat(${GRID_SIZE},1fr)`,

          pointerEvents:'none',
        }}
      >

        {
          showGrid &&
          Array.from(
            { length: GRID_SIZE * GRID_SIZE }
          )
          .map((_, index) => {

            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);

            const playable =
              x >= LOCK_LEFT &&
              x < GRID_SIZE - LOCK_RIGHT;

            return (

              <div
                key={`${x}-${y}`}
                style={{

                  boxSizing:'border-box',

                  border:
                    showGrid
                    ?
                    (
                      playable
                      ?
                      '1px dashed rgba(255,255,255,0.4)'
                      :
                      '1px dashed rgba(255,255,255,0.12)'
                    )
                    :
                    'none',

                  fontSize:'9px',

                  color:
                    playable
                    ?
                    'rgba(255,255,255,0.85)'
                    :
                    'rgba(255,255,255,0.3)',

                  display:'flex',

                  flexDirection:'column',

                  alignItems:'center',

                  justifyContent:'center',

                  textShadow:'0 0 3px black',

                  overflow:'hidden',

                }}
              >

                <span>
                  X:{x}
                </span>

                <span>
                  Y:{y}
                </span>

              </div>

            );

          })
        }

      </div>


      {children}

    </PlacementContext.Provider>

  );

}