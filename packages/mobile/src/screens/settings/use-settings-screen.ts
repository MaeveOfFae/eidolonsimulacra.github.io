/**
 * The settings screen's state: the config query and its mutations, the provider and
 * model editors, the desktop-companion pairing and probe state, the derived flags the
 * screen renders, and every handler it wires up.
 *
 * Cut out of `SettingsScreen` verbatim — the screen keeps its JSX and destructures
 * what it renders, so the two halves cannot drift: a name the JSX needs is either on
 * this hook's return or a typecheck error.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { api, applyStoredApiConfig } from '../../config/api';
import { useTheme } from '../../theme/ThemeProvider';
import {
  getSelectedDesktopCompanionSyncDomains,
  hasSelectedDesktopCompanionSyncDomains,
  type Config,
  type DesktopCompanionSyncSelection,
} from '@char-gen/shared';
import {
  DEFAULT_DEVICE_CONFIG,
  DEFAULT_HELP_STATE,
  getDesktopCompanionReliabilityMetadata,
  getDesktopCompanionSyncSelectionSettings,
  getStoredMobileDeviceIdentity,
  type DesktopCompanionSyncSelectionSettings,
  type RememberedDesktopCompanion,
  type DesktopCompanionReliabilityMetadata,
  getRememberedDesktopCompanions,
  getStoredDesktopCompanionSettings,
  exportStoredApiKeys,
  exportStoredDeviceConfig,
  getStoredDeviceConfig,
  importStoredApiKeys,
  importStoredDeviceConfig,
  removeRememberedDesktopCompanion,
  saveRememberedDesktopCompanion,
  touchRememberedDesktopCompanion,
  updateDesktopCompanionReliabilityMetadata,
  updateDesktopCompanionSyncSelectionSettings,
  updateStoredMobileDeviceIdentity,
  updateStoredDesktopCompanionSettings,
  updateStoredDeviceConfig,
} from '../../storage/device-config';
import {
  fetchDesktopCompanionSyncStateText,
  probeDesktopCompanionConnection,
  sendDesktopCompanionSyncState,
  type DesktopCompanionConnectionProbe,
} from '../../local/desktop-companion';
import {
  type DesktopCompanionSyncPreview,
  exportDesktopCompanionSyncStateText,
  exportWorkspaceBundleText,
  importDesktopCompanionSyncStateText,
  importWorkspaceBundleText,
  previewDesktopCompanionSyncStateText,
} from '../../local/device-link';
import { applyDesktopCompanionPairingLink } from '../../lib/desktop-companion-pairing';
import type { RootTabNavigationProp, SettingsRouteProp } from '../../types/navigation';
import { getErrorMessage } from '../../utils/errors';
import { pickTextFile, saveTextFile } from '../../utils/file-transfer';
import { buildStyles } from '../settings/styles';

export type Provider = Exclude<Config['engine'], 'auto' | 'openai_compatible'>;

export type EditorMode = 'api-key' | 'api-url' | 'model' | null;

export type CompanionProbeStatus = {
  result?: DesktopCompanionConnectionProbe;
  error?: string;
  testedAt: string;
} | null;

export interface SettingsScreenProps {
  navigation: RootTabNavigationProp<'Settings'>;
  route: SettingsRouteProp;
}

export function useSettingsScreen({ navigation, route }: SettingsScreenProps) {
  const providers: Provider[] = [
    'openai',
    'google',
    'openrouter',
    'anthropic',
    'deepseek',
    'zai',
    'moonshot',
    'ollama',
    'custom',
  ];
  const MOBILE_GETTING_STARTED_GUIDE_PREFIX = 'mobile-getting-started:';
  const syncDomainOptions: Array<{ key: keyof DesktopCompanionSyncSelection; label: string }> = [
    { key: 'drafts', label: 'Drafts' },
    { key: 'config', label: 'Config' },
    { key: 'templates', label: 'Templates' },
    { key: 'blueprints', label: 'Blueprints' },
  ];

  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const storedDesktopCompanion = getStoredDesktopCompanionSettings();
  const storedMobileIdentity = getStoredMobileDeviceIdentity();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editorProvider, setEditorProvider] = useState<Provider | null>(null);
  const [editorValue, setEditorValue] = useState('');
  const [desktopCompanionUrl, setDesktopCompanionUrl] = useState(storedDesktopCompanion.url || '');
  const [desktopCompanionPairCode, setDesktopCompanionPairCode] = useState(storedDesktopCompanion.pair_code || '');
  const [rememberedCompanions, setRememberedCompanions] = useState<RememberedDesktopCompanion[]>(() =>
    getRememberedDesktopCompanions(),
  );
  const [mobileDeviceName, setMobileDeviceName] = useState(storedMobileIdentity.name);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [testingCompanionConnection, setTestingCompanionConnection] = useState(false);
  const [companionProbeStatus, setCompanionProbeStatus] = useState<CompanionProbeStatus>(null);
  const [companionReliability, setCompanionReliability] = useState<DesktopCompanionReliabilityMetadata>(() =>
    getDesktopCompanionReliabilityMetadata(),
  );
  const [syncSelectionSettings, setSyncSelectionSettings] = useState<DesktopCompanionSyncSelectionSettings>(() =>
    getDesktopCompanionSyncSelectionSettings(),
  );
  const [companionPreview, setCompanionPreview] = useState<DesktopCompanionSyncPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [companionPreviewError, setCompanionPreviewError] = useState<string | null>(null);
  const [pcLinkTrayY, setPcLinkTrayY] = useState(0);
  const [pcLinkFocusSignal, setPcLinkFocusSignal] = useState<string | null>(null);
  const scanHandledRef = useRef(false);

  const syncCompanionStateFromStorage = useCallback(() => {
    const nextDesktopCompanion = getStoredDesktopCompanionSettings();
    const nextMobileIdentity = getStoredMobileDeviceIdentity();
    setDesktopCompanionUrl(nextDesktopCompanion.url || '');
    setDesktopCompanionPairCode(nextDesktopCompanion.pair_code || '');
    setRememberedCompanions(getRememberedDesktopCompanions());
    setMobileDeviceName(nextMobileIdentity.name);
    setCompanionReliability(getDesktopCompanionReliabilityMetadata());
    setSyncSelectionSettings(getDesktopCompanionSyncSelectionSettings());
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncCompanionStateFromStorage();
    }, [syncCompanionStateFromStorage]),
  );

  useEffect(() => {
    const pairingLink = route.params?.pairingLink;
    const pairingNonce = route.params?.pairingNonce;
    if (!pairingLink || !pairingNonce) {
      return;
    }

    try {
      const applied = applyDesktopCompanionPairingLink(pairingLink);
      if (!applied) {
        return;
      }

      setDesktopCompanionUrl(applied.pairing.url);
      setDesktopCompanionPairCode(applied.pairing.pairCode);
      setRememberedCompanions(applied.rememberedCompanions);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to apply the desktop companion pairing link'));
    } finally {
      navigation.setParams({ pairingLink: undefined, pairingNonce: undefined });
    }
  }, [navigation, route.params?.pairingLink, route.params?.pairingNonce]);

  useEffect(() => {
    const focusSection = route.params?.focusSection;
    const focusNonce = route.params?.focusNonce;
    if (focusSection !== 'pc-link' || !focusNonce) {
      return;
    }

    setPcLinkFocusSignal(focusNonce);
    navigation.setParams({ focusSection: undefined, focusNonce: undefined });
  }, [navigation, route.params?.focusNonce, route.params?.focusSection]);

  useEffect(() => {
    if (!pcLinkFocusSignal || pcLinkTrayY <= 0) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: Math.max(pcLinkTrayY - 16, 0), animated: true });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pcLinkFocusSignal, pcLinkTrayY]);

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
  const helpState = config.help ?? DEFAULT_DEVICE_CONFIG.help ?? DEFAULT_HELP_STATE;
  const guideStepProgressRecorded = (helpState.completed_guides ?? []).some((entry) =>
    entry.startsWith(MOBILE_GETTING_STARTED_GUIDE_PREFIX),
  );
  const companionProbeReady = companionProbeStatus?.result?.publishedSyncAvailable === true;
  const companionProbeIssue =
    Boolean(companionProbeStatus?.error) ||
    companionProbeStatus?.result?.pairCodeAccepted === false ||
    companionProbeStatus?.result?.publishedSyncAvailable === false;
  const desktopApplyPending = Boolean(companionReliability.pending_desktop_apply_sent_at);
  const pullSelectionReady = hasSelectedDesktopCompanionSyncDomains(syncSelectionSettings.pull_selection);
  const sendSelectionReady = hasSelectedDesktopCompanionSyncDomains(syncSelectionSettings.send_selection);
  const companionProbeMessage =
    companionProbeStatus?.error ??
    companionProbeStatus?.result?.message ??
    'Test the PC link before pulling to confirm the desktop is reachable and has published a sync snapshot.';

  const resetCompanionPreview = () => {
    setCompanionPreview(null);
    setCompanionPreviewError(null);
  };

  const updateSyncSelection = (
    key: keyof DesktopCompanionSyncSelectionSettings,
    domain: keyof DesktopCompanionSyncSelection,
  ) => {
    const nextSettings = updateDesktopCompanionSyncSelectionSettings({
      [key]: {
        ...syncSelectionSettings[key],
        [domain]: !syncSelectionSettings[key][domain],
      },
    });
    setSyncSelectionSettings(nextSettings);
    if (key === 'pull_selection') {
      resetCompanionPreview();
    }
  };

  const formatReliabilityTimestamp = (value?: string) => {
    if (!value) {
      return 'Never';
    }

    return new Date(value).toLocaleString();
  };

  const markCompanionReliability = (updates: Partial<DesktopCompanionReliabilityMetadata>) => {
    setCompanionReliability(updateDesktopCompanionReliabilityMetadata(updates));
  };

  const loadDesktopCompanionPreview = async () => {
    if (!pullSelectionReady) {
      setCompanionPreview(null);
      setCompanionPreviewError('Select at least one pull domain to preview or pull from the desktop.');
      return null;
    }

    setPreviewLoading(true);
    try {
      const syncStateJson = await fetchDesktopCompanionSyncStateText(
        desktopCompanionUrl,
        desktopCompanionPairCode,
        getSelectedDesktopCompanionSyncDomains(syncSelectionSettings.pull_selection),
      );
      const preview = await previewDesktopCompanionSyncStateText(syncStateJson);
      setCompanionPreview(preview);
      setCompanionPreviewError(null);
      return syncStateJson;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to load the desktop sync preview');
      setCompanionPreview(null);
      setCompanionPreviewError(message);
      throw error;
    } finally {
      setPreviewLoading(false);
    }
  };

  const closeEditor = () => {
    setEditorMode(null);
    setEditorProvider(null);
    setEditorValue('');
  };

  const handleUseProvider = (provider: Provider) => {
    // Pin explicit mode so the chosen engine is the one that answers — Custom
    // can never be reached by model detection, and auto mode would ignore it.
    saveConfigMutation.mutate({ engine: provider, engine_mode: 'explicit' });
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
        'application/json',
      );

      if (!result.saved) {
        return;
      }

      Alert.alert(
        'Configuration exported',
        'A configuration backup file was prepared. Save it from the system share sheet.',
      );
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
        'application/json',
      );

      if (!result.saved) {
        return;
      }

      Alert.alert(
        'API keys exported',
        'A sensitive API key backup file was prepared. Save it carefully from the system share sheet.',
      );
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to export API keys'));
    }
  };

  const handleExportWorkspaceBundle = async () => {
    try {
      const result = await saveTextFile(
        await exportWorkspaceBundleText(),
        `eidolon-simulacra-mobile-workspace-${new Date().toISOString().split('T')[0]}.json`,
        'application/json',
      );

      if (!result.saved) {
        return;
      }

      Alert.alert(
        'Workspace bundle exported',
        'A mobile workspace bundle was prepared. Save or send it to your PC workspace from the system share sheet.',
      );
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to export workspace bundle'));
    }
  };

  const handleImportWorkspaceBundle = async () => {
    try {
      const file = await pickTextFile(['application/json', 'text/plain']);
      if (!file) {
        return;
      }

      const result = await importWorkspaceBundleText(file.contents);
      const nextConfig = getStoredDeviceConfig();
      applyImportedConfig(nextConfig);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
        queryClient.invalidateQueries({ queryKey: ['templates'] }),
      ]);

      const segments = [
        result.drafts > 0 ? `${result.drafts} drafts` : null,
        result.templates > 0 ? `${result.templates} templates` : null,
        result.blueprintOverrides > 0 ? `${result.blueprintOverrides} blueprint overrides` : null,
        result.configImported ? 'settings' : null,
        result.apiKeys > 0 ? `${result.apiKeys} API keys` : null,
        result.remappedDrafts > 0 ? `${result.remappedDrafts} conflicting drafts preserved as copies` : null,
      ].filter(Boolean);

      Alert.alert(
        'Workspace bundle imported',
        segments.length > 0
          ? `Imported ${segments.join(', ')} from ${file.name}.`
          : `The bundle from ${file.name} did not contain any importable records.`,
      );
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to import workspace bundle'));
    }
  };

  const handlePullFromDesktopCompanion = async () => {
    try {
      if (!pullSelectionReady) {
        Alert.alert(
          'No pull domains selected',
          'Choose at least one pull domain before pulling from the desktop companion.',
        );
        return;
      }

      const probeResult = await runDesktopCompanionProbe(false);
      if (!probeResult) {
        return;
      }

      if (!probeResult.pairCodeAccepted || !probeResult.publishedSyncAvailable) {
        Alert.alert('PC link not ready', probeResult.message);
        return;
      }

      const syncStateJson = await fetchDesktopCompanionSyncStateText(
        desktopCompanionUrl,
        desktopCompanionPairCode,
        getSelectedDesktopCompanionSyncDomains(syncSelectionSettings.pull_selection),
      );
      const result = await importDesktopCompanionSyncStateText(syncStateJson);
      const nextConfig = getStoredDeviceConfig();
      applyImportedConfig(nextConfig);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
        queryClient.invalidateQueries({ queryKey: ['templates'] }),
      ]);

      const segments = [
        result.drafts > 0 ? `${result.drafts} drafts` : null,
        result.templates > 0 ? `${result.templates} templates` : null,
        result.blueprintOverrides > 0 ? `${result.blueprintOverrides} blueprint overrides` : null,
        result.configImported ? 'settings' : null,
        result.apiKeys > 0 ? `${result.apiKeys} API keys` : null,
        result.remappedDrafts > 0 ? `${result.remappedDrafts} conflicting drafts preserved as copies` : null,
      ].filter(Boolean);

      Alert.alert(
        'Pulled from desktop companion',
        segments.length > 0
          ? `Imported ${segments.join(', ')} from the paired desktop workspace.`
          : 'The paired desktop workspace did not expose any importable records.',
      );
      markCompanionReliability({
        last_successful_pull_at: new Date().toISOString(),
        pending_desktop_apply_sent_at: undefined,
      });
      resetCompanionPreview();
      handleRememberCurrentCompanion();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to pull data from the paired desktop companion'));
    }
  };

  const handleSendToDesktopCompanion = async () => {
    try {
      if (!sendSelectionReady) {
        Alert.alert(
          'No send domains selected',
          'Choose at least one send domain before sending to the desktop companion.',
        );
        return;
      }

      const syncStateJson = await exportDesktopCompanionSyncStateText({
        selection: syncSelectionSettings.send_selection,
      });
      await sendDesktopCompanionSyncState(desktopCompanionUrl, desktopCompanionPairCode, syncStateJson);
      Alert.alert(
        'Sent to desktop companion',
        'The current mobile sync snapshot was sent to the paired desktop app. Apply the incoming mobile sync from the desktop Device Link screen.',
      );
      const sentAt = new Date().toISOString();
      markCompanionReliability({
        last_successful_send_at: sentAt,
        pending_desktop_apply_sent_at: sentAt,
      });
      handleRememberCurrentCompanion();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to send data to the paired desktop companion'));
    }
  };

  const runDesktopCompanionProbe = async (
    showResult: boolean,
    options: { loadPreview?: boolean } = {},
  ): Promise<DesktopCompanionConnectionProbe | null> => {
    setTestingCompanionConnection(true);
    try {
      const result = await probeDesktopCompanionConnection(desktopCompanionUrl, desktopCompanionPairCode);
      setCompanionProbeStatus({ result, testedAt: new Date().toISOString() });
      if (result.pairCodeAccepted) {
        markCompanionReliability({ last_successful_test_at: new Date().toISOString() });
      }
      if (result.publishedSyncAvailable && options.loadPreview) {
        try {
          await loadDesktopCompanionPreview();
        } catch {
          // Preview fetch errors are reflected in the inline preview card and should not mask the probe result.
        }
      } else if (!result.publishedSyncAvailable) {
        resetCompanionPreview();
      }
      if (showResult) {
        Alert.alert('PC link status', result.message);
      }
      return result;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to test the paired desktop companion link');
      setCompanionProbeStatus({ error: message, testedAt: new Date().toISOString() });
      Alert.alert('Error', message);
      return null;
    } finally {
      setTestingCompanionConnection(false);
    }
  };

  const handleTestDesktopCompanion = async () => {
    await runDesktopCompanionProbe(true);
  };

  const handleLoadDesktopCompanionPreview = async () => {
    if (!pullSelectionReady) {
      Alert.alert('No pull domains selected', 'Choose at least one pull domain before loading the desktop preview.');
      return;
    }

    const probeResult = await runDesktopCompanionProbe(false);
    if (!probeResult) {
      return;
    }

    if (!probeResult.pairCodeAccepted || !probeResult.publishedSyncAvailable) {
      Alert.alert('PC link not ready', probeResult.message);
      return;
    }

    try {
      await loadDesktopCompanionPreview();
    } catch {
      // Inline preview errors are already surfaced in the preview card.
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

  const handleResetGettingStartedGuide = () => {
    const nextConfig = updateStoredDeviceConfig({
      help: {
        ...helpState,
        first_run_completed: false,
        completed_guides: (helpState.completed_guides ?? []).filter(
          (entry) => !entry.startsWith(MOBILE_GETTING_STARTED_GUIDE_PREFIX),
        ),
      },
    });
    queryClient.setQueryData(['device-config'], nextConfig);
    Alert.alert('Guide reset', 'Return to Home to run through the mobile getting-started checklist again.');
  };

  const updateDesktopCompanionUrl = (value: string) => {
    setDesktopCompanionUrl(value);
    setCompanionProbeStatus(null);
    resetCompanionPreview();
    updateStoredDesktopCompanionSettings({ url: value });
  };

  const updateDesktopCompanionPairCode = (value: string) => {
    setDesktopCompanionPairCode(value);
    setCompanionProbeStatus(null);
    resetCompanionPreview();
    updateStoredDesktopCompanionSettings({ pair_code: value });
  };

  const handleUseRememberedCompanion = (companion: RememberedDesktopCompanion) => {
    setDesktopCompanionUrl(companion.url);
    setDesktopCompanionPairCode(companion.pair_code);
    setCompanionProbeStatus(null);
    resetCompanionPreview();
    updateStoredDesktopCompanionSettings({ url: companion.url, pair_code: companion.pair_code });
    setRememberedCompanions(touchRememberedDesktopCompanion(companion.id));
  };

  const handleRememberCurrentCompanion = (overrides?: {
    id?: string;
    name?: string;
    url?: string;
    pairCode?: string;
  }) => {
    const saved = saveRememberedDesktopCompanion({
      id: overrides?.id,
      name: overrides?.name || undefined,
      url: overrides?.url ?? desktopCompanionUrl,
      pair_code: overrides?.pairCode ?? desktopCompanionPairCode,
    });
    setRememberedCompanions(saved);
  };

  const handleDeleteRememberedCompanion = (id: string) => {
    setRememberedCompanions(removeRememberedDesktopCompanion(id));
  };

  const handleMobileDeviceNameChange = (value: string) => {
    setMobileDeviceName(value);
    updateStoredMobileDeviceIdentity({ name: value });
  };

  const handlePastePairingLink = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      const applied = applyDesktopCompanionPairingLink(clipboardText);
      if (!applied) {
        Alert.alert('Pairing link not found', 'Clipboard does not contain a valid desktop companion pairing link.');
        return;
      }

      setDesktopCompanionUrl(applied.pairing.url);
      setDesktopCompanionPairCode(applied.pairing.pairCode);
      setRememberedCompanions(applied.rememberedCompanions);
      setCompanionProbeStatus(null);
      resetCompanionPreview();
      Alert.alert(
        'Pairing details saved',
        'Desktop companion URL and pair code were loaded from the pairing link in your clipboard.',
      );
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to read the pairing link from the clipboard'));
    }
  };

  const handleOpenScanner = async () => {
    scanHandledRef.current = false;

    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert('Camera access required', 'Allow camera access to scan a desktop companion pairing QR code.');
        return;
      }
    }

    setScannerVisible(true);
  };

  const handleCloseScanner = () => {
    setScannerVisible(false);
    scanHandledRef.current = false;
  };

  const handleScannedPairingCode = (event: BarcodeScanningResult) => {
    if (scanHandledRef.current) {
      return;
    }

    try {
      const applied = applyDesktopCompanionPairingLink(event.data);
      if (!applied) {
        return;
      }

      scanHandledRef.current = true;
      setDesktopCompanionUrl(applied.pairing.url);
      setDesktopCompanionPairCode(applied.pairing.pairCode);
      setRememberedCompanions(applied.rememberedCompanions);
      setCompanionProbeStatus(null);
      resetCompanionPreview();
      handleCloseScanner();
    } catch (error) {
      handleCloseScanner();
      setTimeout(() => {
        Alert.alert('Error', getErrorMessage(error, 'Failed to apply the scanned pairing QR code'));
      }, 0);
    }
  };

  const handleSaveEditor = () => {
    const trimmedValue = editorValue.trim();

    if (editorMode === 'api-key' && editorProvider) {
      saveConfigMutation.mutate(
        { api_keys: { [editorProvider]: trimmedValue || undefined } },
        {
          onSuccess: () => closeEditor(),
        },
      );
      return;
    }

    if (editorMode === 'model') {
      saveConfigMutation.mutate(
        { model: trimmedValue || DEFAULT_DEVICE_CONFIG.model },
        {
          onSuccess: () => closeEditor(),
        },
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
        },
      );
    }
  };

  return {
    cameraPermission,
    closeEditor,
    colors,
    companionPreview,
    companionPreviewError,
    companionProbeIssue,
    companionProbeMessage,
    companionProbeReady,
    companionProbeStatus,
    companionReliability,
    config,
    desktopApplyPending,
    desktopCompanionPairCode,
    desktopCompanionUrl,
    editorMode,
    editorProvider,
    editorValue,
    formatReliabilityTimestamp,
    guideStepProgressRecorded,
    handleCloseScanner,
    handleDeleteRememberedCompanion,
    handleExportApiKeys,
    handleExportConfig,
    handleExportWorkspaceBundle,
    handleImportApiKeys,
    handleImportConfig,
    handleImportWorkspaceBundle,
    handleLoadDesktopCompanionPreview,
    handleMobileDeviceNameChange,
    handleOpenScanner,
    handlePastePairingLink,
    handlePullFromDesktopCompanion,
    handleRememberCurrentCompanion,
    handleResetGettingStartedGuide,
    handleSaveEditor,
    handleScannedPairingCode,
    handleSendToDesktopCompanion,
    handleTestDesktopCompanion,
    handleUseProvider,
    handleUseRememberedCompanion,
    helpState,
    isLoading,
    mobileDeviceName,
    openApiKeyEditor,
    openApiUrlEditor,
    openModelEditor,
    pcLinkFocusSignal,
    previewLoading,
    providers,
    pullSelectionReady,
    rememberedCompanions,
    runtimeEndpoint,
    saveConfigMutation,
    savedKeyCount,
    scannerVisible,
    scrollViewRef,
    sendSelectionReady,
    setEditorValue,
    setPcLinkTrayY,
    styles,
    syncDomainOptions,
    syncSelectionSettings,
    testingCompanionConnection,
    updateDesktopCompanionPairCode,
    updateDesktopCompanionUrl,
    updateSyncSelection,
    usingCustomApiUrl,
  };
}
