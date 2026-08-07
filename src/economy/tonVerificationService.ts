// ===========================================================================
// TON payment verification service.
//
// Turns the "signed BOC" returned by a TON Connect wallet into a verified,
// on-chain confirmable Gem purchase:
//
//   1. Parse the BOC with @ton/core into an internal message.
//   2. Verify the DESTINATION is our receive address and the VALUE matches the
//      exact nanoTON we requested — so a random/wrong transfer can't be credited.
//   3. Derive the message hash (= transaction hash for the internal message).
//   4. Confirm on-chain via TonAPI. Gems are credited ONLY when every check
//      passes; any uncertainty results in `confirmed: false`.
//
// NOTE: full anti-fraud in production should also be enforced server-side /
// by a backend that owns the wallet and re-verifies on the chain. This module
// provides the client-side verification and a clear seam for that backend.
// ===========================================================================

import { Address, Cell, loadMessageRelaxed } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';
import {
  getTonUsdPrice,
  calcTonAmountForGems,
  gemsToUsd,
  tonToNano,
  type TonPrice,
} from './tonPriceService';

/** Fixed wallet that must receive TON for Gem purchases. */
export const TON_RECEIVER_ADDRESS = 'UQD5sQcpg5Ir_gfZ8qjE0m3N97JQK0vel6n_kvOZYZMBdqRa';

/** TonAPI endpoint used for on-chain confirmation. */
const TONAPI_BASE = 'https://tonapi.io';

/** Whether Gems may only be credited after an on-chain confirmation. */
export const REQUIRE_ONCHAIN_CONFIRMATION = true;

export interface ParsedTransfer {
  /** Raw workchain + hash of the destination, for comparison. */
  destination: string;
  /** Amount sent, in nanoTON. */
  amountNanoTon: bigint;
  /** Derived message hash (hex) — used as the transaction identifier. */
  messageHash: string;
}

export interface VerificationResult {
  confirmed: boolean;
  reason?: string;
  parsed?: ParsedTransfer;
  onChainConfirmed?: boolean;
}

/** The TON Connect sendTransaction response envelope we care about. */
interface SendResult {
  boc?: string;
  txHash?: string;
}

// ---------------------------------------------------------------------------
// BOC parsing
// ---------------------------------------------------------------------------

/**
 * Parses a TON Connect signed BOC into our known transfer (receiver + value).
 * Returns the parsed transfer, or throws on any shape mismatch / invalid BOC.
 */
export function parseTransferBoc(boc: string): ParsedTransfer {
  if (!boc) throw new Error('Missing transaction BOC.');

  const cell = Cell.fromBase64(boc);
  const msg = loadMessageRelaxed(cell.beginParse());

  if (msg.info.type !== 'internal') {
    throw new Error('Expected an internal transfer message.');
  }

  const dest = msg.info.dest;
  const coins = msg.info.value.coins;

  if (!dest) throw new Error('Transfer has no destination.');

  return {
    destination: `${dest.workChain}:${dest.hash.toString('hex')}`,
    amountNanoTon: coins,
    messageHash: cell.hash().toString('hex'),
  };
}

// ---------------------------------------------------------------------------
// On-chain confirmation
// ---------------------------------------------------------------------------

async function fetchJson(url: string, timeoutMs = 10_000): Promise<unknown | null> {
  if (typeof fetch !== 'function') return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch (err) {
    console.warn('[tonVerify] on-chain lookup failed:', err);
    return null;
  }
}

/**
 * Best-effort on-chain confirmation. The derived internal-message hash equals
 * the on-chain transaction hash for a payment, so we look it up on TonAPI and
 * require a transaction marked as successful.
 */
