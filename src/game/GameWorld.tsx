import { useEffect, useCallback } from 'react';
import { useGameStore } from './useGameStore';
import { useResourceStore } from '../economy/resourceStore';
import { useGemStore } from '../economy/gemStore';
import { useVipStore } from '../economy/vipStore';
import { usePaymentStore } from '../economy/paymentStore';
import { OrionBackground } from './OrionBackground';
import { PlayerIsland } from './PlayerIsland';
import { LevelBadge } from './LevelBadge';
import { ResourceDisplay } from './ResourceDisplay';
import { QuestButton } from './QuestButton';

export function GameWorld() {
  const {
    playerProfile,
    gameState,
    saveGame,
    movePlayer,
    error,
    connectionStatus,
    disconnectWallet,
  } = useGameStore();

  const initializeResources = useResourceStore((s) => s.initialize);
  const initializeGems = useGemStore((s) => s.initialize);
  const initializeVip = useVipStore((s) => s.initialize);
  const initializePayments = usePaymentStore((s) => s.initialize);

  useEffect(() => {
    void initializeResources();
    void initializeGems();
    void initializeVip();
    void initializePayments();
  }, [
    initializeResources,
    initializeGems,
    initializeVip,
    initializePayments,
  ]);

  useEffect(() => {
    if (!playerProfile) return;

    const interval = window.setInterval(() => {
      void saveGame();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [saveGame, playerProfile]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let dx = 0;
      let dy = 0;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          dy = -1;
          break;

        case 'ArrowDown':
        case 's':
        case 'S':
          dy = 1;
          break;

        case 'ArrowLeft':
        case 'a':
        case 'A':
          dx = -1;
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
          dx = 1;
          break;

        default:
          return;
      }

      movePlayer(dx, dy);
    },
    [movePlayer],
  );

  useEffect(() => {
    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [handleKeyDown]);


  if (!playerProfile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          gap: '20px',
          background: '#071426',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <h2>
          {error
            ? 'Game Loading Error'
            : 'Loading Player...'}
        </h2>

        <p>
          Connection:
          {' '}
          {connectionStatus}
        </p>

        {error && (
          <p>
            {error}
          </p>
        )}

        {error && (
          <button
            onClick={disconnectWallet}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
            }}
          >
            Disconnect Wallet
          </button>
        )}
      </div>
    );
  }


  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >

      <OrionBackground />


      <LevelBadge
        level={1}
        experience={0}
      />


      <ResourceDisplay />


      <QuestButton />


      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <PlayerIsland
          level={playerProfile.level}
          resources={
            gameState?.resources ?? {}
          }
          inventory={
            gameState?.inventory.map(
              (item) => ({
                id: item.id,
                quantity: item.quantity,
              }),
            ) ?? []
          }
        />
      </div>

    </div>
  );
}