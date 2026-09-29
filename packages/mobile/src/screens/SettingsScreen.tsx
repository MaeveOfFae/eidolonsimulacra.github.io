import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { api, applyStoredApiConfig } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '@char-gen/shared';
import { Cog6ToothIcon } from '../components/Icons';
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
} from '../storage/device-config';
import {
  fetchDesktopCompanionSyncStateText,
  probeDesktopCompanionConnection,
  sendDesktopCompanionSyncState,
  type DesktopCompanionConnectionProbe,
} from '../local/desktop-companion';
import {
  type DesktopCompanionSyncPreview,
  exportDesktopCompanionSyncStateText,
  exportWorkspaceBundleText,
  importDesktopCompanionSyncStateText,
  importWorkspaceBundleText,
  previewDesktopCompanionSyncStateText,
} from '../local/device-link';
import { applyDesktopCompanionPairingLink } from '../lib/desktop-companion-pairing';
import type { RootTabNavigationProp, SettingsRouteProp } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';
import { pickTextFile, saveTextFile } from '../utils/file-transfer';

type Provider = Exclude<Config['engine'], 'auto' | 'ollama' | 'openai_compatible'>;
type EditorMode = 'api-key' | 'api-url' | 'model' | null;
type CompanionProbeStatus = {
  result?: DesktopCompanionConnectionProbe;
  error?: string;
  testedAt: string;
} | null;

const providers: Provider[] = ['openai', 'google', 'openrouter', 'anthropic', 'deepseek', 'zai', 'moonshot'];
const MOBILE_GETTING_STARTED_GUIDE_PREFIX = 'mobile-getting-started:';
const syncDomainOptions: Array<{ key: keyof DesktopCompanionSyncSelection; label: string }> = [
  { key: 'drafts', label: 'Drafts' },
  { key: 'config', label: 'Config' },
  { key: 'templates', label: 'Templates' },
  { key: 'blueprints', label: 'Blueprints' },
];

interface SettingsScreenProps {
  navigation: RootTabNavigationProp<'Settings'>;
  route: SettingsRouteProp;
}

