import type { BackendSavePayload } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_KEY = 'land-orion-save';

export function createSupabaseConfig(url: string, anonKey: string): SupabaseConfig {
  return { url, anonKey };
}

export async function savePlayerData(payload: BackendSavePayload): Promise<void> {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return Promise.resolve();
}

export async function loadPlayerData(playerId: string): Promise<BackendSavePayload | null> {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const parsed = JSON.parse(raw) as BackendSavePayload;
  if (parsed.player.id !== playerId) return null;
  return parsed;
}
