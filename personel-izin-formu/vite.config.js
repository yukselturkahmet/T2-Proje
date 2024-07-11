import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Vite development server listens on port 3000
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Backend server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
});
