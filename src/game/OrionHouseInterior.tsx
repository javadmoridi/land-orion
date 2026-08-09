import { useState } from 'react';

const HOUSE_IMAGE = '/assets/orion-house-interior.png';
const KITCHEN_IMAGE = '/assets/orion-kitchen.png';

const GRID_COLS = 20;
const GRID_ROWS = 10;

interface Item {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string;
}

export function OrionHouseInterior({
  onExit,
}: {
  onExit: () => void;
}) {

  const [kitchenOpen, setKitchenOpen] = useState(false);


  const items: Item[] = [
    {
      id: 'kitchen',
      x: 11,
      y: 6,
      width: 4,
      height: 3,
      image: KITCHEN_IMAGE,
    },
  ];


  return (
    <div
      style={{
        position:'fixed',
        inset:0,
        zIndex:200,
        background:'#000',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
      }}
    >

      <img
        src={HOUSE_IMAGE}
        alt="Orion House Interior"
        style={{
          width:'90%',
          height:'90%',
          objectFit:'contain',
          imageRendering:'pixelated',
        }}
      />


      <div
        style={{
          position:'absolute',
          width:'90%',
          height:'90%',
          display:'grid',
          gridTemplateColumns:`repeat(${GRID_COLS},1fr)`,
          gridTemplateRows:`repeat(${GRID_ROWS},1fr)`,
        }}
      >

        {items.map((item)=>(
          <div
            key={item.id}
            onClick={()=>{
              if(item.id === 'kitchen'){
                setKitchenOpen(true);
              }
            }}
            style={{
              gridColumn:`${item.x + 1} / span ${item.width}`,
              gridRow:`${item.y + 1} / span ${item.height}`,
              display:'flex',
              justifyContent:'center',
              alignItems:'center',
              zIndex:5,
              cursor:'pointer',
            }}
          >

            <img
              src={item.image}
              alt={item.id}
              draggable={false}
              style={{
                width:'100%',
                height:'100%',
                objectFit:'contain',
                imageRendering:'pixelated',
              }}
            />

          </div>
        ))}

      </div>


      {kitchenOpen && (
        <div
          style={{
            position:'fixed',
            inset:0,
            zIndex:300,
            background:'rgba(0,0,0,.7)',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
          }}
        >

          <div
            style={{
              width:520,
              background:'#171717',
              color:'white',
              padding:25,
              borderRadius:15,
            }}
          >

            <h2>Orion Kitchen</h2>

            <div
              style={{
                display:'grid',
                gridTemplateColumns:'repeat(5,1fr)',
                gap:8,
              }}
            >

              {Array.from({length:25}).map((_,i)=>(
                <div
                  key={i}
                  style={{
                    height:60,
                    border:'1px solid #555',
                    borderRadius:8,
                    background:'#222',
                  }}
                />
              ))}

            </div>


            <button
              onClick={()=>setKitchenOpen(false)}
              style={{
                marginTop:20,
                padding:'10px 25px',
                cursor:'pointer',
              }}
            >
              Exit Kitchen
            </button>

          </div>

        </div>
      )}


      <button
        onClick={onExit}
        style={{
          position:'absolute',
          bottom:20,
          left:'50%',
          transform:'translateX(-50%)',
          padding:'12px 30px',
          borderRadius:12,
          background:'#222',
          color:'white',
          border:'1px solid #555',
          cursor:'pointer',
        }}
      >
        Exit House
      </button>

    </div>
  );
}