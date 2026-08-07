/**
 * Fixed Gem -> TON price service.
 *
 * Gem price is fixed:
 * 1 Gem = 0.01 TON
 *
 * No live TON/USD price is used.
 */

export const TON_PER_GEM = 0.01;

export interface TonPrice {
  tonToUsd: number;
  isLive: boolean;
}

/**
 * Kept for compatibility with existing code.
 * Live price is disabled.
 */
export async function getTonUsdPrice(): Promise<TonPrice> {
  return {
    tonToUsd: 0,
    isLive: false,
  };
}

/**
 * Converts Gems to USD.
 * Kept only for UI compatibility.
 */
export function gemsToUsd(gems: number): number {
  return gems * 0.01;
}

/**
 * Converts Gems directly to TON.
 *
 * 1 Gem = 0.01 TON
 */
export function calcTonAmountForGems(
  gems: number,
  _tonToUsd?: number,
): number {
  return gems * TON_PER_GEM;
}

/**
 * Converts TON to nanoTON.
 */
export function tonToNano(ton: number): bigint {
  const NANO_PER_TON = 1_000_000_000;

  return BigInt(
    Math.round(ton * NANO_PER_TON),
  );
}