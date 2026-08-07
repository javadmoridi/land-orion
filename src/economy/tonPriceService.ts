// ===========================================================================
// Live TON/USD price service.
//
// Fetches the current TON -> USD rate from a public price API and caches it
// briefly so the Gem -> TON conversion uses a live price instead of a fixed
// rate. Falls back to a sane constant if the API is unreachable, but the
// caller can tell whether the value is live via `isLive`.
// ===========================================================================

/** Fixed price of one Gem in US dollars: 1000 Gems = $10. */
export const USD_PER_GEM = 0.01;

/** Fallback rate used ONLY when the live price API is unavailable. */
const FALLBACK_TON_USD = 6.0;

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd';

/** How long a fetched price is considered fresh (ms). */
const CACHE_TTL_MS = 60_000;

let cached: { price: number; isLive: boolean; fetchedAt: number } | null = null;

export interface TonPrice {
  /** TON -> USD rate. */
  tonToUsd: number;
  /** Whether the rate came from the live API (false = fallback constant). */
  isLive: boolean;
}

/**
 * Returns the current TON -> USD rate, refreshing from the API at most once
 * per CACHE_TTL_MS. Never throws: on any network failure it falls back to the
 * constant rate and reports `isLive === false`.
 */
export async function getTonUsdPrice(): Promise<TonPrice> {
  const now = Date.now();
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { tonToUsd: cached.price, isLive: cached.isLive };
  }

  const fallback: TonPrice = { tonToUsd: FALLBACK_TON_USD, isLive: false };
  if (typeof fetch !== 'function') {
    cached = { price: FALLBACK_TON_USD, isLive: false, fetchedAt: now };
    return fallback;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(COINGECKO_URL, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      cached = { price: FALLBACK_TON_USD, isLive: false, fetchedAt: now };
      return fallback;
    }

    const json = (await res.json()) as {
      'the-open-network'?: { usd?: number };
    };
    const usd = json?.['the-open-network']?.usd;
    const price = typeof usd === 'number' && usd > 0 ? usd : FALLBACK_TON_USD;

    cached = { price, isLive: price !== FALLBACK_TON_USD, fetchedAt: now };
    return { tonToUsd: price, isLive: price !== FALLBACK_TON_USD };
  } catch (err) {
    console.warn('[tonPrice] Could not fetch live TON/USD, using fallback rate.', err);
    cached = { price: FALLBACK_TON_USD, isLive: false, fetchedAt: now };
    return fallback;
  }
}

/** Converts a number of Gems into US dollars (Gems × $0.01). */
export function gemsToUsd(gems: number): number {
  return gems * USD_PER_GEM;
}

/**
 * Calculates how much TON the player must pay for `gems` at `tonToUsd`.
 *   TonAmount = USD price / TON current price
 */
export function calcTonAmountForGems(gems: number, tonToUsd: number): number {
  return gemsToUsd(gems) / tonToUsd;
}

/** Converts a TON amount into nanoTON (integer, 1 TON = 1e9 nanoTON). */
export function tonToNano(ton: number): bigint {
  const NANO_PER_TON = 1_000_000_000;
  return BigInt(Math.round(ton * NANO_PER_TON));
}
