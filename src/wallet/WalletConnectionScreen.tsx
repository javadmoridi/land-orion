import { useState } from 'react';
import { useGameStore } from '../game/useGameStore';
import { createWalletSession } from './walletService';

export function WalletConnectionScreen() {
  const { connectWallet } = useGameStore();
  const [address, setAddress] = useState('');

  const handleConnect = () => {
    if (!address.trim()) return;
    const session = createWalletSession(address.trim());
    connectWallet(session);
  };

  return (
    <section style={{ maxWidth: 520, margin: '0 auto', padding: '2rem', border: '1px solid #2c3e5a', borderRadius: 16, background: 'rgba(255,255,255,0.04)' }}>
      <h2>Connect Wallet</h2>
      <p>TON Connect integration is prepared for future wallet flows.</p>
      <input
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        placeholder="Enter TON wallet address"
        style={{ width: '100%', padding: '0.8rem', borderRadius: 10, border: '1px solid #4d5f80', marginBottom: '1rem' }}
      />
      <button onClick={handleConnect} style={{ padding: '0.8rem 1.2rem', borderRadius: 10, border: 'none', background: '#4f7cff', color: 'white' }}>
        Connect TON Wallet
      </button>
    </section>
  );
}
