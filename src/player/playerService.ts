import type { PlayerProfile, WalletAddress } from '../types';

export function createPlayerProfile(walletAddress: WalletAddress): PlayerProfile {
  const now = new Date().toISOString();
  // This is ONLY used as a fallback initial shape if the Supabase row
  // somehow lacks required fields. Real accounts are created in Supabase
  // via createNewPlayer in supabaseService.
  return {
    id: `player-${walletAddress}`,
    walletAddress,
    username: `Player-${walletAddress.slice(0, 6)}`,
    level: 1,
    experience: 0,
    status: 'connecting',
    inventory: [],
    land: [],
    createdAt: now,
    lastSeenAt: now,
  };
}

export function updatePlayerLastSeen(player: PlayerProfile): PlayerProfile {
  return {
    ...player,
    lastSeenAt: new Date().toISOString(),
  };
}