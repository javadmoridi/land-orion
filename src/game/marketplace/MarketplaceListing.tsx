interface MarketplaceListingProps {
  itemName: string;
  itemImage: string;
}

export function MarketplaceListing({
  itemName,
  itemImage,
}: MarketplaceListingProps) {

  const listings: {
    owner: string;
    amount: number;
    price: number;
  }[] = [];

  return (

    <div
      style={{
        display:'flex',
        flexDirection:'column',
        gap:12,
      }}
    >

      {
        listings.length === 0 ?

        <div
          style={{
            height:70,
            borderRadius:35,
            background:'rgba(255,255,255,.12)',
            border:'1px solid rgba(255,255,255,.2)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            color:'#fff',
            fontWeight:900,
          }}
        >
          No players listed {itemName}
        </div>

        :

        listings.map((item,index)=>(

          <div
            key={index}
            style={{
              height:70,
              display:'flex',
              alignItems:'center',
              justifyContent:'space-between',
              padding:'0 20px',
              borderRadius:35,
              background:'rgba(255,255,255,.12)',
              border:'1px solid rgba(255,255,255,.2)',
              color:'#fff',
            }}
          >

            <div
              style={{
                display:'flex',
                alignItems:'center',
                gap:15,
              }}
            >

              <img
                src={itemImage}
                style={{
                  width:50,
                  height:50,
                  objectFit:'contain',
                }}
              />

              <div>
                <div style={{fontWeight:900}}>
                  {itemName}
                </div>

                <div style={{fontSize:12}}>
                  {item.owner}
                </div>
              </div>

            </div>


            <div>
              x{item.amount}
            </div>


            <div
              style={{
                color:'#ffd700',
                fontWeight:900,
              }}
            >
              {item.price} Token
            </div>


            <button
              style={{
                border:'none',
                borderRadius:25,
                padding:'10px 25px',
                background:'#ffd700',
                fontWeight:900,
                cursor:'pointer',
              }}
            >
              BUY
            </button>

          </div>

        ))

      }

    </div>

  );
}