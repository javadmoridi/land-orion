import { create } from 'zustand';
import { useGemStore } from './gemStore';

export interface VipTier {
  id: string;
  name: string;
  durationLabel: string;
  months: number;
  costGems: number;
}

export const VIP_TIERS: VipTier[] = [
  {
    id: 'vip-3m',
    name: 'VIP 3 Months',
    durationLabel: '3 Months',
    months: 3,
    costGems: 2000,
  },
  {
    id: 'vip-6m',
    name: 'VIP 6 Months',
    durationLabel: '6 Months',
    months: 6,
    costGems: 3000,
  },
  {
    id: 'vip-2y',
    name: 'VIP 2 Years',
    durationLabel: '2 Years',
    months: 24,
    costGems: 10000,
  },
];

export interface ActiveVip {
  tierId: string;
  name: string;
  purchasedAt: string;
  expiresAt: string;
}

interface VipSaveData {
  activeVip: ActiveVip | null;
}

interface VipBackend {
  load(): Promise<VipSaveData | null>;
  save(data: VipSaveData): Promise<void>;
}

const LOCAL_STORAGE_KEY =
  'land-orion-vip';

const localVipBackend: VipBackend = {
  async load(): Promise<VipSaveData | null> {
    if (
      typeof window === 'undefined'
    ) {
      return null;
    }

    const raw =
      window.localStorage.getItem(
        LOCAL_STORAGE_KEY
      );

    if (!raw) {
      return null;
    }

    try {
      const parsed =
        JSON.parse(raw) as Partial<VipSaveData>;

      return {
        activeVip:
          parsed.activeVip ?? null,
      };
    } catch {
      return null;
    }
  },

  async save(
    data: VipSaveData
  ): Promise<void> {
    if (
      typeof window === 'undefined'
    ) {
      return;
    }

    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(data)
    );
  },
};

interface VipStoreState {
  activeVip: ActiveVip | null;

  backend: VipBackend;

  lastPurchase:
    | {
        ok: boolean;
        tierId?: string;
        error?: string;
      }
    | null;

  initialize: () => Promise<void>;

  persist: () => Promise<void>;

  isVipActive: (
    tierId?: string
  ) => boolean;

  getRemainingMs: () => number;

  purchaseVip: (
    tierId: string
  ) =>
    | {
        ok: false;
        message: string;
      }
    | {
        ok: true;
        message: string;
      };

  reset: () => void;
}

export const useVipStore =
  create<VipStoreState>(
    (set, get) => ({
      activeVip: null,

      backend:
        localVipBackend,

      lastPurchase: null,

      // ================================================================
      // INITIALIZE
      // ================================================================

      initialize: async () => {
        const data =
          await get().backend.load();

        if (data?.activeVip) {
          const expiresAt =
            new Date(
              data.activeVip.expiresAt
            ).getTime();

          if (
            Number.isFinite(
              expiresAt
            ) &&
            expiresAt > Date.now()
          ) {
            set({
              activeVip:
                data.activeVip,
            });
          } else {
            set({
              activeVip: null,
            });

            void get().persist();
          }

          return;
        }

        set({
          activeVip: null,
        });

        void get().persist();
      },

      // ================================================================
      // PERSIST
      // ================================================================

      persist: async () => {
        await get().backend.save({
          activeVip:
            get().activeVip,
        });
      },

      // ================================================================
      // ACTIVE VIP
      // ================================================================

      isVipActive: (
        tierId
      ) => {
        const active =
          get().activeVip;

        if (!active) {
          return false;
        }

        const expiresAt =
          new Date(
            active.expiresAt
          ).getTime();

        const activeNow =
          Number.isFinite(
            expiresAt
          ) &&
          expiresAt >
            Date.now();

        if (!activeNow) {
          if (
            get().activeVip !== null
          ) {
            set({
              activeVip: null,
            });

            void get().persist();
          }

          return false;
        }

        if (!tierId) {
          return true;
        }

        return (
          active.tierId === tierId
        );
      },

      // ================================================================
      // REMAINING TIME
      // ================================================================

      getRemainingMs: () => {
        const active =
          get().activeVip;

        if (!active) {
          return 0;
        }

        const expiresAt =
          new Date(
            active.expiresAt
          ).getTime();

        const remaining =
          expiresAt -
          Date.now();

        if (
          remaining <= 0
        ) {
          set({
            activeVip: null,
          });

          void get().persist();

          return 0;
        }

        return remaining;
      },

      // ================================================================
      // PURCHASE
      // ================================================================

      purchaseVip: (
        tierId
      ) => {
        const tier =
          VIP_TIERS.find(
            (item) =>
              item.id === tierId
          );

        if (!tier) {
          const result = {
            ok: false as const,
            message:
              'Unknown VIP tier.',
          };

          set({
            lastPurchase:
              result,
          });

          return result;
        }

        /*
         * Only ONE VIP can be active.
         */
        if (
          get().isVipActive()
        ) {
          const active =
            get().activeVip;

          const result = {
            ok: false as const,
            message:
              active
                ? `${active.name} is already active.`
                : 'A VIP membership is already active.',
          };

          set({
            lastPurchase:
              result,
          });

          return result;
        }

        const gems =
          useGemStore.getState()
            .gems;

        if (
          gems <
          tier.costGems
        ) {
          const result = {
            ok: false as const,
            message:
              `Not enough Gems. Need ${tier.costGems} (you have ${gems}).`,
          };

          set({
            lastPurchase:
              result,
          });

          return result;
        }

        const spent =
          useGemStore
            .getState()
            .spendGems(
              tier.costGems
            );

        if (!spent) {
          const result = {
            ok: false as const,
            message:
              'Unable to spend Gems.',
          };

          set({
            lastPurchase:
              result,
          });

          return result;
        }

        const purchasedAt =
          new Date();

        const expiresAt =
          new Date(
            purchasedAt.getTime() +
              tier.months *
                30 *
                24 *
                60 *
                60 *
                1000
          );

        const activeVip:
          ActiveVip = {
            tierId:
              tier.id,

            name:
              tier.name,

            purchasedAt:
              purchasedAt.toISOString(),

            expiresAt:
              expiresAt.toISOString(),
          };

        set({
          activeVip,

          lastPurchase: {
            ok: true,
            tierId:
              tier.id,
          },
        });

        void get().persist();

        return {
          ok: true as const,

          message:
            `${tier.name} activated until ${expiresAt.toLocaleString()}.`,
        };
      },

      // ================================================================
      // RESET
      // ================================================================

      reset: () => {
        set({
          activeVip: null,
          lastPurchase: null,
        });

        void get().persist();
      },
    })
  );