export default function SettingsScreen({ navigation, route }: SettingsScreenProps) {
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

  return (
    <ScrollView ref={scrollViewRef} style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Provider, model, and device storage.</Text>

      <View style={[styles.statusCard, styles.statusCardReady]}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Device ready</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <View style={[styles.connectionDot, styles.connectionDotActive]} />
          )}
        </View>
        <Text style={styles.statusDescription}>
          {usingCustomApiUrl ? 'Custom endpoint active.' : 'Using default endpoint.'}
        </Text>
        <Text style={styles.connectionUrl}>{runtimeEndpoint}</Text>
      </View>

      <View style={[styles.transferCard, styles.guideStatusCard]}>
        <View style={styles.guideStatusHeader}>
          <View style={styles.guideStatusCopy}>
            <Text style={styles.transferTitle}>Getting Started</Text>
            <Text style={styles.transferDescription}>
              {helpState.first_run_completed
                ? 'The mobile first-run checklist is complete. Reopen it from Home whenever you want a quick setup pass.'
                : savedKeyCount > 0
                  ? 'Provider access is configured. Return to Home to finish templates, generation, and draft review.'
                  : 'Use the Home checklist for the safest first-run path, then come back here for provider setup and transfer tools.'}
            </Text>
          </View>
          <View
            style={[
              styles.guideStatusBadge,
              helpState.first_run_completed ? styles.guideStatusBadgeComplete : styles.guideStatusBadgeOpen,
            ]}
          >
            <Text
              style={[
                styles.guideStatusBadgeText,
                helpState.first_run_completed ? styles.guideStatusBadgeTextComplete : styles.guideStatusBadgeTextOpen,
              ]}
            >
              {helpState.first_run_completed
                ? 'Done'
                : guideStepProgressRecorded || savedKeyCount > 0
                  ? 'In progress'
                  : 'Open'}
            </Text>
          </View>
        </View>

        <View style={styles.transferActionsRow}>
          <TouchableOpacity style={styles.transferPrimaryButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.transferPrimaryButtonText}>View on Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.transferSecondaryButton} onPress={handleResetGettingStartedGuide}>
            <Text style={styles.transferSecondaryButtonText}>Reset Guide</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CollapsibleTray
        title="Providers"
        subtitle="Choose the active engine and stored keys"
        initiallyExpanded={savedKeyCount === 0}
        preview={
          <Text style={styles.trayPreviewText}>
            {config.engine || 'auto'} • {savedKeyCount} key{savedKeyCount === 1 ? '' : 's'}
          </Text>
        }
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
                <View
                  style={[
                    styles.statusDot,
                    config.api_keys[provider] ? styles.statusDotActive : styles.statusDotInactive,
                  ]}
                />
                <Text style={styles.statusText}>
                  {config.api_keys[provider] ? 'API key saved locally' : 'No local API key'}
                </Text>
                {isActive && config.model ? (
                  <Text style={styles.activeModelText} numberOfLines={1}>
                    {' • '}
                    {config.model}
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
        preview={
          <Text style={styles.trayPreviewText}>
            {config.model || 'No model'} • {config.engine_mode}
          </Text>
        }
      >
        <View style={styles.currentModelCard}>
          <View style={styles.currentModelRow}>
            <Text style={styles.currentModelLabel}>Engine</Text>
            <Text style={styles.currentModelValue}>{config.engine || 'auto'}</Text>
          </View>
          <View style={styles.currentModelRow}>
            <Text style={styles.currentModelLabel}>Model</Text>
            <Text style={styles.currentModelValue} numberOfLines={1}>
              {config.model || 'Not set'}
            </Text>
          </View>
          <View style={styles.currentModelRowLast}>
            <Text style={styles.currentModelLabel}>Model Endpoint</Text>
            <Text style={styles.currentModelValue} numberOfLines={1}>
              {runtimeEndpoint}
            </Text>
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
            <Text style={[styles.engineModeText, config.engine_mode === 'auto' && styles.engineModeTextActive]}>
              Auto
            </Text>
            <Text style={styles.engineModeDesc}>Automatically select best available</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.engineModeButton, config.engine_mode === 'explicit' && styles.engineModeButtonActive]}
            onPress={() => saveConfigMutation.mutate({ engine_mode: 'explicit' })}
          >
            <Text style={[styles.engineModeText, config.engine_mode === 'explicit' && styles.engineModeTextActive]}>
              Explicit
            </Text>
            <Text style={styles.engineModeDesc}>Use only the selected engine</Text>
          </TouchableOpacity>
        </View>
      </CollapsibleTray>

      <CollapsibleTray
        title="Generation"
        subtitle="Temperature, tokens, and batch defaults"
        preview={
          <Text style={styles.trayPreviewText}>
            T {config.temperature} • {config.max_tokens} tok • {config.batch.max_concurrent} parallel
          </Text>
        }
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
                saveConfigMutation.mutate({
                  batch: { ...config.batch, rate_limit_delay: Math.round(newDelay * 10) / 10 },
                });
              }}
            >
              <Text style={styles.settingButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                const newDelay = Math.min(10, config.batch.rate_limit_delay + 0.5);
                saveConfigMutation.mutate({
                  batch: { ...config.batch, rate_limit_delay: Math.round(newDelay * 10) / 10 },
                });
              }}
            >
              <Text style={styles.settingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CollapsibleTray>

      <View onLayout={(event) => setPcLinkTrayY(event.nativeEvent.layout.y)}>
        <CollapsibleTray
          title="PC Link & transfer"
          subtitle="Use live PC Link on the same LAN, or fall back to manual bundle files when you need file-based transfer"
          preview={
            <Text style={styles.trayPreviewText}>
              {savedKeyCount} saved key{savedKeyCount === 1 ? '' : 's'} • live link or bundle files
            </Text>
          }
          expandedSignal={pcLinkFocusSignal ?? undefined}
        >
          <View style={styles.transferModeGrid}>
            <View style={styles.transferModeCard}>
              <Text style={styles.transferModeEyebrow}>Recommended</Text>
              <Text style={styles.transferModeTitle}>Live PC Link</Text>
              <Text style={styles.transferModeText}>
                Best when your phone and desktop app are both open on the same local network. Pair once, test the link,
                preview a pull, and send snapshots back without creating files.
              </Text>
            </View>

            <View style={styles.transferModeCard}>
              <Text style={styles.transferModeEyebrow}>Fallback</Text>
              <Text style={styles.transferModeTitle}>Manual bundle files</Text>
              <Text style={styles.transferModeText}>
                Use JSON workspace bundles when live pairing is unavailable, when the devices are not on the same LAN,
                or when you want a signed-off file you can keep or share.
              </Text>
            </View>
          </View>

          <View style={styles.transferCard}>
            <Text style={styles.transferTitle}>Live PC Link</Text>
            <Text style={styles.transferDescription}>
              Pair with the desktop Device Link screen to pull the latest published PC snapshot or send this mobile
              snapshot back over your local network.
            </Text>
            <Text style={styles.companionLabel}>This device name</Text>
            <TextInput
              style={[styles.input, styles.companionInput]}
              value={mobileDeviceName}
              onChangeText={handleMobileDeviceNameChange}
              placeholder="My Phone"
              placeholderTextColor={colors.muted_text}
            />
            {rememberedCompanions.length > 0 && (
              <View style={styles.rememberedCompanionList}>
                {rememberedCompanions.map((companion) => (
                  <View key={companion.id} style={styles.rememberedCompanionCard}>
                    <View style={styles.rememberedCompanionHeader}>
                      <View style={styles.rememberedCompanionTextBlock}>
                        <Text style={styles.rememberedCompanionName}>{companion.name}</Text>
                        <Text style={styles.rememberedCompanionMeta} numberOfLines={1}>
                          {companion.url}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteRememberedCompanion(companion.id)}>
                        <Text style={styles.rememberedCompanionDelete}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.transferActionsRow}>
                      <TouchableOpacity
                        style={styles.transferSecondaryButton}
                        onPress={() => handleUseRememberedCompanion(companion)}
                      >
                        <Text style={styles.transferSecondaryButtonText}>Use saved PC</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.companionLabel}>Desktop companion URL</Text>
            <TextInput
              style={[styles.input, styles.companionInput]}
              value={desktopCompanionUrl}
              onChangeText={updateDesktopCompanionUrl}
              placeholder="http://192.168.1.10:48231"
              placeholderTextColor={colors.muted_text}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.companionLabel}>Pair code</Text>
            <TextInput
              style={[styles.input, styles.companionInput, styles.modalInputMonospace]}
              value={desktopCompanionPairCode}
              onChangeText={updateDesktopCompanionPairCode}
              placeholder="AB12CD34"
              placeholderTextColor={colors.muted_text}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View
              style={[
                styles.companionProbeCard,
                companionProbeReady && styles.companionProbeCardReady,
                (companionProbeIssue || desktopApplyPending) && styles.companionProbeCardIssue,
              ]}
            >
              <Text style={styles.companionProbeTitle}>PC link status</Text>
              <Text style={styles.companionProbeText}>{companionProbeMessage}</Text>
              {desktopApplyPending ? (
                <View style={styles.pendingDesktopApplyCard}>
                  <Text style={styles.pendingDesktopApplyTitle}>Waiting for desktop apply</Text>
                  <Text style={styles.pendingDesktopApplyText}>
                    Sent {formatReliabilityTimestamp(companionReliability.pending_desktop_apply_sent_at)}. Open Device
                    Link on desktop and use Apply Incoming Mobile Sync.
                  </Text>
                </View>
              ) : null}
              {companionProbeStatus?.testedAt ? (
                <Text style={styles.companionProbeMeta}>
                  Last tested {new Date(companionProbeStatus.testedAt).toLocaleString()}
                </Text>
              ) : null}
              <View style={styles.companionReliabilityGrid}>
                <View style={styles.companionReliabilityItem}>
                  <Text style={styles.companionReliabilityLabel}>Last good test</Text>
                  <Text style={styles.companionReliabilityValue}>
                    {formatReliabilityTimestamp(companionReliability.last_successful_test_at)}
                  </Text>
                </View>
                <View style={styles.companionReliabilityItem}>
                  <Text style={styles.companionReliabilityLabel}>Last pull</Text>
                  <Text style={styles.companionReliabilityValue}>
                    {formatReliabilityTimestamp(companionReliability.last_successful_pull_at)}
                  </Text>
                </View>
                <View style={styles.companionReliabilityItem}>
                  <Text style={styles.companionReliabilityLabel}>Last send</Text>
                  <Text style={styles.companionReliabilityValue}>
                    {formatReliabilityTimestamp(companionReliability.last_successful_send_at)}
                  </Text>
                </View>
              </View>
              {previewLoading || companionPreview || companionPreviewError ? (
                <View style={styles.companionPreviewCard}>
                  <View style={styles.companionPreviewHeader}>
                    <Text style={styles.companionPreviewTitle}>Pull preview</Text>
                    {previewLoading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
                  </View>
                  {companionPreviewError ? (
                    <Text style={styles.companionPreviewError}>{companionPreviewError}</Text>
                  ) : companionPreview ? (
                    <>
                      <Text style={styles.companionPreviewText}>
                        Pull uses additive merge. New records import directly, and conflicting drafts, templates, or
                        blueprint overrides are preserved as copies instead of overwriting local mobile data.
                      </Text>
                      <Text style={styles.companionPreviewMeta}>
                        Selected pull domains:{' '}
                        {getSelectedDesktopCompanionSyncDomains(syncSelectionSettings.pull_selection).join(', ')}
                      </Text>
                      {companionPreview.source ? (
                        <Text style={styles.companionPreviewMeta}>
                          Snapshot from {companionPreview.source.name} · exported{' '}
                          {new Date(companionPreview.exportedAt).toLocaleString()}
                        </Text>
                      ) : (
                        <Text style={styles.companionPreviewMeta}>
                          Snapshot exported {new Date(companionPreview.exportedAt).toLocaleString()}
                        </Text>
                      )}
                      <View style={styles.companionPreviewGrid}>
                        <View style={styles.companionPreviewItem}>
                          <Text style={styles.companionPreviewItemTitle}>Drafts</Text>
                          <Text style={styles.companionPreviewItemText}>
                            {companionPreview.domains.drafts.conflictingReviewIds} conflicts ·{' '}
                            {companionPreview.domains.drafts.identicalReviewIds} same ·{' '}
                            {companionPreview.domains.drafts.newReviewIds} new
                          </Text>
                        </View>
                        <View style={styles.companionPreviewItem}>
                          <Text style={styles.companionPreviewItemTitle}>Templates</Text>
                          <Text style={styles.companionPreviewItemText}>
                            {companionPreview.domains.templates.conflictingNames} copies ·{' '}
                            {companionPreview.domains.templates.identicalNames} same ·{' '}
                            {companionPreview.domains.templates.newNames} new
                          </Text>
                        </View>
                        <View style={styles.companionPreviewItem}>
                          <Text style={styles.companionPreviewItemTitle}>Blueprints</Text>
                          <Text style={styles.companionPreviewItemText}>
                            {companionPreview.domains.blueprints.conflictingPaths} copies ·{' '}
                            {companionPreview.domains.blueprints.overridingPaths} overrides ·{' '}
                            {companionPreview.domains.blueprints.newPaths} new
                          </Text>
                        </View>
                        <View style={styles.companionPreviewItem}>
                          <Text style={styles.companionPreviewItemTitle}>Config</Text>
                          <Text style={styles.companionPreviewItemText}>
                            {companionPreview.domains.config.importedSettingFields} fields would merge ·{' '}
                            {companionPreview.domains.config.importedApiKeys} API keys would fill
                          </Text>
                        </View>
                      </View>
                      {companionPreview.domains.drafts.conflictingDrafts.length > 0 && (
                        <View style={styles.companionPreviewListCard}>
                          <Text style={styles.companionPreviewListTitle}>Conflicting drafts</Text>
                          {companionPreview.domains.drafts.conflictingDrafts.slice(0, 4).map((draft) => (
                            <Text key={draft.reviewId} style={styles.companionPreviewListText}>
                              {draft.incomingName} vs {draft.currentName} · preserved as copy
                            </Text>
                          ))}
                        </View>
                      )}
                      {companionPreview.domains.templates.conflictingTemplates.length > 0 && (
                        <View style={styles.companionPreviewListCard}>
                          <Text style={styles.companionPreviewListTitle}>Template copies</Text>
                          {companionPreview.domains.templates.conflictingTemplates.slice(0, 4).map((template) => (
                            <Text
                              key={`${template.incomingName}-${template.importedName}`}
                              style={styles.companionPreviewListText}
                            >
                              {template.incomingName}
                              {' -> '}
                              {template.importedName}
                            </Text>
                          ))}
                        </View>
                      )}
                      {companionPreview.domains.blueprints.conflictingBlueprints.length > 0 && (
                        <View style={styles.companionPreviewListCard}>
                          <Text style={styles.companionPreviewListTitle}>Blueprint copies</Text>
                          {companionPreview.domains.blueprints.conflictingBlueprints.slice(0, 3).map((blueprint) => (
                            <Text
                              key={`${blueprint.incomingPath}-${blueprint.importedPath}`}
                              style={styles.companionPreviewListText}
                            >
                              {blueprint.incomingPath}
                              {' -> '}
                              {blueprint.importedPath}
                            </Text>
                          ))}
                        </View>
                      )}
                    </>
                  ) : (
                    <Text style={styles.companionPreviewText}>
                      Desktop preview will appear here after Load Preview fetches the current published desktop
                      snapshot.
                    </Text>
                  )}
                </View>
              ) : null}
              <View style={styles.syncSelectionCard}>
                <Text style={styles.syncSelectionTitle}>Pull domains</Text>
                <Text style={styles.syncSelectionDescription}>
                  Choose which desktop domains are previewed and imported when you pull from PC.
                </Text>
                <View style={styles.syncSelectionGrid}>
                  {syncDomainOptions.map((option) => (
                    <TouchableOpacity
                      key={`pull-${option.key}`}
                      style={[
                        styles.syncSelectionChip,
                        syncSelectionSettings.pull_selection[option.key] && styles.syncSelectionChipActive,
                      ]}
                      onPress={() => updateSyncSelection('pull_selection', option.key)}
                    >
                      <Text
                        style={[
                          styles.syncSelectionChipText,
                          syncSelectionSettings.pull_selection[option.key] && styles.syncSelectionChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {!pullSelectionReady && (
                  <Text style={styles.syncSelectionWarning}>Select at least one pull domain to preview and pull.</Text>
                )}
              </View>
              <View style={styles.syncSelectionCard}>
                <Text style={styles.syncSelectionTitle}>Send domains</Text>
                <Text style={styles.syncSelectionDescription}>
                  Choose which local mobile domains are included when you send a sync snapshot to desktop.
                </Text>
                <View style={styles.syncSelectionGrid}>
                  {syncDomainOptions.map((option) => (
                    <TouchableOpacity
                      key={`send-${option.key}`}
                      style={[
                        styles.syncSelectionChip,
                        syncSelectionSettings.send_selection[option.key] && styles.syncSelectionChipActive,
                      ]}
                      onPress={() => updateSyncSelection('send_selection', option.key)}
                    >
                      <Text
                        style={[
                          styles.syncSelectionChipText,
                          syncSelectionSettings.send_selection[option.key] && styles.syncSelectionChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {!sendSelectionReady && (
                  <Text style={styles.syncSelectionWarning}>
                    Select at least one send domain before sending to desktop.
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.transferActionsRow}>
              <TouchableOpacity style={styles.transferSecondaryButton} onPress={() => void handlePastePairingLink()}>
                <Text style={styles.transferSecondaryButtonText}>Paste pairing link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.transferSecondaryButton} onPress={() => void handleOpenScanner()}>
                <Text style={styles.transferSecondaryButtonText}>Scan QR</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.transferActionsRow}>
              <TouchableOpacity style={styles.transferSecondaryButton} onPress={() => handleRememberCurrentCompanion()}>
                <Text style={styles.transferSecondaryButtonText}>Remember current PC</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.transferSecondaryButton, testingCompanionConnection && styles.transferButtonDisabled]}
                onPress={() => void handleTestDesktopCompanion()}
                disabled={testingCompanionConnection}
              >
                <Text style={styles.transferSecondaryButtonText}>
                  {testingCompanionConnection ? 'Testing…' : 'Test PC Link'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.transferSecondaryButton,
                  (testingCompanionConnection || previewLoading || !pullSelectionReady) &&
                    styles.transferButtonDisabled,
                ]}
                onPress={() => void handleLoadDesktopCompanionPreview()}
                disabled={testingCompanionConnection || previewLoading || !pullSelectionReady}
              >
                <Text style={styles.transferSecondaryButtonText}>
                  {previewLoading ? 'Loading preview…' : 'Preview PC pull'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.transferSecondaryButton, testingCompanionConnection && styles.transferButtonDisabled]}
                onPress={() => void handlePullFromDesktopCompanion()}
                disabled={testingCompanionConnection || !pullSelectionReady}
              >
                <Text style={styles.transferSecondaryButtonText}>Pull live from PC</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.transferPrimaryButton, !sendSelectionReady && styles.transferButtonDisabled]}
                onPress={() => void handleSendToDesktopCompanion()}
                disabled={!sendSelectionReady}
              >
                <Text style={styles.transferPrimaryButtonText}>Send live to PC</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.transferCard}>
            <Text style={styles.transferTitle}>Manual workspace bundle</Text>
            <Text style={styles.transferDescription}>
              Use this fallback when live pairing is unavailable or when you want one signed-off JSON file for drafts,
              templates, blueprint overrides, settings, and keys.
            </Text>
            <View style={styles.transferActionsRow}>
              <TouchableOpacity
                style={styles.transferSecondaryButton}
                onPress={() => void handleImportWorkspaceBundle()}
              >
                <Text style={styles.transferSecondaryButtonText}>Import Bundle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.transferPrimaryButton} onPress={() => void handleExportWorkspaceBundle()}>
                <Text style={styles.transferPrimaryButtonText}>Export Bundle</Text>
              </TouchableOpacity>
            </View>
          </View>

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
      </View>

      <CollapsibleTray
        title="About"
        subtitle="App info and endpoint details"
        preview={
          <Text style={styles.trayPreviewText}>
            v2.0.0 • {usingCustomApiUrl ? 'custom endpoint' : 'default endpoint'}
          </Text>
        }
      >
        <View style={styles.aboutCard}>
          <Cog6ToothIcon color={colors.accent} size={32} />
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
          <Text style={styles.connectionMeta}>
            {usingCustomApiUrl ? 'Using saved override' : 'Using auto-detected default URL'}
          </Text>
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
              placeholderTextColor={colors.muted_text}
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
                  <ActivityIndicator size="small" color={colors.button_text} />
                ) : (
                  <Text style={styles.primaryButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={scannerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseScanner}
      >
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan Desktop Pairing QR</Text>
            <TouchableOpacity onPress={handleCloseScanner}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scannerBody}>
            <Text style={styles.modalHelpText}>
              Point your camera at the QR code shown in the desktop app Device Link screen.
            </Text>

            {cameraPermission?.granted ? (
              <View style={styles.cameraFrame}>
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing="back"
                  onBarcodeScanned={handleScannedPairingCode}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                />
                <View pointerEvents="none" style={styles.cameraOverlay}>
                  <View style={styles.cameraTarget} />
                </View>
              </View>
            ) : (
              <View style={styles.scannerFallbackCard}>
                <Text style={styles.scannerFallbackText}>Camera permission is required to scan a pairing QR code.</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => void handleOpenScanner()}>
                  <Text style={styles.primaryButtonText}>Grant Camera Access</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      gap: 16,
      paddingBottom: 24,
    },
    input: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    companionLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 6,
    },
    companionInput: {
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted_text,
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
      backgroundColor: colors.window,
      borderColor: colors.accent,
    },
    statusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statusTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    statusDescription: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 6,
    },
    trayPreviewText: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    sectionDesc: {
      fontSize: 12,
      color: colors.muted_text,
      marginBottom: 12,
    },
    transferModeGrid: {
      gap: 10,
    },
    transferModeCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.accent,
      padding: 12,
    },
    transferModeEyebrow: {
      color: colors.accent_title,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    transferModeTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      marginTop: 4,
    },
    transferModeText: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 4,
    },
    transferCard: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    transferTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    transferDescription: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 4,
    },
    guideStatusCard: {
      gap: 12,
    },
    guideStatusHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    guideStatusCopy: {
      flex: 1,
    },
    guideStatusBadge: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    guideStatusBadgeOpen: {
      borderColor: colors.border,
      backgroundColor: colors.window,
    },
    guideStatusBadgeComplete: {
      borderColor: colors.success_text,
      backgroundColor: colors.success_bg,
    },
    guideStatusBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    guideStatusBadgeTextOpen: {
      color: colors.text,
    },
    guideStatusBadgeTextComplete: {
      color: colors.success_text,
    },
    rememberedCompanionList: {
      gap: 8,
      marginBottom: 12,
    },
    rememberedCompanionCard: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      padding: 10,
    },
    rememberedCompanionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    rememberedCompanionTextBlock: {
      flex: 1,
    },
    rememberedCompanionName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    rememberedCompanionMeta: {
      color: colors.muted_text,
      fontSize: 12,
      marginTop: 2,
    },
    rememberedCompanionDelete: {
      color: colors.error_text,
      fontSize: 12,
      fontWeight: '600',
    },
    companionProbeCard: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      padding: 10,
      marginTop: 12,
    },
    companionProbeCardReady: {
      borderColor: colors.success_text,
      backgroundColor: colors.success_bg,
    },
    companionProbeCardIssue: {
      borderColor: colors.warning_text,
      backgroundColor: colors.window,
    },
    companionProbeTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    companionProbeText: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 4,
    },
    companionProbeMeta: {
      color: colors.muted_text,
      fontSize: 11,
      marginTop: 6,
    },
    pendingDesktopApplyCard: {
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.warning_text,
      backgroundColor: colors.window,
      padding: 8,
      marginTop: 10,
    },
    pendingDesktopApplyTitle: {
      color: colors.warning_text,
      fontSize: 12,
      fontWeight: '700',
    },
    pendingDesktopApplyText: {
      color: colors.warning_text,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 3,
    },
    companionPreviewCard: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      padding: 10,
      marginTop: 10,
      gap: 8,
    },
    companionPreviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    companionPreviewTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    companionPreviewText: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 17,
    },
    companionPreviewMeta: {
      color: colors.muted_text,
      fontSize: 11,
    },
    companionPreviewError: {
      color: colors.error_text,
      fontSize: 12,
      lineHeight: 17,
    },
    companionPreviewGrid: {
      gap: 6,
    },
    companionPreviewItem: {
      borderRadius: 6,
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      paddingHorizontal: 8,
      paddingVertical: 7,
    },
    companionPreviewItemTitle: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    companionPreviewItemText: {
      color: colors.text,
      fontSize: 12,
      marginTop: 2,
    },
    companionPreviewListCard: {
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      padding: 8,
      gap: 4,
    },
    companionPreviewListTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    companionPreviewListText: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 17,
    },
    syncSelectionCard: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      padding: 10,
      marginTop: 10,
      gap: 8,
    },
    syncSelectionTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    syncSelectionDescription: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 17,
    },
    syncSelectionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    syncSelectionChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    syncSelectionChipActive: {
      borderColor: colors.accent,
      backgroundColor: 'rgba(124, 58, 237, 0.18)',
    },
    syncSelectionChipText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    syncSelectionChipTextActive: {
      color: colors.accent_title,
    },
    syncSelectionWarning: {
      color: colors.warning_text,
      fontSize: 12,
    },
    companionReliabilityGrid: {
      gap: 6,
      marginTop: 10,
    },
    companionReliabilityItem: {
      borderRadius: 6,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    companionReliabilityLabel: {
      color: colors.muted_text,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    companionReliabilityValue: {
      color: colors.text,
      fontSize: 11,
      marginTop: 2,
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
      backgroundColor: colors.button,
    },
    transferPrimaryButtonText: {
      color: colors.button_text,
      fontSize: 14,
      fontWeight: '600',
    },
    transferSecondaryButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      paddingVertical: 10,
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
    },
    transferButtonDisabled: {
      opacity: 0.55,
    },
    transferSecondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    apiKeyItem: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    apiKeyItemActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
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
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    activeBadge: {
      backgroundColor: colors.button,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    activeBadgeText: {
      color: colors.button_text,
      fontSize: 11,
      fontWeight: '600',
    },
    apiKeyActions: {
      flexDirection: 'row',
      gap: 8,
    },
    testButton: {
      backgroundColor: colors.window,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    testButtonLoading: {
      opacity: 0.7,
    },
    testButtonText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '500',
    },
    modelsButton: {
      backgroundColor: colors.button,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    modelsButtonText: {
      color: colors.button_text,
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
      backgroundColor: colors.success_text,
    },
    statusDotInactive: {
      backgroundColor: colors.muted_text,
    },
    statusText: {
      color: colors.muted_text,
      fontSize: 12,
    },
    activeModelText: {
      color: colors.accent,
      fontSize: 12,
      flex: 1,
    },
    currentModelCard: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currentModelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    currentModelRowLast: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    currentModelLabel: {
      color: colors.muted_text,
      fontSize: 14,
    },
    currentModelValue: {
      color: colors.text,
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
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    settingValue: {
      color: colors.accent,
      fontSize: 18,
      fontWeight: '600',
    },
    settingButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    settingButton: {
      backgroundColor: colors.window,
      width: 32,
      height: 32,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingButtonText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    engineModeContainer: {
      gap: 8,
    },
    engineModeButton: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    engineModeButtonActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
    },
    engineModeText: {
      color: colors.muted_text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    engineModeTextActive: {
      color: colors.accent_title,
    },
    engineModeDesc: {
      color: colors.muted_text,
      fontSize: 12,
    },
    aboutCard: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    aboutTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 4,
    },
    aboutVersion: {
      color: colors.accent,
      fontSize: 14,
      marginBottom: 12,
    },
    aboutText: {
      color: colors.muted_text,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
    },
    connectionCard: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.success_text,
      marginBottom: 24,
    },
    connectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    connectionTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    connectionDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    connectionDotActive: {
      backgroundColor: colors.success_text,
    },
    connectionUrl: {
      color: colors.text,
      fontSize: 12,
      marginBottom: 6,
    },
    connectionMeta: {
      color: colors.muted_text,
      fontSize: 12,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    modalCloseText: {
      color: colors.accent,
      fontSize: 16,
    },
    modalBody: {
      padding: 16,
    },
    modalHelpText: {
      color: colors.muted_text,
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
    scannerContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scannerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    scannerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    scannerBody: {
      flex: 1,
      padding: 16,
      gap: 16,
    },
    cameraFrame: {
      flex: 1,
      overflow: 'hidden',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      // Camera preview surface stays black regardless of theme.
      backgroundColor: '#000',
      minHeight: 360,
    },
    cameraOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
    cameraTarget: {
      width: 220,
      height: 220,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.accent,
      backgroundColor: 'transparent',
    },
    scannerFallbackCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      padding: 16,
      gap: 12,
    },
    scannerFallbackText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    primaryButton: {
      flex: 1,
      backgroundColor: colors.button,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: colors.button_text,
      fontSize: 15,
      fontWeight: '600',
    },
    secondaryModalButton: {
      flex: 1,
      backgroundColor: colors.window,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryModalButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    disabledButton: {
      opacity: 0.6,
    },
  });
}
