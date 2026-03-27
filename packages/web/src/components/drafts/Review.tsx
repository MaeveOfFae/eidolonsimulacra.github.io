import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star, Download, Trash2, Edit3, Check, X, ShieldCheck, ChevronDown, Copy } from 'lucide-react';
import { api } from '@/lib/api';
import { getGuidedTour, REVIEW_EXPORT_TOUR_ID } from '@/lib/help';
import ExportModal from '../common/ExportModal';
import ChatPanel from '../common/ChatPanel';
import { useGuidedTour } from '../common/GuidedTourContext';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import ReviewChecklistPanel from './ReviewChecklistPanel';
import VersionHistoryPanel from './VersionHistoryPanel';

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedAsset, setCopiedAsset] = useState<string | null>(null);
  const [tourManagedExportModal, setTourManagedExportModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { activeStepIndex, activeTourId } = useGuidedTour();
  const queryClient = useQueryClient();

  const reviewId = decodeURIComponent(id || '');

  const { data: draft, isLoading, error } = useQuery({
    queryKey: ['draft', id],
    queryFn: () => api.getDraft(reviewId),
    enabled: !!id,
  });

  const toggleFavorite = useMutation({
    mutationFn: () => api.updateMetadata(reviewId, {
      favorite: !draft?.metadata.favorite,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });

  const deleteDraft = useMutation({
    mutationFn: () => api.deleteDraft(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      navigate('/drafts');
    },
  });

  const updateMetadata = useMutation({
    mutationFn: (metadata: { character_name?: string }) => api.updateMetadata(reviewId, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      setIsEditingName(false);
    },
  });

  const saveAsset = useMutation({
    mutationFn: ({ assetName, content }: { assetName: string; content: string }) => api.updateAsset(reviewId, assetName, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      setEditingAsset(null);
      setEditContent('');
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

    setEditingAsset(assetName);
    setEditContent(draft.assets[assetName]);
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
      saveAsset.mutate({ assetName: editingAsset, content: editContent });
    }
  };

  const handleCancelEdit = () => {
    setEditingAsset(null);
    setEditContent('');
  };

  const handleAssetRefined = (assetName: string, newContent: string) => {
    saveAsset.mutate({ assetName, content: newContent });
  };

  const handleCopyAsset = async (assetName: string) => {
    const content = editingAsset === assetName ? editContent : draft.assets[assetName];

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
          Back to Drafts
        </Link>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Error loading draft
        </div>
      </div>
    );
  }

  const assetNames = Object.keys(draft.assets);

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
              Back to Drafts
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
                <div className="app-page-metric-value text-2xl">{assetNames.length}</div>
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
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive hover:bg-destructive/20 sm:justify-start"
              >
                <Trash2 className="h-4 w-4" />
                Delete
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

      {draft.metadata.parent_drafts && draft.metadata.parent_drafts.length > 0 && (
        <div className="app-note px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Lineage:</span>{' '}
            Offspring of: {draft.metadata.parent_drafts.join(' + ')}
        </div>
      )}

      <div data-tour-anchor="review-assets" className="space-y-2.5 sm:space-y-3">
        {assetNames.map((assetName) => (
          <div key={assetName} className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold capitalize" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                {assetName.replace(/_/g, ' ')}
              </h2>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  onClick={() => void handleCopyAsset(assetName)}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
                >
                  {copiedAsset === assetName ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedAsset === assetName ? 'Copied' : 'Copy'}
                </button>
                <Link
                  to={`/drafts/${encodeURIComponent(reviewId)}/assets/${encodeURIComponent(assetName)}/regenerate`}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
                >
                  <ArrowLeft className="h-3 w-3 rotate-180" />
                  Regen
                </Link>
                {editingAsset !== assetName && (
                  <button
                    onClick={() => handleEditAsset(assetName)}
                    className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="app-panel min-w-0 overflow-hidden p-2.5 sm:p-3">
              {editingAsset === assetName ? (
                <div className="space-y-3">
                  <textarea
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
                      Save
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
                <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words text-xs leading-5 font-mono sm:leading-6">
                  {draft.assets[assetName]}
                </pre>
              )}
            </div>
          </div>
        ))}
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Delete Draft</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Delete this draft and all of its saved assets? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteDraft.isPending}
                className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  deleteDraft.mutate();
                }}
                disabled={deleteDraft.isPending}
                className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteDraft.isPending ? 'Deleting...' : 'Delete Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatPanel
        draftId={reviewId}
        onAssetRefined={handleAssetRefined}
      />
    </div>
  );
}
