import { useEffect } from 'react';
import { useGameStore } from './useGameStore';

export function GameWorld() {
  const { gameState, playerProfile, saveGame, saveStatus, lastSavedAt, isSaving } = useGameStore();

  useEffect(() => {
    if (!playerProfile) return;
    const interval = window.setInterval(() => {
      void saveGame();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [saveGame, playerProfile]);

  if (!playerProfile) {
    return null;
  }

  return (
    <section style={{ padding: '1.5rem', borderRadius: 16, background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
      <h2>Land-Orion World</h2>
      <p>Welcome back, {playerProfile.username}.</p>
      <ul>
        <li>Current mission: {gameState?.progress.currentMissionId ?? 'None'}</li>
        <li>Inventory: {gameState?.inventory.length ? gameState.inventory.map((item) => `${item.name} (x${item.quantity})`).join(', ') : 'Empty'}</li>
        <li>Resources: {gameState && Object.keys(gameState.resources).length ? Object.entries(gameState.resources).map(([key, value]) => `${key}: ${value}`).join(', ') : 'None'}</li>
        <li>Currency: {gameState && Object.keys(gameState.currency).length ? Object.entries(gameState.currency).map(([key, value]) => `${key}: ${value}`).join(', ') : 'None'}</li>
        <li>Land plots: {playerProfile.land.length}</li>
        <li>Buildings: {playerProfile.land.flatMap((plot) => plot.buildings).length}</li>
      </ul>

      <div style={{ marginTop: '1rem', color: '#8fb5ff' }}>
        <p>Status: {isSaving ? 'Saving...' : saveStatus}</p>
        <p>Last save: {lastSavedAt ?? 'Not saved yet'}</p>
      </div>

      <button
        onClick={() => void saveGame()}
        style={{ position: 'fixed', bottom: '1rem', left: '1rem', padding: '0.8rem 1rem', borderRadius: 999, border: 'none', background: '#32c787', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}
      >
        Save
      </button>
    </section>
  );
}