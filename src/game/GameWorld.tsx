import { useEffect, useCallback } from 'react';
import { useGameStore } from './useGameStore';
import { OrionBackground } from './OrionBackground';
import { PlayerIsland } from './PlayerIsland';
import { LevelBadge } from './LevelBadge';

export function GameWorld() {
  const {
    playerProfile,
    gameState,
    saveGame,
    movePlayer,
  } = useGameStore();

  // Auto-save every 3 seconds (logic preserved, no UI)
  useEffect(() => {
    if (!playerProfile) return;
    const interval = window.setInterval(() => {
      void saveGame();
    }, 3000);
    return () => window.clearInterval(interval);
  }, [saveGame, playerProfile]);

  // Keyboard movement (WASD + arrows) – logic preserved, no UI
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!playerProfile) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Full-screen background image */}
      <OrionBackground />

      {/* Floating level HUD badge */}
      <LevelBadge level={playerProfile.level} experience={playerProfile.experience} />

      {/* Player island centered in the world */}
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
          inventory={gameState?.inventory.map((item) => ({ id: item.id, quantity: item.quantity })) ?? []}
        />
      </div>
    </div>
  );
}