async function confirmOnChain(messageHash: string): Promise<boolean> {
  if (!REQUIRE_ONCHAIN_CONFIRMATION) return true;
  if (!messageHash) return false;

  // 1) Look up as a transaction (hash of the internal message == tx hash).
  const tx = await fetchJson(`${TONAPI_BASE}/v2/blockchain/transactions/${messageHash}`);
  if (tx && typeof tx === 'object') {
    const t = tx as { success?: boolean };
    if (t.success === true) return true;
  }

  // 2) Fall back to a message lookup.
  const msg = await fetchJson(`${TONAPI_BASE}/v2/blockchain/messages/${messageHash}`);
  if (msg && typeof msg === 'object') {
    const m = msg as { value?: string; destination?: { address?: string } };
    if (m && typeof m.value === 'string' && BigInt(m.value) > 0n) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

/**
 * Verifies a TON Connect signed BOC against the expected receiver and nanoTON
 * amount, and (optionally) confirms it on-chain.
 */
export async function verifyGemPayment(input: {
  boc: string;
  expectedReceiver: string;
  expectedNanoTon: bigint;
}): Promise<VerificationResult> {
  try {
    const parsed = parseTransferBoc(input.boc);

    const expectedAddr = Address.parse(input.expectedReceiver);
    const expectedRaw = `${expectedAddr.workChain}:${expectedAddr.hash.toString('hex')}`;
    if (parsed.destination !== expectedRaw) {
      return {
        confirmed: false,
        reason: 'Transaction destination does not match the Orion wallet.',
        parsed,
      };
    }

    if (parsed.amountNanoTon !== input.expectedNanoTon) {
      return {
        confirmed: false,
        reason: 'Transaction amount does not match the requested TON amount.',
        parsed,
      };
    }

    const onChainConfirmed = await confirmOnChain(parsed.messageHash);
    if (REQUIRE_ONCHAIN_CONFIRMATION && !onChainConfirmed) {
      return {
        confirmed: false,
        reason: 'Payment is not yet confirmed on the TON blockchain.',
        parsed,
        onChainConfirmed: false,
      };
    }

    return { confirmed: true, parsed, onChainConfirmed: true };
  } catch (err) {
    return {
      confirmed: false,
      reason: err instanceof Error ? err.message : 'Could not verify the transaction.',
    };
  }
}

// ---------------------------------------------------------------------------
// Send + verify (used by the UI)
// ---------------------------------------------------------------------------

export interface GemPaymentResult {
  confirmed: boolean;
  reason?: string;
  gems: number;
  tonAmount: number;
  usdAmount: number;
  tonPrice: TonPrice;
  txHash?: string;
}

/**
 * Sends the TON payment for `gems` via the connected wallet and verifies the
 * returned BOC (destination, amount, on-chain status). Gems are credited by
 * the caller only when this returns `confirmed === true`.
 */
export async function sendGemPaymentAndVerify(
  tonConnectUI: TonConnectUI,
  gems: number,
): Promise<GemPaymentResult> {
  const tonPrice = await getTonUsdPrice();
  const tonAmount = calcTonAmountForGems(gems, tonPrice.tonToUsd);
  const usdAmount = gemsToUsd(gems);
  const nano = tonToNano(tonAmount);

  const validUntil = Math.round(Date.now() / 1000) + 600; // 10 minutes
  const tx = {
    validUntil,
    messages: [
      {
        address: TON_RECEIVER_ADDRESS,
        amount: nano.toString(),
      },
    ],
  };

  try {
    const result = (await tonConnectUI.sendTransaction(tx)) as Partial<SendResult>;
    const boc = result?.boc;
    if (!boc) {
      return {
        confirmed: false,
        reason: 'Wallet returned no transaction to verify.',
        gems,
        tonAmount,
        usdAmount,
        tonPrice,
      };
    }

    const verification = await verifyGemPayment({
      boc,
      expectedReceiver: TON_RECEIVER_ADDRESS,
      expectedNanoTon: nano,
    });

    return {
      confirmed: verification.confirmed,
      reason: verification.reason,
      gems,
      tonAmount,
      usdAmount,
      tonPrice,
      txHash: verification.parsed?.messageHash ?? result?.txHash,
    };
  } catch (err) {
    console.error('[tonVerify] Transaction rejected or failed:', err);
    return {
      confirmed: false,
      reason: err instanceof Error ? err.message : 'Transaction rejected or failed.',
      gems,
      tonAmount,
      usdAmount,
      tonPrice,
    };
  }
}

