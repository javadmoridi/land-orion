import { create } from 'zustand';
import { useGameStore } from '../game/useGameStore';
import type { GemPaymentResult } from './tonVerificationService';
import { usePaymentStore } from './paymentStore';

// ===========================================================================
// Gem store
//
// Fixed pricing:
//   1 Gem    = 0.01 TON
//   100 Gems = 1 TON
//   500 Gems = 5 TON
//   1000 Gems = 10 TON
//   2000 Gems = 20 TON
//
// Minimum purchase:
//   100 Gems
// ===========================================================================

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

export const MIN_GEM_PURCHASE = 100;

export const TON_PER_GEM = 0.01;

/**
 * Convert requested Gems to the exact TON amount.
 *
 * Examples:
 * 100  -> 1
 * 500  -> 5
 * 1000 -> 10
 * 2000 -> 20
 */
export function gemsToTon(
  gems: number
): number {
  return gems * TON_PER_GEM;
}

interface GemSaveData {
  gems: number;
}

export interface GemBackend {
  load(): Promise<GemSaveData | null>;
  save(data: GemSaveData): Promise<void>;
}

const LOCAL_STORAGE_KEY =
  'land-orion-gems';

const localGemBackend: GemBackend = {
  async load(): Promise<GemSaveData | null> {
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
      return JSON.parse(
        raw
      ) as GemSaveData;
    } catch {
      return null;
    }
  },

  async save(
    data: GemSaveData
  ): Promise<void> {
    if (
      typeof window !== 'undefined'
    ) {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(data)
      );
    }
  },
};

/**
 * Function provided by the UI.
 *
 * The UI receives the requested Gems, then sends/verifies
 * the required TON payment.
 */
export type GemPaymentSender = (
  gems: number
) => Promise<GemPaymentResult>;

interface GemStoreState {
  gems: number;

  backend: GemBackend;

  buying: boolean;

  lastPurchase:
    | {
        ok: boolean;
        gems?: number;
        tonAmount?: number;
        usdAmount?: number;
        error?: string;
      }
    | null;

  initialize: () => Promise<void>;

  persist: () => Promise<void>;

  addGems: (
    amount: number
  ) => void;

  spendGems: (
    amount: number
  ) => boolean;

  purchaseGems: (
    gems: number,
    sender: GemPaymentSender
  ) => Promise<boolean>;

  resolvePurchaseGems: (
    gems: number,
    tonAmount: number,
    confirmed: boolean
  ) => void;

  reset: () => void;
}

