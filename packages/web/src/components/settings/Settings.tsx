import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Save,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Shield,
  Zap,
  Lock,
  BookOpen,
  Server,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Config, FeatureCategory, ModelInfo } from '@char-gen/shared';
import { api } from '../../lib/api.js';
import { CONFIG_MANAGER_CHANGED_EVENT, configManager, isInvalidApiKeyValue, normalizeApiKeyValue } from '../../lib/config/manager.js';
import { queueAutoSync } from '../../lib/server/auto-sync.js';
import { createEngine, MODEL_SUGGESTIONS } from '../../lib/llm/factory.js';
import { GETTING_STARTED_TOUR_ID } from '@/lib/help';
import { useGuidedTour } from '../common/GuidedTourContext';
import ServerSettings from './ServerSettings';
import { getBlueprintsForFeature } from '@/lib/blueprints/featureSelection';

const ALL_PROVIDERS = ['openai', 'google', 'openrouter', 'anthropic', 'deepseek', 'zai', 'moonshot', 'ollama'] as const;
type Provider = typeof ALL_PROVIDERS[number];

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

export default function Settings() {
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
  const { isTourCompleted, restartTour, startTour } = useGuidedTour();
  const { data: blueprintList } = useQuery({
    queryKey: ['settings-blueprints'],
    queryFn: () => api.getBlueprints(),
  });

  const featureBlueprintOptions = useMemo(() => {
    if (!blueprintList) {
      return {
        orchestration: [],
        seed_generation: [],
        offspring_generation: [],
        intro_scene_generation: [],
        validation: [],
        similarity: [],
      } as Record<FeatureCategory, Array<{ value: string; label: string }>>;
    }

    const buildOptions = (feature: FeatureCategory) => getBlueprintsForFeature(blueprintList, feature)
      .map((entry) => ({ value: entry.path, label: entry.name || entry.path }));

    return {
      orchestration: buildOptions('orchestration'),
      seed_generation: buildOptions('seed_generation'),
      offspring_generation: buildOptions('offspring_generation'),
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
        engineMode: 'explicit',
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
      queueAutoSync('config');
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
    queueAutoSync('config');
    setThemeNotice('Getting Started has been reset. Return to Home to run through it again.');
    setThemeError(null);
  };

  const handleResetHelpPreferences = () => {
    configManager.resetHelpState();
    queueAutoSync('config');
    setLocalConfig((previous) => ({
      ...previous,
      help: configManager.getHelpState(),
    }));
    setThemeNotice('Help preferences were reset. Inline tips and first-run guidance are enabled again.');
    setThemeError(null);
  };

  const currentModel = localConfig.model || '';

  return (
    <div className="app-page space-y-10 pb-8">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Runtime configuration</p>
            <h1 className="app-page-title">Settings</h1>
            <p className="app-page-summary">
              API keys, model choice, and runtime defaults.
            </p>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Current runtime</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Provider</p>
                <div className="app-page-metric-value text-xl sm:text-2xl">{selectedProvider}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Model</p>
                <div className="app-page-metric-value text-base sm:text-xl">{currentModel || 'Unset'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Stored keys</p>
                <div className="app-page-metric-value text-2xl">{persistKeys ? 'On' : 'Off'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* API Keys Section */}
        <section className="lg:col-span-2 space-y-3">
          <div data-tour-anchor="settings-api-keys" className="app-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">API Keys</h2>
                <p className="text-sm text-muted-foreground">Stored in this browser profile.</p>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-background/60 hover:bg-background/80 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={persistKeys}
                onChange={(e) => handlePersistKeysToggle(e.target.checked)}
                className="h-5 w-5 rounded border-input"
              />
              <span className="text-sm font-medium">
                Save API keys to browser storage
              </span>
            </label>

            {persistKeys && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  Stored in localStorage. Use caution on shared devices.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {ALL_PROVIDERS.map((provider) => (
                <div key={provider} className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {provider}
                    {provider === 'ollama' && (
                      <span className="text-xs font-normal text-muted-foreground/70">(optional - local)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys[provider] ? 'text' : 'password'}
                      value={localConfig.api_keys?.[provider] || ''}
                      onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                      placeholder={provider === 'ollama' ? 'Optional - Ollama runs locally without auth' : `Enter your ${provider} API key`}
                      className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 pr-20 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(provider)}
                      className="absolute right-11 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      {showKeys[provider] ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTest(provider)}
                      disabled={provider !== 'ollama' && !localConfig.api_keys?.[provider]}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {testResult?.provider === provider ? (
                        <div className={`flex items-center gap-2 ${testResult.success ? 'text-green-500' : 'text-destructive'}`}>
                          {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          <span className="text-xs">{testResult.message}</span>
                        </div>
                      ) : (
                        <Zap className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Model Selection */}
        <section className="space-y-4">
          <div data-tour-anchor="settings-model" className="app-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${PROVIDER_COLORS[selectedProvider]}`}>
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Model</h2>
                <p className="text-sm text-muted-foreground">Provider and model selection.</p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedProvider === 'openai' && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100">
                  Direct OpenAI calls from this browser app are blocked by CORS on api.openai.com. Use OpenRouter for browser-direct usage, or point the base URL at your own proxy or relay.
                </div>
              )}

              {selectedProvider === 'ollama' && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-900 dark:text-blue-100">
                  Ollama runs locally on your machine. Make sure Ollama is running on <code className="px-1 py-0.5 rounded bg-blue-500/20">http://localhost:11434</code> or configure a custom base URL. No API key required.
                </div>
              )}

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

              <div className="space-y-2">
                <label htmlFor="provider-select" className="text-sm font-medium">Provider</label>
                <select
                  id="provider-select"
                  value={selectedProvider}
                  onChange={(e) => handleProviderSelect(e.target.value as Provider)}
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {ALL_PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="model-select" className="text-sm font-medium">Model</label>
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
                <p className="text-xs text-muted-foreground mt-1">
                  {modelsLoading
                    ? 'Loading models...'
                    : availableModels.length > 0
                      ? `Loaded ${availableModels.length} models.`
                      : 'Showing built-in suggestions.'}
                </p>
                {modelsNotice && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    {modelsNotice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Or enter custom model ID</label>
                <input
                  type="text"
                  value={currentModel}
                  onChange={(e) => handleModelSelect(e.target.value)}
                  placeholder="e.g., openrouter/openai/gpt-4o-mini"
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Custom API Base URL</label>
                  <button
                    type="button"
                    onClick={handleTestApiConnection}
                    disabled={!localConfig.base_url}
                    className="text-xs px-2 py-1 rounded-md border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    type={showKeys['proxy'] ? 'text' : 'password'}
                    value={localConfig.api_proxy_key || ''}
                    onChange={(e) => handleProxyKeyChange(e.target.value)}
                    placeholder="Enter proxy API key if required"
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 pr-11 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('proxy')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-accent transition-colors"
                  >
                    {showKeys['proxy'] ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="temperature-range" className="text-sm font-medium">Temperature</label>
                <input
                  id="temperature-range"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localConfig.temperature ?? 0.7}
                  onChange={(e) => setLocalConfig((previous) => ({ ...previous, temperature: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Focused (0.0)</span>
                  <span>Creative (2.0)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="max-tokens-input" className="text-sm font-medium">Max Tokens</label>
                <input
                  id="max-tokens-input"
                  type="number"
                  value={localConfig.max_tokens ?? 4096}
                  onChange={(e) => setLocalConfig((previous) => ({ ...previous, max_tokens: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

        </section>
      </div>

      {/* Batch Settings */}
      <section className="app-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold">Batch Generation</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="max-concurrent-input" className="text-sm font-medium">Max Concurrent</label>
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
            <label htmlFor="rate-limit-input" className="text-sm font-medium">Rate Limit Delay</label>
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

      {/* Feature Blueprint Defaults */}
      <section className="app-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Feature Blueprint Defaults</h2>
            <p className="text-sm text-muted-foreground">Choose default blueprints per feature.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="blueprint-orchestration" className="text-sm font-medium">Orchestration</label>
            <select
              id="blueprint-orchestration"
              value={localConfig.feature_blueprints?.orchestration || 'blueprints/system/generator.md'}
              onChange={(e) => setLocalConfig((prev) => ({
                ...prev,
                feature_blueprints: {
                  ...prev.feature_blueprints,
                  orchestration: e.target.value || undefined,
                },
              }))}
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
            <label htmlFor="blueprint-seed" className="text-sm font-medium">Seed Generation</label>
            <select
              id="blueprint-seed"
              value={localConfig.feature_blueprints?.seed_generation || 'blueprints/system/seed_generator.md'}
              onChange={(e) => setLocalConfig((prev) => ({
                ...prev,
                feature_blueprints: {
                  ...prev.feature_blueprints,
                  seed_generation: e.target.value || undefined,
                },
              }))}
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
            <label htmlFor="blueprint-offspring" className="text-sm font-medium">Offspring Generation</label>
            <select
              id="blueprint-offspring"
              value={localConfig.feature_blueprints?.offspring_generation || 'blueprints/system/offspring_generator.md'}
              onChange={(e) => setLocalConfig((prev) => ({
                ...prev,
                feature_blueprints: {
                  ...prev.feature_blueprints,
                  offspring_generation: e.target.value || undefined,
                },
              }))}
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
            <p className="text-xs text-muted-foreground">
              Blueprint used for breeding characters.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="blueprint-intro-scene" className="text-sm font-medium">Intro Scene Generation</label>
            <select
              id="blueprint-intro-scene"
              value={localConfig.feature_blueprints?.intro_scene_generation || 'blueprints/system/intro_scene.md'}
              onChange={(e) => setLocalConfig((prev) => ({
                ...prev,
                feature_blueprints: {
                  ...prev.feature_blueprints,
                  intro_scene_generation: e.target.value || undefined,
                },
              }))}
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
            <label htmlFor="blueprint-validation" className="text-sm font-medium">Validation</label>
            <select
              id="blueprint-validation"
              value={localConfig.feature_blueprints?.validation || ''}
              onChange={(e) => setLocalConfig((prev) => ({
                ...prev,
                feature_blueprints: {
                  ...prev.feature_blueprints,
                  validation: e.target.value || undefined,
                },
              }))}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Built-in Validation (Default)</option>
              {featureBlueprintOptions.validation.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Blueprint for character validation checks.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="blueprint-similarity" className="text-sm font-medium">Similarity Analysis</label>
            <select
              id="blueprint-similarity"
              value={localConfig.feature_blueprints?.similarity || ''}
              onChange={(e) => setLocalConfig((prev) => ({
                ...prev,
                feature_blueprints: {
                  ...prev.feature_blueprints,
                  similarity: e.target.value || undefined,
                },
              }))}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Built-in Analysis (Default)</option>
              {featureBlueprintOptions.similarity.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Blueprint for comparing character relationships.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Create custom blueprints in the <Link to="/blueprints" className="text-primary hover:underline">Blueprint Editor</Link> and they will appear here.
          </p>
        </div>
      </section>

      {/* Server Sync Settings */}
      <section className="app-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
            <Server className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Server Sync</h2>
            <p className="text-sm text-muted-foreground">Optional cross-device sync.</p>
          </div>
        </div>
        <ServerSettings />
      </section>

      <section data-tour-anchor="settings-help-tutorials" className="app-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600">
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
                <h3 className="font-medium text-foreground">Inline tips</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Keep plain-language helper copy visible on high-friction screens like generation, review, export, templates, blueprints, and settings.
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
                Show tips
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-border/50 bg-background/40 p-4">
              <h3 className="font-medium text-foreground">Getting Started guide</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Reopen or reset the home-screen starter guide if you want to walk through setup, generation, review, and export again.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/help"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Open Help Center
                </Link>
                <button
                  type="button"
                  onClick={handleRestartGettingStarted}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
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
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Help Preferences
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        {(themeNotice || themeError) && (
          <div className={`flex-1 rounded-lg px-4 py-2.5 text-sm flex items-center gap-2 ${
            themeError
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-primary/10 border-primary/30 text-foreground'
          }`}>
            <Shield className={`h-4 w-4 flex-shrink-0 ${themeError ? 'text-destructive' : 'text-primary'}`} />
            {themeError || themeNotice}
            <button
              onClick={() => { setThemeError(null); setThemeNotice(null); }}
              className="ml-auto p-1 rounded hover:bg-black/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}
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
