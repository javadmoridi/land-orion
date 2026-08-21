interface MarketplaceHeaderProps {
  onClose: () => void;
}

export function MarketplaceHeader({
  onClose,
}: MarketplaceHeaderProps) {

  return (

    <header

      style={{

        height:75,

        position:'relative',

        display:'flex',

        alignItems:'center',

        justifyContent:'center',

        background:
          'rgba(10,5,20,.88)',


        borderBottom:
          '1px solid rgba(255,255,255,.15)',

      }}

    >



      <h2

        style={{

          margin:0,

          color:'#ffffff',

          fontSize:28,

          fontWeight:1000,

          letterSpacing:3,

          textShadow:
            '0 0 15px #a855f7',

        }}

      >

        MARKETPLACE

      </h2>




      <button

        onClick={onClose}

        style={{

          position:'absolute',

          right:25,


          width:45,

          height:45,


          border:'none',

          borderRadius:'50%',


          background:'#e11d48',


          color:'#fff',


          fontSize:20,

          fontWeight:1000,


          cursor:'pointer',


          boxShadow:
            '0 0 15px rgba(225,29,72,.8)',

        }}

      >

        X

      </button>


    </header>

  );
}