export const useGemStore =
  create<GemStoreState>(
    (set, get) => ({
      gems:
        STARTING_GEMS,

      backend:
        localGemBackend,

      buying: false,

      lastPurchase: null,

      // ================================================================
      // INITIALIZE
      // ================================================================

      initialize: async () => {
        const data =
          await get().backend.load();

        if (data) {
          set({
            gems:
              typeof data.gems ===
              'number'
                ? data.gems
                : STARTING_GEMS,
          });
        } else {
          void get().persist();
        }
      },

      // ================================================================
      // PERSIST
      // ================================================================

      persist: async () => {
        await get().backend.save({
          gems: get().gems,
        });
      },

      // ================================================================
      // ADD GEMS
      // ================================================================

      addGems: (amount) => {
        if (amount <= 0) {
          return;
        }

        set((state) => ({
          gems:
            state.gems + amount,
        }));

        void get().persist();
      },

      // ================================================================
      // SPEND GEMS
      // ================================================================

      spendGems: (amount) => {
        if (
          amount < 0 ||
          get().gems < amount
        ) {
          return false;
        }

        set((state) => ({
          gems:
            state.gems - amount,
        }));

        void get().persist();

        return true;
      },

      // ================================================================
      // PURCHASE GEMS
      // ================================================================

      purchaseGems:
        async (
          gems,
          sender
        ) => {
          // ------------------------------------------------------------
          // Validate amount
          // ------------------------------------------------------------

          if (
            !Number.isFinite(gems) ||
            !Number.isInteger(gems) ||
            gems < MIN_GEM_PURCHASE
          ) {
            set({
              buying: false,

              lastPurchase: {
                ok: false,
                gems,
                tonAmount:
                  Number.isFinite(
                    gems
                  )
                    ? gemsToTon(
                        gems
                      )
                    : 0,
                error:
                  'Minimum purchase is 100 Gems.',
              },
            });

            return false;
          }

          // ------------------------------------------------------------
          // Calculate exact fixed TON price
          // ------------------------------------------------------------

          const requiredTon =
            gemsToTon(gems);

          set({
            buying: true,
            lastPurchase: null,
          });

          try {
            // ----------------------------------------------------------
            // Send + verify payment
            // ----------------------------------------------------------

            const result =
              await sender(gems);

            // ----------------------------------------------------------
            // Payment must be confirmed
            // ----------------------------------------------------------

            if (
              !result.confirmed
            ) {
              set({
                buying: false,

                lastPurchase: {
                  ok: false,
                  gems,
                  tonAmount:
                    requiredTon,
                  error:
                    result.reason ??
                    'Payment was not verified.',
                },
              });

              return false;
            }

            // ----------------------------------------------------------
            // Transaction hash required
            // ----------------------------------------------------------

            if (
              !result.txHash
            ) {
              set({
                buying: false,

                lastPurchase: {
                  ok: false,
                  gems,
                  tonAmount:
                    requiredTon,
                  error:
                    'Missing transaction hash for verification.',
                },
              });

              return false;
            }

            // ----------------------------------------------------------
            // Verify exact TON amount
            //
            // Example:
            // 100 Gems must be exactly 1 TON.
            // ----------------------------------------------------------

            const paidTon =
              Number(
                result.tonAmount
              );

            const amountMatches =
              Number.isFinite(
                paidTon
              ) &&
              Math.abs(
                paidTon -
                  requiredTon
              ) <
                0.000000001;

            if (
              !amountMatches
            ) {
              set({
                buying: false,

                lastPurchase: {
                  ok: false,
                  gems,
                  tonAmount:
                    requiredTon,
                  error:
                    `Incorrect TON amount. Required: ${requiredTon} TON.`,
                },
              });

              return false;
            }

            // ----------------------------------------------------------
            // Player identity
            // ----------------------------------------------------------

            const {
              playerProfile,
              wallet,
            } =
              useGameStore.getState();

            const walletAddress =
              wallet?.address ??
              playerProfile?.walletAddress ??
              'unknown';

            const userId =
              playerProfile?.id ??
              'unknown';

            // ----------------------------------------------------------
            // Persist payment
            // ----------------------------------------------------------

            const rec =
              await usePaymentStore
                .getState()
                .recordPayment({
                  userId,

                  walletAddress,

                  txHash:
                    result.txHash,

                  tonAmount:
                    requiredTon,

                  usdAmount:
                    result.usdAmount,

                  gemsAmount:
                    gems,

                  status:
                    'confirmed',
                });

            if (!rec.ok) {
              set({
                buying: false,

                lastPurchase: {
                  ok: false,
                  gems,

                  tonAmount:
                    requiredTon,

                  error:
                    rec.reason ??
                    'Payment could not be recorded.',
                },
              });

              return false;
            }

            // ----------------------------------------------------------
            // Credit Gems
            // ----------------------------------------------------------

            set(
              (state) => ({
                gems:
                  state.gems +
                  gems,

                buying:
                  false,
              })
            );

            void get().persist();

            set({
              lastPurchase: {
                ok: true,

                gems,

                tonAmount:
                  requiredTon,

                usdAmount:
                  result.usdAmount,
              },
            });

            return true;
          } catch (err) {
            set({
              buying: false,

              lastPurchase: {
                ok: false,

                gems,

                tonAmount:
                  requiredTon,

                error:
                  err instanceof Error
                    ? err.message
                    : 'Gem purchase failed.',
              },
            });

            return false;
          }
        },

      // ================================================================
      // RESOLVE PURCHASE
      // ================================================================

      resolvePurchaseGems:
        (
          gems,
          tonAmount,
          confirmed
        ) => {
          const requiredTon =
            gemsToTon(gems);

          const amountMatches =
            Math.abs(
              tonAmount -
                requiredTon
            ) <
            0.000000001;

          if (
            confirmed &&
            gems >=
              MIN_GEM_PURCHASE &&
            amountMatches
          ) {
            set(
              (state) => ({
                gems:
                  state.gems +
                  gems,
              })
            );

            void get().persist();
          }

          set({
            buying: false,

            lastPurchase: {
              ok:
                confirmed &&
                gems >=
                  MIN_GEM_PURCHASE &&
                amountMatches,

              gems,

              tonAmount:
                requiredTon,
            },
          });
        },

      // ================================================================
      // RESET
      // ================================================================

      reset: () => {
        set({
          gems:
            STARTING_GEMS,

          lastPurchase:
            null,
        });

        void get().persist();
      },
    })
  );