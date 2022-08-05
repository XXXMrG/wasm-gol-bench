/// <reference types="vitest" />

import {defineConfig} from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
    root: './app',
    plugins: [preact()],
    test: {
        includeSource: ['**/*.ts'],
        coverage: {
            reporter: ['html', 'text'],
            include: ['**/*.{ts, tsx}']
        },
        environment: 'happy-dom',
        alias: [
            {find: 'wasm-game-of-life', replacement: './pkg/wasm_game_of_life.js'}
        ]
    },
    define: {
        'import.meta.vitest': 'undefined'
    }
});
