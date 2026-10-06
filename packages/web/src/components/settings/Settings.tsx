import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save, XCircle, Shield, Server } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { Config, FeatureCategory, ModelInfo } from '@char-gen/shared';
import { createDefaultChubConfig, createDefaultComfyUIConfig, detectProviderFromModel } from '@char-gen/shared';
import { api } from '../../lib/api.js';
import {
  CONFIG_MANAGER_CHANGED_EVENT,
  configManager,
  isInvalidApiKeyValue,
  normalizeApiKeyValue,
} from '../../lib/config/manager.js';
import { isDesktopRuntime } from '../../lib/runtime.js';
import { createEngine, MODEL_SUGGESTIONS } from '../../lib/llm/factory.js';
import { ALL_PROVIDERS, PROVIDER_LABELS, type Provider } from '../../lib/llm/providers.js';
import DeviceLinkSettings from './DeviceLinkSettings';
import SettingsAccessSection from './SettingsAccessSection';
import SettingsGenerationSection from './SettingsGenerationSection';
import SettingsHelpSection from './SettingsHelpSection';
import SettingsRuntimeSection from './SettingsRuntimeSection';
import SettingsProvidersSection from './SettingsProvidersSection';
import SettingsImagePipelineSection from './SettingsImagePipelineSection';
import SettingsChubSection from './SettingsChubSection';
import { getBlueprintsForFeature } from '@/lib/blueprints/featureSelection';

type SettingsSectionId = 'setup' | 'providers' | 'generation' | 'image' | 'chub' | 'help' | 'sync';

const SETTINGS_SECTIONS: Array<{ id: SettingsSectionId; label: string }> = [
  { id: 'setup', label: 'Setup' },
  { id: 'providers', label: 'Providers' },
  { id: 'generation', label: 'Generation' },
  { id: 'image', label: 'Image Pipeline' },
  { id: 'chub', label: 'Chub' },
  { id: 'help', label: 'Help' },
  { id: 'sync', label: 'Device Link' },
];

