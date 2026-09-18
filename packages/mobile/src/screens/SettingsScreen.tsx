import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, applyStoredApiConfig } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { Cog6ToothIcon } from '../components/Icons';
import type { Config } from '@char-gen/shared';
import {
  DEFAULT_DEVICE_CONFIG,
  exportStoredApiKeys,
  exportStoredDeviceConfig,
  getStoredDeviceConfig,
  importStoredApiKeys,
  importStoredDeviceConfig,
  updateStoredDeviceConfig,
} from '../storage/device-config';
import { getErrorMessage } from '../utils/errors';
import { pickTextFile, saveTextFile } from '../utils/file-transfer';

type Provider = Exclude<Config['engine'], 'auto' | 'ollama' | 'openai_compatible'>;
type EditorMode = 'api-key' | 'api-url' | 'model' | null;

const providers: Provider[] = ['openai', 'google', 'openrouter', 'anthropic', 'deepseek', 'zai', 'moonshot'];

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editorProvider, setEditorProvider] = useState<Provider | null>(null);
  const [editorValue, setEditorValue] = useState('');

  const { data: config = DEFAULT_DEVICE_CONFIG, isLoading } = useQuery({
    queryKey: ['device-config'],
    queryFn: async () => getStoredDeviceConfig(),
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (updates: Partial<Config>) => {
      const nextConfig = updateStoredDeviceConfig(updates);
      applyStoredApiConfig();
      return nextConfig;
    },
    onSuccess: (nextConfig) => {
      queryClient.setQueryData(['device-config'], nextConfig);
    },
    onError: (error: unknown) => {
      Alert.alert('Error', getErrorMessage(error, 'Failed to save device settings'));
    },
  });

  const runtimeEndpoint = config.base_url || api.getApiBaseUrl();
  const usingCustomApiUrl = Boolean(config.base_url);
  const savedKeyCount = providers.filter((provider) => Boolean(config.api_keys[provider])).length;

  const closeEditor = () => {
    setEditorMode(null);
    setEditorProvider(null);
    setEditorValue('');
  };

  const handleUseProvider = (provider: Provider) => {
    saveConfigMutation.mutate({ engine: provider });
  };

  const openApiKeyEditor = (provider: Provider) => {
    setEditorMode('api-key');
    setEditorProvider(provider);
    setEditorValue(config.api_keys[provider] || '');
  };

  const openModelEditor = () => {
    setEditorMode('model');
    setEditorProvider(null);
    setEditorValue(config.model || '');
  };

  const openApiUrlEditor = () => {
    setEditorMode('api-url');
    setEditorProvider(null);
    setEditorValue(config.base_url || '');
  };

  const applyImportedConfig = (nextConfig: Config) => {
    applyStoredApiConfig();
    queryClient.setQueryData(['device-config'], nextConfig);
  };

  const handleExportConfig = async () => {
    try {
      const result = await saveTextFile(
        exportStoredDeviceConfig(),
        `eidolon-simulacra-mobile-config-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      );

      if (!result.saved) {
        return;
      }

      Alert.alert('Configuration exported', 'A configuration backup file was prepared. Save it from the system share sheet.');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to export configuration'));
    }
  };

  const handleImportConfig = async () => {
    try {
      const file = await pickTextFile(['application/json', 'text/plain']);
      if (!file) {
        return;
      }

      const nextConfig = importStoredDeviceConfig(file.contents);
      applyImportedConfig(nextConfig);
      Alert.alert('Configuration imported', `Imported device configuration from ${file.name}.`);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to import configuration'));
    }
  };

  const handleExportApiKeys = async () => {
    try {
      const result = await saveTextFile(
        exportStoredApiKeys(),
        `eidolon-simulacra-mobile-api-keys-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      );

      if (!result.saved) {
        return;
      }

      Alert.alert('API keys exported', 'A sensitive API key backup file was prepared. Save it carefully from the system share sheet.');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to export API keys'));
    }
  };

  const handleImportApiKeys = async () => {
    try {
      const file = await pickTextFile(['application/json', 'text/plain']);
      if (!file) {
        return;
      }

      const nextConfig = importStoredApiKeys(file.contents);
      applyImportedConfig(nextConfig);
      Alert.alert('API keys imported', `Imported API keys from ${file.name}.`);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to import API keys'));
    }
  };

  const handleSaveEditor = () => {
    const trimmedValue = editorValue.trim();

    if (editorMode === 'api-key' && editorProvider) {
      saveConfigMutation.mutate(
        { api_keys: { [editorProvider]: trimmedValue || undefined } },
        {
          onSuccess: () => closeEditor(),
        }
      );
      return;
    }

    if (editorMode === 'model') {
      saveConfigMutation.mutate(
        { model: trimmedValue || DEFAULT_DEVICE_CONFIG.model },
        {
          onSuccess: () => closeEditor(),
        }
      );
      return;
    }

    if (editorMode === 'api-url') {
      const normalizedUrl = trimmedValue.replace(/\/$/, '');
      saveConfigMutation.mutate(
        {
          base_url: normalizedUrl || undefined,
        },
        {
          onSuccess: () => closeEditor(),
        }
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Provider, model, and device storage.</Text>

      <View style={[styles.statusCard, styles.statusCardReady]}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Device ready</Text>
          {isLoading ? <ActivityIndicator size="small" color="#7c3aed" /> : <View style={[styles.connectionDot, styles.connectionDotActive]} />}
        </View>
        <Text style={styles.statusDescription}>{usingCustomApiUrl ? 'Custom endpoint active.' : 'Using default endpoint.'}</Text>
        <Text style={styles.connectionUrl}>{runtimeEndpoint}</Text>
      </View>

      <CollapsibleTray
        title="Providers"
        subtitle="Choose the active engine and stored keys"
        initiallyExpanded={savedKeyCount === 0}
        preview={<Text style={styles.trayPreviewText}>{config.engine || 'auto'} • {savedKeyCount} key{savedKeyCount === 1 ? '' : 's'}</Text>}
      >
        {providers.map((provider) => {
          const isActive = config.engine === provider;
          return (
            <View key={provider} style={[styles.apiKeyItem, isActive && styles.apiKeyItemActive]}>
              <View style={styles.apiKeyHeader}>
                <View style={styles.apiKeyLabelRow}>
                  <Text style={styles.apiKeyLabel}>{provider.charAt(0).toUpperCase() + provider.slice(1)}</Text>
                  {isActive ? (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.apiKeyActions}>
                  <TouchableOpacity
                    style={[styles.testButton, isActive && styles.testButtonLoading]}
                    onPress={() => handleUseProvider(provider)}
                    disabled={saveConfigMutation.isPending}
                  >
                    <Text style={styles.testButtonText}>{isActive ? 'Active' : 'Use'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modelsButton}
                    onPress={() => openApiKeyEditor(provider)}
                    disabled={saveConfigMutation.isPending}
                  >
                    <Text style={styles.modelsButtonText}>{config.api_keys[provider] ? 'Edit Key' : 'Add Key'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.apiKeyStatus}>
                <View style={[styles.statusDot, config.api_keys[provider] ? styles.statusDotActive : styles.statusDotInactive]} />
                <Text style={styles.statusText}>{config.api_keys[provider] ? 'API key saved locally' : 'No local API key'}</Text>
                {isActive && config.model ? (
                  <Text style={styles.activeModelText} numberOfLines={1}>
                    {' • '}{config.model}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </CollapsibleTray>

      <CollapsibleTray
        title="Model & routing"
        subtitle="Current model, endpoint, and engine mode"
        initiallyExpanded
        preview={<Text style={styles.trayPreviewText}>{config.model || 'No model'} • {config.engine_mode}</Text>}
      >
        <View style={styles.currentModelCard}>
          <View style={styles.currentModelRow}>
            <Text style={styles.currentModelLabel}>Engine</Text>
            <Text style={styles.currentModelValue}>{config.engine || 'auto'}</Text>
          </View>
          <View style={styles.currentModelRow}>
            <Text style={styles.currentModelLabel}>Model</Text>
            <Text style={styles.currentModelValue} numberOfLines={1}>{config.model || 'Not set'}</Text>
          </View>
          <View style={styles.currentModelRowLast}>
            <Text style={styles.currentModelLabel}>Model Endpoint</Text>
            <Text style={styles.currentModelValue} numberOfLines={1}>{runtimeEndpoint}</Text>
          </View>

          <View style={styles.currentModelActions}>
            <TouchableOpacity style={styles.modelsButton} onPress={openModelEditor}>
              <Text style={styles.modelsButtonText}>Edit Model</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modelsButton} onPress={openApiUrlEditor}>
              <Text style={styles.modelsButtonText}>Edit Endpoint</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.engineModeContainer}>
          <TouchableOpacity
            style={[styles.engineModeButton, config.engine_mode === 'auto' && styles.engineModeButtonActive]}
            onPress={() => saveConfigMutation.mutate({ engine_mode: 'auto' })}
          >
            <Text style={[styles.engineModeText, config.engine_mode === 'auto' && styles.engineModeTextActive]}>Auto</Text>
            <Text style={styles.engineModeDesc}>Automatically select best available</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.engineModeButton, config.engine_mode === 'explicit' && styles.engineModeButtonActive]}
            onPress={() => saveConfigMutation.mutate({ engine_mode: 'explicit' })}
          >
            <Text style={[styles.engineModeText, config.engine_mode === 'explicit' && styles.engineModeTextActive]}>Explicit</Text>
            <Text style={styles.engineModeDesc}>Use only the selected engine</Text>
          </TouchableOpacity>
        </View>
      </CollapsibleTray>

      <CollapsibleTray
        title="Generation"
        subtitle="Temperature, tokens, and batch defaults"
        preview={<Text style={styles.trayPreviewText}>T {config.temperature} • {config.max_tokens} tok • {config.batch.max_concurrent} parallel</Text>}
      >
        <View style={styles.settingItem}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Temperature</Text>
            <Text style={styles.settingValue}>{config.temperature}</Text>
          </View>
          <View style={styles.settingButtons}>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                const newTemp = Math.max(0, config.temperature - 0.1);
                saveConfigMutation.mutate({ temperature: Math.round(newTemp * 10) / 10 });
              }}
            >
              <Text style={styles.settingButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                const newTemp = Math.min(2, config.temperature + 0.1);
                saveConfigMutation.mutate({ temperature: Math.round(newTemp * 10) / 10 });
              }}
            >
              <Text style={styles.settingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Max Tokens</Text>
            <Text style={styles.settingValue}>{config.max_tokens}</Text>
          </View>
          <View style={styles.settingButtons}>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                const newTokens = Math.max(256, config.max_tokens - 256);
                saveConfigMutation.mutate({ max_tokens: newTokens });
              }}
            >
              <Text style={styles.settingButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                const newTokens = Math.min(32768, config.max_tokens + 256);
                saveConfigMutation.mutate({ max_tokens: newTokens });
              }}
            >
              <Text style={styles.settingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Max Concurrent</Text>
            <Text style={styles.settingValue}>{config.batch.max_concurrent}</Text>
          </View>
          <View style={styles.settingButtons}>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                const newConcurrent = Math.max(1, config.batch.max_concurrent - 1);
                saveConfigMutation.mutate({ batch: { ...config.batch, max_concurrent: newConcurrent } });
              }}
            >
              <Text style={styles.settingButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                const newConcurrent = Math.min(10, config.batch.max_concurrent + 1);
                saveConfigMutation.mutate({ batch: { ...config.batch, max_concurrent: newConcurrent } });
              }}
            >
              <Text style={styles.settingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Rate Limit Delay</Text>
            <Text style={styles.settingValue}>{config.batch.rate_limit_delay}s</Text>
          </View>
          <View style={styles.settingButtons}>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                const newDelay = Math.max(0, config.batch.rate_limit_delay - 0.5);
                saveConfigMutation.mutate({ batch: { ...config.batch, rate_limit_delay: Math.round(newDelay * 10) / 10 } });
              }}
            >
              <Text style={styles.settingButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                const newDelay = Math.min(10, config.batch.rate_limit_delay + 0.5);
                saveConfigMutation.mutate({ batch: { ...config.batch, rate_limit_delay: Math.round(newDelay * 10) / 10 } });
              }}
            >
              <Text style={styles.settingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CollapsibleTray>

      <CollapsibleTray
        title="Backup & transfer"
        subtitle="Import or export config and keys"
        preview={<Text style={styles.trayPreviewText}>{savedKeyCount} saved key{savedKeyCount === 1 ? '' : 's'} • JSON import/export</Text>}
      >
        <View style={styles.transferCard}>
          <Text style={styles.transferTitle}>Device Configuration</Text>
          <Text style={styles.transferDescription}>Back up engine, model, endpoint, and batch settings.</Text>
          <View style={styles.transferActionsRow}>
            <TouchableOpacity style={styles.transferSecondaryButton} onPress={() => void handleImportConfig()}>
              <Text style={styles.transferSecondaryButtonText}>Import Config</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.transferPrimaryButton} onPress={() => void handleExportConfig()}>
              <Text style={styles.transferPrimaryButtonText}>Export Config</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.transferCard}>
          <Text style={styles.transferTitle}>API Keys</Text>
          <Text style={styles.transferDescription}>Move locally stored provider keys between devices.</Text>
          <View style={styles.transferActionsRow}>
            <TouchableOpacity style={styles.transferSecondaryButton} onPress={() => void handleImportApiKeys()}>
              <Text style={styles.transferSecondaryButtonText}>Import Keys</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.transferPrimaryButton} onPress={() => void handleExportApiKeys()}>
              <Text style={styles.transferPrimaryButtonText}>Export Keys</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CollapsibleTray>

      <CollapsibleTray
        title="About"
        subtitle="App info and endpoint details"
        preview={<Text style={styles.trayPreviewText}>v2.0.0 • {usingCustomApiUrl ? 'custom endpoint' : 'default endpoint'}</Text>}
      >
        <View style={styles.aboutCard}>
          <Cog6ToothIcon color="#7c3aed" size={32} />
          <Text style={styles.aboutTitle}>Eidolon Simulacra</Text>
          <Text style={styles.aboutVersion}>Version 2.0.0</Text>
          <Text style={styles.aboutText}>Mobile companion for local character generation and review.</Text>
        </View>

        <View style={styles.connectionCard}>
          <View style={styles.connectionHeader}>
            <Text style={styles.connectionTitle}>Provider Endpoint</Text>
            <View style={[styles.connectionDot, styles.connectionDotActive]} />
          </View>
          <Text style={styles.connectionUrl}>{runtimeEndpoint}</Text>
          <Text style={styles.connectionMeta}>{usingCustomApiUrl ? 'Using saved override' : 'Using auto-detected default URL'}</Text>
        </View>
      </CollapsibleTray>

      <Modal
        visible={editorMode !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditor}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editorMode === 'api-key' && editorProvider
                ? `${editorProvider.charAt(0).toUpperCase()}${editorProvider.slice(1)} API Key`
                : editorMode === 'model'
                  ? 'Default Model'
                  : 'Model Endpoint'}
            </Text>
            <TouchableOpacity onPress={closeEditor}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalHelpText}>
              {editorMode === 'api-key'
                ? 'Stored locally on this device. Leave blank to remove.'
                : editorMode === 'model'
                  ? 'Default model ID for this device.'
                  : 'Custom endpoint for this device. Leave blank for the provider default.'}
            </Text>

            <TextInput
              style={[styles.input, styles.modalInput, editorMode === 'api-url' && styles.modalInputMonospace]}
              value={editorValue}
              onChangeText={setEditorValue}
              placeholder={editorMode === 'api-url' ? 'http://192.168.1.10:3001/api' : 'Enter value'}
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={editorMode === 'api-key'}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryModalButton} onPress={closeEditor}>
                <Text style={styles.secondaryModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, saveConfigMutation.isPending && styles.disabledButton]}
                onPress={handleSaveEditor}
                disabled={saveConfigMutation.isPending}
              >
                {saveConfigMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 24,
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  statusCardReady: {
    backgroundColor: '#111827',
    borderColor: '#1d4ed8',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusDescription: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  trayPreviewText: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  transferCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  transferTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  transferDescription: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  transferActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  transferPrimaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: '#7c3aed',
  },
  transferPrimaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  transferSecondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  transferSecondaryButtonText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '600',
  },
  apiKeyItem: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  apiKeyItemActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#1e1b4b',
  },
  apiKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  apiKeyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apiKeyLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  apiKeyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    backgroundColor: '#2f2f2f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testButtonLoading: {
    opacity: 0.7,
  },
  testButtonText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '500',
  },
  modelsButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modelsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  apiKeyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#22c55e',
  },
  statusDotInactive: {
    backgroundColor: '#6b7280',
  },
  statusText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  activeModelText: {
    color: '#7c3aed',
    fontSize: 12,
    flex: 1,
  },
  currentModelCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  currentModelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2f2f2f',
  },
  currentModelRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  currentModelLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  currentModelValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  currentModelActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  settingItem: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  settingValue: {
    color: '#7c3aed',
    fontSize: 18,
    fontWeight: '600',
  },
  settingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  settingButton: {
    backgroundColor: '#2f2f2f',
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  engineModeContainer: {
    gap: 8,
  },
  engineModeButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  engineModeButtonActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#1e1b4b',
  },
  engineModeText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  engineModeTextActive: {
    color: '#a78bfa',
  },
  engineModeDesc: {
    color: '#6b7280',
    fontSize: 12,
  },
  aboutCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    alignItems: 'center',
  },
  aboutTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  aboutVersion: {
    color: '#7c3aed',
    fontSize: 14,
    marginBottom: 12,
  },
  aboutText: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  connectionCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
    marginBottom: 24,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connectionDotActive: {
    backgroundColor: '#22c55e',
  },
  connectionUrl: {
    color: '#d1d5db',
    fontSize: 12,
    marginBottom: 6,
  },
  connectionMeta: {
    color: '#6b7280',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalCloseText: {
    color: '#7c3aed',
    fontSize: 16,
  },
  modalBody: {
    padding: 16,
  },
  modalHelpText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalInputMonospace: {
    fontFamily: 'monospace',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryModalButton: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  secondaryModalButtonText: {
    color: '#d1d5db',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});