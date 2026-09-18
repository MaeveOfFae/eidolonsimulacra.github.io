/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

const tauriHost = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: tauriHost || undefined,
    port: 3000,
    strictPort: true,
    hmr: tauriHost
      ? {
          protocol: 'ws',
          host: tauriHost,
          port: 3001,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  // Optimize for static deployment
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('/react-router') || id.includes('/@remix-run/')) {
            return 'router-vendor';
          }

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
            return 'react-vendor';
          }

          if (id.includes('/@tanstack/react-query/')) {
            return 'query-vendor';
          }

          if (id.includes('/react-markdown/') || id.includes('/remark-gfm/')) {
            return 'markdown-vendor';
          }

          if (id.includes('/prismjs/') || id.includes('/react-simple-code-editor/')) {
            return 'editor-vendor';
          }

          if (id.includes('/@radix-ui/')) {
            return 'radix-vendor';
          }

          if (id.includes('/@dnd-kit/')) {
            return 'dnd-vendor';
          }

          if (id.includes('/@anthropic-ai/sdk/')) {
            return 'llm-vendor';
          }

          if (id.includes('/dexie/')) {
            return 'storage-vendor';
          }

          if (id.includes('/zustand/') || id.includes('/clsx/') || id.includes('/tailwind-merge/') || id.includes('/class-variance-authority/')) {
            return 'ui-utils-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
});
