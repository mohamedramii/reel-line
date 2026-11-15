import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const root = import.meta.dirname;

// reel line: one page, at "/". The facts shown on it live in src/shared/content.js, the shared wording in
// src/shared/ar.js and en.js, the page's own code and wording in src/v1-1/, the agency's reels and screen
// recordings in public/media and the brand kit's files in public/brand.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@shared': resolve(root, 'src/shared') },
  },
  server: { port: 5181, host: true },
  preview: { port: 4181 },
  build: { chunkSizeWarningLimit: 800 },
});
