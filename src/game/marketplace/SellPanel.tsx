import { useState } from 'react';


interface SellPanelProps {
  itemName: string;
  itemImage: string;
  maxAmount?: number;
  onClose: () => void;
  onConfirm?: (amount: number, afterTax: number) => void;
}


export function SellPanel({
  itemName,
  itemImage,
  maxAmount = 100,
  onClose,
  onConfirm,
}: SellPanelProps) {


  const [amount,setAmount] = useState(1);

  const [price,setPrice] = useState(10);


  const tax = 25;


  const total = amount * price;

  const afterTax = Math.floor(
    total - (total * tax / 100)
  );

  const canList =
    Number.isFinite(amount) &&
    amount > 0 &&
    amount <= maxAmount &&
    Number.isFinite(price) &&
    price > 0;

  const handleList = () => {
    if (!canList) return;
    onConfirm?.(amount, afterTax);
    onClose();
  };



  return (

    <div
      style={{
        position:'fixed',
        inset:0,

        background:'rgba(0,0,0,.65)',

        display:'flex',
        alignItems:'center',
        justifyContent:'center',

        zIndex:99999,
      }}
    >


      <div
        style={{
          width:320,

          padding:20,

          borderRadius:20,

          background:'#17101f',

          color:'#fff',

          border:
          '1px solid rgba(255,215,0,.4)',
        }}
      >


        <h3>
          SELL {itemName}
        </h3>


        <img
          src={itemImage}
          style={{
            width:70,
            height:70,
            objectFit:'contain',
          }}
        />



        <div>
          Amount
        </div>


        <input

          type="number"

          min={1}

          max={maxAmount}

          value={amount}

          onChange={(e)=>
            setAmount(
              Math.min(
                Number(e.target.value),
                maxAmount
              )
            )
          }


          style={{
            width:'100%',
            padding:8,
          }}

        />



        <div>
          Price each item
        </div>


        <input

          type="number"

          min={1}

          value={price}

          onChange={(e)=>
            setPrice(
              Number(e.target.value)
            )
          }


          style={{
            width:'100%',
            padding:8,
          }}

        />



        <p>
          Tax: 25%
        </p>


        <p>
          Total: {total} Token
        </p>


        <p
          style={{
            color:'#ffd700',
            fontWeight:900,
          }}
        >
          After Tax: {afterTax} Token
        </p>




        <div
          style={{
            display:'flex',
            gap:10,
            marginTop:15,
          }}
        >


          <button
            onClick={onClose}

            style={{
              flex:1,
              borderRadius:20,
              padding:10,
              border:'none',
            }}
          >
            CANCEL
          </button>



          <button

            onClick={handleList}

            disabled={!canList}

            style={{
              flex:1,
              borderRadius:20,
              padding:10,
              border:'none',
              background: canList
                ? '#ffd700'
                : '#555',
              fontWeight:900,
              cursor: canList
                ? 'pointer'
                : 'not-allowed',
            }}

          >
            LIST
          </button>


        </div>


      </div>


    </div>

  );
}