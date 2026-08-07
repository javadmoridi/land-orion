import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// @ton/core relies on the Node `Buffer` global, which does not exist in the
// browser. Polyfill it so TON transaction BOC parsing works on the client.
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
