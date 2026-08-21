// MUST be the first import: sets up Node-style globals (Buffer/global/process)
import './bufferPolyfill';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

import App from './App';
import './styles.css';

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <TonConnectUIProvider
      manifestUrl="https://land-orion-mu.vercel.app/tonconnect-manifest.json"
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);