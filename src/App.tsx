import { WalletConnectionScreen } from './wallet/WalletConnectionScreen';
import { PlayerDashboard } from './player/PlayerDashboard';
import { GameWorld } from './game/GameWorld';
import { useGameStore } from './game/useGameStore';

function App() {
  const { wallet, isConnected } = useGameStore();

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Land Orion</h1>
        <p>Scalable TON-native Web3 game architecture</p>
      </header>

      {!isConnected ? (
        <WalletConnectionScreen />
      ) : (
        <>
          <PlayerDashboard address={wallet?.address} />
          <GameWorld />
        </>
      )}
    </div>
  );
}

export default App;
