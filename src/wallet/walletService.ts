import type { WalletSession, WalletAddress } from '../types';

export const TON_CONNECT_ONLY = 'ton-connect' as const;

// TON Connect requires an absolute URL to the manifest.
// Build it from the current origin so it works in dev and production.
export const MANIFEST_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/tonconnect-manifest.json`
    : '/tonconnect-manifest.json';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface WalletConnectionState {
  status: ConnectionStatus;
  session: WalletSession | null;
}

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
  // TON addresses are either raw "0:<hex>" (67 chars) or user-friendly
  // base64url addresses starting with EQ/EQ... (48 chars).
  if (!address) return false;
  if (address.startsWith('0:') && address.length === 67) return true;
  return /^[A-Za-z0-9_-]{48}$/.test(address);
}

export function getConnectionStatus(session: WalletSession | null, isConnectionRestored: boolean): ConnectionStatus {
  if (session) {
    return isConnectionRestored ? 'connected' : 'reconnecting';
  }
  return 'disconnected';
}