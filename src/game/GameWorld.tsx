import { useEffect, useCallback, useState } from 'react';
import { useGameStore } from './useGameStore';
import { OrionBackground } from './OrionBackground';
import { PlayerIsland } from './PlayerIsland';

export function GameWorld() {
  const {
    gameState,
    playerProfile,
    saveGame,
    saveStatus,
    isSaving,
    movePlayer,
  } = useGameStore();

  // Player position is managed locally on the island (center-start).
  const islandSize = playerProfile?.level && playerProfile.level >= 3 ? 7 : playerProfile?.level === 2 ? 5 : 3;
  const [playerX, setPlayerX] = useState(Math.floor(islandSize / 2));
  const [playerY, setPlayerY] = useState(Math.floor(islandSize / 2));

  // Auto-save every 3 seconds
  useEffect(() => {
    if (!playerProfile) return;
    const interval = window.setInterval(() => {
      void saveGame();
    }, 3000);
    return () => window.clearInterval(interval);
  }, [saveGame, playerProfile]);

  // Keyboard movement (WASD + arrows)
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

      const newX = playerX + dx;
      const newY = playerY + dy;

      // Boundary check within the island grid
      if (newX < 0 || newX >= islandSize || newY < 0 || newY >= islandSize) return;

      setPlayerX(newX);
      setPlayerY(newY);
      movePlayer(dx, dy);
    },
    [playerX, playerY, islandSize, movePlayer],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!playerProfile) {
    return null;
  }

  const resources = gameState?.resources ?? {};
  const inventory = gameState?.inventory ?? [];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Living Orion background (unchanged) */}
      <OrionBackground />

      {/* Game world above background */}
      <div className="orion-world">
        {/* Top HUD */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            background: 'rgba(10, 14, 26, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
            width: '100%',
            maxWidth: 620,
            border: '1px solid rgba(79, 124, 255, 0.2)',
          }}
        >
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: '#8fb5ff', fontSize: '0.8rem' }}>LEVEL</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{playerProfile.level}</div>
            </div>
            <div>
              <span style={{ color: '#8fb5ff', fontSize: '0.8rem' }}>XP</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{playerProfile.experience}</div>
            </div>
            <div>
              <span style={{ color: '#8fb5ff', fontSize: '0.8rem' }}>WOOD</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>🪵 {resources.wood ?? 0}</div>
            </div>
            <div>
              <span style={{ color: '#8fb5ff', fontSize: '0.8rem' }}>STONE</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>🪨 {resources.stone ?? 0}</div>
            </div>
            <div>
              <span style={{ color: '#8fb5ff', fontSize: '0.8rem' }}>FOOD</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>🌾 {resources.food ?? 0}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7c99' }}>
              {isSaving ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : saveStatus}
            </span>
            <button
              onClick={() => void saveGame()}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: 'none',
                background: '#32c787',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Save
            </button>
          </div>
        </div>

        {/* Player's raw pixel-art island (level-based size) */}
        <PlayerIsland level={playerProfile.level} playerX={playerX} playerY={playerY} />

        {/* Controls hint */}
        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7c99', fontSize: '0.85rem' }}>
          <p>Move: WASD / Arrow Keys</p>
        </div>

        {/* Inventory */}
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(10, 14, 26, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: 10,
            maxWidth: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
            textAlign: 'center',
            border: '1px solid rgba(79, 124, 255, 0.2)',
          }}
        >
          <span style={{ color: '#8fb5ff', fontSize: '0.8rem' }}>INVENTORY</span>
          <div style={{ marginTop: '0.25rem' }}>
            {inventory.length > 0
              ? inventory.map((item) => `${item.name} (x${item.quantity})`).join(' • ')
              : 'Empty'}
          </div>
        </div>

        {/* Debug info (hidden visually, kept for debugging) */}
        <div style={{ display: 'none' }}>
          <p>Player: {playerProfile.id}</p>
          <p>Wallet: {playerProfile.walletAddress}</p>
          <p>Land plots: {playerProfile.land.length}</p>
          <p>Status: {playerProfile.status}</p>
          <p>Last save: {saveStatus}</p>
        </div>
      </div>
    </div>
  );
}