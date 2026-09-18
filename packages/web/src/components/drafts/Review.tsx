import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star, Download, Archive, RotateCcw, Edit3, Check, X, ShieldCheck, Copy, ScissorsLineDashed } from 'lucide-react';
import { MAX_CONNECTED_DRAFT_REFERENCES, type DraftMetadata, type Template } from '@char-gen/shared';
import { api } from '@/lib/api';
import { getGuidedTour, REVIEW_EXPORT_TOUR_ID } from '@/lib/help';
import { pickFile } from '@/utils/download';
import CollapsibleSection from '../common/CollapsibleSection';
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

function formatAssetLabel(assetName: string): string {
  return assetName.replace(/_/g, ' ');
}

function summarizeText(content: string, maxLength = 180): string {
  const trimmed = content.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

function isVisibleDraftAsset(assetName: string): boolean {
  return assetName !== 'card_image';
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read PNG image'));
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  });
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
  const [pendingConnectedDraftId, setPendingConnectedDraftId] = useState('');
  const [editableConnectedDraftIds, setEditableConnectedDraftIds] = useState<string[]>([]);
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

  const { data: draftListData } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const template = useMemo(() => {
    if (!draft) {
      return undefined;
    }

    return templates.find((entry: Template) => entry.name === draft.metadata.template_name);
  }, [draft, templates]);

  const relatedDraftLookup = useMemo(
    () => new Map((draftListData?.drafts ?? []).map((entry) => [entry.review_id, entry] as const)),
    [draftListData]
  );
  const availableConnectedDrafts = useMemo(
    () => (draftListData?.drafts ?? []).filter((entry) => entry.review_id !== reviewId && !editableConnectedDraftIds.includes(entry.review_id)),
    [draftListData, editableConnectedDraftIds, reviewId]
  );
  const hasConnectedDraftChanges = useMemo(() => {
    const saved = draft?.metadata.connected_drafts ?? [];
    if (saved.length !== editableConnectedDraftIds.length) {
      return true;
    }

    return saved.some((draftId, index) => draftId !== editableConnectedDraftIds[index]);
  }, [draft?.metadata.connected_drafts, editableConnectedDraftIds]);

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
      if (seenAssets.has(assetName) || !isVisibleDraftAsset(assetName)) {
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
    connected_character_count: draft?.metadata.connected_drafts?.length ?? 0,
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

  const handleAddConnectedDraft = () => {
    if (!pendingConnectedDraftId) {
      return;
    }

    setEditableConnectedDraftIds((previous) => {
      if (previous.includes(pendingConnectedDraftId) || previous.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
        return previous;
      }

      return [...previous, pendingConnectedDraftId];
    });
    setPendingConnectedDraftId('');
  };

  const handleRemoveConnectedDraft = (draftId: string) => {
    setEditableConnectedDraftIds((previous) => previous.filter((candidate) => candidate !== draftId));
  };

  const handleSaveConnectedDrafts = async () => {
    await saveDraftSendConfig.mutateAsync({
      connected_drafts: editableConnectedDraftIds,
    });
  };

  const handleResetConnectedDrafts = () => {
    if (!draft) {
      return;
    }

    setEditableConnectedDraftIds(draft.metadata.connected_drafts ?? []);
    setPendingConnectedDraftId('');
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

  const handleAttachCardImage = async () => {
    try {
      const file = await pickFile({ accept: '.png,image/png' });
      if (!file || !draft) {
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);
      if (!dataUrl.startsWith('data:image/png;base64,')) {
        setAssetActionError('Only PNG images are supported for card export.');
        return;
      }

      await saveAsset.mutateAsync({
        assetName: 'card_image',
        content: dataUrl,
        expectedPreviousContent: Object.prototype.hasOwnProperty.call(draft.assets, 'card_image') ? draft.assets.card_image : null,
        overwrite: Object.prototype.hasOwnProperty.call(draft.assets, 'card_image'),
      });

      const nextCardMetadata = {
        ...(draft.metadata.card_metadata ?? {}),
        avatar: dataUrl,
      };

      await saveDraftSendConfig.mutateAsync({
        card_metadata: nextCardMetadata,
      });
      setAssetActionError(null);
    } catch (error) {
      setAssetActionError(error instanceof Error ? error.message : 'Failed to attach PNG image.');
    }
  };

  const handleClearCardImage = async () => {
    if (!draft) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(draft.assets, 'card_image')) {
      await saveAsset.mutateAsync({
        assetName: 'card_image',
        content: '',
        expectedPreviousContent: draft.assets.card_image,
        overwrite: true,
      });
    }

    if (draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) {
      const nextCardMetadata = { ...draft.metadata.card_metadata };
      delete nextCardMetadata.avatar;
      await saveDraftSendConfig.mutateAsync({
        card_metadata: Object.keys(nextCardMetadata).length > 0 ? nextCardMetadata : undefined,
      });
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

  useEffect(() => {
    if (!draft) {
      return;
    }

    setEditableConnectedDraftIds(draft.metadata.connected_drafts ?? []);
    setPendingConnectedDraftId('');
  }, [draft]);

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

  const assetNames = Object.keys(draft.assets).filter(isVisibleDraftAsset);
  const missingAssetCount = assetEntries.filter((asset) => !asset.exists).length;
  const assetCountLabel = template ? `${assetNames.length}/${template.assets.length}` : `${assetNames.length}`;
  const overviewPreview = [`${assetCountLabel} assets`, draft.metadata.mode, draft.metadata.template_name, draft.metadata.genre]
    .filter(Boolean)
    .join(' • ');

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

          <div className="app-panel-muted min-w-0 p-3.5 sm:p-5">
            <p className="app-page-eyebrow">Draft state</p>
            <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
              <span className="app-pill app-pill-muted">{assetCountLabel} assets</span>
              {draft.metadata.mode ? <span className="app-pill app-pill-muted">{draft.metadata.mode}</span> : null}
              {draft.metadata.template_name ? <span className="app-pill app-pill-muted">{draft.metadata.template_name}</span> : null}
              {draft.metadata.genre ? <span className="app-pill app-pill-muted">{draft.metadata.genre}</span> : null}
            </div>
            <div className="mt-4 hidden sm:grid app-page-metrics">
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

      <CollapsibleSection
        title="Overview"
        subtitle="Tags, validation, lineage, and archive state"
        preview={overviewPreview || 'No extra metadata'}
        defaultExpanded={Boolean(validationMessage || draft.metadata.parent_drafts?.length || draft.metadata.archived_at)}
        density="compact"
        className="app-panel"
        bodyClassName="space-y-2.5"
      >
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

        {validationMessage ? (
          <div className="app-note p-4 text-sm">
            {validationMessage}. <Link to="/validation" className="text-primary hover:underline">Open Validation screen</Link>
          </div>
        ) : null}

        {missingAssetCount > 0 ? (
          <div className="app-note border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
            This draft is missing {missingAssetCount} template asset{missingAssetCount === 1 ? '' : 's'}. {missingAssetCount === 1 ? 'Create it' : 'Create them'} with AI from the existing draft context or add {missingAssetCount === 1 ? 'it' : 'them'} manually before export.
          </div>
        ) : null}

        {draft.metadata.parent_drafts && draft.metadata.parent_drafts.length > 0 ? (
          <div className="app-note px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Lineage:</span>{' '}
            Offspring of: {draft.metadata.parent_drafts.join(' + ')}
          </div>
        ) : null}

        {draft.metadata.archived_at ? (
          <div className="app-note px-4 py-3 text-sm text-muted-foreground">
            Archived {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(draft.metadata.archived_at))}
          </div>
        ) : null}

        <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium text-foreground">Draft card image</div>
              <div className="mt-1 text-muted-foreground">
                {draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')
                  ? 'PNG card image attached. Standard PNG card export is available.'
                  : 'No PNG card image attached yet. PNG export needs one.'}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleAttachCardImage()}
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                Attach PNG image
              </button>
              {(draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) && (
                <button
                  type="button"
                  onClick={() => void handleClearCardImage()}
                  className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
                >
                  Clear image
                </button>
              )}
            </div>
          </div>
          {(draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) && (
            <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-background/60 p-3">
              <img
                src={draft.assets.card_image || draft.metadata.card_metadata?.avatar || ''}
                alt={`${draft.metadata.character_name || draft.metadata.seed} card image`}
                className="mx-auto max-h-72 rounded-lg object-contain"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {assetActionError && (
        <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {assetActionError}
        </div>
      )}

      <div data-tour-anchor="review-assets" className="space-y-2.5 sm:space-y-3">
        {assetEntries.map((assetEntry) => {
          const assetName = assetEntry.name;
          const assetExists = assetEntry.exists;
          const assetLabel = formatAssetLabel(assetName);
          const assetPreview = editingAsset === assetName
            ? 'Editing asset content'
            : assetExists
              ? summarizeText(draft.assets[assetName])
              : 'No saved content yet';

          return (
            <CollapsibleSection
              key={assetName}
              title={assetLabel}
              subtitle={assetEntry.description}
              preview={assetPreview}
              defaultExpanded={false}
              forceExpanded={editingAsset === assetName}
              density="compact"
              className="app-panel"
              bodyClassName="space-y-2.5"
            >
              {(assetEntry.required || !assetExists) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {!assetExists && (
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
                      Missing
                    </span>
                  )}
                  {assetEntry.required && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary-foreground">
                      Req
                    </span>
                  )}
                </div>
              )}

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
                <Link
                  to={`/optimize?draft=${encodeURIComponent(reviewId)}&asset=${encodeURIComponent(assetName)}&text=${encodeURIComponent(editingAsset === assetName ? editContent : draft.assets[assetName] ?? '')}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
                >
                  <ScissorsLineDashed className="h-3 w-3" />
                  Optimize
                </Link>
                {editingAsset !== assetName && (
                  <button
                    onClick={() => handleEditAsset(assetName)}
                    className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
                  >
                    <Edit3 className="h-3 w-3" />
                    {assetExists ? 'Edit' : 'Add manually'}
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-border/60 bg-background/45 p-2 sm:p-2.5">
                {editingAsset === assetName ? (
                  <div className="space-y-3">
                    <textarea
                      aria-label={`${assetLabel} content`}
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
                ) : assetExists ? (
                  <pre className="max-h-[24rem] overflow-auto whitespace-pre-wrap break-words text-xs leading-5 font-mono">
                    {draft.assets[assetName]}
                  </pre>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/70 bg-background/40 p-3 text-sm text-muted-foreground">
                    Not saved yet. Create it with AI using the existing draft context, or add it manually here.
                  </div>
                )}
              </div>
            </CollapsibleSection>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <CollapsibleSection
          title="Connected references"
          subtitle={`Attach up to ${MAX_CONNECTED_DRAFT_REFERENCES} saved drafts to this draft`}
          preview={editableConnectedDraftIds.length > 0
            ? editableConnectedDraftIds.map((draftId) => relatedDraftLookup.get(draftId)?.character_name || draftId).join(' • ')
            : 'None saved'}
          defaultExpanded={false}
          forceExpanded={hasConnectedDraftChanges}
          density="compact"
          className="app-panel"
          bodyClassName="space-y-2.5"
        >
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Connected characters:</span>{' '}
            {editableConnectedDraftIds.length > 0 ? editableConnectedDraftIds.map((draftId, index) => (
              <span key={draftId}>
                {index > 0 ? ', ' : ''}
                <Link to={`/drafts/${encodeURIComponent(draftId)}`} className="text-primary hover:underline">
                  {relatedDraftLookup.get(draftId)?.character_name || draftId}
                </Link>
              </span>
            )) : 'None saved'}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={pendingConnectedDraftId}
              onChange={(event) => setPendingConnectedDraftId(event.target.value)}
              disabled={saveDraftSendConfig.isPending || availableConnectedDrafts.length === 0 || editableConnectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES}
              aria-label="Review connected draft reference"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">Add a saved draft...</option>
              {availableConnectedDrafts.map((entry) => (
                <option key={entry.review_id} value={entry.review_id}>
                  {entry.character_name || entry.review_id}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddConnectedDraft}
              disabled={!pendingConnectedDraftId || saveDraftSendConfig.isPending || editableConnectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              Add reference
            </button>
          </div>

          {editableConnectedDraftIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {editableConnectedDraftIds.map((draftId) => (
                <span key={draftId} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
                  {relatedDraftLookup.get(draftId)?.character_name || draftId}
                  <button
                    type="button"
                    onClick={() => handleRemoveConnectedDraft(draftId)}
                    disabled={saveDraftSendConfig.isPending}
                    aria-label={`Remove ${(relatedDraftLookup.get(draftId)?.character_name || draftId)}`}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleSaveConnectedDrafts()}
              disabled={!hasConnectedDraftChanges || saveDraftSendConfig.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save references
            </button>
            <button
              type="button"
              onClick={handleResetConnectedDrafts}
              disabled={!hasConnectedDraftChanges || saveDraftSendConfig.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </CollapsibleSection>

        <DraftSendConfigPanel
          draft={draft}
          template={template}
          onSave={async (updates) => {
            await saveDraftSendConfig.mutateAsync(updates);
          }}
          isSaving={saveDraftSendConfig.isPending}
          description="Saved instructions and outbound component order for later refinement or regeneration."
        />
      </div>

      <CollapsibleSection
        title="Review aids"
        subtitle="Checklist and local activity panels"
        preview="Secondary"
        density="compact"
        className="app-panel"
      >
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ReviewChecklistPanel draftId={reviewId} />
          <VersionHistoryPanel draftId={reviewId} />
        </div>
      </CollapsibleSection>

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
