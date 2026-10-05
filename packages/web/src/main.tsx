import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializePersistentStorage } from './lib/persistence/storage.js';
import { migrateLegacyStorageKeys } from './lib/persistence/migrate-legacy-keys.js';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

async function bootstrap() {
  await initializePersistentStorage();

  // Retire the legacy `bpui.*` keys before anything reads storage: the per-module
  // fallbacks are gone, so this pass is what keeps existing users' data.
  migrateLegacyStorageKeys();

  const [{ default: App }, { ThemeProvider }] = await Promise.all([
    import('./App'),
    import('./components/common/ThemeProvider'),
  ]);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();
