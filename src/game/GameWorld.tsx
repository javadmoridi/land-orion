import { useEffect, useCallback } from 'react';
import { useGameStore } from './useGameStore';
import { useResourceStore } from '../economy/resourceStore';
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
  } = useGameStore();

  const initializeResources = useResourceStore((s) => s.initialize);

  // Load resource balances once (local storage for now, Supabase later).
  useEffect(() => {
    void initializeResources();
  }, [initializeResources]);

  // Auto-save every 3 seconds
  useEffect(() => {
    if (!playerProfile) return;

    const interval = window.setInterval(() => {
      void saveGame();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [saveGame, playerProfile]);

  // Keyboard movement
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
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!playerProfile) {
    return null;
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

      {/* XP TEST MODE */}
      <LevelBadge
        level={1}
        experience={0}
      />

      {/* Player resource HUD (coins + Orion Token) below the level circle */}
      <ResourceDisplay />

      {/* Floating quest button on the left side */}
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
          resources={gameState?.resources ?? {}}
          inventory={
            gameState?.inventory.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })) ?? []
          }
        />
      </div>
    </div>
  );
}