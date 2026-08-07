// MUST be the first import: sets up Node-style globals (Buffer/global/process)
// needed by @ton/core before it is evaluated. Fixes the blank page on
// production builds (Rollup does not run the optimizeDeps esbuild polyfill).
import './bufferPolyfill';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './styles.css';

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);