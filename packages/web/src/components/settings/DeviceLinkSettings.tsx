/**
 * Device Link Settings Component
 * Configure manual workspace bundle transfer, desktop identity, and the live desktop companion.
 */

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, ExternalLink, Link as LinkIcon, RefreshCw, RotateCcw, Upload } from 'lucide-react';
import QRCode from 'qrcode';
import { hasSelectedDesktopCompanionSyncDomains, type DesktopCompanionSyncSelection } from '@char-gen/shared';
import {
  buildDesktopCompanionPairingQrText,
  buildDesktopCompanionPairingText,
  getDesktopCompanionStatus,
  peekIncomingWorkspaceBundleFromDesktopCompanion,
  publishWorkspaceBundleToDesktopCompanion,
  rotateDesktopCompanionPairCode,
  takeIncomingWorkspaceBundleFromDesktopCompanion,
  type DesktopCompanionStatus,
} from '../../lib/desktop-companion.js';
import {
  getDesktopCompanionSyncSelectionSettings,
  getDesktopCompanionIdentity,
  getDesktopCompanionPolicySettings,
  getDesktopCompanionReliabilityMetadata,
  getRememberedMobileCompanions,
  removeRememberedMobileCompanion,
  saveRememberedMobileCompanion,
  updateDesktopCompanionSyncSelectionSettings,
  updateDesktopCompanionPolicySettings,
  updateDesktopCompanionReliabilityMetadata,
  updateRememberedMobileCompanion,
  type DesktopCompanionSyncSelectionSettings,
  type DesktopCompanionPolicySettings,
  type DesktopCompanionReliabilityMetadata,
  updateDesktopCompanionIdentity,
  type DesktopCompanionIdentity,
  type RememberedMobileCompanion,
} from '../../lib/desktop-companion-settings.js';
import {
  exportDesktopCompanionSyncStateText,
  exportWorkspaceBundleText,
  importDesktopCompanionSyncStateText,
  importWorkspaceBundleText,
  previewDesktopCompanionSyncStateText,
  type DesktopCompanionSyncPreview,
} from '../../lib/device-link.js';
import { isDesktopRuntime } from '../../lib/runtime.js';
import { pickFile, saveBlobDownload } from '../../utils/download';

