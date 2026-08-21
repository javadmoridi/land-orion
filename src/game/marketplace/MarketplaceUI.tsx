import { useState } from 'react';

import { MarketplaceListing } from './MarketplaceListing';
import { MarketplaceHeader } from './MarketplaceHeader';
import { CategorySidebar } from './CategorySidebar';
import { SellPanel } from './SellPanel';

import { useResourceStore } from '../../economy/resourceStore';
import { useMarketplaceTestStore } from './marketplaceTestStore';



interface MarketplaceUIProps {
  onClose: () => void;
}



const STYLE = {
  sidebarWidth:280,
};



export function MarketplaceUI({
  onClose,
}:MarketplaceUIProps) {


  const [selectedItem,setSelectedItem] = useState({
    name:'Wood',
    image:'/assets/orion-wood.png'
  });


  const [showSell,setShowSell] = useState(false);



  // بازیکن واقعی
  const resources = useResourceStore(
    state=>state.resources
  );


  // ارز تست هاست بازار
  const {
    hostTokens,
    hostGems
  } = useMarketplaceTestStore();




  const getResourceKey = (name:string)=>{

    const map:any = {

      Water:'water',
      Fire:'fire',
      Earth:'earth',
      Air:'air',

      Wood:'wood',
      Stone:'stone',
      Iron:'iron',
      Gold:'gold',
      Crystal:'crystal',

    };


    return map[name];

  };



  const selectedAmount =
    resources[
      getResourceKey(selectedItem.name)
    ] ?? 0;

  // Actions that make the sale real: the sold resource is
  // withdrawn from the resource store and the player receives tokens.
  const spendResource = useResourceStore(
    (s) => s.spendResource
  );

  const addTokens = useResourceStore(
    (s) => s.addTokens
  );

  const handleSell = (
    amount: number,
    afterTax: number
  ) => {
    const key = getResourceKey(selectedItem.name);

    if (!key) return;

    const spent = spendResource(key, amount);

    if (!spent) return;

    addTokens(afterTax);
  };





  return (

    <div
      style={{
        position:'fixed',
        inset:0,
        zIndex:50000,

        backgroundImage:
        "url('/assets/orion_marketplace_bg.png')",

        backgroundSize:'cover',
        backgroundPosition:'center',

        color:'#fff',

        fontFamily:
        "'Inter','Poppins',sans-serif",
      }}
    >



      <div
        style={{
          position:'absolute',
          inset:0,
          background:'rgba(0,0,0,.45)',
        }}
      />




      <div
        style={{
          position:'relative',
          height:'100%',
          display:'flex',
          flexDirection:'column',
        }}
      >



        <MarketplaceHeader
          onClose={onClose}
        />





        <div
          style={{
            height:55,

            display:'flex',

            alignItems:'center',

            justifyContent:'space-between',

            padding:'0 25px',

            background:'rgba(15,5,25,.9)',

            fontWeight:900,
          }}
        >



          <div
            style={{
              color:'#ffd700',
            }}
          >

            Orion Token : {hostTokens}

          </div>





          <div
            style={{
              display:'flex',

              alignItems:'center',

              gap:15,
            }}
          >



            <div>
              💎 Gem : {hostGems}
            </div>




            <div>

              {selectedItem.name} :

              {' '}

              {selectedAmount}

            </div>





            <button

              onClick={()=>
                setShowSell(true)
              }

              style={{

                border:'none',

                borderRadius:25,

                padding:'8px 25px',

                background:'#ffd700',

                fontWeight:900,

                cursor:'pointer',

              }}

            >

              SELL

            </button>




          </div>



        </div>







        <div
          style={{

            display:'grid',

            gridTemplateColumns:
            `${STYLE.sidebarWidth}px 1fr`,

            height:'calc(100vh - 130px)',

          }}
        >





          <CategorySidebar

            onSelect={setSelectedItem}

          />







          <main
            style={{

              padding:30,

              overflowY:'auto',

            }}
          >



            <MarketplaceListing

              itemName={selectedItem.name}

              itemImage={selectedItem.image}

            />



          </main>




        </div>







        {
          showSell &&

          <SellPanel

            itemName={selectedItem.name}

            itemImage={selectedItem.image}

            maxAmount={selectedAmount}

            onConfirm={handleSell}

            onClose={()=>
              setShowSell(false)
            }

          />

        }





      </div>



    </div>

  );

}