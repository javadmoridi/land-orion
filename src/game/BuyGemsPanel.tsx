import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import type { CSSProperties } from 'react';

import {
  GEM_PACKAGES,
  useGemStore,
  type GemPackage,
} from '../economy/gemStore';

import {
  calcTonAmountForGems,
  gemsToUsd,
} from '../economy/tonPriceService';

import {
  sendGemPaymentAndVerify,
  TON_RECEIVER_ADDRESS,
} from '../economy/tonVerificationService';


interface BuyGemsPanelProps {
  open: boolean;
  onClose: () => void;
}


export function BuyGemsPanel({
  open,
  onClose,
}: BuyGemsPanelProps) {

  const [tonConnectUI] = useTonConnectUI();

  const gems = useGemStore((s) => s.gems);
  const buying = useGemStore((s) => s.buying);
  const lastPurchase = useGemStore((s) => s.lastPurchase);
  const purchaseGems = useGemStore((s) => s.purchaseGems);

  const [selected, setSelected] =
    useState<GemPackage | null>(null);


  if (!open) return null;


  const panelStyle: CSSProperties = {
    width: 'min(440px, 100%)',
    maxHeight: '85vh',
    overflowY: 'auto',
    background: 'rgba(10,14,26,0.96)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(143,92,245,0.4)',
    borderRadius: 16,
    boxShadow: '0 0 40px rgba(0,0,0,0.6)',
    padding: '1.25rem',
  };


  async function handleBuy(pkg: GemPackage) {

    setSelected(pkg);

    await purchaseGems(
      pkg.gems,
      async (gemsToBuy) => {

        return sendGemPaymentAndVerify(
          tonConnectUI,
          gemsToBuy,
        );

      }
    );
  }


  return (

    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        padding: '1rem',
      }}
      onClick={onClose}
    >

      <div
        style={panelStyle}
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div
          style={{
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
          }}
        >

          <h2
            style={{
              color:'#8a5cf5',
            }}
          >
            🛒 Buy Gems
          </h2>


          <button
            onClick={onClose}
            style={{
              background:'rgba(255,255,255,0.08)',
              border:'none',
              color:'#fff',
              borderRadius:8,
              width:32,
              height:32,
              cursor:'pointer',
            }}
          >
            ✕
          </button>

        </div>


        <p
          style={{
            fontSize:'0.85rem',
            color:'#9fb0d0',
          }}
        >

          💎 Your Gems:
          {' '}
          <strong>
            {gems.toLocaleString()}
          </strong>

          <br />

          1 Gem = 0.01 TON

        </p>



        <div
          style={{
            display:'flex',
            flexDirection:'column',
            gap:'0.6rem',
          }}
        >

          {GEM_PACKAGES.map((pkg)=>{

            const usd =
              gemsToUsd(pkg.gems);

            const ton =
              calcTonAmountForGems(
                pkg.gems
              );


            return (

              <div
                key={pkg.id}
                style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'space-between',
                  gap:'0.5rem',
                  padding:'0.7rem 0.9rem',
                  borderRadius:10,

                  background:
                    selected?.id === pkg.id
                    ? 'rgba(138,92,245,0.15)'
                    : 'rgba(255,255,255,0.05)',
                }}
              >

                <div>
                  💎 {pkg.gems.toLocaleString()}
                </div>


                <div
                  style={{
                    fontSize:'0.78rem',
                    color:'#9fb0d0',
                  }}
                >
                  {usd.toFixed(2)} USD
                  <br />
                  {ton.toFixed(2)} TON
                </div>


                <button
                  disabled={buying}
                  onClick={() =>
                    handleBuy(pkg)
                  }
                  style={{
                    background:'#8a5cf5',
                    color:'#fff',
                    border:'none',
                    borderRadius:8,
                    padding:'0.45rem 0.8rem',
                    cursor:'pointer',
                  }}
                >
                  {
                    buying &&
                    selected?.id === pkg.id
                    ? 'Paying...'
                    : 'Buy'
                  }
                </button>


              </div>

            );

          })}

        </div>



        {lastPurchase && (

          <div
            style={{
              marginTop:'1rem',
              padding:'0.7rem',
              borderRadius:10,
              color:'#fff',
              background:
                lastPurchase.ok
                ? 'rgba(46,160,67,0.2)'
                : 'rgba(255,80,80,0.2)',
            }}
          >

            {
              lastPurchase.ok
              ? `✅ ${lastPurchase.gems} Gems added`
              : lastPurchase.error
            }

          </div>

        )}



        <p
          style={{
            marginTop:'1rem',
            fontSize:'0.7rem',
            color:'#6b7c99',
            wordBreak:'break-all',
          }}
        >
          TON receive address:
          {' '}
          {TON_RECEIVER_ADDRESS}
        </p>


      </div>

    </div>

  );
}