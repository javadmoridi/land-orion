import { useEffect, useRef, useState } from 'react';

import {
  TonConnectButton,
  useTonAddress,
  useTonWallet,
  useIsConnectionRestored,
} from '@tonconnect/ui-react';

import { useGameStore } from '../game/useGameStore';

import {
  createWalletSession,
  formatWalletAddress,
} from './walletService';

import { useGemStore } from '../economy/gemStore';
import { useResourceStore } from '../economy/resourceStore';
import { useVipStore } from '../economy/vipStore';

import {
  claimLoginRewards,
  getReferralCodeFromUrl,
} from '../economy/playerApi';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

export const WALLET_BACKGROUND =
  '/assets/wallet-background.jpg';

export function WalletConnectionScreen() {
  const userFriendlyAddress =
    useTonAddress(true);

  const rawAddress =
    useTonAddress(false);

  const wallet =
    useTonWallet();

  const connectionRestored =
    useIsConnectionRestored();

  const {
    connectWallet,
    wallet: session,
    connectionStatus,
    error,
  } = useGameStore();

  const [referralCode, setReferralCode] =
    useState('');

  const [welcomeMessage, setWelcomeMessage] =
    useState<string | null>(null);

  const processedAddress =
    useRef<string | null>(null);

  const rewardProcessed =
    useRef<string | null>(null);

  // ============================================================
  // REFERRAL
  // ============================================================

  useEffect(() => {
    const code =
      getReferralCodeFromUrl();

    if (code) {
      setReferralCode(
        code.toUpperCase()
      );
    }
  }, []);

  // ============================================================
  // TELEGRAM
  // ============================================================

  useEffect(() => {
    const tg =
      window.Telegram?.WebApp;

    if (!tg) {
      return;
    }

    tg.ready();
    tg.expand();
  }, []);

  // ============================================================
  // WALLET
  // ============================================================

  useEffect(() => {
    if (!connectionRestored) {
      return;
    }

    if (!wallet) {
      processedAddress.current = null;
      return;
    }

    const address =
      userFriendlyAddress ||
      rawAddress;

    if (!address) {
      return;
    }

    if (
      processedAddress.current === address
    ) {
      return;
    }

    processedAddress.current =
      address;

    const walletSession =
      createWalletSession(address);

    void (async () => {
      try {
        await connectWallet(
          walletSession
        );

        await Promise.all([
          useGemStore
            .getState()
            .initialize(),

          useResourceStore
            .getState()
            .initialize(),

          useVipStore
            .getState()
            .initialize(),
        ]);

        if (
          rewardProcessed.current !==
          address
        ) {
          rewardProcessed.current =
            address;

          const reward =
            await claimLoginRewards(
              referralCode
            );

          if (
            reward.ok &&
            reward.welcomeGems > 0
          ) {
            useGemStore
              .getState()
              .addGems(
                reward.welcomeGems
              );

            useResourceStore
              .getState()
              .addGems(
                reward.welcomeGems
              );

            setWelcomeMessage(
              `Welcome! +${reward.welcomeGems} Gems added.`
            );
          }

          if (
            reward.ok &&
            reward.referralGems > 0
          ) {
            setWelcomeMessage(
              `Welcome! +${reward.welcomeGems} Gems + referral bonus.`
            );
          }
        }
      } catch (err) {
        console.error(
          '[Wallet] Connection error:',
          err
        );
      }
    })();
  }, [
    connectionRestored,
    wallet,
    userFriendlyAddress,
    rawAddress,
    connectWallet,
    referralCode,
  ]);

  // ============================================================
  // RESTORING
  // ============================================================

  if (!connectionRestored) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage:
            `url(${WALLET_BACKGROUND})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <p
          style={{
            color: '#8fb5ff',
            fontSize: '1.1rem',
          }}
        >
          Restoring connection...
        </p>
      </div>
    );
  }

  // ============================================================
  // SCREEN
  // ============================================================

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage:
          `url(${WALLET_BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: 24,
          background:
            'rgba(10, 14, 26, 0.85)',
          backdropFilter:
            'blur(12px)',
          border:
            '1px solid rgba(79, 124, 255, 0.3)',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.6)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              fontSize: '2.5rem',
            }}
          >
            🌌
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: '2rem',
            letterSpacing: '0.05em',
            color: '#ffffff',
          }}
        >
          LAND-ORION
        </h1>

        <p
          style={{
            marginTop: '0.5rem',
            marginBottom: '1.5rem',
            color: '#8fb5ff',
            fontSize: '0.95rem',
          }}
        >
          Enter the world of Orion
        </p>

        {/* REFERRAL */}

        <label
          htmlFor="referral-code"
          style={{
            display: 'block',
            textAlign: 'left',
            color: '#9fb0d0',
            fontSize: '0.78rem',
            marginBottom: '0.3rem',
          }}
        >
          Referral code (optional)
        </label>

        <input
          id="referral-code"
          value={referralCode}
          onChange={(event) =>
            setReferralCode(
              event.target.value
                .toUpperCase()
            )
          }
          placeholder="e.g. ABC12345"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.6rem 0.8rem',
            borderRadius: 10,
            border:
              '1px solid rgba(79,124,255,0.4)',
            background:
              'rgba(255,255,255,0.06)',
            color: '#fff',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            textAlign: 'center',
            marginBottom: '0.4rem',
          }}
        />

        <p
          style={{
            margin:
              '0 0 0.4rem',
            fontSize: '0.72rem',
            color: '#6b7c99',
          }}
        >
          Join with a friend's code.
          Every new player receives
          100 Gems on first login.
        </p>

        {/* TON CONNECT */}

        <div
          style={{
            margin: '2rem 0',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <TonConnectButton />
        </div>

        {/* WELCOME */}

        {welcomeMessage && (
          <div
            style={{
              marginBottom: '0.8rem',
              padding: '0.6rem',
              borderRadius: 10,
              background:
                'rgba(46,160,67,0.15)',
              border:
                '1px solid rgba(46,160,67,0.4)',
              color: '#4cd07d',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {welcomeMessage}
          </div>
        )}

        {/* CONNECTING */}

        {connectionStatus ===
          'connecting' && (
          <p
            style={{
              color: '#8fb5ff',
            }}
          >
            Connecting wallet...
          </p>
        )}

        {/* CONNECTED */}

        {connectionStatus ===
          'connected' &&
          session && (
            <div
              style={{
                marginTop: '1rem',
              }}
            >
              <p>
                Connected:{' '}
                {formatWalletAddress(
                  session.address
                )}
              </p>

              <p
                style={{
                  color: '#32c787',
                }}
              >
                Player profile loaded.
                Entering the game world...
              </p>
            </div>
          )}

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: 10,
              background:
                'rgba(255,80,80,0.1)',
              border:
                '1px solid rgba(255,80,80,0.4)',
            }}
          >
            <p
              style={{
                color: '#ff6b6b',
                fontSize: '0.9rem',
                margin: 0,
              }}
            >
              {error}
            </p>
          </div>
        )}

        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '0.8rem',
            color: '#6b7c99',
          }}
        >
          Connect via TON Connect
          to enter Land-Orion.
        </p>
      </div>
    </div>
  );
}