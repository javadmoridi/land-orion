import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
export default defineConfig({
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            // Point `buffer` at the real npm `buffer` package so it is BUNDLED in the
            // production build (otherwise Vite treats it as a Node builtin and
            // externalizes it -> `Buffer` undefined -> @ton/core crashes the page).
            buffer: 'buffer/',
        },
    },
    optimizeDeps: {
        include: [
            'buffer',
            'tweetnacl-util',
        ],
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                }),
            ],
        },
    },
    define: {
        global: 'globalThis',
    },
    build: {
        rollupOptions: {
            plugins: [
                // Inject `Buffer` as a module-scope binding into every module that
                // references it (including @ton/core). Combined with the `buffer`
                // alias above, this guarantees a working Buffer regardless of module
                // evaluation order, so the site no longer blanks in production.
                inject({
                    Buffer: ['buffer', 'Buffer'],
                }),
            ],
        },
    },
    server: {
        port: 3000,
    },
});
