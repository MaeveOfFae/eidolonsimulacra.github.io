import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    // Proxy is only needed for server mode - can be disabled for pure client-side
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Only proxy when backend is available
        bypass: (req) => req.headers.get('x-client-side-only') === 'true',
      },
    },
  },
  // Optimize for static deployment
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
        },
      },
    },
  },
});
