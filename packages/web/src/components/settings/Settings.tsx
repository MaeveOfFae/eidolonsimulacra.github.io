import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, TestTube, Loader2, CheckCircle, XCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { api, type Config, type ModelInfo } from '@char-gen/shared';

const ALL_PROVIDERS = ['openai', 'google', 'openrouter', 'deepseek', 'zai', 'moonshot'] as const;
type Provider = typeof ALL_PROVIDERS[number];

export default function Settings() {
  const queryClient = useQueryClient();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider>('openrouter');
  const [localConfig, setLocalConfig] = useState<Partial<Config>>({});

  // Fetch current config
  const { data: config, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: () => api.getConfig(),
  });

  // Fetch models for selected provider
  const {
    data: modelsData,
    isLoading: modelsLoading,
    refetch: refreshModels,
    isRefetching: modelsRefreshing,
  } = useQuery({
    queryKey: ['models', selectedProvider],
    queryFn: () => api.getModels(selectedProvider),
    enabled: !!selectedProvider,
  });

  // Sync local config with server config
  useEffect(() => {
    if (config) {
      setLocalConfig(config);
      // Detect provider from current model
      const model = config.model || '';
      for (const provider of ALL_PROVIDERS) {
        if (model.startsWith(provider + '/') || model.includes(provider)) {
          setSelectedProvider(provider as Provider);
          break;
        }
      }
    }
  }, [config]);

  // Update config mutation
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Config>) => api.updateConfig(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  // Test connection mutation
  const testMutation = useMutation({
    mutationFn: (provider: string) => api.testConnection({ provider }),
    onSuccess: (result, provider) => {
      setTestResult({
        provider,
        success: result.success,
        message: result.success
          ? `Connected! Latency: ${result.latency_ms?.toFixed(0)}ms`
          : result.error || 'Connection failed',
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(localConfig);
  };

  const handleTest = (provider: string) => {
    setTestResult(null);
    testMutation.mutate(provider);
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleModelSelect = (modelId: string) => {
    setLocalConfig({ ...localConfig, model: modelId });
  };

  const handleRefreshModels = () => {
    refreshModels();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const models = modelsData?.models || [];
  const currentModel = localConfig.model || config?.model || '';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure API keys and generation settings
        </p>
      </div>

      {/* API Keys Section */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Configure your LLM provider API keys. Keys are stored locally in .bpui.toml.
          </p>
        </div>
        <div className="p-4 space-y-4">
          {ALL_PROVIDERS.map((provider) => (
            <div key={provider} className="space-y-2">
              <label className="text-sm font-medium capitalize">{provider}</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKeys[provider] ? 'text' : 'password'}
                    value={localConfig.api_keys?.[provider] || config?.api_keys?.[provider] || ''}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        api_keys: {
                          ...(localConfig.api_keys || config?.api_keys || {}),
                          [provider]: e.target.value,
                        },
                      })
                    }
                    placeholder={`Enter your ${provider} API key`}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(provider)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKeys[provider] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => handleTest(provider)}
                  disabled={testMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                >
                  {testMutation.isPending && testMutation.variables === provider ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                  Test
                </button>
              </div>
              {testResult?.provider === provider && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    testResult.success ? 'text-green-500' : 'text-destructive'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {testResult.message}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Model Selection</h2>
          <p className="text-sm text-muted-foreground">
            Choose your preferred model and engine. Models are fetched dynamically from providers.
          </p>
        </div>
        <div className="p-4 space-y-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as Provider)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ALL_PROVIDERS.map((provider) => (
                <option key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Engine Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Engine</label>
              <select
                value={localConfig.engine || config?.engine || 'auto'}
                onChange={(e) => setLocalConfig({ ...localConfig, engine: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="auto">Auto (detect from model)</option>
                <option value="openai">OpenAI</option>
                <option value="google">Google</option>
                <option value="openai_compatible">OpenAI Compatible</option>
              </select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Model</label>
                <button
                  onClick={handleRefreshModels}
                  disabled={modelsRefreshing || modelsLoading}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${modelsRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              {modelsLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <select
                  value={currentModel}
                  onChange={(e) => handleModelSelect(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a model...</option>
                  {models.map((model: ModelInfo) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                      {model.context_length ? ` (${Math.round(model.context_length / 1000)}k ctx)` : ''}
                    </option>
                  ))}
                </select>
              )}
              {modelsData?.error && (
                <p className="text-xs text-yellow-600">{modelsData.error}</p>
              )}
            </div>
          </div>

          {/* Custom Model Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Or enter custom model ID</label>
            <input
              type="text"
              value={currentModel}
              onChange={(e) => handleModelSelect(e.target.value)}
              placeholder="e.g., openrouter/openai/gpt-4o-mini"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Use format: provider/model-name (e.g., openrouter/anthropic/claude-3.5-sonnet)
            </p>
          </div>
        </div>
      </div>

      {/* Generation Settings */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Generation Settings</h2>
          <p className="text-sm text-muted-foreground">
            Fine-tune generation parameters
          </p>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Temperature: {localConfig.temperature ?? config?.temperature ?? 0.7}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={localConfig.temperature ?? config?.temperature ?? 0.7}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Tokens</label>
              <input
                type="number"
                value={localConfig.max_tokens ?? config?.max_tokens ?? 4096}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, max_tokens: parseInt(e.target.value) })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Concurrent (Batch)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={localConfig.batch?.max_concurrent ?? config?.batch?.max_concurrent ?? 3}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    batch: {
                      ...(localConfig.batch || config?.batch || { max_concurrent: 3, rate_limit_delay: 1 }),
                      max_concurrent: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate Limit Delay (seconds)</label>
              <input
                type="number"
                min="0"
                max="60"
                step="0.5"
                value={localConfig.batch?.rate_limit_delay ?? config?.batch?.rate_limit_delay ?? 1}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    batch: {
                      ...(localConfig.batch || config?.batch || { max_concurrent: 3, rate_limit_delay: 1 }),
                      rate_limit_delay: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </button>
      </div>
    </div>
  );
}
