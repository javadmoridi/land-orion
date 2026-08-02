import type { WalletAddress, WalletSession } from '../types';

export const TON_CONNECT_ONLY = 'ton-connect';

export function createWalletSession(address: WalletAddress): WalletSession {
  return {
    address,
    connectedAt: new Date().toISOString(),
    provider: TON_CONNECT_ONLY,
  };
}

export function formatWalletAddress(address: WalletAddress): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isTonAddress(address: WalletAddress): boolean {
  return address.length > 20 && address.startsWith('0x');
}
