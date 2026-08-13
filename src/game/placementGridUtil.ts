export const GRID_SIZE = 40;

// فاصله از دیواره راست/چپ در خود PlayerIsland اعمال می‌شود (LOCK = 0)
export const LOCK_LEFT = 0;

// فاصله از دیواره راست/چپ در خود PlayerIsland اعمال می‌شود (LOCK = 0)
export const LOCK_RIGHT = 0;


export interface GridSlot {
  id:string;
  x:number;
  y:number;
}


export type ItemSize =
  | number
  | {
      width:number;
      height:number;
    };



// گرید 40x40 با حاشیه چپ و راست
export function createPlacementGrid():GridSlot[] {

  const slots:GridSlot[] = [];


  for(let y = 0; y < GRID_SIZE; y++){

    for(
      let x = LOCK_LEFT;
      x < GRID_SIZE - LOCK_RIGHT;
      x++
    ){

      slots.push({
        id:`${x}-${y}`,
        x,
        y,
      });

    }

  }


  return slots;

}



export function getOccupiedSlots(
  x:number,
  y:number,
  size:ItemSize
):GridSlot[] {


  const slots:GridSlot[] = [];


  const width =
    typeof size === 'number'
    ? size
    : size.width;


  const height =
    typeof size === 'number'
    ? size
    : size.height;



  for(let yy = 0; yy < height; yy++){

    for(let xx = 0; xx < width; xx++){


      const slotX = x + xx;
      const slotY = y + yy;



      if(
        slotX >= LOCK_LEFT &&
        slotX < GRID_SIZE - LOCK_RIGHT &&
        slotY >= 0 &&
        slotY < GRID_SIZE
      ){

        slots.push({

          id:`${slotX}-${slotY}`,

          x:slotX,

          y:slotY,

        });

      }

    }

  }


  return slots;

}


export function canPlaceItem(
  x:number,
  y:number,
  size:ItemSize,
  occupied:GridSlot[],
):boolean {

  const width =
    typeof size === 'number'
    ? size
    : size.width;

  const height =
    typeof size === 'number'
    ? size
    : size.height;


  if (
    x < LOCK_LEFT ||
    y < 0 ||
    x + width > GRID_SIZE - LOCK_RIGHT ||
    y + height > GRID_SIZE
  ) {
    return false;
  }


  const newSlots =
    getOccupiedSlots(x, y, { width, height });


  return !newSlots.some(slot =>
    occupied.some(other =>
      other.x === slot.x &&
      other.y === slot.y
    )
  );

}
