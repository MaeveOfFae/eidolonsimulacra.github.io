import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * The server source uses NodeNext-style `.js` specifiers that resolve to `.ts`
 * files. Vite does not rewrite those on its own, so map them here for tests.
 */
function resolveNodeNextSpecifiers() {
  return {
    name: 'server-node-next-js-to-ts',
    enforce: 'pre' as const,
    resolveId(source: string, importer?: string) {
      if (!importer || !source.startsWith('.') || !source.endsWith('.js')) {
        return null;
      }

      const candidate = path.resolve(path.dirname(importer), source.replace(/\.js$/, '.ts'));
      return fs.existsSync(candidate) ? candidate : null;
    },
  };
}

export default defineConfig({
  plugins: [resolveNodeNextSpecifiers()],
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup-env.ts'],
    include: ['src/**/*.test.ts'],
  },
});
