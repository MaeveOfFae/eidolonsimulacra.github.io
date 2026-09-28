import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save, XCircle, Eye, EyeOff, RotateCcw, Shield, Zap, Lock, BookOpen, Server } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Config, FeatureCategory, ModelInfo } from '@char-gen/shared';
import { api } from '../../lib/api.js';
import {
  CONFIG_MANAGER_CHANGED_EVENT,
  configManager,
  isInvalidApiKeyValue,
  normalizeApiKeyValue,
} from '../../lib/config/manager.js';
import { isDesktopRuntime } from '../../lib/runtime.js';
import { createEngine, MODEL_SUGGESTIONS } from '../../lib/llm/factory.js';
import CollapsibleSection from '../common/CollapsibleSection';
import DeviceLinkSettings from './DeviceLinkSettings';
import { getBlueprintsForFeature } from '@/lib/blueprints/featureSelection';

const ALL_PROVIDERS = ['openai', 'google', 'openrouter', 'anthropic', 'deepseek', 'zai', 'moonshot', 'ollama'] as const;
type Provider = (typeof ALL_PROVIDERS)[number];

// Provider colors for badges
const PROVIDER_COLORS: Record<Provider, string> = {
  openai: 'from-emerald-500 to-green-500',
  google: 'from-blue-500 to-cyan-500',
  openrouter: 'from-violet-500 to-purple-500',
  anthropic: 'from-orange-500 to-red-500',
  deepseek: 'from-cyan-500 to-teal-500',
  zai: 'from-pink-500 to-rose-500',
  moonshot: 'from-orange-500 to-amber-500',
  ollama: 'from-slate-500 to-gray-600',
};

type SettingsSectionId = 'setup' | 'providers' | 'generation' | 'help' | 'sync';

const SETTINGS_SECTIONS: Array<{ id: SettingsSectionId; label: string }> = [
  { id: 'setup', label: 'Setup' },
  { id: 'providers', label: 'Providers' },
  { id: 'generation', label: 'Generation' },
  { id: 'help', label: 'Help' },
  { id: 'sync', label: 'Device Link' },
];

