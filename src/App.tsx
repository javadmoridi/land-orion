import { useEffect } from 'react';
import { TonConnectUIProvider, useTonWallet } from '@tonconnect/ui-react';
import { WalletConnectionScreen } from './wallet/WalletConnectionScreen';
import { GameWorld } from './game/GameWorld';
import { useGameStore } from './game/useGameStore';
import { MANIFEST_URL } from './wallet/walletService';

function GameRouter() {
  const { isConnected, disconnectWallet } = useGameStore();
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
        <GameWorld />
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