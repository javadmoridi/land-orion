interface ItemCardProps {
  name?: string;
  image?: string;
}

export function ItemCard({
  name = 'Item',
  image = '/assets/wood.png',
}: ItemCardProps) {

  return (

    <div

      style={{

        aspectRatio:'1 / 1',

        borderRadius:20,

        background:
          'rgba(10,5,20,.75)',

        border:
          '1px solid rgba(255,255,255,.18)',


        overflow:'hidden',


        display:'flex',

        flexDirection:'column',


        color:'#fff',

        boxShadow:
          '0 0 20px rgba(0,0,0,.4)',

      }}

    >


      {/* IMAGE 80% */}

      <div

        style={{

          height:'80%',


          display:'flex',

          alignItems:'center',

          justifyContent:'center',


          background:
          'rgba(255,255,255,.05)',

        }}

      >

        <img

          src={image}

          style={{

            width:'85%',

            height:'85%',

            objectFit:'contain',

          }}

        />

      </div>



      {/* NAME 20% */}

      <div

        style={{

          height:'20%',


          display:'flex',

          alignItems:'center',

          justifyContent:'center',


          fontWeight:1000,

          fontSize:18,


          background:
          'rgba(0,0,0,.35)',

        }}

      >

        {name}

      </div>



    </div>


  );

}