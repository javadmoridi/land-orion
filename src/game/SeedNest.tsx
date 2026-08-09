import { useState } from 'react';
import { useResourceStore } from '../economy/resourceStore';
import { useGameStore } from './useGameStore';
import type { InventoryItem } from '../types';

const IMAGE = '/assets/seed-nest.png';

const GRID_SIZE = 14;
const WIDTH = 4;
const HEIGHT = 4;

const SEEDS = [
  { id:'seed-1', name:'Crystal Seed', image:'/assets/seed-1.png', price:1 },
  { id:'seed-2', name:'Fire Seed', image:'/assets/seed-2.png', price:2 },
  { id:'seed-3', name:'Ice Seed', image:'/assets/seed-3.png', price:5 },
  { id:'seed-4', name:'Light Seed', image:'/assets/seed-4.png', price:10 },
  { id:'seed-5', name:'Shadow Seed', image:'/assets/seed-5.png', price:20 },
  { id:'seed-6', name:'Forest Seed', image:'/assets/seed-6.png', price:50 },
  { id:'seed-7', name:'Moon Seed', image:'/assets/seed-7.png', price:100 },
  { id:'seed-8', name:'Star Seed', image:'/assets/seed-8.png', price:200 },
  { id:'seed-9', name:'Ancient Seed', image:'/assets/seed-9.png', price:500 },
  { id:'seed-10', name:'Orion Seed', image:'/assets/seed-10.png', price:1000 },
];

interface Props {
  x?: number;
  y?: number;
}

export function SeedNest({
  x = 6,
  y = 0,
}: Props) {

  const [openShop, setOpenShop] = useState(false);
  const [message, setMessage] = useState('');

  const coins = useResourceStore(
    (s)=>s.resources.coins
  );

  const spendCoins = useResourceStore(
    (s)=>s.spendCoins
  );

  const addToInventory = useGameStore(
    (s)=>s.addToInventory
  );


  function buySeed(seed:any){

    if(!spendCoins(seed.price)){
      setMessage('Not enough Coin');
      return;
    }


    const item: InventoryItem = {
      id: seed.id,
      name: seed.name,
      type:'seed',
      quantity:1,
    };


    addToInventory(item);

    setMessage(`${seed.name} added`);
  }


  return (
    <>
      <div
        onClick={()=>setOpenShop(true)}
        style={{
          position:'absolute',
          left:`${(x / GRID_SIZE)*100}%`,
          top:`${(y / GRID_SIZE)*100}%`,
          width:`${(WIDTH / GRID_SIZE)*100}%`,
          height:`${(HEIGHT / GRID_SIZE)*100}%`,
          zIndex:3,
          cursor:'pointer',
        }}
      >
        <img
          src={IMAGE}
          alt="Seed Shop"
          draggable={false}
          style={{
            width:'100%',
            height:'100%',
            objectFit:'contain',
            imageRendering:'pixelated',
          }}
        />
      </div>


      {openShop && (
        <div
          onClick={()=>setOpenShop(false)}
          style={{
            position:'fixed',
            inset:0,
            background:'rgba(0,0,0,.5)',
            zIndex:100,
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
          }}
        >

          <div
            onClick={(e)=>e.stopPropagation()}
            style={{
              background:'#222',
              color:'white',
              padding:20,
              borderRadius:12,
              width:600,
            }}
          >

            <h2>Seed Shop</h2>

            <p>
              Coin: {coins}
            </p>


            <div
              style={{
                display:'grid',
                gridTemplateColumns:'repeat(5,1fr)',
                gap:15,
              }}
            >

              {SEEDS.map((seed)=>(

                <div
                  key={seed.id}
                  style={{
                    textAlign:'center',
                  }}
                >

                  <img
                    src={seed.image}
                    alt={seed.name}
                    width={70}
                    height={70}
                  />

                  <div>
                    {seed.name}
                  </div>

                  <div>
                    {seed.price} Coin
                  </div>

                  <button
                    onClick={()=>buySeed(seed)}
                  >
                    Buy
                  </button>

                </div>

              ))}

            </div>


            {message && (
              <p>{message}</p>
            )}


            <button
              onClick={()=>setOpenShop(false)}
            >
              Exit
            </button>

          </div>

        </div>
      )}

    </>
  );
}