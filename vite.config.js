import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
export default defineConfig({
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            buffer: 'buffer',
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
    server: {
        port: 3000,
    },
});
