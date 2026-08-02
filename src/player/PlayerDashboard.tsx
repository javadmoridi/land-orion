import type { WalletAddress } from '../types';
import { formatWalletAddress } from '../wallet/walletService';
import { useGameStore } from '../game/useGameStore';

interface PlayerDashboardProps {
  address?: WalletAddress;
}

export function PlayerDashboard({ address }: PlayerDashboardProps) {
  const { playerProfile, gameState } = useGameStore();

  return (
    <section style={{ marginBottom: '1.5rem', padding: '1.25rem', borderRadius: 14, background: 'rgba(255,255,255,0.06)' }}>
      <h2>Player Profile</h2>
      <p>Wallet: {address ? formatWalletAddress(address) : 'Not connected'}</p>
      <p>Player ID: {playerProfile?.id ?? (address ? `player-${address}` : 'Pending')}</p>
      <p>Status: {playerProfile?.status ?? 'connecting'}</p>
      <p>Inventory slots: {gameState?.inventory.length ?? 0}</p>
      <p>Land plots: {playerProfile?.land.length ?? 0}</p>
    </section>
  );
}
