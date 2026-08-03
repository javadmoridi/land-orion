import { useEffect } from 'react';
import { TonConnectButton, useTonAddress, useTonWallet, useIsConnectionRestored, useTonConnectUI } from '@tonconnect/ui-react';
import { useGameStore } from '../game/useGameStore';
import { createWalletSession, formatWalletAddress } from './walletService';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

// Replace this file to change the wallet screen background:
// public/assets/wallet-background.jpg
export const WALLET_BACKGROUND = '/assets/wallet-background.jpg';

export function WalletConnectionScreen() {
  const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false);
  const wallet = useTonWallet();
  const connectionRestored = useIsConnectionRestored();
  const [tonConnectUI] = useTonConnectUI();

  const { connectWallet, wallet: session, connectionStatus, error } = useGameStore();

  // Telegram Mini App support: notify Telegram that the web app is ready and expand.
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  // NOTE: tonProof is optional in TON Connect 2.4.4.
  // A real tonProof payload must come from a backend that signs a
  // challenge with the wallet. Sending a fake/static value here causes
  // the wallet to reject the connection request, so we intentionally
  // do NOT set connect request parameters until a real backend exists.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    tonConnectUI.setConnectRequestParameters(null);
  }, [tonConnectUI]);

  useEffect(() => {
    if (!connectionRestored || !wallet) return;

    const address = userFriendlyAddress || rawAddress;
    if (!address) return;

    const walletSession = createWalletSession(address);
    void connectWallet(walletSession);
  }, [connectionRestored, wallet, userFriendlyAddress, rawAddress, connectWallet]);

  if (!connectionRestored) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${WALLET_BACKGROUND})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <p style={{ color: '#8fb5ff', fontSize: '1.1rem' }}>Restoring connection...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${WALLET_BACKGROUND})`,
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
          background: 'rgba(10, 14, 26, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(79, 124, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🌌</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '2rem', letterSpacing: '0.05em', color: '#ffffff' }}>LAND-ORION</h1>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: '#8fb5ff', fontSize: '0.95rem' }}>
          Enter the world of Orion
        </p>

        <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
          <TonConnectButton />
        </div>

        {connectionStatus === 'connecting' && (
          <p style={{ color: '#8fb5ff' }}>Connecting wallet... searching player profile in Supabase.</p>
        )}

        {connectionStatus === 'connected' && session && (
          <div style={{ marginTop: '1rem' }}>
            <p>Connected: {formatWalletAddress(session.address)}</p>
            <p style={{ color: '#32c787' }}>Player profile loaded. Entering the game world...</p>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: 10,
              background: 'rgba(255,80,80,0.1)',
              border: '1px solid rgba(255,80,80,0.4)',
            }}
          >
            <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#6b7c99' }}>
          Connect via the official TON Connect modal to enter Land-Orion.
        </p>
      </div>
    </div>
  );
}