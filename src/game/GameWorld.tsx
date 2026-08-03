import { useEffect, useCallback } from 'react';
import { useGameStore, type WorldTile } from './useGameStore';
import { OrionBackground } from './OrionBackground';

const TILE_SIZE = 56;
const GRID_SIZE = 10;

function tileEmoji(tile: WorldTile): string {
  if (tile.harvested) return '🌱';
  switch (tile.type) {
    case 'tree': return '🌳';
    case 'rock': return '🪨';
    case 'farm': return '🌾';
    case 'water': return '🌊';
    default: return '🌿';
  }
}

function tileColor(tile: WorldTile): string {
  if (tile.type === 'water') return '#1a4a7a';
  if (tile.type === 'farm') return '#8a6d3b';
  if (tile.type === 'tree') return '#2d5a27';
  if (tile.type === 'rock') return '#5a5a5a';
  return '#3a7d44';
}

export function GameWorld() {
  const {
    gameState,
    playerProfile,
    saveGame,
    saveStatus,
    lastSavedAt,
    isSaving,
    playerPosition,
    worldTiles,
    selectedTile,
    movePlayer,
    interactWithTile,
    selectTile,
  } = useGameStore();

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
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(1, 0);
          break;
      }
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

  const resources = gameState?.resources ?? {};
  const inventory = gameState?.inventory ?? [];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Living Orion background */}
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

        {/* Player's land island */}
        <div
          style={{
            padding: 12,
            borderRadius: 16,
            background: 'rgba(10, 14, 26, 0.6)',
            backdropFilter: 'blur(4px)',
            border: '2px solid rgba(79, 124, 255, 0.3)',
            boxShadow: '0 0 40px rgba(79, 124, 255, 0.15)',
          }}
        >
          {/* Game Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
              gap: 2,
              background: '#0a0e1a',
              padding: 8,
              borderRadius: 12,
              width: 'fit-content',
              margin: '0 auto',
              border: '2px solid #2c3e5a',
            }}
          >
            {worldTiles.map((tile) => {
              const isPlayer = tile.x === playerPosition.x && tile.y === playerPosition.y;
              const isSelected = selectedTile?.id === tile.id;
              const isAdjacent =
                Math.abs(tile.x - playerPosition.x) + Math.abs(tile.y - playerPosition.y) === 1;

              return (
                <div
                  key={tile.id}
                  onClick={() => {
                    selectTile(tile);
                    if (isAdjacent && tile.harvestable && !tile.harvested) {
                      interactWithTile(tile);
                    }
                  }}
                  style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isPlayer ? '1.8rem' : '1.4rem',
                    background: tileColor(tile),
                    borderRadius: 6,
                    cursor: isAdjacent && tile.harvestable && !tile.harvested ? 'pointer' : 'default',
                    border: isSelected
                      ? '3px solid #ffd700'
                      : isAdjacent && tile.harvestable && !tile.harvested
                        ? '2px solid rgba(255,215,0,0.4)'
                        : '1px solid rgba(0,0,0,0.2)',
                    position: 'relative',
                    transition: 'transform 0.1s',
                    transform: isPlayer ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {isPlayer ? '🧑‍🌾' : tileEmoji(tile)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls hint */}
        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7c99', fontSize: '0.85rem' }}>
          <p>Move: WASD / Arrow Keys • Click adjacent tree/rock/farm to harvest</p>
        </div>

        {/* Selected tile info */}
        {selectedTile && (
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
            <p style={{ margin: 0 }}>
              {selectedTile.harvested
                ? `🌱 ${selectedTile.type} (harvested)`
                : `${tileEmoji(selectedTile)} ${selectedTile.type}${selectedTile.harvestable ? ' — click to harvest' : ''}`}
            </p>
          </div>
        )}

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
          <p>Last save: {lastSavedAt ?? 'Not saved yet'}</p>
        </div>
      </div>
    </div>
  );
}