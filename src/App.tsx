import { useEffect, useMemo } from 'react';
import { TonConnectUIProvider, useTonWallet } from '@tonconnect/ui-react';

import { WalletConnectionScreen } from './wallet/WalletConnectionScreen';
import { GameWorld } from './game/GameWorld';
import { useGameStore } from './game/useGameStore';
import { getManifestUrl } from './wallet/walletService';

function GameRouter() {
  const {
    isConnected,
    playerProfile,
    connectionStatus,
    error,
    disconnectWallet,
  } = useGameStore();

  const wallet = useTonWallet();

  useEffect(() => {
    if (!wallet && isConnected) {
      disconnectWallet();
    }
  }, [wallet, isConnected, disconnectWallet]);

  if (connectionStatus === 'connecting') {
    return <div>Connecting wallet...</div>;
  }

  if (error) {
    return (
      <div>
        <h3>Game Error</h3>
        <p>{error}</p>
        <button onClick={disconnectWallet}>
          Disconnect
        </button>
      </div>
    );
  }

  if (!isConnected || !playerProfile) {
    return <WalletConnectionScreen />;
  }

  return <GameWorld />;
}

function App() {
  const manifestUrl = useMemo(getManifestUrl, []);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <GameRouter />
    </TonConnectUIProvider>
  );
}

export default App;