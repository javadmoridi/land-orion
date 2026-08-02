import type { BackendSavePayload } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function createSupabaseConfig(url: string, anonKey: string): SupabaseConfig {
  return { url, anonKey };
}

export async function savePlayerData(payload: BackendSavePayload): Promise<void> {
  void payload;
  return Promise.resolve();
}

export async function loadPlayerData(playerId: string): Promise<BackendSavePayload | null> {
  void playerId;
  return Promise.resolve(null);
}
