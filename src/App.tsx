import { useEffect, useMemo } from 'react';
import { TonConnectUIProvider, useTonWallet } from '@tonconnect/ui-react';
import { WalletConnectionScreen } from './wallet/WalletConnectionScreen';
import { GameWorld } from './game/GameWorld';
import { useGameStore } from './game/useGameStore';
import { getManifestUrl } from './wallet/walletService';

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
  // Lazily + memoically compute the TON Connect manifest URL.
  // `getManifestUrl()` reads `window.location.origin` at first render (not at
  // module load), and the result is memoized so it is identical across React's
  // StrictMode double-invoke — giving a stable initial manifest for both SSR and
  // the production client build.
  const manifestUrl = useMemo(getManifestUrl, []);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <GameRouter />
    </TonConnectUIProvider>
  );
}

export default App;