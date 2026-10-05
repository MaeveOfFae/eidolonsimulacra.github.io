import type { Config } from '@char-gen/shared';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { ALL_PROVIDERS, PROVIDER_LABELS, type Provider } from '../../lib/llm/providers.js';

/**
 * Setup-tab "Access" column for the settings screen.
 *
 * Extracted from `Settings` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). Holds the persist-keys toggle,
 * the provider grid, and the inline key editor for the selected provider. The credential
 * mutations and the config draft stay in the parent; this section is presentational plus
 * callbacks. Behavior is pinned by `SettingsSetup.test.tsx`.
 */

interface SettingsAccessSectionProps {
  desktopRuntime: boolean;
  persistKeys: boolean;
  onPersistKeysToggle: (checked: boolean) => void;
  selectedProvider: Provider;
  onProviderSelect: (provider: Provider) => void;
  apiKeys?: Config['api_keys'];
  onManageProviders: () => void;
  showKeys: Record<string, boolean>;
  activeProviderKey: string;
  onApiKeyChange: (provider: Provider, value: string) => void;
  onToggleShowKey: (provider: Provider) => void;
  testResult: { provider: string; success: boolean; message: string } | null;
  onTest: (provider: Provider) => void;
}

export default function SettingsAccessSection({
  desktopRuntime,
  persistKeys,
  onPersistKeysToggle,
  selectedProvider,
  onProviderSelect,
  apiKeys,
  onManageProviders,
  showKeys,
  activeProviderKey,
  onApiKeyChange,
  onToggleShowKey,
  testResult,
  onTest,
}: SettingsAccessSectionProps) {
  return (
    <section data-tour-anchor="settings-api-keys" className="order-1 app-panel p-6 xl:order-1">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-2">
          <Lock className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Access</h2>
          <p className="text-sm text-muted-foreground">
            Keep first-run setup focused on the provider you want to use right now.
          </p>
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
          <span className="text-sm font-medium">
            {desktopRuntime ? 'Save API keys to desktop app data' : 'Save API keys to browser storage'}
          </span>
        </label>

        {persistKeys && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100">
            {desktopRuntime
              ? 'Stored in desktop app data on this device. Use caution on shared devices.'
              : 'Stored in local browser storage on this device. Use caution on shared devices.'}
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Active provider</h3>
              <p className="text-xs text-muted-foreground">Switch providers without opening every key field at once.</p>
            </div>
            <button
              type="button"
              onClick={onManageProviders}
              className="rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary"
            >
              Manage all providers
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ALL_PROVIDERS.map((provider) => {
              const isActive = provider === selectedProvider;
              const isConfigured = Boolean(apiKeys?.[provider]);

              return (
                <button
                  key={provider}
                  type="button"
                  onClick={() => onProviderSelect(provider)}
                  className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'border-primary/30 bg-primary/12 text-foreground'
                      : 'border-border/60 bg-background/50 text-muted-foreground hover:border-primary/35 hover:text-foreground'
                  }`}
                >
                  <div className="text-sm font-medium">{PROVIDER_LABELS[provider]}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {isConfigured ? 'Configured' : provider === 'ollama' ? 'Local' : 'Empty'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/35 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">{PROVIDER_LABELS[selectedProvider]} access</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedProvider === 'ollama'
                  ? 'Ollama does not need an API key unless your local setup is proxied.'
                  : `Store or update the ${PROVIDER_LABELS[selectedProvider]} key used by the current runtime.`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onTest(selectedProvider)}
              disabled={selectedProvider !== 'ollama' && !activeProviderKey}
              className="rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testResult?.provider === selectedProvider
                ? testResult.success
                  ? `Connected ${testResult.message}`
                  : testResult.message
                : 'Test access'}
            </button>
          </div>

          <div className="relative mt-4">
            <input
              type={showKeys[selectedProvider] ? 'text' : 'password'}
              aria-label="Provider API key"
              value={activeProviderKey}
              onChange={(e) => onApiKeyChange(selectedProvider, e.target.value)}
              placeholder={
                selectedProvider === 'ollama'
                  ? 'Optional - Ollama runs locally without auth'
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

          {selectedProvider === 'openai' && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
              Browser-direct OpenAI requests usually need a proxy or OpenRouter because of CORS.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
