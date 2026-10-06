import type { Config } from '@char-gen/shared';
import { Eye, EyeOff, ExternalLink, Zap } from 'lucide-react';
import {
  ALL_PROVIDERS,
  PROVIDER_COLORS,
  PROVIDER_DOCS,
  PROVIDER_LABELS,
  type Provider,
} from '../../lib/llm/providers.js';
import CollapsibleSection from '../common/CollapsibleSection';

/**
 * Setup-tab "Runtime" column for the settings screen.
 *
 * Extracted from `Settings` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). Holds engine mode, provider and
 * model selection, the sampling sliders, and the advanced transport panel. Values that the
 * parent owns as defaults (`engine_mode ?? 'auto'`, `temperature ?? 0.7`, ...) arrive
 * already resolved so this section only renders what it is given. Behavior is pinned by
 * `SettingsSetup.test.tsx`.
 */

interface SettingsRuntimeSectionProps {
  engineMode: NonNullable<Config['engine_mode']>;
  onEngineModeChange: (engineMode: NonNullable<Config['engine_mode']>) => void;
  selectedProvider: Provider;
  onProviderSelect: (provider: Provider) => void;
  currentModel: string;
  onModelSelect: (modelId: string) => void;
  modelSuggestions: string[];
  modelsLoading: boolean;
  modelsLoadedCount: number;
  modelsNotice: string | null;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  maxTokens: number;
  onMaxTokensChange: (value: number) => void;
  baseUrl: string;
  onBaseUrlChange: (url: string) => void;
  apiProxyKey: string;
  onProxyKeyChange: (key: string) => void;
  showProxyKey: boolean;
  onToggleShowKey: (key: string) => void;
  onTestApiConnection: () => void;
}

export default function SettingsRuntimeSection({
  engineMode,
  onEngineModeChange,
  selectedProvider,
  onProviderSelect,
  currentModel,
  onModelSelect,
  modelSuggestions,
  modelsLoading,
  modelsLoadedCount,
  modelsNotice,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  baseUrl,
  onBaseUrlChange,
  apiProxyKey,
  onProxyKeyChange,
  showProxyKey,
  onToggleShowKey,
  onTestApiConnection,
}: SettingsRuntimeSectionProps) {
  return (
    <section data-tour-anchor="settings-model" className="order-2 app-panel p-6 xl:order-2">
      <div className="mb-5 flex items-center gap-3">
        <div className={`rounded-xl bg-gradient-to-br p-2 ${PROVIDER_COLORS[selectedProvider]}`}>
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Runtime</h2>
          <p className="text-sm text-muted-foreground">Pick the provider, model, and default generation behavior.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Engine Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEngineModeChange('auto')}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                engineMode === 'auto'
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-background/50 hover:bg-accent'
              }`}
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => onEngineModeChange('explicit')}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                engineMode === 'explicit'
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-background/50 hover:bg-accent'
              }`}
            >
              Explicit
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="provider-select" className="text-sm font-medium">
              Provider
            </label>
            <select
              id="provider-select"
              value={selectedProvider}
              onChange={(e) => onProviderSelect(e.target.value as Provider)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ALL_PROVIDERS.map((provider) => (
                <option key={provider} value={provider}>
                  {PROVIDER_LABELS[provider]}
                </option>
              ))}
            </select>
            <a
              href={PROVIDER_DOCS[selectedProvider]}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-info hover:underline"
            >
              {PROVIDER_LABELS[selectedProvider]} API docs
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-2">
            <label htmlFor="model-select" className="text-sm font-medium">
              Model
            </label>
            <select
              id="model-select"
              value={currentModel}
              onChange={(e) => onModelSelect(e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select a model...</option>
              {modelSuggestions.map((model: string) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {modelsLoading
                ? 'Loading models...'
                : modelsLoadedCount > 0
                  ? `Loaded ${modelsLoadedCount} models.`
                  : 'Showing built-in suggestions.'}
            </p>
            {modelsNotice && <p className="text-xs text-warning">{modelsNotice}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="custom-model-id" className="text-sm font-medium">
            Custom model ID
          </label>
          <input
            type="text"
            id="custom-model-id"
            aria-label="Custom model ID"
            value={currentModel}
            onChange={(e) => onModelSelect(e.target.value)}
            placeholder="e.g., openrouter/openai/gpt-5.2"
            className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="temperature-input" className="text-sm font-medium">
              Temperature
            </label>
            <input
              id="temperature-input"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              inputMode="decimal"
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Focused (0.0)</span>
              <span>Creative (2.0)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="max-tokens-input" className="text-sm font-medium">
              Max Tokens
            </label>
            <input
              id="max-tokens-input"
              type="number"
              value={maxTokens}
              onChange={(e) => onMaxTokensChange(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <CollapsibleSection
          title="Advanced transport"
          subtitle="Base URL, proxy key, and provider-specific transport notes"
          preview={baseUrl || apiProxyKey ? 'Custom transport configured' : 'Using provider defaults'}
          defaultExpanded={Boolean(baseUrl || apiProxyKey)}
          className="bg-background/35"
          bodyClassName="space-y-4"
        >
          {selectedProvider === 'openai' && (
            <div className="rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm text-warning">
              Direct OpenAI calls from this browser app are blocked by CORS on api.openai.com. Use OpenRouter for
              browser-direct usage, or point the base URL at your own proxy or relay.
            </div>
          )}

          {selectedProvider === 'ollama' && (
            <div className="rounded-lg border border-info/20 bg-info/10 p-3 text-sm text-info">
              Local server defaults to <code className="rounded bg-info/20 px-1 py-0.5">http://localhost:11434/v1</code>
              . The desktop app connects to it directly — no setup needed. A browser on an origin Ollama does not allow
              needs Ollama started with <code className="rounded bg-info/20 px-1 py-0.5">OLLAMA_ORIGINS=*</code>. For
              Ollama Cloud, set the base URL to{' '}
              <code className="rounded bg-info/20 px-1 py-0.5">https://ollama.com/v1</code> and add your OLLAMA_API_KEY
              in Providers.
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Custom API Base URL</label>
              <button
                type="button"
                onClick={onTestApiConnection}
                disabled={!baseUrl}
                className="rounded-md border border-border px-2 py-1 text-xs transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Test Connection
              </button>
            </div>
            <input
              type="text"
              aria-label="Base URL"
              value={baseUrl || ''}
              onChange={(e) => onBaseUrlChange(e.target.value)}
              placeholder="e.g., https://your-proxy.example.com/v1"
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Proxy API Key (Optional)</label>
            <div className="relative">
              <input
                type={showProxyKey ? 'text' : 'password'}
                aria-label="Proxy API key"
                value={apiProxyKey || ''}
                onChange={(e) => onProxyKeyChange(e.target.value)}
                placeholder="Enter proxy API key if required"
                className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 pr-11 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => onToggleShowKey('proxy')}
                aria-label={showProxyKey ? 'Hide proxy API key' : 'Show proxy API key'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-accent"
              >
                {showProxyKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </section>
  );
}
