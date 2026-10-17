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
    // The workspace pins more than one React copy (web 19.2.x, mobile 19.1.x).
    // Without deduping, component tests can bind two React instances and fail
    // with "Invalid hook call".
    dedupe: ['react', 'react-dom'],
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
    // The suite runs many files in parallel and each Dexie/`fake-indexeddb` storage
    // test does 1.5-4s of real work; under a saturated worker pool they were
    // tripping the 5s default and reddening the build with no code change (a full
    // run produced 4 failures, the next 2, and every one passed in isolation).
    // 20s keeps a genuine hang visible without reporting machine load as a failure.
    testTimeout: 20_000,
    hookTimeout: 20_000,
    environmentOptions: {
      happyDOM: {
        settings: {
          // The About page embeds the Ko-fi panel in an iframe. happy-dom would
          // otherwise issue a real request to ko-fi.com for it and reject the fetch
          // when the window tears down, which surfaced as stray `NetworkError` /
          // `AbortError` noise — and a live network dependency — in every test that
          // renders About or Home. happy-dom then logs one `NotSupportedError` per
          // skipped load; that single line is expected and not a failure.
          disableIframePageLoading: true,
        },
      },
    },
    server: {
      deps: {
        // `@tanstack/react-query` and `react-router-dom` must be transformed by Vite
        // like the app code; when they are loaded externally they resolve their own
        // React copy and hooks fail with "Invalid hook call".
        inline: ['@tanstack/react-query', 'react-router-dom', 'react-router'],
      },
    },
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

          if (
            id.includes('/zustand/') ||
            id.includes('/clsx/') ||
            id.includes('/tailwind-merge/') ||
            id.includes('/class-variance-authority/')
          ) {
            return 'ui-utils-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
});