export default function DeviceLinkSettings() {
  const queryClient = useQueryClient();
  const desktopRuntime = isDesktopRuntime();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [companionStatus, setCompanionStatus] = useState<DesktopCompanionStatus | null>(null);
  const [incomingPreview, setIncomingPreview] = useState<DesktopCompanionSyncPreview | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [rotateLoading, setRotateLoading] = useState(false);
  const [pairingQrDataUrl, setPairingQrDataUrl] = useState<string | null>(null);
  const [desktopIdentity, setDesktopIdentity] = useState<DesktopCompanionIdentity>(() => getDesktopCompanionIdentity());
  const [policySettings, setPolicySettings] = useState<DesktopCompanionPolicySettings>(() =>
    getDesktopCompanionPolicySettings(),
  );
  const [syncSelectionSettings, setSyncSelectionSettings] = useState<DesktopCompanionSyncSelectionSettings>(() =>
    getDesktopCompanionSyncSelectionSettings(),
  );
  const [reliabilityMetadata, setReliabilityMetadata] = useState<DesktopCompanionReliabilityMetadata>(() =>
    getDesktopCompanionReliabilityMetadata(),
  );
  const [rememberedMobiles, setRememberedMobiles] = useState<RememberedMobileCompanion[]>(() =>
    getRememberedMobileCompanions(),
  );
  const publishSelectionReady = hasSelectedDesktopCompanionSyncDomains(syncSelectionSettings.publishSelection);
  const syncDomainOptions: Array<{ key: keyof DesktopCompanionSyncSelection; label: string }> = [
    { key: 'drafts', label: 'Drafts' },
    { key: 'config', label: 'Config' },
    { key: 'templates', label: 'Templates' },
    { key: 'blueprints', label: 'Blueprints' },
  ];

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const copyText = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      clearMessages();
      setSuccess(successMessage);
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : 'Failed to copy to the clipboard');
    }
  };

  const refreshCompanionStatus = async () => {
    if (!desktopRuntime) {
      return;
    }

    setStatusLoading(true);
    try {
      const nextStatus = await getDesktopCompanionStatus();
      setCompanionStatus(nextStatus);

      if (nextStatus.incomingBundleAvailable) {
        setPreviewLoading(true);
        try {
          const pendingSync = await peekIncomingWorkspaceBundleFromDesktopCompanion();
          const preview = pendingSync ? await previewDesktopCompanionSyncStateText(pendingSync) : null;
          setIncomingPreview(preview);
          if (preview?.source) {
            setRememberedMobiles(
              saveRememberedMobileCompanion({
                deviceId: preview.source.deviceId,
                name: preview.source.name,
                platform: preview.source.platform,
                runtime: preview.source.runtime,
              }),
            );
          }
        } finally {
          setPreviewLoading(false);
        }
      } else {
        setIncomingPreview(null);
      }
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Failed to load desktop companion status');
    } finally {
      setStatusLoading(false);
    }
  };

  // The status refresh runs once when the desktop runtime becomes available, so it
  // goes through a latest-value ref instead of re-running whenever the callback identity
  // changes (which would spam the Tauri companion with status calls).
  const refreshCompanionStatusRef = useRef(refreshCompanionStatus);
  refreshCompanionStatusRef.current = refreshCompanionStatus;

  useEffect(() => {
    if (!desktopRuntime) {
      return;
    }

    void refreshCompanionStatusRef.current();
  }, [desktopRuntime]);

  const handleDesktopNameChange = (value: string) => {
    const nextIdentity = updateDesktopCompanionIdentity({ name: value });
    setDesktopIdentity(nextIdentity);
  };

  const handlePolicyChange = (value: DesktopCompanionPolicySettings['untrustedSenderPolicy']) => {
    const nextSettings = updateDesktopCompanionPolicySettings({ untrustedSenderPolicy: value });
    setPolicySettings(nextSettings);
  };

  const handlePublishDomainToggle = (domain: keyof DesktopCompanionSyncSelection) => {
    const nextSettings = updateDesktopCompanionSyncSelectionSettings({
      publishSelection: {
        ...syncSelectionSettings.publishSelection,
        [domain]: !syncSelectionSettings.publishSelection[domain],
      },
    });
    setSyncSelectionSettings(nextSettings);
  };

  const handleExportBundle = async () => {
    clearMessages();
    try {
      const data = await exportWorkspaceBundleText();
      const blob = new Blob([data], { type: 'application/json' });
      await saveBlobDownload(blob, `eidolon-simulacra-workspace-bundle-${new Date().toISOString().split('T')[0]}.json`);
      setSuccess(
        desktopRuntime
          ? 'Workspace bundle exported. Import it on mobile to mirror this desktop workspace.'
          : 'Workspace bundle exported. Import it on mobile or another local workspace to mirror this browser data.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Workspace bundle export failed');
    }
  };

  const handleImportBundle = async () => {
    clearMessages();
    try {
      const file = await pickFile({ accept: 'application/json,.json' });
      if (!file) {
        return;
      }

      const result = await importWorkspaceBundleText(await file.text());
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
        queryClient.invalidateQueries({ queryKey: ['templates'] }),
        queryClient.invalidateQueries({ queryKey: ['blueprints'] }),
      ]);

      const importedSegments = [
        result.drafts > 0 ? `${result.drafts} drafts` : null,
        result.templates > 0 ? `${result.templates} templates` : null,
        result.blueprintOverrides > 0 ? `${result.blueprintOverrides} blueprint overrides` : null,
        result.configImported ? 'settings' : null,
        result.apiKeys > 0 ? `${result.apiKeys} API keys` : null,
        result.remappedDrafts > 0 ? `${result.remappedDrafts} conflicting drafts preserved as copies` : null,
      ].filter(Boolean);

      setSuccess(
        importedSegments.length > 0
          ? `Imported ${importedSegments.join(', ')} from ${file.name}.`
          : `The bundle from ${file.name} did not contain any importable records.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Workspace bundle import failed');
    }
  };

  const handlePublishCompanionBundle = async () => {
    if (!desktopRuntime) {
      return;
    }

    if (!publishSelectionReady) {
      clearMessages();
      setError('Select at least one publish domain before publishing live sync to the desktop companion.');
      return;
    }

    clearMessages();
    setPublishLoading(true);
    try {
      const syncStateJson = await exportDesktopCompanionSyncStateText({
        selection: syncSelectionSettings.publishSelection,
      });
      const nextStatus = await publishWorkspaceBundleToDesktopCompanion(syncStateJson);
      setCompanionStatus(nextStatus);
      setReliabilityMetadata(updateDesktopCompanionReliabilityMetadata({ lastPublishedAt: new Date().toISOString() }));
      setSuccess(
        'Published the current sync snapshot to the desktop companion. Mobile can pull live drafts, config, templates, and blueprint overrides with the current URL and pair code.',
      );
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : 'Failed to publish the sync snapshot to the desktop companion',
      );
    } finally {
      setPublishLoading(false);
    }
  };

  const handleApplyIncomingBundle = async () => {
    if (!desktopRuntime) {
      return;
    }

    if (!incomingSourceTrusted) {
      if (policySettings.untrustedSenderPolicy === 'block') {
        clearMessages();
        setError(
          'Desktop policy blocks apply from untrusted or unknown mobile senders. Trust this sender first or change the incoming sender policy.',
        );
        return;
      }

      if (policySettings.untrustedSenderPolicy === 'confirm') {
        const senderLabel = incomingPreview?.source
          ? `${incomingPreview.source.name} (${incomingPreview.source.platform}/${incomingPreview.source.runtime})`
          : 'an unknown mobile sender';
        const confirmed = window.confirm(
          `This incoming sync snapshot is from ${senderLabel} and is not trusted yet. Apply it anyway?`,
        );
        if (!confirmed) {
          return;
        }
      }
    }

    clearMessages();
    setIncomingLoading(true);
    try {
      const syncStateJson = await takeIncomingWorkspaceBundleFromDesktopCompanion();
      if (!syncStateJson) {
        setSuccess('There is no pending incoming mobile sync snapshot to apply.');
        await refreshCompanionStatus();
        return;
      }

      const result = await importDesktopCompanionSyncStateText(syncStateJson);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
        queryClient.invalidateQueries({ queryKey: ['templates'] }),
        queryClient.invalidateQueries({ queryKey: ['blueprints'] }),
      ]);
      setIncomingPreview(null);
      await refreshCompanionStatus();
      setReliabilityMetadata(
        updateDesktopCompanionReliabilityMetadata({ lastAppliedIncomingAt: new Date().toISOString() }),
      );

      const importedSegments = [
        result.drafts > 0 ? `${result.drafts} drafts` : null,
        result.templates > 0 ? `${result.templates} templates` : null,
        result.blueprintOverrides > 0 ? `${result.blueprintOverrides} blueprint overrides` : null,
        result.configImported ? 'settings' : null,
        result.apiKeys > 0 ? `${result.apiKeys} API keys` : null,
        result.remappedDrafts > 0 ? `${result.remappedDrafts} conflicting drafts preserved as copies` : null,
      ].filter(Boolean);

      setSuccess(
        importedSegments.length > 0
          ? `Applied incoming mobile sync with ${importedSegments.join(', ')}.`
          : 'Applied the incoming mobile sync snapshot, but it did not contain any importable records.',
      );
    } catch (incomingError) {
      setError(
        incomingError instanceof Error ? incomingError.message : 'Failed to apply the incoming mobile sync snapshot',
      );
    } finally {
      setIncomingLoading(false);
    }
  };

  const handleRotatePairCode = async () => {
    if (!desktopRuntime) {
      return;
    }

    clearMessages();
    setRotateLoading(true);
    try {
      const nextStatus = await rotateDesktopCompanionPairCode();
      setCompanionStatus(nextStatus);
      setSuccess('Rotated the desktop companion pair code. Update mobile before the next pull or push.');
    } catch (rotationError) {
      setError(
        rotationError instanceof Error ? rotationError.message : 'Failed to rotate the desktop companion pair code',
      );
    } finally {
      setRotateLoading(false);
    }
  };

  const formatTimestamp = (value: number | null | undefined) => {
    if (!value) {
      return 'Never';
    }

    return new Date(value).toLocaleString();
  };

  const formatStoredTimestamp = (value: string | undefined) => {
    if (!value) {
      return 'Never';
    }

    return new Date(value).toLocaleString();
  };

  const pairingText = companionStatus ? buildDesktopCompanionPairingText(companionStatus, desktopIdentity) : null;
  const pairingQrText = companionStatus ? buildDesktopCompanionPairingQrText(companionStatus, desktopIdentity) : null;
  const incomingSourceRecord = incomingPreview?.source
    ? rememberedMobiles.find((mobile) => mobile.deviceId === incomingPreview.source?.deviceId)
    : null;
  const incomingSourceTrusted = incomingSourceRecord?.trusted === true;
  const incomingBlockedByPolicy = !incomingSourceTrusted && policySettings.untrustedSenderPolicy === 'block';
  const mobilePullStatus = companionStatus?.outgoingBundleAvailable
    ? `Ready for mobile pull · published ${formatTimestamp(companionStatus.outgoingBundlePublishedAtMs)}`
    : 'Publish Live Sync before mobile can pull from this desktop.';
  const incomingApplyStatus = companionStatus?.incomingBundleAvailable
    ? `Incoming mobile sync waiting · received ${formatTimestamp(companionStatus.incomingBundleReceivedAtMs)}`
    : 'No incoming mobile sync is waiting to apply.';

  useEffect(() => {
    let cancelled = false;

    const buildQr = async () => {
      if (!pairingQrText) {
        setPairingQrDataUrl(null);
        return;
      }

      try {
        const nextDataUrl = await QRCode.toDataURL(pairingQrText, {
          width: 240,
          margin: 1,
          color: {
            dark: '#f5f3ff',
            light: '#171717',
          },
        });

        if (!cancelled) {
          setPairingQrDataUrl(nextDataUrl);
        }
      } catch (qrError) {
        if (!cancelled) {
          setPairingQrDataUrl(null);
          setError(qrError instanceof Error ? qrError.message : 'Failed to generate pairing QR code');
        }
      }
    };

    void buildQr();

    return () => {
      cancelled = true;
    };
  }, [pairingQrText]);

  const handleRenameRememberedMobile = (mobile: RememberedMobileCompanion) => {
    const nextName = window.prompt('Rename remembered sender', mobile.name);
    if (!nextName) {
      return;
    }

    setRememberedMobiles(updateRememberedMobileCompanion(mobile.deviceId, { name: nextName }));
  };

  const handleTrustRememberedMobile = (mobile: RememberedMobileCompanion, trusted: boolean) => {
    setRememberedMobiles(updateRememberedMobileCompanion(mobile.deviceId, { trusted }));
  };

  const handleForgetRememberedMobile = (mobile: RememberedMobileCompanion) => {
    setRememberedMobiles(removeRememberedMobileCompanion(mobile.deviceId));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <LinkIcon className="h-6 w-6" />
          Device Link
        </h2>
        <p className="text-muted-foreground">
          {desktopRuntime
            ? 'Use Live PC Link when the desktop app and phone are on the same LAN and you want direct pull/send without files. Use Manual Bundle Transfer when you need a signed-off JSON snapshot or the live link is unavailable.'
            : 'Use manual workspace bundle files to move data between your browser workspace and the mobile app without a hosted sync service.'}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {desktopRuntime && (
          <div className="rounded-md border border-primary/25 bg-primary/10 p-4 text-sm text-muted-foreground">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">Recommended</div>
            <h3 className="mt-2 font-semibold text-foreground">Live PC Link</h3>
            <p className="mt-2">
              Pair mobile to this desktop, publish a live sync snapshot, let mobile preview and pull it, then apply
              incoming mobile snapshots here when the phone sends changes back.
            </p>
          </div>
        )}

        <div className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fallback</div>
          <h3 className="mt-2 font-semibold text-foreground">Manual Bundle Transfer</h3>
          <p className="mt-2">
            Export or import workspace bundle files when devices are not on the same LAN, when you want a signed-off
            snapshot, or when you do not want to rely on the live pair-code path.
          </p>
        </div>
      </div>

      {desktopRuntime && (
        <div className="app-panel">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">Live PC Link</h3>
              <button
                type="button"
                onClick={() => void refreshCompanionStatus()}
                disabled={statusLoading}
                className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground">
              Publish the current sync snapshot to the LAN companion, then let mobile preview and pull live drafts,
              config, templates, and blueprint overrides. If mobile sends a snapshot back, apply it here instead of
              moving bundle files by hand.
            </p>

            <div className="rounded-md border border-border bg-background/40 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Desktop Identity</div>
              <label className="mt-3 block text-sm font-medium text-foreground">Desktop name</label>
              <input
                type="text"
                value={desktopIdentity.name}
                onChange={(event) => handleDesktopNameChange(event.target.value)}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="My Desktop"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                This name is included in the pairing link and helps mobile remember this desktop by a friendly label.
              </p>
            </div>

            <div className="rounded-md border border-border bg-background/40 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Incoming Sender Policy
              </div>
              <label className="mt-3 block text-sm font-medium text-foreground">
                When a sender is untrusted or unknown
              </label>
              <select
                value={policySettings.untrustedSenderPolicy}
                onChange={(event) =>
                  handlePolicyChange(event.target.value as DesktopCompanionPolicySettings['untrustedSenderPolicy'])
                }
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="allow">Allow apply immediately</option>
                <option value="confirm">Require confirmation</option>
                <option value="block">Block apply</option>
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                Trusted senders bypass this policy. Unknown and explicitly untrusted mobile devices follow it.
              </p>
            </div>

            <div className="rounded-md border border-border bg-background/40 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Published Domains</div>
              <p className="mt-3 text-xs text-muted-foreground">
                Choose which desktop domains are included when you publish live sync for mobile pull.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {syncDomainOptions.map((option) => (
                  <label
                    key={option.key}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${syncSelectionSettings.publishSelection[option.key] ? 'border-primary/50 bg-primary/15 text-foreground' : 'border-border/60 bg-background/70 text-muted-foreground'}`}
                  >
                    <input
                      type="checkbox"
                      checked={syncSelectionSettings.publishSelection[option.key]}
                      onChange={() => handlePublishDomainToggle(option.key)}
                      className="h-3.5 w-3.5"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {!publishSelectionReady && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Select at least one publish domain before using Publish Live Sync.
                </p>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
              <div className="rounded-md border border-border bg-background/60 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</div>
                <div className="mt-1 font-semibold text-foreground">
                  {companionStatus?.running ? 'Running' : 'Unavailable'}
                </div>
              </div>
              <div className="rounded-md border border-border bg-background/60 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">LAN URL</div>
                <div className="mt-1 break-all font-semibold text-foreground">
                  {companionStatus?.localUrl || 'Unavailable'}
                </div>
              </div>
              <div className="rounded-md border border-border bg-background/60 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pair code</div>
                <div className="mt-1 font-mono text-lg font-semibold text-foreground">
                  {companionStatus?.pairCode || '--------'}
                </div>
              </div>
              <div className="rounded-md border border-border bg-background/60 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Incoming sync</div>
                <div className="mt-1 font-semibold text-foreground">
                  {companionStatus?.incomingBundleAvailable ? 'Waiting' : 'None'}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
              <div className="grid gap-3 md:grid-cols-2">
                <div
                  className={`rounded-md border px-3 py-2 ${companionStatus?.outgoingBundleAvailable ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'}`}
                >
                  <div className="text-xs font-medium uppercase tracking-wide">Mobile pull</div>
                  <div className="mt-1 text-xs">{mobilePullStatus}</div>
                </div>
                <div
                  className={`rounded-md border px-3 py-2 ${companionStatus?.incomingBundleAvailable ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-border/60 bg-background/70 text-muted-foreground'}`}
                >
                  <div className="text-xs font-medium uppercase tracking-wide">Desktop apply</div>
                  <div className="mt-1 text-xs">{incomingApplyStatus}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-border/60 bg-background/70 px-3 py-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Last successful publish
                  </div>
                  <div className="mt-1 text-xs text-foreground">
                    {formatStoredTimestamp(reliabilityMetadata.lastPublishedAt)}
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-background/70 px-3 py-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Last successful apply
                  </div>
                  <div className="mt-1 text-xs text-foreground">
                    {formatStoredTimestamp(reliabilityMetadata.lastAppliedIncomingAt)}
                  </div>
                </div>
              </div>
              {companionStatus?.lastError && (
                <div className="mt-2 text-red-600 dark:text-red-400">Companion error: {companionStatus.lastError}</div>
              )}
            </div>

            {companionStatus?.incomingBundleAvailable && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-800 shadow-sm dark:text-emerald-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide">Incoming mobile sync is waiting</div>
                    <p className="mt-1 text-xs">
                      Mobile sent a sync snapshot to this desktop. Review the preview below, then apply it here to bring
                      the desktop workspace up to date.
                    </p>
                    {incomingPreview?.source && (
                      <p className="mt-2 text-xs">
                        Sender: {incomingPreview.source.name} ({incomingPreview.source.platform}/
                        {incomingPreview.source.runtime}){incomingSourceTrusted ? ' · trusted' : ' · untrusted'}.
                      </p>
                    )}
                    {incomingBlockedByPolicy && (
                      <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                        Apply is blocked by policy until this sender is trusted or the incoming sender policy changes.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleApplyIncomingBundle()}
                    disabled={incomingLoading || !companionStatus.running || incomingBlockedByPolicy}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {incomingLoading ? 'Applying…' : 'Apply Incoming Sync'}
                  </button>
                </div>
              </div>
            )}

            {companionStatus?.incomingBundleAvailable && (
              <div className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Incoming Sync Preview
                  </div>
                  {previewLoading && <span className="text-xs">Loading…</span>}
                </div>

                {incomingPreview ? (
                  <>
                    {incomingPreview.source && (
                      <div
                        className={`mt-3 rounded-md border px-3 py-2 text-xs ${incomingSourceTrusted ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'}`}
                      >
                        Incoming from {incomingPreview.source.name} ({incomingPreview.source.platform}/
                        {incomingPreview.source.runtime})
                        {incomingSourceTrusted ? ' • trusted sender' : ' • untrusted sender'}.
                        {!incomingSourceTrusted && ' Review before applying or mark this sender as trusted.'}
                      </div>
                    )}
                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-md border border-border/60 bg-background/70 p-3">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Drafts</div>
                        <div className="mt-1 text-sm text-foreground">
                          {incomingPreview.domains.drafts.incomingCount} incoming
                        </div>
                        <div className="mt-1 text-xs">
                          {incomingPreview.domains.drafts.conflictingReviewIds} conflicts ·{' '}
                          {incomingPreview.domains.drafts.identicalReviewIds} same ·{' '}
                          {incomingPreview.domains.drafts.newReviewIds} new
                        </div>
                      </div>
                      <div className="rounded-md border border-border/60 bg-background/70 p-3">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Templates</div>
                        <div className="mt-1 text-sm text-foreground">
                          {incomingPreview.domains.templates.incomingCount} incoming
                        </div>
                        <div className="mt-1 text-xs">
                          {incomingPreview.domains.templates.conflictingNames} copies ·{' '}
                          {incomingPreview.domains.templates.identicalNames} same ·{' '}
                          {incomingPreview.domains.templates.newNames} new
                        </div>
                      </div>
                      <div className="rounded-md border border-border/60 bg-background/70 p-3">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Blueprints</div>
                        <div className="mt-1 text-sm text-foreground">
                          {incomingPreview.domains.blueprints.incomingCount} incoming
                        </div>
                        <div className="mt-1 text-xs">
                          {incomingPreview.domains.blueprints.conflictingPaths} copies ·{' '}
                          {incomingPreview.domains.blueprints.overridingPaths} overrides ·{' '}
                          {incomingPreview.domains.blueprints.newPaths} new
                        </div>
                      </div>
                      <div className="rounded-md border border-border/60 bg-background/70 p-3">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Config</div>
                        <div className="mt-1 text-sm text-foreground">
                          {incomingPreview.domains.config.hasConfig ? 'Included' : 'Not included'}
                        </div>
                        <div className="mt-1 text-xs">
                          {incomingPreview.domains.config.importedSettingFields} fields would merge ·{' '}
                          {incomingPreview.domains.config.importedApiKeys} API keys would fill
                        </div>
                      </div>
                    </div>

                    {incomingPreview.domains.config.hasConfig && (
                      <p className="mt-3 text-xs">
                        Model impact: incoming {incomingPreview.domains.config.incomingModel || 'unset'} → current{' '}
                        {incomingPreview.domains.config.currentModel || 'unset'}
                        {incomingPreview.domains.config.modelWillChange ? ' (will change).' : ' (unchanged).'}
                      </p>
                    )}
                    {incomingPreview.domains.drafts.conflictingDrafts.length > 0 && (
                      <div className="mt-3 rounded-md border border-border/60 bg-background/70 p-3">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Conflicting Drafts
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          {incomingPreview.domains.drafts.conflictingDrafts.slice(0, 6).map((draft) => (
                            <div key={draft.reviewId}>
                              <span className="text-foreground">{draft.reviewId}</span>: incoming{' '}
                              <span className="text-foreground">{draft.incomingName}</span> vs current{' '}
                              <span className="text-foreground">{draft.currentName}</span> · will preserve as a copy
                            </div>
                          ))}
                          {incomingPreview.domains.drafts.conflictingDrafts.length > 6 && (
                            <div>
                              +{incomingPreview.domains.drafts.conflictingDrafts.length - 6} more conflicting drafts
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {incomingPreview.domains.drafts.newDrafts.length > 0 && (
                      <div className="mt-3 rounded-md border border-border/60 bg-background/70 p-3">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          New drafts
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          {incomingPreview.domains.drafts.newDrafts.slice(0, 6).map((draft) => (
                            <div key={draft.reviewId}>
                              <span className="text-foreground">{draft.incomingName}</span>{' '}
                              <span className="text-muted-foreground">({draft.reviewId})</span>
                            </div>
                          ))}
                          {incomingPreview.domains.drafts.newDrafts.length > 6 && (
                            <div>+{incomingPreview.domains.drafts.newDrafts.length - 6} more new drafts</div>
                          )}
                        </div>
                      </div>
                    )}
                    {incomingPreview.domains.templates.incomingCount > 0 && (
                      <div className="mt-3 rounded-md border border-border/60 bg-background/70 p-3">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Templates
                        </div>
                        <div className="mt-2 text-xs">
                          {incomingPreview.domains.templates.conflictingTemplates.length > 0 && (
                            <div>
                              Conflicting copies:{' '}
                              {incomingPreview.domains.templates.conflictingTemplates
                                .slice(0, 4)
                                .map((template) => `${template.incomingName} -> ${template.importedName}`)
                                .join(', ')}
                              {incomingPreview.domains.templates.conflictingTemplates.length > 4 ? '…' : ''}
                            </div>
                          )}
                          {incomingPreview.domains.templates.newTemplateNames.length > 0 && (
                            <div className="mt-1">
                              New: {incomingPreview.domains.templates.newTemplateNames.slice(0, 6).join(', ')}
                              {incomingPreview.domains.templates.newTemplateNames.length > 6 ? '…' : ''}
                            </div>
                          )}
                          {incomingPreview.domains.templates.identicalNames > 0 && (
                            <div className="mt-1">
                              Unchanged matches: {incomingPreview.domains.templates.identicalNames}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {incomingPreview.domains.blueprints.incomingCount > 0 && (
                      <div className="mt-3 rounded-md border border-border/60 bg-background/70 p-3">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Blueprint Overrides
                        </div>
                        <div className="mt-2 text-xs">
                          {incomingPreview.domains.blueprints.conflictingBlueprints.length > 0 && (
                            <div>
                              Conflicting copies:{' '}
                              {incomingPreview.domains.blueprints.conflictingBlueprints
                                .slice(0, 3)
                                .map((blueprint) => `${blueprint.incomingPath} -> ${blueprint.importedPath}`)
                                .join(', ')}
                              {incomingPreview.domains.blueprints.conflictingBlueprints.length > 3 ? '…' : ''}
                            </div>
                          )}
                          {incomingPreview.domains.blueprints.overridingBlueprintPaths.length > 0 && (
                            <div className="mt-1">
                              Incoming overrides:{' '}
                              {incomingPreview.domains.blueprints.overridingBlueprintPaths.slice(0, 4).join(', ')}
                              {incomingPreview.domains.blueprints.overridingBlueprintPaths.length > 4 ? '…' : ''}
                            </div>
                          )}
                          {incomingPreview.domains.blueprints.newBlueprintPaths.length > 0 && (
                            <div className="mt-1">
                              New: {incomingPreview.domains.blueprints.newBlueprintPaths.slice(0, 4).join(', ')}
                              {incomingPreview.domains.blueprints.newBlueprintPaths.length > 4 ? '…' : ''}
                            </div>
                          )}
                          {incomingPreview.domains.blueprints.identicalPaths > 0 && (
                            <div className="mt-1">
                              Unchanged matches: {incomingPreview.domains.blueprints.identicalPaths}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <p className="mt-2 text-xs">
                      Snapshot exported at {new Date(incomingPreview.exportedAt).toLocaleString()}.
                    </p>
                    <p className="mt-2 text-xs">
                      Sync apply is additive. New records are imported directly, and conflicting drafts are preserved as
                      copies instead of overwriting the current desktop version.
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-xs">No preview is available yet for the incoming sync snapshot.</p>
                )}
              </div>
            )}

            {rememberedMobiles.length > 0 && (
              <div className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recent Mobile Senders
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {rememberedMobiles.map((mobile) => (
                    <div key={mobile.deviceId} className="rounded-md border border-border/60 bg-background/70 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-foreground">{mobile.name}</div>
                          <div
                            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${mobile.trusted ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/15 text-amber-800 dark:text-amber-200'}`}
                          >
                            {mobile.trusted ? 'Trusted' : 'Untrusted'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-1 text-xs">
                        {mobile.platform}/{mobile.runtime}
                      </div>
                      <div className="mt-1 text-xs">Last seen {new Date(mobile.lastSeenAt).toLocaleString()}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleTrustRememberedMobile(mobile, !mobile.trusted)}
                          className="rounded-md border border-input px-2.5 py-1 text-xs hover:bg-accent"
                        >
                          {mobile.trusted ? 'Untrust' : 'Trust'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRenameRememberedMobile(mobile)}
                          className="rounded-md border border-input px-2.5 py-1 text-xs hover:bg-accent"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForgetRememberedMobile(mobile)}
                          className="rounded-md border border-red-500/40 px-2.5 py-1 text-xs text-red-600 hover:bg-red-500/10 dark:text-red-300"
                        >
                          Forget
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pairingText && (
              <div className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                <div className="grid gap-4 xl:grid-cols-[14rem_minmax(0,1fr)] xl:items-start">
                  <div className="rounded-md border border-border/60 bg-background/70 p-3">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      In-App Scanner QR
                    </div>
                    <div className="mt-3 flex justify-center">
                      {pairingQrDataUrl ? (
                        <img
                          src={pairingQrDataUrl}
                          alt="Desktop companion pairing QR code"
                          className="h-56 w-56 rounded-lg border border-border/60 bg-[#171717] p-2"
                        />
                      ) : (
                        <div className="flex h-56 w-56 items-center justify-center rounded-lg border border-dashed border-border/60 bg-background text-xs text-muted-foreground">
                          QR unavailable
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Pairing Link
                    </div>
                    <div className="mt-2 break-all rounded-md border border-border/60 bg-background/70 p-3 font-mono text-xs text-foreground">
                      {pairingText}
                    </div>
                    <p className="mt-2 text-xs">
                      Scan this QR code from mobile Settings with Scan QR. System camera apps may show the raw pairing
                      data instead of opening the app.
                    </p>
                    <p className="mt-2 text-xs">
                      Use Copy Pairing Link with mobile Paste Pair Link to prefill the desktop companion URL and pair
                      code without typing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {companionStatus?.localUrl && (
                <button
                  type="button"
                  onClick={() =>
                    void copyText(companionStatus.localUrl!, 'Copied the desktop companion URL to the clipboard.')
                  }
                  className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
                >
                  Copy URL
                </button>
              )}
              {companionStatus?.pairCode && (
                <button
                  type="button"
                  onClick={() =>
                    void copyText(companionStatus.pairCode, 'Copied the desktop companion pair code to the clipboard.')
                  }
                  className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
                >
                  Copy Pair Code
                </button>
              )}
              {pairingText && (
                <button
                  type="button"
                  onClick={() =>
                    void copyText(pairingText, 'Copied the desktop companion pairing link to the clipboard.')
                  }
                  className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
                >
                  Copy Pairing Link
                </button>
              )}
              <button
                type="button"
                onClick={() => void handlePublishCompanionBundle()}
                disabled={publishLoading || !companionStatus?.running || !publishSelectionReady}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {publishLoading ? 'Publishing…' : 'Publish Live Sync'}
              </button>
              <button
                type="button"
                onClick={() => void handleApplyIncomingBundle()}
                disabled={incomingLoading || !companionStatus?.running || incomingBlockedByPolicy}
                className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {incomingLoading ? 'Applying…' : 'Apply Incoming Mobile Sync'}
              </button>
              {incomingBlockedByPolicy && (
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  Apply is blocked by the incoming sender policy until this sender is trusted.
                </span>
              )}
              <button
                type="button"
                onClick={() => void handleRotatePairCode()}
                disabled={rotateLoading || !companionStatus?.running}
                className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                {rotateLoading ? 'Rotating…' : 'Rotate Pair Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="app-note border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
          <button onClick={clearMessages} className="ml-2 opacity-50 hover:opacity-100">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="app-note border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
          {success}
          <button onClick={clearMessages} className="ml-2 opacity-50 hover:opacity-100">
            ×
          </button>
        </div>
      )}

      <div className="app-panel">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold">Manual Bundle Transfer</h3>
        </div>
        <div className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">
            Use bundle files when Live PC Link is unavailable, when you want a signed-off snapshot to archive or share,
            or when you are moving data through the browser runtime instead of the desktop app.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void handleExportBundle()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Export Bundle File
            </button>
            <button
              onClick={() => void handleImportBundle()}
              className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
            >
              <Upload className="h-4 w-4" />
              Import Bundle File
            </button>
          </div>
        </div>
      </div>

      <div className="app-panel-muted p-4">
        <h3 className="font-medium text-sm mb-2">Quick Links</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="/data" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ExternalLink className="h-3 w-3" />
            Data Manager
          </a>
          <span className="text-muted-foreground">
            {desktopRuntime
              ? 'Use Live PC Link for direct LAN pull/send, or fall back to Manual Bundle Transfer for file-based movement.'
              : 'Manual bundle files replace hosted sync for browser-to-mobile transfer.'}
          </span>
        </div>
      </div>
    </div>
  );
}
