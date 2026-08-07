import { Address, Cell, loadMessageRelaxed } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui-react';

import {
  calcTonAmountForGems,
  tonToNano,
  getTonUsdPrice,
  type TonPrice,
} from './tonPriceService';

export const TON_RECEIVER_ADDRESS =
  'UQD5sQcpg5Ir_gfZ8qjE0m3N97JQK0vel6n_kvOZYZMBdqRa';

const TONAPI_BASE = 'https://tonapi.io';

export const REQUIRE_ONCHAIN_CONFIRMATION = true;

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
}

export interface GemPaymentResult {
  confirmed: boolean;
  reason?: string;
  gems: number;
  tonAmount: number;
  usdAmount: number;
  tonPrice: TonPrice;
  txHash?: string;
}

interface SendResult {
  boc?: string;
  txHash?: string;
}

export function parseTransferBoc(
  boc: string
): ParsedTransfer {

  const cell = Cell.fromBase64(boc);
  const msg = loadMessageRelaxed(cell.beginParse());

  if (msg.info.type !== 'internal') {
    throw new Error('Expected internal transfer.');
  }

  const dest = msg.info.dest;

  if (!dest) {
    throw new Error('Missing destination.');
  }

  return {
    destination:
      `${dest.workChain}:${dest.hash.toString('hex')}`,
    amountNanoTon: msg.info.value.coins,
    messageHash: cell.hash().toString('hex'),
  };
}


async function fetchJson(
  url: string
): Promise<any | null> {

  try {
    const res = await fetch(url);

    if (!res.ok) return null;

    return await res.json();

  } catch {
    return null;
  }
}


async function confirmOnChain(
  hash: string
): Promise<boolean> {

  if (!REQUIRE_ONCHAIN_CONFIRMATION) {
    return true;
  }

  const tx =
    await fetchJson(
      `${TONAPI_BASE}/v2/blockchain/transactions/${hash}`
    );

  return tx?.success === true;
}


export async function verifyGemPayment(
  input: {
    boc: string;
    expectedReceiver: string;
    expectedNanoTon: bigint;
  }
): Promise<VerificationResult> {

  try {

    const parsed =
      parseTransferBoc(input.boc);


    const address =
      Address.parse(input.expectedReceiver);


    const expected =
      `${address.workChain}:${address.hash.toString('hex')}`;


    if (parsed.destination !== expected) {

      return {
        confirmed:false,
        reason:'Wrong receiver.',
        parsed,
      };

    }


    if (
      parsed.amountNanoTon !==
      input.expectedNanoTon
    ) {

      return {
        confirmed:false,
        reason:'Wrong TON amount.',
        parsed,
      };

    }


    const confirmed =
      await confirmOnChain(
        parsed.messageHash
      );


    return {
      confirmed,
      parsed,
      onChainConfirmed: confirmed,
      reason: confirmed
        ? undefined
        : 'Transaction not confirmed.',
    };


  } catch(err) {

    return {
      confirmed:false,
      reason:
        err instanceof Error
        ? err.message
        : 'Verification failed.',
    };

  }
}



export async function sendGemPaymentAndVerify(
  tonConnectUI: TonConnectUI,
  gems: number
): Promise<GemPaymentResult> {


  const tonPrice =
    await getTonUsdPrice();


  const tonAmount =
    calcTonAmountForGems(
      gems
    );


  const nano =
    tonToNano(
      tonAmount
    );


  const usdAmount = 0;


  try {


    const result =
      await tonConnectUI.sendTransaction({

        validUntil:
          Math.floor(Date.now()/1000)+600,

        messages:[
          {
            address:
              TON_RECEIVER_ADDRESS,

            amount:
              nano.toString(),
          }
        ]

      }) as SendResult;



    if(!result.boc){

      return {
        confirmed:false,
        reason:'No transaction returned.',
        gems,
        tonAmount,
        usdAmount,
        tonPrice,
      };

    }



    const verify =
      await verifyGemPayment({

        boc:result.boc,

        expectedReceiver:
          TON_RECEIVER_ADDRESS,

        expectedNanoTon:
          nano,

      });



    return {

      confirmed:
        verify.confirmed,

      reason:
        verify.reason,

      gems,

      tonAmount,

      usdAmount,

      tonPrice,

      txHash:
        verify.parsed?.messageHash ??
        result.txHash,

    };


  } catch(err) {


    return {

      confirmed:false,

      reason:
        err instanceof Error
        ? err.message
        : 'Payment failed.',

      gems,

      tonAmount,

      usdAmount,

      tonPrice,

    };

  }
}