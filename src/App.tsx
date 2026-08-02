import { useEffect } from 'react';
import { TonConnectUIProvider, useTonWallet } from '@tonconnect/ui-react';
import { WalletConnectionScreen } from './wallet/WalletConnectionScreen';
import { PlayerDashboard } from './player/PlayerDashboard';
import { GameWorld } from './game/GameWorld';
import { useGameStore } from './game/useGameStore';
import { MANIFEST_URL } from './wallet/walletService';

function GameRouter() {
  const { isConnected, disconnectWallet, wallet: walletSession } = useGameStore();
  const wallet = useTonWallet();

  // If the TON wallet disconnects on the TON Connect side, sync local state.
  useEffect(() => {
    if (!wallet && isConnected) {
      disconnectWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, isConnected]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {!isConnected ? (
        <WalletConnectionScreen />
      ) : (
        <div style={{ padding: '2rem' }}>
          <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Land Orion</h1>
              <p>Scalable TON-native Web3 game architecture</p>
            </div>
            {isConnected && walletSession && (
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#8fb5ff' }}>
                <p>Connected: {walletSession.address.slice(0, 6)}...{walletSession.address.slice(-4)}</p>
              </div>
            )}
          </header>
          <PlayerDashboard />
          <GameWorld />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <GameRouter />
    </TonConnectUIProvider>
  );
}

export default App;