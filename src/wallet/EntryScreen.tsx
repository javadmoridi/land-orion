import { useState } from 'react';
import type { CSSProperties } from 'react';

import { useGameStore } from '../game/useGameStore';
import { createWalletSession } from './walletService';

import { useGemStore } from '../economy/gemStore';
import { useResourceStore } from '../economy/resourceStore';
import { useVipStore } from '../economy/vipStore';
import {
  claimLoginRewards,
  getReferralCodeFromUrl,
} from '../economy/playerApi';

// A stable, per-device identity so the game can be entered without a TON
// wallet. This is only a login id — currencies are NOT stored in the browser.
const GUEST_ID_KEY = 'land-orion-guest-id';

function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') {
    return 'guest-local';
  }

  const existing = window.localStorage.getItem(GUEST_ID_KEY);
  if (existing) {
    return existing;
  }

  const id = `guest-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  window.localStorage.setItem(GUEST_ID_KEY, id);
  return id;
}

export const ENTRY_BACKGROUND = '/assets/wallet-background.jpg';

export function EntryScreen() {
  const connectWallet = useGameStore(
    (s) => s.connectWallet
  );

  const connectionStatus = useGameStore(
    (s) => s.connectionStatus
  );

  const error = useGameStore(
    (s) => s.error
  );

  const [referralCode, setReferralCode] = useState(
    () => getReferralCodeFromUrl()
  );

  const [starting, setStarting] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    setWelcomeMessage(null);

    try {
      // Build a guest wallet session and let the game store create/find the
      // matching player profile (Supabase when configured, local otherwise).
      const guestId = getOrCreateGuestId();
      const session = createWalletSession(guestId);

      await connectWallet(session);

      // Initialise the economy stores once an identity is known.
      await useGemStore.getState().initialize();
      await useResourceStore.getState().initialize();
      await useVipStore.getState().initialize();

      // Grant the 100 Gem welcome reward (once) + record any referral.
      const reward = await claimLoginRewards(referralCode);
      if (reward.ok && reward.welcomeGems > 0) {
        useGemStore.getState().addGems(reward.welcomeGems);
        useResourceStore.getState().addGems(reward.welcomeGems);
        setWelcomeMessage(
          `🎁 Welcome! +${reward.welcomeGems} 💎 added.`
        );
      }
    } catch (err) {
      console.error('[entry] start error:', err);
    } finally {
      setStarting(false);
    }
  }

  const loading =
    connectionStatus === 'connecting' || starting;

  const cardStyle: CSSProperties = {
    maxWidth: 420,
    width: '100%',
    padding: '2.5rem 2rem',
    borderRadius: 24,
    background: 'rgba(10, 14, 26, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(79, 124, 255, 0.3)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    textAlign: 'center',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${ENTRY_BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '1.5rem',
      }}
    >
      <div style={cardStyle}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🌌</span>
        </div>

        <h1 style={{ margin: 0, fontSize: '2rem', letterSpacing: '0.05em', color: '#ffffff' }}>
          LAND-ORION
        </h1>

        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: '#8fb5ff', fontSize: '0.95rem' }}>
          Enter the world of Orion
        </p>

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
            setReferralCode(event.target.value.toUpperCase())
          }
          placeholder="e.g. ABC12345"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.6rem 0.8rem',
            borderRadius: 10,
            border: '1px solid rgba(79,124,255,0.4)',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            textAlign: 'center',
            marginBottom: '0.4rem',
          }}
        />

        <p style={{ margin: '0 0 1.2rem', fontSize: '0.72rem', color: '#6b7c99' }}>
          Join with a friend's code to unlock a referral bonus. Every new player
          receives 100 💎 on first login.
        </p>

        <button
          type="button"
          onClick={() => void handleStart()}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.9rem',
            border: 'none',
            borderRadius: 12,
            background: loading ? 'rgba(255,255,255,.15)' : '#5b8cff',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 900,
            letterSpacing: '0.08em',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'ENTERING...' : '▶  START GAME'}
        </button>

        {welcomeMessage && (
          <div
            style={{
              marginTop: '0.9rem',
              padding: '0.6rem',
              borderRadius: 10,
              background: 'rgba(46,160,67,0.15)',
              border: '1px solid rgba(46,160,67,0.4)',
              color: '#4cd07d',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {welcomeMessage}
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
            <p style={{ color: '#ff6b6b', fontSize: '0.9rem', margin: 0 }}>{error}</p>
          </div>
        )}

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#6b7c99' }}>
          No wallet required — just press Start to play.
        </p>
      </div>
    </div>
  );
}
