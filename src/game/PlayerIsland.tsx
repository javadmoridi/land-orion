import { OrionHouse } from './OrionHouse';
import { PlacementGrid } from './PlacementGrid';
import { SeedNest } from './SeedNest';
import { EggShop } from './EggShop';
import { Barracks } from './buildings/Barracks';
import { Incubator } from './buildings/Incubator';
import { OrionSupply } from './buildings/OrionSupply';
import { Tree } from './buildings/Tree';

const LAND_MAP_IMAGE = '/assets/land-map.png';


const TREES = [
  { x: 0, y: 8 },
  { x: 2, y: 8 },
  { x: 4, y: 8 },

  { x: 0, y: 10 },
  { x: 2, y: 10 },
  { x: 4, y: 10 },

  { x: 0, y: 12 },
  { x: 2, y: 12 },
  { x: 4, y: 12 },
];


interface PlayerIslandProps {
  level: number;
  resources?: Record<string, number>;
  inventory?: Array<{
    id:string;
    quantity:number;
  }>;
}


export function PlayerIsland(_props: PlayerIslandProps) {

  return (

    <div
      style={{
        width:'100%',
        height:'100%',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
      }}
    >

      <div
        style={{
          position:'relative',
          width:'min(90vw,90vh)',
          maxWidth:'1400px',
          aspectRatio:'1 / 1',
          overflow:'hidden',
        }}
      >

        <img
          src={LAND_MAP_IMAGE}
          alt="Island"
          draggable={false}
          style={{
            position:'absolute',
            inset:0,
            width:'100%',
            height:'100%',
            objectFit:'fill',
            imageRendering:'pixelated',
            pointerEvents:'none',
          }}
        />


        <PlacementGrid>

          <OrionHouse
            subX={0}
            subY={0}
          />


          <Barracks
            x={0}
            y={4}
          />


          <SeedNest
            x={5}
            y={0}
          />


          <EggShop
            x={9}
            y={0}
          />


          <Incubator
            x={9}
            y={3}
          />


          <OrionSupply
            x={4}
            y={4}
          />


          {TREES.map((tree,index)=>(

            <Tree
              key={index}
              x={tree.x}
              y={tree.y}
            />

          ))}


        </PlacementGrid>


      </div>

    </div>

  );
}