// ===========================================================================
// Browser polyfill for Node-style globals used by TON libraries.
//
// @ton/core (used for TON transaction BOC parsing) requires the global
// `Buffer` at module-import time and will throw "Buffer is not defined" if it
// is missing. Because ES module imports are evaluated before a module body
// runs, this file must be imported FIRST from main.tsx so the globals exist
// before any TON library is evaluated.
//
// This fixes the site on PRODUCTION builds (Rollup), where the esbuild
// optimizeDeps polyfill from vite.config does NOT run.
// ===========================================================================

import { Buffer } from 'buffer';

const g = globalThis as unknown as {
  Buffer?: typeof Buffer;
  global?: unknown;
  process?: { env: Record<string, string | undefined> };
};

if (typeof g.Buffer === 'undefined') {
  g.Buffer = Buffer;
}

// Some libraries reference `global` / `globalThis`.
if (typeof g.global === 'undefined') {
  g.global = globalThis;
}

// Minimal `process` shim (some TON deps read process.env).
if (typeof g.process === 'undefined') {
  g.process = { env: {} };
}

export {};
