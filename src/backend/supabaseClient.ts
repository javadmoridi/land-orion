import { createClient } from '@supabase/supabase-js';

import type { LandPlot } from '../types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL as
    | string
    | undefined;

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY as
    | string
    | undefined;

export const isSupabaseConfigured =
  Boolean(
    SUPABASE_URL &&
      SUPABASE_ANON_KEY,
  );

export const supabase =
  isSupabaseConfigured
    ? createClient(
        SUPABASE_URL!,
        SUPABASE_ANON_KEY!,
      )
    : null;

// ============================================================================
// PLAYER ROW
// ============================================================================

export type PlayerRow = {
  id: string;
  wallet: string;
  level: number | null;
  game_data: unknown;
  created_at: string;
};

// ============================================================================
// WALLET HEADER
// ============================================================================

let currentWallet: string | null =
  null;

export function setWalletHeader(
  walletAddress: string,
): void {
  currentWallet =
    walletAddress;
}

export function getWalletHeader():
  | string
  | null {
  return currentWallet;
}

// ============================================================================
// LAND TYPE HELPER
// ============================================================================

export type SupabaseLandPlot =
  LandPlot;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default supabase;