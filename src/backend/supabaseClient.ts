import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project') && supabaseAnonKey !== 'your-anon-key');

let currentWalletHeader: string | undefined;

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {},
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (currentWalletHeader) {
            headers.set('x-wallet-address', currentWalletHeader);
          }
          return fetch(input, { ...init, headers });
        },
      },
    })
  : null;

export const isSupabaseConfigured = isConfigured;

/**
 * Sets the custom header used by RLS policies to identify the current wallet.
 * Must be called before any Supabase query so RLS can match the row.
 */
export function setWalletHeader(walletAddress: string): void {
  currentWalletHeader = walletAddress;
}

export interface PlayerRow {
  id: string;
  wallet_address: string;
  username: string;
  level: number;
  experience: number;
  status: string;
  inventory: unknown;
  land: unknown;
  game_state: unknown;
  created_at: string;
  last_seen_at: string;
}

export interface SaveRow {
  id: string;
  player_id: string;
  player_data: unknown;
  saved_at: string;
}