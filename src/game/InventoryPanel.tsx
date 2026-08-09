import { useState } from 'react';

const IMAGE = '/assets/inventory-icon.png';

export function InventoryPanel() {

  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          position:'fixed',
          left:20,
          top:20,
          width:95,
          height:95,
          cursor:'pointer',
          zIndex:9999,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
        }}
      >

        <img
          src={IMAGE}
          alt="Inventory"
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


      {open && (

        <div
          onClick={()=>setOpen(false)}
          style={{
            position:'fixed',
            inset:0,
            background:'rgba(0,0,0,.65)',
            zIndex:10000,
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
          }}
        >

          <div
            onClick={(e)=>e.stopPropagation()}
            style={{
              width:650,
              maxHeight:'80vh',
              overflow:'auto',
              background:'#171717',
              color:'white',
              padding:25,
              borderRadius:16,
              border:'1px solid #444',
            }}
          >

            <h2>
              Orion Inventory
            </h2>


            <section>
              <h3>🌱 Seeds</h3>
              <p>Empty</p>
            </section>


            <section>
              <h3>🛠 Tools</h3>
              <p>Empty</p>
            </section>


            <section>
              <h3>🍎 Food</h3>
              <p>Empty</p>
            </section>


            <section>
              <h3>📦 Items</h3>
              <p>Empty</p>
            </section>


            <section>
              <h3>⛏ Resources</h3>
              <p>
                Wood / Stone / Iron / Gold
              </p>
            </section>


            <button
              onClick={()=>setOpen(false)}
              style={{
                marginTop:20,
                padding:'10px 25px',
                cursor:'pointer',
              }}
            >
              Exit
            </button>


          </div>

        </div>

      )}

    </>
  );
}