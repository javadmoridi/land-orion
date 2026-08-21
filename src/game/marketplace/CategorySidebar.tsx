import { useState } from 'react';

interface CategorySidebarProps {
  onSelect: (item: {
    name:string;
    image:string;
  }) => void;
}

export function CategorySidebar({
  onSelect,
}: CategorySidebarProps) {

  const [selected, setSelected] = useState('Water');

  const categories = [

    {
      name:'Water',
      image:'/assets/orion-element-water.png'
    },
    {
      name:'Fire',
      image:'/assets/orion-element-fire.png'
    },
    {
      name:'Earth',
      image:'/assets/orion-element-earth.png'
    },
    {
      name:'Air',
      image:'/assets/orion-element-air.png'
    },

    {
      name:'Orion Asil',
      image:'/assets/orion-asil.png'
    },
    {
      name:'Water Orion',
      image:'/assets/orion-water.png'
    },
    {
      name:'Fire Orion',
      image:'/assets/orion-fire.png'
    },
    {
      name:'Earth Orion',
      image:'/assets/orion-earth.png'
    },
    {
      name:'Air Orion',
      image:'/assets/orion-air.png'
    },

    {
      name:'Wood',
      image:'/assets/orion-wood.png'
    },
    {
      name:'Stone',
      image:'/assets/orion-stone.png'
    },
    {
      name:'Iron',
      image:'/assets/orion-iron.png'
    },
    {
      name:'Gold',
      image:'/assets/orion-gold.png'
    },
    {
      name:'Crystal',
      image:'/assets/orion-crystal.png'
    },

    {
      name:'Celestial Melon',
      image:'/assets/celestial-melon.png'
    },
    {
      name:'Cosmic Peach',
      image:'/assets/cosmic-peach.png'
    },
    {
      name:'Crystal Pear',
      image:'/assets/crystal-pear.png'
    },
    {
      name:'Galaxy Mango',
      image:'/assets/galaxy-mango.png'
    },
    {
      name:'Moon Apple',
      image:'/assets/moon-apple.png'
    },
    {
      name:'Nebula Orange',
      image:'/assets/nebula-orange.png'
    },
    {
      name:'Nova Berry',
      image:'/assets/nova-berry.png'
    },
    {
      name:'Orion Eternal Fruit',
      image:'/assets/orion-eternal-fruit.png'
    },
    {
      name:'Solar Dragon Fruit',
      image:'/assets/solar-dragon-fruit.png'
    },
    {
      name:'Star Plum',
      image:'/assets/star-plum.png'
    },

  ];


  return (

    <aside
      style={{
        width:'100%',
        padding:15,
        background:'rgba(10,5,20,.85)',
        borderRight:'1px solid rgba(255,255,255,.15)',
        overflowY:'auto',
        scrollbarWidth:'none',
      }}
    >

      <div
        style={{
          display:'grid',
          gridTemplateColumns:'repeat(2,1fr)',
          gap:12,
        }}
      >

        {categories.map((item)=>(

          <div
            key={item.name}

            onClick={()=>{
              setSelected(item.name);
              onSelect(item);
            }}

            style={{
              aspectRatio:'1/1',
              borderRadius:16,
              cursor:'pointer',

              background:
              selected===item.name
              ? 'rgba(168,85,247,.5)'
              : 'rgba(255,255,255,.08)',

              border:
              selected===item.name
              ? '2px solid #ffd700'
              : '1px solid rgba(255,255,255,.15)',

              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              overflow:'hidden',
            }}
          >

            <img
              src={item.image}
              alt={item.name}
              style={{
                width:'85%',
                height:'75%',
                objectFit:'contain',
              }}
            />


            <span
              style={{
                fontSize:11,
                fontWeight:900,
                color:'#fff',
                textAlign:'center',
              }}
            >
              {item.name}
            </span>


          </div>

        ))}

      </div>

    </aside>

  );
}