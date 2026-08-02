import { useState } from 'react';
import { useGameStore } from '../game/useGameStore';
import { createWalletSession } from './walletService';

export function WalletConnectionScreen() {
  const { connectWallet } = useGameStore();
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Enter a TON wallet address to enter Land-Orion.');

  const handleConnect = async () => {
    if (!address.trim()) {
      setStatus('Please provide a TON wallet address.');
      return;
    }

    const session = createWalletSession(address.trim());
    setStatus(`Connecting to TON wallet ${session.address.slice(0, 8)}...`);
    await connectWallet(session);
    setStatus('Connected. Loading your player profile and entering the game world.');
  };

  return (
    <section style={{ maxWidth: 560, margin: '0 auto', padding: '2rem', border: '1px solid #2c3e5a', borderRadius: 16, background: 'rgba(255,255,255,0.04)' }}>
      <h2>Connect TON Wallet</h2>
      <p>Only TON-compatible wallet flow is used. No EVM, no MetaMask.</p>
      <input
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        placeholder="Enter TON wallet address"
        style={{ width: '100%', padding: '0.8rem', borderRadius: 10, border: '1px solid #4d5f80', marginBottom: '1rem' }}
      />
      <button onClick={() => void handleConnect()} style={{ padding: '0.8rem 1.2rem', borderRadius: 10, border: 'none', background: '#4f7cff', color: 'white' }}>
        Enter Land-Orion
      </button>
      <p style={{ marginTop: '1rem', color: '#8fb5ff' }}>{status}</p>
    </section>
  );
}
