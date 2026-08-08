import type { WalletSession, WalletAddress } from '../types';

export const TON_CONNECT_ONLY = 'ton-connect' as const;

// TON Connect requires an absolute URL to the manifest.
// Build it from the current origin (dev + production).
//
// NOTE: this is intentionally a *function* and not a module-level `const`.
// Reading `window.location.origin` at module-evaluation time makes the value
// depend on the environment that ran the import (server vs. browser) and causes
// it to be captured before React ever renders. That non-determinism is what can
// trigger a React hydration/strict-mode mismatch (#418).
//
// Instead, evaluate it lazily at first render (and memoize it) so the initial
// manifest URL is identical across React's StrictMode double-invoke and any
// future SSR path, and there is never a browser-only side effect at import.
export function getManifestUrl(): string {
  if (typeof window !== 'undefined' && typeof window.location?.origin === 'string') {
    return `${window.location.origin}/tonconnect-manifest.json`;
  }
  return '/tonconnect-manifest.json';
}

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