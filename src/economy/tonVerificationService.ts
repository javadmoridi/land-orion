import {
  Address,
  Cell,
} from '@ton/core';

import type { TonConnectUI } from '@tonconnect/ui-react';

export const TON_RECEIVER_ADDRESS =
  'UQD5sQcpg5Ir_gfZ8qjE0m3N97JQK0vel6n_kvOZYZMBdqRa';

export const MIN_GEM_PURCHASE = 100;

// 1 Gem = 0.01 TON
export const TON_PER_GEM = 0.01;

const TONAPI_BASE =
  'https://tonapi.io';

export const REQUIRE_ONCHAIN_CONFIRMATION =
  true;

const CONFIRM_TIMEOUT_MS =
  60_000;

const FIRST_POLL_DELAY_MS =
  1_000;

export interface ParsedTransfer {
  destination: string;
  amountNanoTon: bigint;
  messageHash: string;
}

export interface VerificationResult {
  confirmed: boolean;
  reason?: string;
  parsed?: ParsedTransfer;
  onChainConfirmed?: boolean;
  txHash?: string;
}

export interface GemPaymentResult {
  confirmed: boolean;
  reason?: string;
  gems: number;
  tonAmount: number;
  usdAmount: number;
  tonPrice: {
    usd: number;
  };
  txHash?: string;
}

interface SendResult {
  boc?: string;
}

interface TonApiMessage {
  destination?: string;
  value?: string | number;
}

interface TonApiTransaction {
  hash?: string;
  success?: boolean;
  out_msgs?: TonApiMessage[];
}

function messageHashFromBoc(
  boc: string
): string {
  const cell =
    Cell.fromBase64(boc);

  return cell
    .hash()
    .toString('hex');
}

function normalizeAddress(
  value: string
): string {
  return Address.parse(
    value
  ).toString({
    urlSafe: true,
    bounceable: true,
  });
}

function sameAddress(
  a: string,
  b: string
): boolean {
  try {
    return (
      normalizeAddress(a) ===
      normalizeAddress(b)
    );
  } catch {
    return a === b;
  }
}

async function fetchJson(
  url: string
): Promise<any | null> {
  try {
    const response =
      await fetch(url);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function sleep(
  ms: number
): Promise<void> {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        ms
      );
    }
  );
}

/*
 * Find the exact outgoing payment inside
 * the finalized blockchain transaction.
 */
function findMatchingOutgoingMessage(
  transaction: TonApiTransaction,
  expectedReceiver: string,
  expectedNanoTon: bigint
): TonApiMessage | null {
  const messages =
    Array.isArray(
      transaction.out_msgs
    )
      ? transaction.out_msgs
      : [];

  const expectedReceiverNormalized =
    normalizeAddress(
      expectedReceiver
    );

  for (
    const message of messages
  ) {
    if (
      !message.destination ||
      message.value ===
        undefined
    ) {
      continue;
    }

    if (
      !sameAddress(
        message.destination,
        expectedReceiverNormalized
      )
    ) {
      continue;
    }

    let actualNano: bigint;

    try {
      actualNano =
        BigInt(
          String(
            message.value
          )
        );
    } catch {
      continue;
    }

    if (
      actualNano ===
      expectedNanoTon
    ) {
      return message;
    }
  }

  return null;
}

/*
 * Wait for TONAPI to index the transaction.
 */
async function waitForVerifiedTransaction(
  messageHash: string,
  expectedReceiver: string,
  expectedNanoTon: bigint
): Promise<{
  confirmed: boolean;
  txHash?: string;
  reason?: string;
}> {
  const startedAt =
    Date.now();

  let delay =
    FIRST_POLL_DELAY_MS;

  while (
    Date.now() -
      startedAt <
    CONFIRM_TIMEOUT_MS
  ) {
    const transaction =
      (await fetchJson(
        `${TONAPI_BASE}/v2/blockchain/messages/${messageHash}/transaction`
      )) as
        | TonApiTransaction
        | null;

    if (transaction) {
      const txHash =
        transaction.hash;

      if (
        transaction.success ===
        false
      ) {
        return {
          confirmed: false,
          txHash,
          reason:
            'Transaction failed on-chain.',
        };
      }

      const paymentMessage =
        findMatchingOutgoingMessage(
          transaction,
          expectedReceiver,
          expectedNanoTon
        );

      if (paymentMessage) {
        return {
          confirmed: true,
          txHash,
        };
      }

      return {
        confirmed: false,
        txHash,
        reason:
          'Transaction found, but receiver or TON amount did not match.',
      };
    }

    await sleep(delay);

    delay = Math.min(
      delay * 2,
      8_000
    );
  }

  return {
    confirmed: false,
    reason:
      'Transaction was not indexed within 60 seconds.',
  };
}

