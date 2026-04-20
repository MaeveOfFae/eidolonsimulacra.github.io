import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star, Download, Archive, RotateCcw, Edit3, Check, X, ShieldCheck, ChevronDown, Copy } from 'lucide-react';
import type { DraftMetadata, Template } from '@char-gen/shared';
import { api } from '@/lib/api';
import { getGuidedTour, REVIEW_EXPORT_TOUR_ID } from '@/lib/help';
import ExportModal from '../common/ExportModal';
import ChatPanel from '../common/ChatPanel';
import { useGuidedTour } from '../common/GuidedTourContext';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import DraftSendConfigPanel from './DraftSendConfigPanel';
import ReviewChecklistPanel from './ReviewChecklistPanel';
import VersionHistoryPanel from './VersionHistoryPanel';

interface ReviewAssetEntry {
  name: string;
  exists: boolean;
  description?: string;
  required?: boolean;
}

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingBaseContent, setEditingBaseContent] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedAsset, setCopiedAsset] = useState<string | null>(null);
  const [assetActionError, setAssetActionError] = useState<string | null>(null);
  const [tourManagedExportModal, setTourManagedExportModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { activeStepIndex, activeTourId } = useGuidedTour();
  const queryClient = useQueryClient();
  const invalidateDraftQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['draft', id] });
    queryClient.invalidateQueries({ queryKey: ['drafts'] });
  };

  const reviewId = decodeURIComponent(id || '');

  const { data: draft, isLoading, error } = useQuery({
    queryKey: ['draft', id],
    queryFn: () => api.getDraft(reviewId),
    enabled: !!id,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const template = useMemo(() => {
    if (!draft) {
      return undefined;
    }

    return templates.find((entry: Template) => entry.name === draft.metadata.template_name);
  }, [draft, templates]);

  const assetEntries = useMemo((): ReviewAssetEntry[] => {
    if (!draft) {
      return [];
    }

    const entries: ReviewAssetEntry[] = [];
    const seenAssets = new Set<string>();

    if (template) {
      for (const asset of template.assets) {
        entries.push({
          name: asset.name,
          exists: Object.prototype.hasOwnProperty.call(draft.assets, asset.name),
          description: asset.description,
          required: asset.required,
        });
        seenAssets.add(asset.name);
      }
    }

    for (const assetName of Object.keys(draft.assets)) {
      if (seenAssets.has(assetName)) {
        continue;
      }

      entries.push({
        name: assetName,
        exists: true,
      });
    }

    return entries;
  }, [draft, template]);

  const toggleFavorite = useMutation({
    mutationFn: () => api.updateMetadata(reviewId, {
      favorite: !draft?.metadata.favorite,
    }),
    onSuccess: () => {
      invalidateDraftQueries();
    },
  });

  const archiveDraft = useMutation({
    mutationFn: () => draft?.metadata.archived_at ? api.restoreDraft(reviewId) : api.archiveDraft(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.invalidateQueries({ queryKey: ['drafts', 'archived'] });
      if (draft?.metadata.archived_at) {
        return;
      }
      navigate('/drafts?tab=archive');
    },
  });

  const updateMetadata = useMutation({
    mutationFn: (metadata: { character_name?: string }) => api.updateMetadata(reviewId, metadata),
    onSuccess: () => {
      invalidateDraftQueries();
      setIsEditingName(false);
    },
  });

  const saveDraftSendConfig = useMutation({
    mutationFn: (metadata: Partial<DraftMetadata>) => api.updateMetadata(reviewId, metadata),
    onSuccess: () => {
      invalidateDraftQueries();
    },
  });

  const saveAsset = useMutation({
    mutationFn: ({
      assetName,
      content,
      expectedPreviousContent,
      overwrite,
    }: {
      assetName: string;
      content: string;
      expectedPreviousContent: string | null;
      overwrite: boolean;
    }) => api.updateAsset(reviewId, assetName, content, {
      expectedPreviousContent,
      overwrite,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      setEditingAsset(null);
      setEditingBaseContent(null);
      setEditContent('');
      setAssetActionError(null);
    },
    onError: (mutationError: Error) => {
      setAssetActionError(mutationError.message);
    },
  });

  const validateDraft = useMutation({
    mutationFn: () => api.validateDraft(reviewId),
    onSuccess: (result) => {
      setValidationMessage(result.success ? 'Validation passed' : 'Validation failed');
    },
    onError: (mutationError: Error) => {
      setValidationMessage(mutationError.message);
    },
  });

  useAssistantScreenContext({
    draft_id: reviewId,
    character_name: draft?.metadata.character_name || '',
    mode: draft?.metadata.mode || '',
    template_name: draft?.metadata.template_name || '',
    asset_names: draft ? Object.keys(draft.assets) : [],
    editing_asset: editingAsset || '',
    favorite: draft?.metadata.favorite ?? false,
    has_lineage: Boolean(draft?.metadata.parent_drafts?.length),
  });

  const handleEditAsset = (assetName: string) => {
    if (!draft) {
      return;
    }

    const baseContent = Object.prototype.hasOwnProperty.call(draft.assets, assetName)
      ? draft.assets[assetName]
      : null;

    setEditingAsset(assetName);
    setEditingBaseContent(baseContent);
    setEditContent(baseContent ?? '');
    setAssetActionError(null);
  };

  const handleEditName = () => {
    setEditName(draft?.metadata.character_name || '');
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    updateMetadata.mutate({
      character_name: editName.trim() || undefined,
    });
  };

  const handleCancelNameEdit = () => {
    setIsEditingName(false);
    setEditName('');
  };

  const handleSaveAsset = () => {
    if (editingAsset) {
      saveAsset.mutate({
        assetName: editingAsset,
        content: editContent,
        expectedPreviousContent: editingBaseContent,
        overwrite: editingBaseContent !== null,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingAsset(null);
    setEditingBaseContent(null);
    setEditContent('');
    setAssetActionError(null);
  };

  const handleAssetRefined = (assetName: string, newContent: string) => {
    const expectedPreviousContent = draft && Object.prototype.hasOwnProperty.call(draft.assets, assetName)
      ? draft.assets[assetName]
      : null;

    saveAsset.mutate({
      assetName,
      content: newContent,
      expectedPreviousContent,
      overwrite: expectedPreviousContent !== null,
    });
  };

  const handleCopyAsset = async (assetName: string) => {
    const content = editingAsset === assetName ? editContent : draft?.assets[assetName] ?? '';

    try {
      await navigator.clipboard.writeText(content);
      setCopiedAsset(assetName);
      window.setTimeout(() => {
        setCopiedAsset((currentAsset) => (currentAsset === assetName ? null : currentAsset));
      }, 1600);
    } catch (copyError) {
      console.error('Failed to copy asset', copyError);
    }
  };

  useEffect(() => {
    if (activeTourId !== REVIEW_EXPORT_TOUR_ID) {
      if (tourManagedExportModal && showExportModal) {
        setShowExportModal(false);
      }
      if (tourManagedExportModal) {
        setTourManagedExportModal(false);
      }
      return;
    }

    const activeStep = getGuidedTour(activeTourId)?.steps[activeStepIndex];
    const needsExportModal = activeStep?.targetId === 'export-preset-selection' || activeStep?.targetId === 'export-confirm';

    if (needsExportModal && !showExportModal) {
      setTourManagedExportModal(true);
      setShowExportModal(true);
      return;
    }

    if (!needsExportModal && showExportModal && tourManagedExportModal) {
      setShowExportModal(false);
      setTourManagedExportModal(false);
    }
  }, [activeStepIndex, activeTourId, showExportModal, tourManagedExportModal]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading draft...</div>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="space-y-4">
        <Link
          to="/drafts"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Error loading draft
        </div>
      </div>
    );
  }

  const assetNames = Object.keys(draft.assets);
  const missingAssetCount = assetEntries.filter((asset) => !asset.exists).length;
  const assetCountLabel = template ? `${assetNames.length}/${template.assets.length}` : `${assetNames.length}`;

  return (
    <div className="app-page space-y-5 pb-10 sm:space-y-6 sm:pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-2.5 sm:space-y-3">
            <Link
              to="/drafts"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Link>
            <p className="app-page-eyebrow">Review</p>
            {isEditingName ? (
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  placeholder="Character name"
                  className="w-full min-w-0 rounded-xl border border-input bg-background px-3 py-2 text-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-[18rem] sm:text-2xl"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={updateMetadata.isPending}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  Save Name
                </button>
                <button
                  onClick={handleCancelNameEdit}
                  disabled={updateMetadata.isPending}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <h1 className="app-page-title text-[clamp(2rem,4vw,3.4rem)]">
                  {draft.metadata.character_name || draft.metadata.seed}
                </h1>
                <button
                  onClick={handleEditName}
                  className="inline-flex items-center gap-1 rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit Name
                </button>
              </div>
            )}
            <p className="app-page-summary max-w-4xl">{draft.metadata.seed}</p>
          </div>

          <div className="app-panel-muted min-w-0 p-4 sm:p-5">
            <p className="app-page-eyebrow">Draft state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Assets</p>
                <div className="app-page-metric-value text-2xl">{assetCountLabel}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Mode</p>
                <div className="app-page-metric-value text-xl sm:text-2xl">{draft.metadata.mode || 'Unset'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Template</p>
                <div className="app-page-metric-value text-base sm:text-xl">{draft.metadata.template_name || 'Unset'}</div>
              </div>
            </div>

            <div data-tour-anchor="review-actions" className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:flex-wrap">
              <button
                onClick={() => validateDraft.mutate()}
                data-tour-anchor="review-validate"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
              >
                <ShieldCheck className="h-4 w-4" />
                Validate
              </button>
              <button
                onClick={() => toggleFavorite.mutate()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
              >
                <Star className={`h-4 w-4 ${draft.metadata.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                {draft.metadata.favorite ? 'Favorited' : 'Favorite'}
              </button>
              <button
                onClick={() => {
                  setTourManagedExportModal(false);
                  setShowExportModal(true);
                }}
                data-tour-anchor="review-export"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => archiveDraft.mutate()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
              >
                {draft.metadata.archived_at ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                {draft.metadata.archived_at ? 'Restore' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
        {draft.metadata.mode && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary sm:px-3 sm:text-sm">
            {draft.metadata.mode}
          </span>
        )}
        {draft.metadata.template_name && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs sm:px-3 sm:text-sm">
            {draft.metadata.template_name}
          </span>
        )}
        {draft.metadata.genre && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs sm:px-3 sm:text-sm">
            {draft.metadata.genre}
          </span>
        )}
        {draft.metadata.tags?.map((tag) => (
          <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs sm:px-3 sm:text-sm">
            {tag}
          </span>
        ))}
      </div>

      {validationMessage && (
        <div className="app-note p-4 text-sm">
          {validationMessage}. <Link to="/validation" className="text-primary hover:underline">Open Validation screen</Link>
        </div>
      )}

      {missingAssetCount > 0 && (
        <div className="app-note border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          This draft is missing {missingAssetCount} template asset{missingAssetCount === 1 ? '' : 's'}. {missingAssetCount === 1 ? 'Create it' : 'Create them'} with AI from the existing draft context or add {missingAssetCount === 1 ? 'it' : 'them'} manually before export.
        </div>
      )}

      {draft.metadata.parent_drafts && draft.metadata.parent_drafts.length > 0 && (
        <div className="app-note px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Lineage:</span>{' '}
            Offspring of: {draft.metadata.parent_drafts.join(' + ')}
        </div>
      )}

      {draft.metadata.archived_at && (
        <div className="app-note px-4 py-3 text-sm text-muted-foreground">
          Archived {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(draft.metadata.archived_at))}
        </div>
      )}

      <DraftSendConfigPanel
        draft={draft}
        template={template}
        onSave={async (updates) => {
          await saveDraftSendConfig.mutateAsync(updates);
        }}
        isSaving={saveDraftSendConfig.isPending}
        description="Set persistent instructions and outbound component order for later refinement or regeneration of this saved draft."
      />

      {assetActionError && (
        <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {assetActionError}
        </div>
      )}

      <div data-tour-anchor="review-assets" className="space-y-2.5 sm:space-y-3">
        {assetEntries.map((assetEntry) => {
          const assetName = assetEntry.name;
          const assetExists = assetEntry.exists;

          return (
          <div key={assetName} className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold capitalize" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                    {assetName.replace(/_/g, ' ')}
                  </h2>
                  {!assetExists && (
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                      Missing
                    </span>
                  )}
                  {assetEntry.required && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-secondary-foreground">
                      Required
                    </span>
                  )}
                </div>
                {assetEntry.description && (
                  <p className="text-xs text-muted-foreground">{assetEntry.description}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {assetExists && (
                  <button
                    onClick={() => void handleCopyAsset(assetName)}
                    className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
                  >
                    {copiedAsset === assetName ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedAsset === assetName ? 'Copied' : 'Copy'}
                  </button>
                )}
                <Link
                  to={`/drafts/${encodeURIComponent(reviewId)}/assets/${encodeURIComponent(assetName)}/regenerate`}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
                >
                  <ArrowLeft className="h-3 w-3 rotate-180" />
                  {assetExists ? 'Regen' : 'Create with AI'}
                </Link>
                {editingAsset !== assetName && (
                  <button
                    onClick={() => handleEditAsset(assetName)}
                    className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
                  >
                    <Edit3 className="h-3 w-3" />
                    {assetExists ? 'Edit' : 'Add Manually'}
                  </button>
                )}
              </div>
            </div>
            <div className="app-panel min-w-0 overflow-hidden p-2.5 sm:p-3">
              {editingAsset === assetName ? (
                <div className="space-y-3">
                  <textarea
                    aria-label={`${assetName.replace(/_/g, ' ')} content`}
                    value={editContent}
                    onChange={(event) => setEditContent(event.target.value)}
                    className="min-h-[160px] w-full min-w-0 rounded-xl border border-input bg-background p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[180px]"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={handleSaveAsset}
                      disabled={saveAsset.isPending}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {saveAsset.isPending ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {editingBaseContent === null ? 'Create Asset' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                assetExists ? (
                  <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words text-xs leading-5 font-mono sm:leading-6">
                    {draft.assets[assetName]}
                  </pre>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
                    This asset was not present in the imported draft. Create it with AI using the existing seed and prior assets, or add it manually here.
                  </div>
                )
              )}
            </div>
          </div>
        )})}
      </div>

      <details className="app-panel group p-4 sm:p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Review aids</h2>
            <p className="text-sm text-muted-foreground">
              Checklist and local activity panels.
            </p>
          </div>
          <span className="app-pill app-pill-muted">
            Secondary
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
          </span>
        </summary>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ReviewChecklistPanel draftId={reviewId} />
          <VersionHistoryPanel draftId={reviewId} />
        </div>
      </details>

      {showExportModal && (
        <ExportModal
          draftId={reviewId}
          characterName={draft.metadata.character_name || draft.metadata.seed}
          onClose={() => {
            setShowExportModal(false);
            setTourManagedExportModal(false);
          }}
        />
      )}

      <ChatPanel
        draftId={reviewId}
        onAssetRefined={handleAssetRefined}
      />
    </div>
  );
}
