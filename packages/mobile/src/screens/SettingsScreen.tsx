import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { CameraView } from 'expo-camera';
import CollapsibleTray from '../components/CollapsibleTray';
import { Cog6ToothIcon } from '../components/Icons';
import { getSelectedDesktopCompanionSyncDomains } from '@char-gen/shared';
import { useSettingsScreen } from './settings/use-settings-screen';
import type { SettingsScreenProps } from './settings/use-settings-screen';

export default function SettingsScreen({ navigation, route }: SettingsScreenProps) {
  const {
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
  } = useSettingsScreen({ navigation, route });
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
