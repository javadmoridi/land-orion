import { useState } from 'react';

import { VipPanel } from './VipPanel';
import { MarketplacePanel } from './marketplace/MarketplacePanel';

export function xpRequiredForLevel(
  level: number
): number {
  return Math.round(
    20 * Math.pow(1.2, level - 1)
  );
}

const VIP_IMAGE =
  '/assets/orion-vip-button.png';

interface LevelBadgeProps {
  level: number;
  experience: number;
}

export function LevelBadge({
  level: _level,
  experience: _experience,
}: LevelBadgeProps) {
  const [vipOpen, setVipOpen] =
    useState(false);

  const [shopOpen, setShopOpen] =
    useState(false);

  const [battleOpen, setBattleOpen] =
    useState(false);

  const anyPanelOpen =
    vipOpen ||
    shopOpen ||
    battleOpen;

  return (
    <>
      {/* ============================================================
          RIGHT SIDE BUTTONS
          مخفی می‌شوند وقتی یکی از پنل‌ها باز است
      ============================================================ */}

      {!anyPanelOpen && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {/* VIP */}

          <button
            type="button"
            onClick={() =>
              setVipOpen(true)
            }
            title="VIP"
            style={{
              width: 90,
              height: 90,
              padding: 0,
              border: 'none',
              borderRadius: '50%',
              background:
                'transparent',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <img
              src={VIP_IMAGE}
              alt="VIP"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit:
                  'contain',
                imageRendering:
                  'pixelated',
                display: 'block',
              }}
            />
          </button>

          {/* SHOP */}

          <button
            type="button"
            onClick={() =>
              setShopOpen(true)
            }
            title="Shop"
            style={{
              width: 90,
              height: 90,
              padding: 0,
              border: 'none',
              borderRadius: '50%',
              background:
                'transparent',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <img
              src="/assets/orion-shop-button.png"
              alt="Shop"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit:
                  'contain',
                imageRendering:
                  'pixelated',
                display: 'block',
              }}
            />
          </button>

          {/* BATTLE */}

          <button
            type="button"
            onClick={() =>
              setBattleOpen(true)
            }
            title="Battle"
            style={{
              width: 90,
              height: 90,
              padding: 0,
              border: 'none',
              borderRadius: '50%',
              background:
                'transparent',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <img
              src="/assets/orion-battle-button.png"
              alt="Battle"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit:
                  'contain',
                imageRendering:
                  'pixelated',
                display: 'block',
              }}
            />
          </button>
        </div>
      )}

      {/* ============================================================
          VIP
      ============================================================ */}

      <VipPanel
        open={vipOpen}
        onClose={() =>
          setVipOpen(false)
        }
      />

      {/* ============================================================
          MARKETPLACE
      ============================================================ */}

      <MarketplacePanel
        open={shopOpen}
        onClose={() =>
          setShopOpen(false)
        }
      />

      {/* ============================================================
          FULL SCREEN BATTLE PAGE
      ============================================================ */}

      {battleOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.42)), url('/assets/battle-menu-bg.png')",
            backgroundSize:
              'cover',
            backgroundPosition:
              'center',
            backgroundRepeat:
              'no-repeat',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            overflow: 'hidden',
          }}
        >
          {/* CLOSE */}

          <button
            type="button"
            onClick={() =>
              setBattleOpen(false)
            }
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 48,
              height: 48,
              border:
                '1px solid rgba(255,255,255,.25)',
              borderRadius: 12,
              background:
                'rgba(0,0,0,.65)',
              color: '#fff',
              cursor:
                'pointer',
              fontSize: 18,
              fontWeight: 900,
              zIndex: 20,
            }}
          >
            X
          </button>

          {/* CENTER MENU */}

          <div
            style={{
              width:
                'min(430px, 86vw)',
              display: 'flex',
              flexDirection:
                'column',
              gap: 18,
            }}
          >
            <div
              style={{
                textAlign:
                  'center',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize:
                    'clamp(2rem, 7vw, 3.5rem)',
                  fontWeight: 1000,
                  letterSpacing:
                    '.14em',
                  color:
                    '#ffd700',
                  textShadow:
                    '0 4px 20px rgba(0,0,0,.9)',
                }}
              >
                BATTLE
              </div>

              <div
                style={{
                  marginTop: 8,
                  color:
                    'rgba(255,255,255,.82)',
                  fontSize: '.78rem',
                  letterSpacing:
                    '.12em',
                }}
              >
                CHOOSE YOUR BATTLE
              </div>
            </div>

            <BattleOptionButton
              title="BATTLE VS BOT"
              subtitle="Fight against an AI opponent"
              onClick={() => {
                console.log(
                  'BATTLE VS BOT'
                );
              }}
            />

            <BattleOptionButton
              title="ONLINE BATTLE"
              subtitle="Fight against another player"
              onClick={() => {
                console.log(
                  'ONLINE BATTLE'
                );
              }}
            />

            <BattleOptionButton
              title="CLAN BATTLE"
              subtitle="Fight together with your clan"
              onClick={() => {
                console.log(
                  'CLAN BATTLE'
                );
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// BATTLE OPTION
// ============================================================================

interface BattleOptionButtonProps {
  title: string;
  subtitle: string;
  onClick: () => void;
}

function BattleOptionButton({
  title,
  subtitle,
  onClick,
}: BattleOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 82,
        padding:
          '16px 20px',
        border:
          '2px solid rgba(255,215,0,.45)',
        borderRadius: 16,
        background:
          'rgba(0,0,0,.68)',
        color: '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow:
          '0 10px 30px rgba(0,0,0,.42)',
        backdropFilter:
          'blur(6px)',
        transition:
          'transform .15s ease, border-color .15s ease',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          'scale(1.02)';

        event.currentTarget.style.borderColor =
          'rgba(255,215,0,.9)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          'scale(1)';

        event.currentTarget.style.borderColor =
          'rgba(255,215,0,.45)';
      }}
    >
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 900,
          letterSpacing:
            '.04em',
          color: '#ffd700',
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: '.74rem',
          color:
            '#b7c0d3',
        }}
      >
        {subtitle}
      </div>
    </button>
  );
}