function isSettingsSectionId(value: string | null): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((section) => section.id === value);
}

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  google: 'Google',
  openrouter: 'OpenRouter',
  anthropic: 'Anthropic',
  deepseek: 'DeepSeek',
  zai: 'Z.AI',
  moonshot: 'Moonshot',
  ollama: 'Ollama',
};

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const desktopRuntime = isDesktopRuntime();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider>('openrouter');
  const [localConfig, setLocalConfig] = useState<Partial<Config>>({});
  const [themeNotice, setThemeNotice] = useState<string | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [persistKeys, setPersistKeys] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsNotice, setModelsNotice] = useState<string | null>(null);
  const requestedSection = searchParams.get('section');
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(() =>
    isSettingsSectionId(requestedSection) ? requestedSection : 'setup',
  );
  const { data: blueprintList } = useQuery({
    queryKey: ['settings-blueprints'],
    queryFn: () => api.getBlueprints(),
  });

  useEffect(() => {
    const nextSection = isSettingsSectionId(requestedSection) ? requestedSection : 'setup';
    if (nextSection !== activeSection) {
      setActiveSection(nextSection);
    }
  }, [activeSection, requestedSection]);

  const featureBlueprintOptions = useMemo(() => {
    if (!blueprintList) {
      return {
        orchestration: [],
        seed_generation: [],
        offspring_generation: [],
        worldbook_generation: [],
        intro_scene_generation: [],
        validation: [],
        similarity: [],
      } as Record<FeatureCategory, Array<{ value: string; label: string }>>;
    }

    const buildOptions = (feature: FeatureCategory) =>
      getBlueprintsForFeature(blueprintList, feature).map((entry) => ({
        value: entry.path,
        label: entry.name || entry.path,
      }));

    return {
      orchestration: buildOptions('orchestration'),
      seed_generation: buildOptions('seed_generation'),
      offspring_generation: buildOptions('offspring_generation'),
      worldbook_generation: buildOptions('worldbook_generation'),
      intro_scene_generation: buildOptions('intro_scene_generation'),
      validation: buildOptions('validation'),
      similarity: buildOptions('similarity'),
    } as Record<FeatureCategory, Array<{ value: string; label: string }>>;
  }, [blueprintList]);

  const syncLocalConfigFromManager = () => {
    const config = configManager.getConfig();
    const apiKeys = configManager.getApiKeys();
    setLocalConfig({ ...config, api_keys: apiKeys });
    setPersistKeys(configManager.isPersistingApiKeys());

    if (config.engine_mode === 'explicit' && config.engine && ALL_PROVIDERS.includes(config.engine as Provider)) {
      setSelectedProvider(config.engine as Provider);
      return;
    }

    const model = config.model || '';
    for (const provider of ALL_PROVIDERS) {
      if (model.startsWith(provider + '/') || model.includes(provider)) {
        setSelectedProvider(provider);
        return;
      }
    }
  };

  // Load config from client-side manager
  useEffect(() => {
    syncLocalConfigFromManager();

    const handleConfigChange = () => {
      syncLocalConfigFromManager();
    };

    window.addEventListener(CONFIG_MANAGER_CHANGED_EVENT, handleConfigChange);
    return () => {
      window.removeEventListener(CONFIG_MANAGER_CHANGED_EVENT, handleConfigChange);
    };
  }, []);

  const modelSuggestions = useMemo(() => {
    if (availableModels.length > 0) {
      return availableModels.map((model) => model.id);
    }

    return MODEL_SUGGESTIONS[selectedProvider] || [];
  }, [availableModels, selectedProvider]);

  const updateConfig = async () => {
    const persistedConfig = { ...localConfig };
    delete persistedConfig.api_keys;
    await api.updateConfig({
      ...persistedConfig,
      api_keys: localConfig.api_keys,
    });
    configManager.setPersistApiKeys(persistKeys);

    setThemeNotice('Settings saved. Theme and generation config are now persisted.');
    setThemeError(null);
  };

  useEffect(() => {
    let isCancelled = false;

    const loadModels = async () => {
      setModelsLoading(true);
      try {
        const response = await api.getModels(selectedProvider);
        if (isCancelled) {
          return;
        }

        setAvailableModels(response.models);
        setModelsNotice(response.error || null);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setAvailableModels([]);
        setModelsNotice(error instanceof Error ? error.message : 'Failed to load models');
      } finally {
        if (!isCancelled) {
          setModelsLoading(false);
        }
      }
    };

    void loadModels();

    return () => {
      isCancelled = true;
    };
  }, [selectedProvider, localConfig.api_keys?.[selectedProvider]]);

  // Test connection with client-side engine
  const testConnection = async (provider: string) => {
    setTestResult(null);

    try {
      const apiKey = localConfig.api_keys?.[provider];

      // Ollama doesn't require an API key
      if (!apiKey && provider !== 'ollama') {
        setTestResult({
          provider,
          success: false,
          message: 'No API key configured',
        });
        return;
      }

      const model = modelSuggestions[0] || localConfig.model || 'test-model';
      const engine = createEngine({
        model,
        apiKey,
        provider: provider as Provider,
        baseUrl: localConfig.base_url || undefined,
        proxyKey: localConfig.api_proxy_key || undefined,
      });

      const startTime = performance.now();
      const result = await engine.testConnection();
      const latency = performance.now() - startTime;

      if (result.success) {
        setTestResult({
          provider,
          success: true,
          message: `${latency.toFixed(0)}ms`,
        });
      } else {
        setTestResult({
          provider,
          success: false,
          message: result.error || 'Connection failed',
        });
      }
    } catch (error) {
      setTestResult({
        provider,
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      });
    }
  };

  const handleTest = (provider: string) => {
    testConnection(provider);
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleApiKeyChange = (provider: Provider, value: string) => {
    const normalizedValue = normalizeApiKeyValue(value);

    setLocalConfig((previous) => {
      const nextApiKeys = { ...(previous.api_keys || {}) };
      if (normalizedValue && !isInvalidApiKeyValue(normalizedValue)) {
        nextApiKeys[provider] = normalizedValue;
        configManager.setApiKey(provider, normalizedValue);
      } else {
        delete nextApiKeys[provider];
        configManager.clearApiKey(provider);
      }
      return {
        ...previous,
        api_keys: nextApiKeys,
      };
    });
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setLocalConfig((previous) => ({
      ...previous,
      engine: provider,
      engine_mode: 'explicit',
      model: previous.engine === provider ? previous.model : '',
    }));
  };

  const handleEngineModeChange = (engineMode: NonNullable<Config['engine_mode']>) => {
    setLocalConfig((previous) => ({
      ...previous,
      engine_mode: engineMode,
    }));
  };

  const handleModelSelect = (modelId: string) => {
    setLocalConfig((previous) => ({
      ...previous,
      engine: selectedProvider,
      engine_mode: 'explicit',
      model: modelId,
    }));
  };

  const handlePersistKeysToggle = (checked: boolean) => {
    setPersistKeys(checked);
    configManager.setPersistApiKeys(checked);
  };

  const handleBaseUrlChange = (url: string) => {
    const trimmedUrl = url.trim();
    setLocalConfig((previous) => ({
      ...previous,
      base_url: trimmedUrl || undefined,
    }));
  };

  const handleProxyKeyChange = (key: string) => {
    const trimmedKey = key.trim();
    setLocalConfig((previous) => ({
      ...previous,
      api_proxy_key: trimmedKey || undefined,
    }));
  };

  const handleTestApiConnection = async () => {
    const baseUrl = localConfig.base_url;
    if (!baseUrl) {
      setThemeError('Enter a custom API base URL to test');
      setThemeNotice(null);
      return;
    }

    try {
      const startTime = performance.now();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add proxy API key if provided
      if (localConfig.api_proxy_key) {
        headers['Authorization'] = `Bearer ${localConfig.api_proxy_key}`;
      }

      const response = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers,
      });
      const latency = performance.now() - startTime;

      if (response.ok) {
        setThemeNotice(`API connection successful (${latency.toFixed(0)}ms)`);
        setThemeError(null);
      } else {
        setThemeError(`API returned status ${response.status}`);
        setThemeNotice(null);
      }
    } catch (error) {
      setThemeError(error instanceof Error ? error.message : 'Connection failed');
      setThemeNotice(null);
    }
  };

  const handleRestartGettingStarted = () => {
    const baseHelp = localConfig.help ?? configManager.getHelpState();
    const nextHelpState = {
      ...baseHelp,
      first_run_completed: false,
      completed_guides: (baseHelp.completed_guides ?? []).filter((guideId) => guideId !== 'getting-started'),
      completed_tours: (baseHelp.completed_tours ?? []).filter((tourId) => tourId !== 'getting-started'),
    };

    setLocalConfig((previous) => ({
      ...previous,
      help: nextHelpState,
    }));
    configManager.updateHelpState(nextHelpState);
    setThemeNotice('Getting Started has been reset. Return to Home to run through it again.');
    setThemeError(null);
  };

  const handleResetHelpPreferences = () => {
    configManager.resetHelpState();
    setLocalConfig((previous) => ({
      ...previous,
      help: configManager.getHelpState(),
    }));
    setThemeNotice('Help preferences were reset. Hover help popups and first-run guidance are enabled again.');
    setThemeError(null);
  };

  const currentModel = localConfig.model || '';
  const compactModelLabel = currentModel
    ? currentModel.split('/').filter(Boolean).slice(-1)[0] || currentModel
    : 'Unset';
  const activeProviderKey = localConfig.api_keys?.[selectedProvider] || '';
  const configuredProviderCount = ALL_PROVIDERS.filter((provider) => Boolean(localConfig.api_keys?.[provider])).length;
  const configuredFeatureBlueprintCount = Object.values(localConfig.feature_blueprints ?? {}).filter(Boolean).length;
  const visibleSections = SETTINGS_SECTIONS;

  const handleSectionChange = (section: SettingsSectionId) => {
    setActiveSection(section);

    const nextParams = new URLSearchParams(searchParams);
    if (section === 'setup') {
      nextParams.delete('section');
    } else {
      nextParams.set('section', section);
    }

    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="app-page space-y-8 pb-8">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Runtime configuration</p>
            <h1 className="app-page-title">Settings</h1>
            <p className="app-page-summary">Configure access first, then tune defaults only when you need them.</p>
          </div>

          <div className="app-panel-muted p-3.5 sm:p-5">
            <p className="app-page-eyebrow">Current runtime</p>
            <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
              <span className="app-pill app-pill-muted">{PROVIDER_LABELS[selectedProvider]}</span>
              <span className="app-pill app-pill-muted">{compactModelLabel}</span>
              <span className="app-pill app-pill-muted">Keys {persistKeys ? 'On' : 'Off'}</span>
              <span className="app-pill app-pill-muted">{configuredProviderCount} ready</span>
            </div>
            <div className="mt-4 hidden sm:grid app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Provider</p>
                <div className="app-page-metric-value text-xl sm:text-2xl">{PROVIDER_LABELS[selectedProvider]}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Model</p>
                <div className="app-page-metric-value text-base sm:text-xl">{currentModel || 'Unset'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Stored keys</p>
                <div className="app-page-metric-value text-2xl">{persistKeys ? 'On' : 'Off'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Providers ready</p>
                <div className="app-page-metric-value text-2xl">{configuredProviderCount}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2 pb-1 sm:hidden">
        {visibleSections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => handleSectionChange(section.id)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'border-primary/35 bg-primary/15 text-foreground'
                : 'border-border/60 bg-background/55 text-muted-foreground hover:border-primary/35 hover:text-foreground'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="hidden overflow-x-auto pb-1 sm:flex">
        <div className="app-tab-group min-w-max">
          {visibleSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSectionChange(section.id)}
              data-active={activeSection === section.id ? 'true' : 'false'}
              className="app-tab-button"
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {(themeNotice || themeError) && (
        <div
          className={`app-note flex items-center gap-2 px-4 py-3 text-sm ${
            themeError
              ? 'border-destructive/50 bg-destructive/10 text-destructive'
              : 'border-primary/30 bg-primary/10 text-foreground'
          }`}
        >
          <Shield className={`h-4 w-4 flex-shrink-0 ${themeError ? 'text-destructive' : 'text-primary'}`} />
          {themeError || themeNotice}
          <button
            onClick={() => {
              setThemeError(null);
              setThemeNotice(null);
            }}
            className="ml-auto rounded p-1 transition-colors hover:bg-black/10"
            aria-label="Dismiss notification"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {activeSection === 'setup' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <section data-tour-anchor="settings-model" className="order-2 app-panel p-6 xl:order-2">
            <div className="mb-5 flex items-center gap-3">
              <div className={`rounded-xl bg-gradient-to-br p-2 ${PROVIDER_COLORS[selectedProvider]}`}>
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Runtime</h2>
                <p className="text-sm text-muted-foreground">
                  Pick the provider, model, and default generation behavior.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Engine Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEngineModeChange('auto')}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      (localConfig.engine_mode ?? 'auto') === 'auto'
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-background/50 hover:bg-accent'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEngineModeChange('explicit')}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      (localConfig.engine_mode ?? 'auto') === 'explicit'
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
                    onChange={(e) => handleProviderSelect(e.target.value as Provider)}
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {ALL_PROVIDERS.map((provider) => (
                      <option key={provider} value={provider}>
                        {PROVIDER_LABELS[provider]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="model-select" className="text-sm font-medium">
                    Model
                  </label>
                  <select
                    id="model-select"
                    value={currentModel}
                    onChange={(e) => handleModelSelect(e.target.value)}
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
                      : availableModels.length > 0
                        ? `Loaded ${availableModels.length} models.`
                        : 'Showing built-in suggestions.'}
                  </p>
                  {modelsNotice && <p className="text-xs text-amber-700 dark:text-amber-300">{modelsNotice}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Custom model ID</label>
                <input
                  type="text"
                  value={currentModel}
                  onChange={(e) => handleModelSelect(e.target.value)}
                  placeholder="e.g., openrouter/openai/gpt-4o-mini"
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
                    value={localConfig.temperature ?? 0.7}
                    onChange={(e) =>
                      setLocalConfig((previous) => ({ ...previous, temperature: parseFloat(e.target.value) }))
                    }
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
                    value={localConfig.max_tokens ?? 4096}
                    onChange={(e) =>
                      setLocalConfig((previous) => ({ ...previous, max_tokens: parseInt(e.target.value, 10) || 0 }))
                    }
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <CollapsibleSection
                title="Advanced transport"
                subtitle="Base URL, proxy key, and provider-specific transport notes"
                preview={
                  localConfig.base_url || localConfig.api_proxy_key
                    ? 'Custom transport configured'
                    : 'Using provider defaults'
                }
                defaultExpanded={Boolean(localConfig.base_url || localConfig.api_proxy_key)}
                className="bg-background/35"
                bodyClassName="space-y-4"
              >
                {selectedProvider === 'openai' && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100">
                    Direct OpenAI calls from this browser app are blocked by CORS on api.openai.com. Use OpenRouter for
                    browser-direct usage, or point the base URL at your own proxy or relay.
                  </div>
                )}

                {selectedProvider === 'ollama' && (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-900 dark:text-blue-100">
                    Ollama runs locally on your machine. Make sure Ollama is running on{' '}
                    <code className="rounded bg-blue-500/20 px-1 py-0.5">http://localhost:11434</code> or configure a
                    custom base URL.
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Custom API Base URL</label>
                    <button
                      type="button"
                      onClick={handleTestApiConnection}
                      disabled={!localConfig.base_url}
                      className="rounded-md border border-border px-2 py-1 text-xs transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Test Connection
                    </button>
                  </div>
                  <input
                    type="text"
                    value={localConfig.base_url || ''}
                    onChange={(e) => handleBaseUrlChange(e.target.value)}
                    placeholder="e.g., https://your-proxy.example.com/v1"
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Proxy API Key (Optional)</label>
                  <div className="relative">
                    <input
                      type={showKeys.proxy ? 'text' : 'password'}
                      value={localConfig.api_proxy_key || ''}
                      onChange={(e) => handleProxyKeyChange(e.target.value)}
                      placeholder="Enter proxy API key if required"
                      className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 pr-11 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('proxy')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-accent"
                    >
                      {showKeys.proxy ? (
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
                  onChange={(e) => handlePersistKeysToggle(e.target.checked)}
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
                    <p className="text-xs text-muted-foreground">
                      Switch providers without opening every key field at once.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSectionChange('providers')}
                    className="rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary"
                  >
                    Manage all providers
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ALL_PROVIDERS.map((provider) => {
                    const isActive = provider === selectedProvider;
                    const isConfigured = Boolean(localConfig.api_keys?.[provider]);

                    return (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => handleProviderSelect(provider)}
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
                    <h3 className="text-base font-semibold text-foreground">
                      {PROVIDER_LABELS[selectedProvider]} access
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedProvider === 'ollama'
                        ? 'Ollama does not need an API key unless your local setup is proxied.'
                        : `Store or update the ${PROVIDER_LABELS[selectedProvider]} key used by the current runtime.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTest(selectedProvider)}
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
                    value={activeProviderKey}
                    onChange={(e) => handleApiKeyChange(selectedProvider, e.target.value)}
                    placeholder={
                      selectedProvider === 'ollama'
                        ? 'Optional - Ollama runs locally without auth'
                        : `Enter your ${selectedProvider} API key`
                    }
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 pr-12 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(selectedProvider)}
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
        </div>
      )}

      {activeSection === 'providers' && (
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
                  onChange={(e) => handlePersistKeysToggle(e.target.checked)}
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
                  const isConfigured = Boolean(localConfig.api_keys?.[provider]);

                  return (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => handleProviderSelect(provider)}
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
                <p className="text-sm text-muted-foreground">
                  Edit the selected provider without scanning the full list.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showKeys[selectedProvider] ? 'text' : 'password'}
                  value={activeProviderKey}
                  onChange={(e) => handleApiKeyChange(selectedProvider, e.target.value)}
                  placeholder={
                    selectedProvider === 'ollama'
                      ? 'Optional - Ollama runs locally without auth'
                      : `Enter your ${selectedProvider} API key`
                  }
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 pr-12 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey(selectedProvider)}
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
                  onClick={() => handleTest(selectedProvider)}
                  disabled={selectedProvider !== 'ollama' && !activeProviderKey}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  Test connection
                </button>
                <button
                  type="button"
                  onClick={() => handleApiKeyChange(selectedProvider, '')}
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
                      ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300'
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
                  'Keep Ollama running locally and use a base URL only when your instance is not on the default port.'}
                {selectedProvider !== 'openrouter' &&
                  selectedProvider !== 'openai' &&
                  selectedProvider !== 'ollama' &&
                  'Store only the providers you actually use so the browser profile does not collect stale keys.'}
              </div>
            </div>
          </section>
        </div>
      )}

      {activeSection === 'generation' && (
        <div className="space-y-6">
          <section className="app-panel p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 p-2">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Batch Generation</h2>
                <p className="text-sm text-muted-foreground">Control concurrency and pacing for multi-draft runs.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="max-concurrent-input" className="text-sm font-medium">
                  Max Concurrent
                </label>
                <input
                  id="max-concurrent-input"
                  type="number"
                  min="1"
                  max="10"
                  value={localConfig.batch?.max_concurrent ?? 3}
                  onChange={(e) =>
                    setLocalConfig((previous) => ({
                      ...previous,
                      batch: {
                        ...(previous.batch || { max_concurrent: 3, rate_limit_delay: 1 }),
                        max_concurrent: parseInt(e.target.value, 10) || 1,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="rate-limit-input" className="text-sm font-medium">
                  Rate Limit Delay
                </label>
                <input
                  id="rate-limit-input"
                  type="number"
                  min="0"
                  max="60"
                  step="0.5"
                  value={localConfig.batch?.rate_limit_delay ?? 1}
                  onChange={(e) =>
                    setLocalConfig((previous) => ({
                      ...previous,
                      batch: {
                        ...(previous.batch || { max_concurrent: 3, rate_limit_delay: 1 }),
                        rate_limit_delay: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </section>

          <CollapsibleSection
            title="Feature blueprint defaults"
            subtitle="Advanced compiler defaults"
            preview={`${configuredFeatureBlueprintCount} override${configuredFeatureBlueprintCount === 1 ? '' : 's'} configured`}
            className="app-panel"
            bodyClassName="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="blueprint-orchestration" className="text-sm font-medium">
                  Orchestration
                </label>
                <select
                  id="blueprint-orchestration"
                  value={localConfig.feature_blueprints?.orchestration || 'blueprints/system/generator.md'}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      feature_blueprints: {
                        ...prev.feature_blueprints,
                        orchestration: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="blueprints/system/generator.md">Orchestrator (Default)</option>
                  {featureBlueprintOptions.orchestration
                    .filter((option) => option.value !== 'blueprints/system/generator.md')
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  <option value="">None (Built-in)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Blueprint used for the orchestrator on the Generate New tab.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="blueprint-seed" className="text-sm font-medium">
                  Seed Generation
                </label>
                <select
                  id="blueprint-seed"
                  value={localConfig.feature_blueprints?.seed_generation || 'blueprints/system/seed_generator.md'}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      feature_blueprints: {
                        ...prev.feature_blueprints,
                        seed_generation: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="blueprints/system/seed_generator.md">Seed Generator (Default)</option>
                  {featureBlueprintOptions.seed_generation
                    .filter((option) => option.value !== 'blueprints/system/seed_generator.md')
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  <option value="">None (Built-in)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Blueprint used for generating seed batches from genre lines.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="blueprint-offspring" className="text-sm font-medium">
                  Offspring Generation
                </label>
                <select
                  id="blueprint-offspring"
                  value={
                    localConfig.feature_blueprints?.offspring_generation || 'blueprints/system/offspring_generator.md'
                  }
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      feature_blueprints: {
                        ...prev.feature_blueprints,
                        offspring_generation: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="blueprints/system/offspring_generator.md">Offspring Generator (Default)</option>
                  {featureBlueprintOptions.offspring_generation
                    .filter((option) => option.value !== 'blueprints/system/offspring_generator.md')
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  <option value="">None (Built-in)</option>
                </select>
                <p className="text-xs text-muted-foreground">Blueprint used for breeding characters.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="blueprint-intro-scene" className="text-sm font-medium">
                  Intro Scene Generation
                </label>
                <select
                  id="blueprint-intro-scene"
                  value={localConfig.feature_blueprints?.intro_scene_generation || 'blueprints/system/intro_scene.md'}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      feature_blueprints: {
                        ...prev.feature_blueprints,
                        intro_scene_generation: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="blueprints/system/intro_scene.md">Intro Scene (Default)</option>
                  {featureBlueprintOptions.intro_scene_generation
                    .filter((option) => option.value !== 'blueprints/system/intro_scene.md')
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  <option value="">None (Built-in)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Blueprint used by the Assets tab when generating additional intro scenes.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="blueprint-worldbook" className="text-sm font-medium">
                  Worldbook Generation
                </label>
                <select
                  id="blueprint-worldbook"
                  value={
                    localConfig.feature_blueprints?.worldbook_generation || 'blueprints/system/lorebook_generator.md'
                  }
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      feature_blueprints: {
                        ...prev.feature_blueprints,
                        worldbook_generation: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="blueprints/system/lorebook_generator.md">Lorebook Generator (Default)</option>
                  {featureBlueprintOptions.worldbook_generation
                    .filter((option) => option.value !== 'blueprints/system/lorebook_generator.md')
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  <option value="">None (Built-in)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Blueprint for synthesizing connected lorebook entries from reference drafts.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="blueprint-validation" className="text-sm font-medium">
                  Validation
                </label>
                <select
                  id="blueprint-validation"
                  value={localConfig.feature_blueprints?.validation || ''}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      feature_blueprints: {
                        ...prev.feature_blueprints,
                        validation: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Built-in Validation (Default)</option>
                  {featureBlueprintOptions.validation.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Blueprint for character validation checks.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="blueprint-similarity" className="text-sm font-medium">
                  Similarity Analysis
                </label>
                <select
                  id="blueprint-similarity"
                  value={localConfig.feature_blueprints?.similarity || ''}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      feature_blueprints: {
                        ...prev.feature_blueprints,
                        similarity: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Built-in Analysis (Default)</option>
                  {featureBlueprintOptions.similarity.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Blueprint for comparing character relationships.</p>
              </div>
            </div>

            <div className="mt-4 border-t border-border/50 pt-4">
              <p className="text-xs text-muted-foreground">
                Create custom blueprints in the{' '}
                <Link to="/blueprints" className="text-primary hover:underline">
                  Blueprint Editor
                </Link>{' '}
                and they will appear here.
              </p>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {activeSection === 'help' && (
        <section data-tour-anchor="settings-help-tutorials" className="app-panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 p-2">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Help and Tutorials</h2>
              <p className="text-sm text-muted-foreground">Guide and help preferences.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-border/50 bg-background/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-foreground">Hover help popups</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Keep contextual help available behind compact hover popups on high-friction screens like generation,
                    review, export, templates, blueprints, and settings.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={localConfig.help?.show_inline_tips ?? true}
                    onChange={(event) =>
                      setLocalConfig((previous) => ({
                        ...previous,
                        help: {
                          ...(previous.help ?? configManager.getHelpState()),
                          show_inline_tips: event.target.checked,
                        },
                      }))
                    }
                    className="rounded border-input"
                  />
                  Show popups
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-border/50 bg-background/40 p-4">
                <h3 className="font-medium text-foreground">Getting Started guide</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Reopen or reset the home-screen starter guide if you want to walk through setup, generation, review,
                  and export again.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to="/help"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <BookOpen className="h-4 w-4" />
                    Open Help Center
                  </Link>
                  <button
                    type="button"
                    onClick={handleRestartGettingStarted}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restart Getting Started
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-background/40 p-4">
                <h3 className="font-medium text-foreground">Reset help state</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Restore default tutorial settings and turn first-run guidance back on for this browser profile.
                </p>
                <button
                  type="button"
                  onClick={handleResetHelpPreferences}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Help Preferences
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'sync' && (
        <section className="app-panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-2">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Device Link</h2>
              <p className="text-sm text-muted-foreground">
                Move the workspace between this PC runtime and mobile with local bundle transfer.
              </p>
            </div>
          </div>
          <DeviceLinkSettings />
        </section>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <button
          onClick={() => void updateConfig()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:from-primary/90 hover:to-accent/90 transition-all duration-200 shadow-lg shadow-primary/20"
        >
          <Save className="h-4 w-4" />
          Save All Settings
        </button>
      </div>
    </div>
  );
}
