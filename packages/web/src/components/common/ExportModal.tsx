import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Download,
  FileText,
  FileJson,
  FileCode,
  CheckCircle2,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import type { ExportPresetSummary } from '@char-gen/shared';
import { api } from '@/lib/api';
import { buildExportReadinessSummary } from '@/lib/drafts/export-readiness';
import { saveDownload } from '../../utils/download';
import ExportPreviewPlaceholder from './ExportPreviewPlaceholder';
import PublishingPlaceholder from './PublishingPlaceholder';

type ExportPresetOption = ExportPresetSummary & {
  format?: 'text' | 'json' | 'combined' | 'png';
  description?: string;
};

interface ExportModalProps {
  draftId: string;
  characterName: string;
  onClose: () => void;
}

export default function ExportModal({ draftId, characterName, onClose }: ExportModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [acknowledgeWarnings, setAcknowledgeWarnings] = useState(false);

  const {
    data: presets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['export-presets'],
    queryFn: () => api.getExportPresets(),
  });
  const { data: draft } = useQuery({
    queryKey: ['draft', draftId, 'export-modal'],
    queryFn: () => api.getDraft(draftId),
    enabled: Boolean(draftId),
  });
  const { data: validation } = useQuery({
    queryKey: ['draft', draftId, 'export-readiness-validation'],
    queryFn: () => api.validateDraft(draftId),
    enabled: Boolean(draftId),
  });

  const hasPngCardImage = Boolean(
    draft?.assets.card_image || draft?.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,'),
  );
  const exportReadiness = buildExportReadinessSummary(draft, validation);
  const requiresAcknowledgement = exportReadiness.requiresAcknowledgement;

  useEffect(() => {
    setAcknowledgeWarnings(false);
  }, [draftId, requiresAcknowledgement]);

  useEffect(() => {
    document.body.classList.add('modal-open');

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleExport = async () => {
    if (!selectedPreset) return;

    setIsExporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const download = await api.exportDraft({
        draft_id: draftId,
        preset: selectedPreset,
        include_metadata: includeMetadata,
      });

      const result = await saveDownload(
        download,
        `${characterName.replace(/[^a-z0-9]/gi, '_')}_export.${selectedPreset === 'png' ? 'png' : selectedPreset === 'json' ? 'json' : selectedPreset === 'combined' ? 'md' : 'txt'}`,
      );

      if (result.saved) {
        switch (result.method) {
          case 'file-system-access':
            setSuccessMessage('Browser save dialog opened. Choose the filename and destination there.');
            break;
          case 'share':
            setSuccessMessage(
              'Share sheet opened. Choose Save to Files, Downloads, or another app to keep the export.',
            );
            break;
          case 'new-tab':
            setSuccessMessage(
              'Export opened in a new tab. Use the browser menu in that tab to save or share the file.',
            );
            break;
          case 'download':
            setSuccessMessage(
              'Export sent to the browser download flow. Check your browser download tray or downloads page.',
            );
            break;
          case 'tauri':
            setSuccessMessage('Save dialog opened. Choose the filename and destination there.');
            break;
          default:
            setSuccessMessage('Export prepared successfully.');
            break;
        }
      } else if (result.method === 'cancelled') {
        setErrorMessage('Export was cancelled before the browser could save or share the file.');
      }
    } catch (err) {
      console.error('Export failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <FileJson className="h-4 w-4" />;
      case 'combined':
        return <FileCode className="h-4 w-4" />;
      case 'png':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative flex h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-md flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg sm:h-auto sm:max-h-[min(80vh,48rem)]">
        {/* Header */}
        <div className="shrink-0 border-b border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Export Character</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <div className="space-y-4 pb-2">
            {/* Character Name */}
            <div>
              <label className="text-sm font-medium">Character</label>
              <p className="text-muted-foreground">{characterName}</p>
            </div>

            {/* Preset Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Preset</label>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading presets...</p>
              ) : error ? (
                <p className="text-sm text-destructive">Failed to load presets: {error.message}</p>
              ) : presets && presets.length > 0 ? (
                <div data-tour-anchor="export-preset-selection" className="space-y-2">
                  {presets.map((preset: ExportPresetOption) => {
                    const presetValue = preset.path || preset.name;

                    return (
                      <button
                        key={presetValue}
                        onClick={() => setSelectedPreset(presetValue)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          selectedPreset === presetValue
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-accent'
                        }`}
                      >
                        {getFormatIcon(preset.format ?? 'text')}
                        <div className="text-left">
                          <div className="font-medium">{preset.name}</div>
                          {preset.description && <p className="text-xs text-muted-foreground">{preset.description}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No presets available</p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded border-input"
                />
                Include metadata (creation date, model, tags)
              </label>
            </div>

            {selectedPreset === 'png' && !hasPngCardImage && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                PNG export needs an attached draft card image. Attach one from draft review first.
              </div>
            )}

            <section
              className={`rounded-lg border p-4 ${requiresAcknowledgement ? 'border-amber-500/40 bg-amber-500/10' : 'border-emerald-500/30 bg-emerald-500/10'}`}
            >
              <div className="flex items-start gap-3">
                {requiresAcknowledgement ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">Export readiness</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Export now reflects the current validation result plus saved review notes and scores.
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <div className="rounded-md border border-border/60 bg-background/70 px-3 py-2">
                  <div className="font-medium text-foreground">Validation</div>
                  <div className="mt-1">
                    {exportReadiness.validationState === 'checking'
                      ? 'Checking…'
                      : exportReadiness.validationState === 'passing'
                        ? 'Passing'
                        : 'Failing'}
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-background/70 px-3 py-2">
                  <div className="font-medium text-foreground">Reviewed assets</div>
                  <div className="mt-1">
                    {exportReadiness.reviewedAssetCount}/
                    {Object.keys(draft?.assets ?? {}).filter((assetName) => assetName !== 'card_image').length || 0}{' '}
                    scored
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-background/70 px-3 py-2">
                  <div className="font-medium text-foreground">Asset notes</div>
                  <div className="mt-1">{exportReadiness.assetNoteCount} saved</div>
                </div>
                <div className="rounded-md border border-border/60 bg-background/70 px-3 py-2">
                  <div className="font-medium text-foreground">Reviewer summary</div>
                  <div className="mt-1">{exportReadiness.reviewerSummary ? 'Present' : 'Not saved'}</div>
                </div>
              </div>

              {exportReadiness.blockingWarnings.length > 0 && (
                <div className="mt-3 space-y-2 rounded-md border border-amber-500/40 bg-background/60 p-3 text-xs text-amber-800 dark:text-amber-200">
                  {exportReadiness.blockingWarnings.map((warning) => (
                    <div key={warning}>{warning}</div>
                  ))}
                  {exportReadiness.lowScoreEntries.length > 0 && (
                    <div>
                      Low-score assets:{' '}
                      {exportReadiness.lowScoreEntries
                        .map(({ assetName, score }) => `${assetName.replace(/_/g, ' ')} (${score}/5)`)
                        .join(', ')}
                    </div>
                  )}
                  <label className="flex items-start gap-2 pt-1 text-foreground">
                    <input
                      type="checkbox"
                      checked={acknowledgeWarnings}
                      onChange={(event) => setAcknowledgeWarnings(event.target.checked)}
                      className="mt-0.5 rounded border-input"
                    />
                    <span>I understand these warnings and still want to export this draft.</span>
                  </label>
                </div>
              )}

              {!requiresAcknowledgement && exportReadiness.unratedAssetCount > 0 && (
                <div className="mt-3 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                  {exportReadiness.unratedAssetCount} asset{exportReadiness.unratedAssetCount === 1 ? '' : 's'} do not
                  have saved review scores yet. Export is still available, but the review checklist is not fully scored.
                </div>
              )}

              {!validation?.success && validation?.output && (
                <div className="mt-3 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                  {validation.output}
                </div>
              )}
            </section>

            <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Browser export is a handoff. Depending on device and browser, you may get a share sheet, new tab, or
              download tray instead of a filename dialog.
            </div>

            <section className="rounded-lg border border-dashed border-border bg-card/50 p-4">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold">Planned Export Extras</h3>
                  <p className="text-xs text-muted-foreground">
                    Preview and publishing hooks stay visible here until those flows are implemented.
                  </p>
                </div>
                <span className="app-pill app-pill-muted !px-2 !py-1 !text-[11px]">Planned</span>
              </div>

              <div className="space-y-3">
                <ExportPreviewPlaceholder draftId={draftId} presetName={selectedPreset || undefined} />
                <PublishingPlaceholder draftId={draftId} />
              </div>
            </section>

            {errorMessage && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={
                !selectedPreset ||
                isExporting ||
                (selectedPreset === 'png' && !hasPngCardImage) ||
                (requiresAcknowledgement && !acknowledgeWarnings)
              }
              data-tour-anchor="export-confirm"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
