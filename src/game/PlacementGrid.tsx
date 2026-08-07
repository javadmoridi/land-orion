import {
  useState,
  createContext,
  useContext,
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

  registerItem: (
    id: string,
    x: number,
    y: number,
    size: ItemSize,
  ) => void;

  removeItem: (
    id: string,
  ) => void;

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


  const slots = createPlacementGrid();


  const [items, setItems] =
    useState<PlacedItem[]>([]);



  const occupied =
    items.flatMap((item) =>
      getOccupiedSlots(
        item.x,
        item.y,
        item.size,
      )
    );



  function registerItem(

    id: string,

    x: number,

    y: number,

    size: ItemSize,

  ) {


    setItems((old) => {


      const filtered =
        old.filter(
          (item) =>
            item.id !== id
        );


      return [
        ...filtered,

        {
          id,
          x,
          y,
          size,
        },

      ];


    });


  }



  function removeItem(id: string) {


    setItems((old) =>
      old.filter(
        (item) =>
          item.id !== id
      )
    );


  }



  return (

    <PlacementContext.Provider

      value={{

        occupied,

        items,

        registerItem,

        removeItem,

      }}

    >


      <div

        style={{

          position: 'absolute',

          inset: 0,

          width: '100%',

          height: '100%',

        }}

      >



        <div

          style={{

            position: 'absolute',

            inset: 0,

            display: 'grid',

            gridTemplateColumns:
              `repeat(${GRID_SIZE},1fr)`,

            gridTemplateRows:
              `repeat(${GRID_SIZE},1fr)`,

            pointerEvents: 'none',

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