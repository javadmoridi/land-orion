// Empirically verify the ROOT-CAUSE mechanics with the REAL installed Zustand v5.0.14.
const { createStore } = require('zustand/vanilla');

let syncCallCount = 0;
let notifyDepth = 0;

const api = createStore((set, get) => ({
  wallet: null,
  connectionStatus: 'disconnected',
  isConnected: false,
  connectWallet: async (session) => {
    // mirror useGameStore.connectWallet first line: synchronous set
    set({ wallet: session, connectionStatus: 'connecting', error: null });
    // (async part omitted)
  },
}));

// 1) Is the action reference stable across a shallow-merge set()?
const s1 = api.getState();
api.setState({ wallet: { address: 'A' }, connectionStatus: 'connecting', error: null });
const s2 = api.getState();
console.log('connectWallet ref stable across set?', s1.connectWallet === s2.connectWallet);
console.log('state object replaced (new ref)?', s1 !== s2);

// 2) Does set() notify subscribers SYNCHRONOUSLY (nestedUpdateCount driver)?
let notifiedSync = false;
api.subscribe(() => {
  notifiedSync = true;
  notifyDepth++;
});
// reset
api.setState({ wallet: null, connectionStatus: 'disconnected', error: null });
notifiedSync = false;
console.log('--- synchronous set() from outside-React context ---');
api.setState({ wallet: { address: 'B' }, connectionStatus: 'connecting' });
console.log('listener notified synchronously (before next line)?', notifiedSync);