export function parseTransferBoc(
  boc: string
): ParsedTransfer {
  const messageHash =
    messageHashFromBoc(
      boc
    );

  return {
    destination:
      TON_RECEIVER_ADDRESS,

    amountNanoTon: 0n,

    messageHash,
  };
}

export async function verifyGemPayment(
  input: {
    boc: string;
    expectedReceiver: string;
    expectedNanoTon: bigint;
  }
): Promise<VerificationResult> {
  try {
    Address.parse(
      input.expectedReceiver
    );

    const messageHash =
      messageHashFromBoc(
        input.boc
      );

    const verified =
      await waitForVerifiedTransaction(
        messageHash,
        input.expectedReceiver,
        input.expectedNanoTon
      );

    if (!verified.confirmed) {
      return {
        confirmed: false,

        reason:
          verified.reason ??
          'Transaction was not verified.',

        onChainConfirmed: false,

        txHash:
          verified.txHash,

        parsed: {
          destination:
            input.expectedReceiver,

          amountNanoTon:
            input.expectedNanoTon,

          messageHash,
        },
      };
    }

    return {
      confirmed: true,

      onChainConfirmed: true,

      txHash:
        verified.txHash,

      parsed: {
        destination:
          input.expectedReceiver,

        amountNanoTon:
          input.expectedNanoTon,

        messageHash,
      },
    };
  } catch (error) {
    return {
      confirmed: false,

      reason:
        error instanceof Error
          ? error.message
          : 'Verification failed.',

      onChainConfirmed: false,
    };
  }
}

export async function sendGemPaymentAndVerify(
  tonConnectUI: TonConnectUI,
  gems: number
): Promise<GemPaymentResult> {
  const tonAmount =
    gems * TON_PER_GEM;

  const nano =
    BigInt(
      Math.round(
        tonAmount *
          1_000_000_000
      )
    );

  const usdAmount = 0;

  const tonPrice = {
    usd: 0,
  };

  if (
    !Number.isInteger(gems) ||
    gems < MIN_GEM_PURCHASE
  ) {
    return {
      confirmed: false,

      reason:
        'Minimum purchase is 100 Gems.',

      gems,

      tonAmount,

      usdAmount,

      tonPrice,
    };
  }

  try {
    const result =
      (await tonConnectUI.sendTransaction(
        {
          validUntil:
            Math.floor(
              Date.now() / 1000
            ) + 600,

          messages: [
            {
              address:
                TON_RECEIVER_ADDRESS,

              amount:
                nano.toString(),
            },
          ],
        }
      )) as SendResult;

    if (!result.boc) {
      return {
        confirmed: false,

        reason:
          'No transaction BOC returned by wallet.',

        gems,

        tonAmount,

        usdAmount,

        tonPrice,
      };
    }

    const verification =
      await verifyGemPayment({
        boc:
          result.boc,

        expectedReceiver:
          TON_RECEIVER_ADDRESS,

        expectedNanoTon:
          nano,
      });

    return {
      confirmed:
        verification.confirmed,

      reason:
        verification.reason,

      gems,

      tonAmount,

      usdAmount,

      tonPrice,

      txHash:
        verification.txHash,
    };
  } catch (error) {
    return {
      confirmed: false,

      reason:
        error instanceof Error
          ? error.message
          : 'Payment failed.',

      gems,

      tonAmount,

      usdAmount,

      tonPrice,
    };
  }
}