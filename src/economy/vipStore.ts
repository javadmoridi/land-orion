import { create } from 'zustand';
import { useGemStore } from './gemStore';

// ===========================================================================
// VIP store — premium membership tiers.
//
// Only the purchase structure / UI is built right now. The actual VIP benefits
// will be defined later. Buying a VIP tier costs Gems (from gemStore).
// Persistence is local for now and structured for Supabase later.
// ===========================================================================

export interface VipTier {
  id: string;
  name: string;
  durationLabel: string;
  /** Duration in months. */
  months: number;
  /** Cost in Gems. */
  costGems: number;
}

export const VIP_TIERS: VipTier[] = [
  { id: 'vip-3m', name: 'VIP 3 Months', durationLabel: '3 Months', months: 3, costGems: 2000 },
  { id: 'vip-6m', name: 'VIP 6 Months', durationLabel: '6 Months', months: 6, costGems: 3000 },
  { id: 'vip-2y', name: 'VIP 2 Years', durationLabel: '2 Years', months: 24, costGems: 10000 },
];

export interface ActiveVip {
  tierId: string;
  name: string;
  purchasedAt: string;
  expiresAt?: string;
}

interface VipSaveData {
  activeVips: ActiveVip[];
}

interface VipBackend {
  load(): Promise<VipSaveData | null>;
  save(data: VipSaveData): Promise<void>;
}

const LOCAL_STORAGE_KEY = 'land-orion-vip';

const localVipBackend: VipBackend = {
  async load(): Promise<VipSaveData | null> {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as VipSaveData;
    } catch {
      return null;
    }
  },
  async save(data: VipSaveData): Promise<void> {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  },
};

interface VipStoreState {
  activeVips: ActiveVip[];
  backend: VipBackend;
  /** Result of the last purchase attempt (UI feedback). */
  lastPurchase:
    | { ok: boolean; tierId?: string; error?: string }
    | null;

  // Actions
  initialize: () => Promise<void>;
  persist: () => Promise<void>;
  isVipActive: (tierId: string) => boolean;
  /**
   * Purchases a VIP tier with Gems. Returns a human-readable result.
   * Benefits of VIP are defined later.
   */
  purchaseVip: (tierId: string) => { ok: boolean; message: string } | { ok: true; message: string };
  reset: () => void;
}

export const useVipStore = create<VipStoreState>((set, get) => ({
  activeVips: [],
  backend: localVipBackend,
  lastPurchase: null,

  initialize: async () => {
    const data = await get().backend.load();
    if (data) {
      set({ activeVips: Array.isArray(data.activeVips) ? data.activeVips : [] });
    } else {
      void get().persist();
    }
  },

  persist: async () => {
    await get().backend.save({ activeVips: get().activeVips });
  },

  isVipActive: (tierId) => {
    const now = Date.now();
    return get().activeVips.some((v) => {
      if (v.tierId !== tierId) return false;
      if (v.expiresAt) return new Date(v.expiresAt).getTime() > now;
      return true;
    });
  },

  purchaseVip: (tierId) => {
    const tier = VIP_TIERS.find((t) => t.id === tierId);
    if (!tier) {
      const res = { ok: false as const, message: 'Unknown VIP tier.' };
      set({ lastPurchase: res });
      return res;
    }
    if (get().isVipActive(tierId)) {
      const res = { ok: false as const, message: `${tier.name} is already active.` };
      set({ lastPurchase: res });
      return res;
    }

    // Deduct Gems (from gemStore). Benefits will be defined later.
    const spent = useGemStore.getState().spendGems(tier.costGems);
    if (!spent) {
      const res = {
        ok: false as const,
        message: `Not enough Gems. Need ${tier.costGems} (you have ${useGemStore.getState().gems}).`,
      };
      set({ lastPurchase: res });
      return res;
    }

    const active: ActiveVip = {
      tierId,
      name: tier.name,
      purchasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + tier.months * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    set((s) => ({
      activeVips: [...s.activeVips, active],
      lastPurchase: { ok: true, tierId },
    }));
    void get().persist();

    const res = { ok: true as const, message: `${tier.name} activated for ${tier.durationLabel}.` };
    return res;
  },

  reset: () => {
    set({ activeVips: [], lastPurchase: null });
    void get().persist();
  },
}));
