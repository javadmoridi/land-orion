import { useState } from 'react';

interface Props {
  x?: number;
  y?: number;
}

const IMAGE = '/assets/orion-supply.png';

const GRID_SIZE = 14;
const WIDTH = 4;
const HEIGHT = 4;


export function OrionSupply({
  x = 5,
  y = 9,
}: Props) {

  const [open,setOpen] = useState(false);


  return (
    <>
      <div
        onClick={()=>setOpen(true)}
        style={{
          position:'absolute',
          left:`${(x / GRID_SIZE) * 100}%`,
          top:`${(y / GRID_SIZE) * 100}%`,
          width:`${(WIDTH / GRID_SIZE) * 100}%`,
          height:`${(HEIGHT / GRID_SIZE) * 100}%`,
          zIndex:3,
          cursor:'pointer',
        }}
      >

        <img
          src={IMAGE}
          alt="Orion Supply"
          draggable={false}
          style={{
            width:'100%',
            height:'100%',
            objectFit:'contain',
            imageRendering:'pixelated',
          }}
        />

      </div>


      {open && (

        <div
          onClick={()=>setOpen(false)}
          style={{
            position:'fixed',
            inset:0,
            background:'rgba(0,0,0,.6)',
            zIndex:9999,
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
          }}
        >

          <div
            onClick={(e)=>e.stopPropagation()}
            style={{
              background:'#171717',
              color:'white',
              padding:25,
              borderRadius:15,
              width:500,
            }}
          >

            <h2>
              Orion Supply
            </h2>

            <p>
              Tool shop coming soon
            </p>


            <button
              onClick={()=>setOpen(false)}
            >
              Exit
            </button>


          </div>

        </div>

      )}

    </>
  );
}