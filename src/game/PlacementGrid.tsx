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
  createPlacementGrid,
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
    size: ItemSize,
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


  const slots = useMemo(
    () => createPlacementGrid(),
    []
  );


  const [items, setItems] =
    useState<PlacedItem[]>([]);



  const occupied = useMemo(
    () =>
      items.flatMap((item) =>
        getOccupiedSlots(
          item.x,
          item.y,
          item.size,
        )
      ),
    [items]
  );



  const registerItem = useCallback(
    (
      id: string,
      x: number,
      y: number,
      size: ItemSize,
    ) => {


      setItems((old) => {


        const otherItems =
          old.filter(
            (item) =>
              item.id !== id
          );


        const newSlots =
          getOccupiedSlots(
            x,
            y,
            size,
          );


        const collision =
          otherItems.some(
            (item) => {

              const itemSlots =
                getOccupiedSlots(
                  item.x,
                  item.y,
                  item.size,
                );


              return newSlots.some(
                (slot) =>
                  itemSlots.some(
                    (other) =>
                      other.x === slot.x &&
                      other.y === slot.y
                  )
              );

            }
          );



        // جلوگیری از قرار گرفتن روی ساختمان دیگر

        if (collision) {
          return old;
        }



        return [
          ...otherItems,
          {
            id,
            x,
            y,
            size,
          },
        ];

      });


    },
    []
  );



  const removeItem = useCallback(
    (id: string) => {

      setItems((old) =>
        old.filter(
          (item) =>
            item.id !== id
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
          width:'100%',
          height:'100%',
        }}
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

          {slots.map((slot) => (

            <div
              key={slot.id}
              data-x={slot.x}
              data-y={slot.y}
              style={{
                boxSizing:'border-box',
                border:
                  showGrid
                    ? '1px dashed rgba(255,255,255,0.25)'
                    : 'none',
              }}
            />

          ))}

        </div>



        <div
          style={{
            position:'absolute',
            inset:0,
            width:'100%',
            height:'100%',
          }}
        >

          {children}

        </div>


      </div>

    </PlacementContext.Provider>

  );

}