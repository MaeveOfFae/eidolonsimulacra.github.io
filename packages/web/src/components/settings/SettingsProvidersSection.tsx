import type { Config } from '@char-gen/shared';
import { Eye, EyeOff, ExternalLink, Lock, XCircle, Zap } from 'lucide-react';
import {
  ALL_PROVIDERS,
  PROVIDER_COLORS,
  PROVIDER_DOCS,
  PROVIDER_LABELS,
  type Provider,
} from '../../lib/llm/providers.js';

/**
 * Provider credentials tab for the settings screen.
 *
 * Extracted from `Settings` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). Two columns: the stored-key
 * inventory with the persist toggle on the left, the single-provider editor on the
 * right. All state and the credential mutations stay in the parent; this section is
 * presentational plus callbacks. Behavior is pinned by `SettingsProviders.test.tsx`.
 */

interface SettingsProvidersSectionProps {
  persistKeys: boolean;
  onPersistKeysToggle: (checked: boolean) => void;
  configuredProviderCount: number;
  selectedProvider: Provider;
  onProviderSelect: (provider: Provider) => void;
  apiKeys?: Config['api_keys'];
  showKeys: Record<string, boolean>;
  activeProviderKey: string;
  onApiKeyChange: (provider: Provider, value: string) => void;
  onToggleShowKey: (provider: Provider) => void;
  testResult: { provider: string; success: boolean; message: string } | null;
  onTest: (provider: Provider) => void;
}

export default function SettingsProvidersSection({
  persistKeys,
  onPersistKeysToggle,
  configuredProviderCount,
  selectedProvider,
  onProviderSelect,
  apiKeys,
  showKeys,
  activeProviderKey,
  onApiKeyChange,
  onToggleShowKey,
  testResult,
  onTest,
}: SettingsProvidersSectionProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
      <section className="app-panel p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-2">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Providers</h2>
            <p className="text-sm text-muted-foreground">Manage stored credentials one provider at a time.</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 rounded-lg bg-background/60 p-3 transition-colors hover:bg-background/80 cursor-pointer">
            <input
              type="checkbox"
              checked={persistKeys}
              onChange={(e) => onPersistKeysToggle(e.target.checked)}
              className="h-5 w-5 rounded border-input"
            />
            <span className="text-sm font-medium">Persist keys on this device</span>
          </label>

          <div className="rounded-xl border border-border/60 bg-background/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Configured providers
            </p>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {configuredProviderCount} / {ALL_PROVIDERS.length}
            </div>
          </div>

          <div className="grid gap-2">
            {ALL_PROVIDERS.map((provider) => {
              const isActive = provider === selectedProvider;
              const isConfigured = Boolean(apiKeys?.[provider]);

              return (
                <button
                  key={provider}
                  type="button"
                  onClick={() => onProviderSelect(provider)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition-colors ${
                    isActive
                      ? 'border-primary/30 bg-primary/12 text-foreground'
                      : 'border-border/60 bg-background/50 text-foreground hover:border-primary/35'
                  }`}
                >
                  <span className="font-medium">{PROVIDER_LABELS[provider]}</span>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {isConfigured ? 'Configured' : provider === 'ollama' ? 'Local' : 'Empty'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="app-panel p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className={`rounded-xl bg-gradient-to-br p-2 ${PROVIDER_COLORS[selectedProvider]}`}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{PROVIDER_LABELS[selectedProvider]}</h2>
            <p className="text-sm text-muted-foreground">Edit the selected provider without scanning the full list.</p>
            <a
              href={PROVIDER_DOCS[selectedProvider]}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-info hover:underline"
            >
              {PROVIDER_LABELS[selectedProvider]} API docs
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type={showKeys[selectedProvider] ? 'text' : 'password'}
              aria-label="Provider API key"
              value={activeProviderKey}
              onChange={(e) => onApiKeyChange(selectedProvider, e.target.value)}
              placeholder={
                selectedProvider === 'ollama'
                  ? 'Optional for local Ollama; required for Ollama Cloud'
                  : `Enter your ${selectedProvider} API key`
              }
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 pr-12 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => onToggleShowKey(selectedProvider)}
              aria-label={showKeys[selectedProvider] ? 'Hide API key' : 'Show API key'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-accent"
            >
              {showKeys[selectedProvider] ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onTest(selectedProvider)}
              disabled={selectedProvider !== 'ollama' && !activeProviderKey}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              Test connection
            </button>
            <button
              type="button"
              onClick={() => onApiKeyChange(selectedProvider, '')}
              disabled={!activeProviderKey}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Clear key
            </button>
          </div>

          {testResult?.provider === selectedProvider && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                testResult.success
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-destructive/30 bg-destructive/10 text-destructive'
              }`}
            >
              {testResult.message}
            </div>
          )}

          <div className="rounded-xl border border-border/60 bg-background/35 p-4 text-sm text-muted-foreground">
            {selectedProvider === 'openrouter' &&
              'Recommended default for browser-direct usage because it avoids the OpenAI CORS constraint.'}
            {selectedProvider === 'openai' &&
              'Use a proxy or switch to OpenRouter when you want browser-direct generation without CORS issues.'}
            {selectedProvider === 'ollama' &&
              'Local server (http://localhost:11434/v1) needs no key. Desktop connects directly; if a browser is refused, start Ollama with OLLAMA_ORIGINS=*. For Ollama Cloud, set the API base URL in Runtime to https://ollama.com/v1 and add your OLLAMA_API_KEY.'}
            {selectedProvider !== 'openrouter' &&
              selectedProvider !== 'openai' &&
              selectedProvider !== 'ollama' &&
              'Store only the providers you actually use so the browser profile does not collect stale keys.'}
          </div>
        </div>
      </section>
    </div>
  );
}