function isSettingsSectionId(value: string | null): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((section) => section.id === value);
}

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

  const providerSignatureRef = useRef<string | null>(null);

  const syncLocalConfigFromManager = () => {
    const config = configManager.getConfig();
    const apiKeys = configManager.getApiKeys();
    setLocalConfig({ ...config, api_keys: apiKeys });
    setPersistKeys(configManager.isPersistingApiKeys());

    // Only re-resolve the provider when the config's engine/model identity changed.
    // Saving or clearing a key rewrites config and fires the change event; without this
    // guard the panel jumps back to the inferred provider mid-edit.
    const signature = `${config.engine_mode}:${
      config.engine_mode === 'explicit' ? (config.engine ?? '') : (config.model ?? '')
    }`;
    if (providerSignatureRef.current === signature) {
      return;
    }
    providerSignatureRef.current = signature;

    if (config.engine_mode === 'explicit' && config.engine && ALL_PROVIDERS.includes(config.engine as Provider)) {
      setSelectedProvider(config.engine as Provider);
      return;
    }

    // The shared detector owns model -> provider (slash prefixes, bare ids like
    // `gemma4` / `glm-5.3` / `kimi-k3`, OpenRouter as the default) — the exact
    // rules engine creation applies — so the panel always shows the provider
    // that will actually answer for this model. Key-only writes never reach
    // here (the signature guard above), so a key edit can't bounce the panel.
    const inferredProvider = detectProviderFromModel(config.model || '');
    setSelectedProvider(inferredProvider);
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

  const handleTemperatureChange = (value: number) => {
    setLocalConfig((previous) => ({ ...previous, temperature: value }));
  };

  const handleMaxTokensChange = (value: number) => {
    setLocalConfig((previous) => ({ ...previous, max_tokens: value }));
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
  const handleBatchChange = (key: 'max_concurrent' | 'rate_limit_delay', value: number) => {
    setLocalConfig((previous) => ({
      ...previous,
      batch: {
        ...(previous.batch || { max_concurrent: 3, rate_limit_delay: 1 }),
        [key]: value,
      },
    }));
  };

  const handleFeatureBlueprintChange = (feature: FeatureCategory, value: string) => {
    setLocalConfig((previous) => ({
      ...previous,
      feature_blueprints: {
        ...previous.feature_blueprints,
        [feature]: value || undefined,
      },
    }));
  };

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
          <SettingsRuntimeSection
            engineMode={localConfig.engine_mode ?? 'auto'}
            onEngineModeChange={handleEngineModeChange}
            selectedProvider={selectedProvider}
            onProviderSelect={handleProviderSelect}
            currentModel={currentModel}
            onModelSelect={handleModelSelect}
            modelSuggestions={modelSuggestions}
            modelsLoading={modelsLoading}
            modelsLoadedCount={availableModels.length}
            modelsNotice={modelsNotice}
            temperature={localConfig.temperature ?? 0.7}
            onTemperatureChange={handleTemperatureChange}
            maxTokens={localConfig.max_tokens ?? 4096}
            onMaxTokensChange={handleMaxTokensChange}
            baseUrl={localConfig.base_url ?? ''}
            onBaseUrlChange={handleBaseUrlChange}
            apiProxyKey={localConfig.api_proxy_key ?? ''}
            onProxyKeyChange={handleProxyKeyChange}
            showProxyKey={Boolean(showKeys.proxy)}
            onToggleShowKey={toggleShowKey}
            onTestApiConnection={handleTestApiConnection}
          />

          <SettingsAccessSection
            desktopRuntime={desktopRuntime}
            persistKeys={persistKeys}
            onPersistKeysToggle={handlePersistKeysToggle}
            selectedProvider={selectedProvider}
            onProviderSelect={handleProviderSelect}
            apiKeys={localConfig.api_keys}
            onManageProviders={() => handleSectionChange('providers')}
            showKeys={showKeys}
            activeProviderKey={activeProviderKey}
            onApiKeyChange={handleApiKeyChange}
            onToggleShowKey={toggleShowKey}
            testResult={testResult}
            onTest={handleTest}
          />
        </div>
      )}

      {activeSection === 'providers' && (
        <SettingsProvidersSection
          persistKeys={persistKeys}
          onPersistKeysToggle={handlePersistKeysToggle}
          configuredProviderCount={configuredProviderCount}
          selectedProvider={selectedProvider}
          onProviderSelect={handleProviderSelect}
          apiKeys={localConfig.api_keys}
          showKeys={showKeys}
          activeProviderKey={activeProviderKey}
          onApiKeyChange={handleApiKeyChange}
          onToggleShowKey={toggleShowKey}
          testResult={testResult}
          onTest={handleTest}
        />
      )}

      {activeSection === 'generation' && (
        <SettingsGenerationSection
          batch={localConfig.batch}
          onBatchChange={handleBatchChange}
          featureBlueprints={localConfig.feature_blueprints}
          onFeatureBlueprintChange={handleFeatureBlueprintChange}
          featureBlueprintOptions={featureBlueprintOptions}
        />
      )}

      {activeSection === 'image' && (
        <SettingsImagePipelineSection
          comfyui={localConfig.comfyui}
          onChange={(updates) =>
            setLocalConfig((previous) => ({
              ...previous,
              comfyui: {
                ...(previous.comfyui ?? createDefaultComfyUIConfig()),
                ...updates,
              },
            }))
          }
        />
      )}

      {activeSection === 'chub' && (
        <SettingsChubSection
          chub={localConfig.chub}
          onChange={(updates) =>
            setLocalConfig((previous) => ({
              ...previous,
              chub: {
                ...(previous.chub ?? createDefaultChubConfig()),
                ...updates,
              },
            }))
          }
        />
      )}

      {activeSection === 'help' && (
        <SettingsHelpSection
          showInlineTips={localConfig.help?.show_inline_tips ?? true}
          onShowInlineTipsChange={(enabled) =>
            setLocalConfig((previous) => ({
              ...previous,
              help: {
                ...(previous.help ?? configManager.getHelpState()),
                show_inline_tips: enabled,
              },
            }))
          }
          onRestartGettingStarted={handleRestartGettingStarted}
          onResetHelpPreferences={handleResetHelpPreferences}
        />
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
