import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const shared = fileURLToPath(new URL('../shared', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Leave rules and the holiday calendar are shared with the backend.
    alias: { '@shared': shared },
  },
  server: {
    // Dedicated port; strictPort stops Vite from silently moving to
    // another port and clashing with other local projects.
    port: 5180,
    strictPort: true,
    fs: { allow: ['..'] },
    // The API runs separately; the dev server forwards /graphql to it.
    proxy: {
      '/graphql': 'http://localhost:4000',
    },
  },
});
