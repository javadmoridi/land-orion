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


interface PlacementContextType {
  occupied: GridSlot[];
  registerItem: (
    x: number,
    y: number,
    size: ItemSize,
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

  const [occupied, setOccupied] = useState<GridSlot[]>([]);


  function registerItem(
    x: number,
    y: number,
    size: ItemSize,
  ) {

    const itemSlots = getOccupiedSlots(
      x,
      y,
      size,
    );

    setOccupied((old) => {

      const filtered = old.filter(
        (slot) =>
          !itemSlots.some(
            (item) =>
              item.x === slot.x &&
              item.y === slot.y,
          ),
      );

      return [
        ...filtered,
        ...itemSlots,
      ];
    });
  }


  return (
    <PlacementContext.Provider
      value={{
        occupied,
        registerItem,
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
              `repeat(${GRID_SIZE}, 1fr)`,

            gridTemplateRows:
              `repeat(${GRID_SIZE}, 1fr)`,

            pointerEvents: 'none',
          }}
        >

          {slots.map((slot) => (
            <div
              key={slot.id}
              data-x={slot.x}
              data-y={slot.y}
              data-slot={slot.id}
              style={{
                boxSizing: 'border-box',

                border: showGrid
                  ? '1px dashed rgba(255,255,255,0.25)'
                  : 'none',
              }}
            />
          ))}

        </div>


        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {children}
        </div>

      </div>
    </PlacementContext.Provider>
  );
}