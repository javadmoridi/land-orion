import { useEffect, useState } from 'react';
import { usePlacementGrid } from './PlacementGrid';
import { OrionHouseInterior } from './OrionHouseInterior';
import { GRID_SIZE, LOCK_LEFT } from './placementGridUtil';

const ORION_HOUSE_IMAGE = '/assets/orion-house.png';

const HOUSE_WIDTH = 10;
const HOUSE_HEIGHT = 10;

const HOUSE_ID = 'orion-house';


interface OrionHouseProps {
  subX?: number;
  subY?: number;
}


export function OrionHouse({
  subX = 0,
  subY = 0,
}: OrionHouseProps) {


const [insideHouse,setInsideHouse] =
useState(false);


const placement = usePlacementGrid();


const positionX = subX + LOCK_LEFT;
const positionY = subY;


useEffect(()=>{

placement?.registerItem(
  HOUSE_ID,
  positionX,
  positionY,
  {
    width:HOUSE_WIDTH,
    height:HOUSE_HEIGHT,
  }
);

},[
  positionX,
  positionY
]);


if(insideHouse){

return (
<OrionHouseInterior
onExit={()=>setInsideHouse(false)}
/>
);

}


return (

<div

onClick={()=>setInsideHouse(true)}

style={{

position:'absolute',

left:`${(positionX / GRID_SIZE) * 100}%`,

top:`${(positionY / GRID_SIZE) * 100}%`,

width:`${(HOUSE_WIDTH / GRID_SIZE) * 100}%`,

height:`${(HOUSE_HEIGHT / GRID_SIZE) * 100}%`,

zIndex:3,

cursor:'pointer',

pointerEvents:'auto',

}}

>

<img

src={ORION_HOUSE_IMAGE}

alt="Orion House"

draggable={false}

style={{

width:'100%',

height:'100%',

objectFit:'contain',

imageRendering:'pixelated',

display:'block',

}}

/>

</div>

);

}
