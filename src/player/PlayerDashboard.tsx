import { useGameStore } from '../game/useGameStore';
import { formatWalletAddress } from '../wallet/walletService';

export function PlayerDashboard() {
  const { playerProfile, gameState, isConnected, wallet } = useGameStore();

  if (!isConnected || !playerProfile || !wallet) {
    return null;
  }

  return (
    <section style={{ marginBottom: '1.5rem', padding: '1.25rem', borderRadius: 14, background: 'rgba(255,255,255,0.06)' }}>
      <h2>Player Profile</h2>
      <p>Wallet: {formatWalletAddress(wallet.address)}</p>
      <p>Username: {playerProfile.username}</p>
      <p>Level: {playerProfile.level}</p>
      <p>Experience: {playerProfile.experience}</p>
      <p>Player ID: {playerProfile.id}</p>
      <p>Status: {playerProfile.status}</p>
      <p>Inventory slots: {gameState?.inventory.length ?? 0}</p>
      <p>Land plots: {playerProfile.land.length}</p>
      <p>Resource: {gameState ? Object.entries(gameState.resources).map(([key, value]) => `${key}: ${value}`).join(', ') : 'None'}</p>
      <p>Currency: {gameState ? Object.entries(gameState.currency).map(([key, value]) => `${key}: ${value}`).join(', ') : 'None'}</p>
    </section>
  );
}