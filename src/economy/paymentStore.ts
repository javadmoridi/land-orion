import { create } from 'zustand';
import { supabase, isSupabaseConfigured, setWalletHeader } from '../backend/supabaseClient';

// ===========================================================================
// Payment store — persists Gem purchases to the `payments` table and prevents
// a single tx_hash from being credited twice.
//
// Fields (Supabase `payments` table):
//   id, user_id, wallet_address, tx_hash, ton_amount, usd_amount,
//   gems_amount, status, created_at
//
// When Supabase is not configured it falls back to localStorage so the flow is
// still testable, but a real deployment must use the Supabase-backed path.
// ===========================================================================

export type PaymentStatus = 'pending' | 'confirmed' | 'failed';

export interface PaymentRecord {
  id: string;
  user_id: string;
  wallet_address: string;
  tx_hash: string;
  ton_amount: number;
  usd_amount: number;
  gems_amount: number;
  status: PaymentStatus;
  created_at: string;
}

export interface RecordPaymentInput {
  userId: string;
  walletAddress: string;
  txHash: string;
  tonAmount: number;
  usdAmount: number;
  gemsAmount: number;
  status?: PaymentStatus;
}

interface PaymentStoreState {
  /** tx hashes seen in this session / loaded from storage (dedupe guard). */
  usedTxHashes: string[];
  lastError: string | null;
  initialized: boolean;

  initialize: () => Promise<void>;
  isTxUsed: (txHash: string) => boolean;
  recordPayment: (input: RecordPaymentInput) => Promise<{ ok: boolean; reason?: string }>;
  markStatus: (txHash: string, status: PaymentStatus) => Promise<void>;
  reset: () => void;
}

const LOCAL_STORAGE_KEY = 'land-orion-payments';

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readLocalFallback(): PaymentRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PaymentRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocalFallback(payments: PaymentRecord[]): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payments));
  }
}

export const usePaymentStore = create<PaymentStoreState>((set, get) => ({
  usedTxHashes: [],
  lastError: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    const local = readLocalFallback();
    let used = local.map((p) => p.tx_hash);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('tx_hash');

        if (!error && Array.isArray(data)) {
          used = [...new Set([...used, ...data.map((r) => (r as { tx_hash: string }).tx_hash)])];
        }
      } catch (err) {
        console.warn('[paymentStore] initialize from Supabase failed:', err);
      }
    }

    set({ usedTxHashes: used, initialized: true });
  },

  isTxUsed: (txHash) => get().usedTxHashes.includes(txHash),

  recordPayment: async (input) => {
    // Guards against reusing the same transaction hash.
    if (get().isTxUsed(input.txHash)) {
      return { ok: false, reason: 'This transaction has already been used.' };
    }

    const now = new Date().toISOString();
    const record: PaymentRecord = {
      id: newId(),
      user_id: input.userId,
      wallet_address: input.walletAddress,
      tx_hash: input.txHash,
      ton_amount: input.tonAmount,
      usd_amount: input.usdAmount,
      gems_amount: input.gemsAmount,
      status: input.status ?? 'confirmed',
      created_at: now,
    };

    // Reserve the hash first so a retry can't double-credit.
    set((s) => ({ usedTxHashes: [...s.usedTxHashes, input.txHash], lastError: null }));

    if (isSupabaseConfigured && supabase) {
      setWalletHeader(input.walletAddress);
      const { error } = await supabase.from('payments').insert({
        id: record.id,
        user_id: record.user_id,
        wallet_address: record.wallet_address,
        tx_hash: record.tx_hash,
        ton_amount: record.ton_amount,
        usd_amount: record.usd_amount,
        gems_amount: record.gems_amount,
        status: record.status,
      });
      if (error) {
        console.error('[paymentStore] insert payment error:', error.message);
        set({ lastError: error.message });
        return { ok: false, reason: 'Could not save the payment. Contact support.' };
      }
    } else {
      // Local fallback (no Supabase configured).
      const all = readLocalFallback();
      all.push(record);
      writeLocalFallback(all);
    }

    return { ok: true };
  },

  markStatus: async (txHash, status) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('payments')
        .update({ status })
        .eq('tx_hash', txHash);
      if (error) console.error('[paymentStore] update status error:', error.message);
      return;
    }
    const all = readLocalFallback().map((p) =>
      p.tx_hash === txHash ? { ...p, status } : p,
    );
    writeLocalFallback(all);
  },

  reset: () => {
    set({ usedTxHashes: [], lastError: null, initialized: false });
  },
}));
