import { create } from 'zustand';
import { useGameStore } from '../game/useGameStore';
import { gemsToUsd } from './tonPriceService';
import type { GemPaymentResult } from './tonVerificationService';
import { usePaymentStore } from './paymentStore';

// ===========================================================================
// Gem store — special currency used for fast progression / VIP purchases.
//
// Gems are bought with Toncoin (TON): tonPriceService provides the live
// TON/USD rate, tonVerificationService sends + verifies the payment on-chain,
// and paymentStore persists purchases to Supabase. The store keeps the balance
// and only credits Gems after a verified, recorded payment.
// Persistence uses a local seam for now, structured for Supabase later.
// ===========================================================================

/** A preset amount of Gems the player can buy. */
export interface GemPackage {
  id: string;
  gems: number;
}

export const GEM_PACKAGES: GemPackage[] = [
  { id: 'gems-100', gems: 100 },
  { id: 'gems-500', gems: 500 },
  { id: 'gems-1000', gems: 1000 },
  { id: 'gems-2000', gems: 2000 },
];

export const STARTING_GEMS = 0;

interface GemSaveData {
  gems: number;
}

export interface GemBackend {
  load(): Promise<GemSaveData | null>;
  save(data: GemSaveData): Promise<void>;
}

const LOCAL_STORAGE_KEY = 'land-orion-gems';

const localGemBackend: GemBackend = {
  async load(): Promise<GemSaveData | null> {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as GemSaveData;
    } catch {
      return null;
    }
  },
  async save(data: GemSaveData): Promise<void> {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  },
};

/** A function, provided by the UI, that sends + verifies the TON payment. */
export type GemPaymentSender = (gems: number) => Promise<GemPaymentResult>;

interface GemStoreState {
  gems: number;
  backend: GemBackend;
  /** True while a purchase is waiting for wallet confirmation. */
  buying: boolean;
  /** Result of the last purchase attempt. */
  lastPurchase:
    | {
        ok: boolean;
        gems?: number;
        tonAmount?: number;
        usdAmount?: number;
        error?: string;
      }
    | null;

  // Actions
  initialize: () => Promise<void>;
  persist: () => Promise<void>;
  addGems: (amount: number) => void;
  /** Tries to spend gems; returns false if the balance is too low. */
  spendGems: (amount: number) => boolean;
  /**
   * Buys `gems` by running the provided TON sender. Only credits the balance
   * if the sender reports the payment as confirmed.
   */
  purchaseGems: (gems: number, sender: GemPaymentSender) => Promise<boolean>;
  resolvePurchaseGems: (
    gems: number,
    tonAmount: number,
    confirmed: boolean,
  ) => void;
  reset: () => void;
}

export const useGemStore = create<GemStoreState>((set, get) => ({
  gems: STARTING_GEMS,
  backend: localGemBackend,
  buying: false,
  lastPurchase: null,

  initialize: async () => {
    const data = await get().backend.load();
    if (data) {
      set({ gems: data.gems });
    } else {
      void get().persist();
    }
  },

  persist: async () => {
    await get().backend.save({ gems: get().gems });
  },

  addGems: (amount) => {
    if (amount <= 0) return;
    set((s) => ({ gems: s.gems + amount }));
    void get().persist();
  },

  spendGems: (amount) => {
    if (amount < 0 || get().gems < amount) return false;
    set((s) => ({ gems: s.gems - amount }));
    void get().persist();
    return true;
  },

  purchaseGems: async (gems, sender) => {
    if (gems <= 0) return false;

    set({ buying: true });
    try {
      // 1) The UI runs the real TON send + on-chain verification.
      const result = await sender(gems);

      // 2) Only proceed when the transaction is verified (and thus credible).
      if (!result.confirmed) {
        set({
          buying: false,
          lastPurchase: {
            ok: false,
            gems,
            error: result.reason ?? 'Payment was not verified.',
          },
        });
        return false;
      }

      if (!result.txHash) {
        set({
          buying: false,
          lastPurchase: {
            ok: false,
            gems,
            error: 'Missing transaction hash for verification.',
          },
        });
        return false;
      }

      // 3) Persist the payment (dedupes tx_hash) and only then credit Gems.
      const { playerProfile, wallet } = useGameStore.getState();
      const walletAddress = wallet?.address ?? playerProfile?.walletAddress ?? 'unknown';
      const userId = playerProfile?.id ?? 'unknown';

      const rec = await usePaymentStore.getState().recordPayment({
        userId,
        walletAddress,
        txHash: result.txHash,
        tonAmount: result.tonAmount,
        usdAmount: result.usdAmount,
        gemsAmount: gems,
        status: 'confirmed',
      });

      if (!rec.ok) {
        set({
          buying: false,
          lastPurchase: { ok: false, gems, error: rec.reason ?? 'Payment could not be recorded.' },
        });
        return false;
      }

      // 4) Credit the verified purchase.
      set((s) => ({ gems: s.gems + gems, buying: false }));
      void get().persist();
      set({
        lastPurchase: {
          ok: true,
          gems,
          tonAmount: result.tonAmount,
          usdAmount: result.usdAmount,
        },
      });
      return true;
    } catch (err) {
      set({
        buying: false,
        lastPurchase: {
          ok: false,
          gems,
          error: err instanceof Error ? err.message : 'Gem purchase failed.',
        },
      });
      return false;
    }
  },

  // Resolve a purchase result (used by the UI after payment + on-chain verify).
  resolvePurchaseGems: (gems, tonAmount, confirmed) => {
    if (confirmed) {
      set((s) => ({ gems: s.gems + gems }));
      void get().persist();
    }
    set({
      buying: false,
      lastPurchase: {
        ok: confirmed,
        gems,
        tonAmount,
        usdAmount: gemsToUsd(gems),
      },
    });
  },

  reset: () => {
    set({ gems: STARTING_GEMS, lastPurchase: null });
    void get().persist();
  },
}));
