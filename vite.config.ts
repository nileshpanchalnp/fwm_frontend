// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // 'base' must match your production subdirectory
  // Dev: '/'  →  http://localhost:5173/
  // Prod: '/fwm/'  →  https://client.sattvion.com/fwm/
  base: command === 'serve' ? '/fwm/' : '/fwm/',

  plugins: [react()],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Dev only: forwards /api/* → Express on port 5000
      // In production this block is ignored entirely
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));