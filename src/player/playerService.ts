import type { PlayerProfile, WalletAddress } from '../types';
import { createInventoryItem } from '../inventory/inventoryService';

export function createPlayerProfile(walletAddress: WalletAddress): PlayerProfile {
  return {
    id: `player-${walletAddress}`,
    walletAddress,
    username: `Player-${walletAddress.slice(0, 6)}`,
    level: 1,
    experience: 0,
    status: 'in-game',
    inventory: [createInventoryItem('starter-tool', 'Starter Tool')],
    land: [],
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
}

export function updatePlayerLastSeen(player: PlayerProfile): PlayerProfile {
  return {
    ...player,
    lastSeenAt: new Date().toISOString(),
  };
}
