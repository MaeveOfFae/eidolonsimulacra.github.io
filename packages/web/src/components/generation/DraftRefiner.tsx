import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RotateCcw,
  Save,
  Loader2,
  FileText,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import DraftSendConfigPanel from '@/components/drafts/DraftSendConfigPanel';
import {
  buildDraftPriorAssets,
  mergeDraftAdditionalInstructions,
} from '@/lib/drafts/send-config';
import { GenerationService } from '@/lib/services/generation';
import {
  clearActiveDraftRefinerSession,
  type ActiveDraftRefinerAssetState,
  loadActiveDraftRefinerSession,
  saveActiveDraftRefinerSession,
} from '@/lib/services/generation-session';
import { unwrapSingleCodeFence } from '@/lib/content-format';
import type { Draft, DraftMetadata, Template } from '@char-gen/shared';

interface DraftRefinerProps {
  templates: Template[];
}

interface AssetRegenerationState {
  assetName: string;
  status: 'idle' | 'generating' | 'reviewing' | 'saving';
  content: string;
  originalContent: string;
  storedContent: string | null;
}

interface DraftAssetEntry {
  name: string;
  exists: boolean;
  required?: boolean;
  description?: string;
}

function draftHasAsset(draft: Draft | undefined, assetName: string): boolean {
  return Boolean(draft && Object.prototype.hasOwnProperty.call(draft.assets, assetName));
}

export default function DraftRefiner({ templates }: DraftRefinerProps) {
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [assetStates, setAssetStates] = useState<Record<string, AssetRegenerationState>>({});
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [transientInstructions, setTransientInstructions] = useState('');
  const [refinerError, setRefinerError] = useState<string | null>(null);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const restoredSessionRef = useRef(loadActiveDraftRefinerSession());
  const queryClient = useQueryClient();

  // Fetch all drafts for selection
  const { data: draftsResponse } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  // Fetch selected draft details
  const { data: draft, isLoading: draftLoading } = useQuery({
    queryKey: ['draft', selectedDraftId],
    queryFn: () => api.getDraft(selectedDraftId),
    enabled: !!selectedDraftId,
  });

  // Get template for the selected draft
  const draftTemplate = useMemo(() => {
    if (!draft || !templates.length) return undefined;
    return templates.find((t) => t.name === draft.metadata.template_name);
  }, [draft, templates]);

  const assetEntries = useMemo((): DraftAssetEntry[] => {
    if (!draft) {
      return [];
    }

    const entries: DraftAssetEntry[] = [];
    const seenAssets = new Set<string>();

    if (draftTemplate) {
      for (const asset of draftTemplate.assets) {
        entries.push({
          name: asset.name,
          exists: draftHasAsset(draft, asset.name),
          required: asset.required,
          description: asset.description,
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
  }, [draft, draftTemplate]);

  const assetNames = useMemo(() => assetEntries.map((asset) => asset.name), [assetEntries]);
  const missingAssetCount = useMemo(() => assetEntries.filter((asset) => !asset.exists).length, [assetEntries]);

  useEffect(() => {
    const session = restoredSessionRef.current;
    if (!session) {
      return;
    }

    setSelectedDraftId(session.selectedDraftId);
    setTransientInstructions(session.transientInstructions ?? '');
    setAssetStates(
      Object.fromEntries(
        Object.entries(session.assetStates).map(([assetName, state]) => [
          assetName,
          {
            assetName: state.assetName,
            status: state.status,
            content: state.content,
            originalContent: state.originalContent,
            storedContent: state.storedContent ?? state.originalContent,
          },
        ])
      )
    );
    setExpandedAssets(new Set(session.expandedAssets));
    setEditingAsset(session.editingAsset);
    setEditContent(session.editContent);
    setRefinerError(null);

    if (session.interrupted) {
      setResumeNotice('Draft refinement was interrupted. Restored your editable snapshot.');
    } else if (session.editingAsset) {
      setResumeNotice('Restored draft refinement edit in progress.');
    } else if (Object.values(session.assetStates).some((state) => state.status === 'reviewing' || state.content !== state.originalContent)) {
      setResumeNotice('Restored draft refinement changes for review.');
    } else if (session.selectedDraftId) {
      setResumeNotice('Restored selected draft.');
    }

    restoredSessionRef.current = null;
  }, []);

  // Initialize asset states when draft loads
  useEffect(() => {
    if (!draft) {
      return;
    }

    setAssetStates((previous) => {
      const nextStates: Record<string, AssetRegenerationState> = {};

      for (const assetEntry of assetEntries) {
        const draftContent = draftHasAsset(draft, assetEntry.name) ? draft.assets[assetEntry.name] : '';
        const previousState = previous[assetEntry.name];

        if (previousState) {
          nextStates[assetEntry.name] = {
            ...previousState,
            assetName: assetEntry.name,
            storedContent: previousState.storedContent ?? (draftHasAsset(draft, assetEntry.name) ? draftContent : null),
          };
          continue;
        }

        nextStates[assetEntry.name] = {
          assetName: assetEntry.name,
          status: 'idle',
          content: draftContent,
          originalContent: draftContent,
          storedContent: draftHasAsset(draft, assetEntry.name) ? draftContent : null,
        };
      }

      return nextStates;
    });
  }, [assetEntries, draft]);

  // Update asset mutation
  const updateAsset = useMutation({
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
    }) => api.updateAsset(selectedDraftId, assetName, content, {
      expectedPreviousContent,
      overwrite,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', selectedDraftId] });
      setRefinerError(null);
    },
    onError: (error: Error) => {
      setRefinerError(error.message);
    },
  });

  const updateMetadata = useMutation({
    mutationFn: (metadata: Partial<DraftMetadata>) => api.updateMetadata(selectedDraftId, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', selectedDraftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      setRefinerError(null);
    },
    onError: (error: Error) => {
      setRefinerError(error.message);
    },
  });

  // Toggle asset expansion
  const toggleExpand = useCallback((assetName: string) => {
    setExpandedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(assetName)) {
        next.delete(assetName);
      } else {
        next.add(assetName);
      }
      return next;
    });
  }, []);

  // Start editing an asset
  const startEditing = useCallback((assetName: string) => {
    if (draft) {
      setEditingAsset(assetName);
      setEditContent(draft.assets[assetName] ?? assetStates[assetName]?.content ?? '');
      setRefinerError(null);
    }
  }, [assetStates, draft]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingAsset(null);
    setEditContent('');
    setRefinerError(null);
  }, []);

  // Save edited content
  const saveEditedContent = useCallback(async () => {
    if (!editingAsset || !editContent.trim()) return;

    const sanitizedContent = unwrapSingleCodeFence(editContent);

    setRefinerError(null);

    setAssetStates((prev) => ({
      ...prev,
      [editingAsset]: {
        ...prev[editingAsset],
        status: 'saving',
      },
    }));

    try {
      const currentState = assetStates[editingAsset];
      await updateAsset.mutateAsync({
        assetName: editingAsset,
        content: sanitizedContent,
        expectedPreviousContent: currentState?.storedContent ?? null,
        overwrite: (currentState?.storedContent ?? null) !== null,
      });
      setAssetStates((prev) => ({
        ...prev,
        [editingAsset]: {
          ...prev[editingAsset],
          status: 'idle',
          content: sanitizedContent,
          originalContent: sanitizedContent,
          storedContent: sanitizedContent,
        },
      }));
      setEditingAsset(null);
      setEditContent('');
    } catch {
      setAssetStates((prev) => ({
        ...prev,
        [editingAsset]: {
          ...prev[editingAsset],
          status: 'idle',
        },
      }));
    }
  }, [assetStates, editingAsset, editContent, updateAsset]);

  // Regenerate a single asset
  const regenerateAsset = useCallback(async (assetName: string) => {
    if (!draft || !draftTemplate) return;

    setRefinerError(null);

    setAssetStates((prev) => ({
      ...prev,
      [assetName]: {
        ...prev[assetName],
        status: 'generating',
      },
    }));

    const draftWithCurrentState: Draft = {
      ...draft,
      assets: Object.fromEntries(
        Object.entries(assetStates).map(([name, state]) => [name, state.content])
      ),
    };
    const priorAssets = buildDraftPriorAssets(draftWithCurrentState, assetName, draftTemplate);
    const additionalInstructions = mergeDraftAdditionalInstructions(
      draft.metadata.custom_instructions,
      transientInstructions
    );

    try {
      let newContent = '';

      for await (const progress of GenerationService.generateAsset({
        seed: draft.metadata.seed,
        mode: draft.metadata.mode ?? 'Auto',
        template: draft.metadata.template_name,
        asset_name: assetName,
        prior_assets: priorAssets,
        additional_instructions: additionalInstructions,
      })) {
        if (progress.type === 'chunk' && progress.content) {
          newContent += progress.content;
          setAssetStates((prev) => ({
            ...prev,
            [assetName]: {
              ...prev[assetName],
              status: 'generating',
              content: newContent,
            },
          }));
        } else if (progress.type === 'asset' && progress.content) {
          newContent = unwrapSingleCodeFence(progress.content);
          setAssetStates((prev) => ({
            ...prev,
            [assetName]: {
              ...prev[assetName],
              status: 'reviewing',
              content: newContent,
            },
          }));
        }
      }

      if (!newContent) {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('Asset regeneration failed:', error);
      setRefinerError(error instanceof Error ? error.message : 'Asset regeneration failed');
      setAssetStates((prev) => ({
        ...prev,
        [assetName]: {
          ...prev[assetName],
          status: 'idle',
        },
      }));
    }
  }, [assetStates, draft, draftTemplate, transientInstructions]);

  // Accept regenerated content
  const acceptRegenerated = useCallback(async (assetName: string) => {
    const state = assetStates[assetName];
    if (!state || state.status !== 'reviewing') return;

    const sanitizedContent = unwrapSingleCodeFence(state.content);

    setRefinerError(null);

    setAssetStates((prev) => ({
      ...prev,
      [assetName]: {
        ...prev[assetName],
        status: 'saving',
      },
    }));

    try {
      await updateAsset.mutateAsync({
        assetName,
        content: sanitizedContent,
        expectedPreviousContent: state.storedContent,
        overwrite: state.storedContent !== null,
      });
      setAssetStates((prev) => ({
        ...prev,
        [assetName]: {
          ...prev[assetName],
          status: 'idle',
          content: sanitizedContent,
          originalContent: sanitizedContent,
          storedContent: sanitizedContent,
        },
      }));
    } catch {
      setAssetStates((prev) => ({
        ...prev,
        [assetName]: {
          ...prev[assetName],
          status: 'reviewing',
        },
      }));
    }
  }, [assetStates, updateAsset]);

  // Discard regenerated content
  const discardRegenerated = useCallback((assetName: string) => {
    const state = assetStates[assetName];
    if (!state) return;

    setAssetStates((prev) => ({
      ...prev,
      [assetName]: {
        ...prev[assetName],
        status: 'idle',
        content: state.originalContent,
      },
    }));
  }, [assetStates]);

  // Handle draft selection
  const handleDraftSelect = useCallback((draftId: string) => {
    setSelectedDraftId(draftId);
    setAssetStates({});
    setExpandedAssets(new Set());
    setEditingAsset(null);
    setEditContent('');
    setTransientInstructions('');
    setRefinerError(null);
    setResumeNotice(null);
  }, []);

  useEffect(() => {
    const hasState = Boolean(
      selectedDraftId
      || transientInstructions.trim()
      || Object.keys(assetStates).length > 0
      || editingAsset
      || editContent.trim()
    );

    if (!hasState) {
      clearActiveDraftRefinerSession();
      return;
    }

    const interrupted = Object.values(assetStates).some(
      (state) => state.status === 'generating' || state.status === 'saving'
    );

    const serializedAssetStates: Record<string, ActiveDraftRefinerAssetState> = Object.fromEntries(
      Object.entries(assetStates).map(([assetName, state]) => [
        assetName,
        {
          assetName: state.assetName,
          status: state.status === 'reviewing' ? 'reviewing' : 'idle',
          content: state.content,
          originalContent: state.originalContent,
          storedContent: state.storedContent,
        },
      ])
    );

    saveActiveDraftRefinerSession({
      version: 1,
      selectedDraftId,
      transientInstructions,
      assetStates: serializedAssetStates,
      expandedAssets: Array.from(expandedAssets),
      editingAsset,
      editContent,
      interrupted,
      updatedAt: Date.now(),
    });
  }, [assetStates, editContent, editingAsset, expandedAssets, selectedDraftId, transientInstructions]);

  useEffect(() => {
    const hasWorkingState = Boolean(
      transientInstructions.trim()
      ||
      editingAsset
      || Object.values(assetStates).some((state) => state.status !== 'idle' || state.content !== state.originalContent)
    );

    if (!hasWorkingState) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [assetStates, editingAsset, transientInstructions]);

  const getStatusIcon = (status: AssetRegenerationState['status']) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'reviewing':
        return <FileText className="h-4 w-4 text-amber-500" />;
      case 'saving':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'idle':
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft Selector */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <h3 className="text-lg font-semibold mb-4">Select Draft to Refine</h3>
        <select
          aria-label="Select draft to refine"
          value={selectedDraftId}
          onChange={(e) => handleDraftSelect(e.target.value)}
          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select a draft...</option>
          {draftsResponse?.drafts.map((d) => (
            <option key={d.review_id} value={d.review_id}>
              {d.character_name || d.seed} ({d.template_name || 'default'})
            </option>
          ))}
        </select>

        {resumeNotice && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {resumeNotice}
          </div>
        )}
      </div>

      {/* Loading State */}
      {draftLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading draft...</span>
        </div>
      )}

      {/* Draft Content */}
      {draft && !draftLoading && (
        <div className="space-y-4">
          {/* Draft Header */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{draft.metadata.character_name || draft.metadata.seed}</h2>
                <p className="text-sm text-muted-foreground">{draft.metadata.seed}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {draft.metadata.mode && (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    {draft.metadata.mode}
                  </span>
                )}
                {draft.metadata.template_name && (
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    {draft.metadata.template_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <DraftSendConfigPanel
            draft={draft}
            template={draftTemplate}
            onSave={async (updates) => {
              await updateMetadata.mutateAsync(updates);
            }}
            isSaving={updateMetadata.isPending}
            description="Adjust the saved outbound instructions and component order used for future regeneration from this draft."
            transientInstructions={{
              value: transientInstructions,
              onChange: setTransientInstructions,
              disabled: updateMetadata.isPending,
              label: 'Transient send-only instructions',
              description: 'Merged with the saved draft instructions for regeneration actions in this refiner session only.',
              placeholder: 'Temporary guidance for the next regenerate action without changing the saved draft instructions.',
            }}
          />

          {missingAssetCount > 0 && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
              This draft is missing {missingAssetCount} template asset{missingAssetCount === 1 ? '' : 's'}. Create them here with AI or by editing the empty fields directly.
            </div>
          )}

          {refinerError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {refinerError}
            </div>
          )}

          {/* Asset List */}
          <div className="space-y-2">
            {assetEntries.map((assetEntry) => {
              const assetName = assetEntry.name;
              const state = assetStates[assetName];
              if (!state) return null;

              const isExpanded = expandedAssets.has(assetName);
              const isEditing = editingAsset === assetName;
              const isGenerating = state.status === 'generating';
              const isReviewing = state.status === 'reviewing';
              const isSaving = state.status === 'saving';
              const hasChanges = state.content !== state.originalContent;
              const assetExists = state.storedContent !== null;
              const saveLabel = assetExists ? 'Save Changes' : 'Create Asset';
              const regenerateLabel = assetExists ? 'Regenerate' : 'Create with AI';
              const reviewLabel = assetExists ? 'Accept' : 'Create Asset';

              return (
                <div
                  key={assetName}
                  className={`rounded-xl border ${
                    isReviewing
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : hasChanges
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/50'
                  }`}
                >
                  {/* Asset Header */}
                  <button
                    onClick={() => toggleExpand(assetName)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      {getStatusIcon(state.status)}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium capitalize">
                          {assetName.replace(/_/g, ' ')}
                        </span>
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
                      {hasChanges && state.status === 'idle' && (
                        <span className="text-xs text-primary">(modified)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isGenerating && (
                        <span className="text-xs text-muted-foreground">Generating...</span>
                      )}
                      {isReviewing && (
                        <span className="text-xs text-amber-500">Review changes</span>
                      )}
                      {isSaving && (
                        <span className="text-xs text-muted-foreground">Saving...</span>
                      )}
                    </div>
                  </button>

                  {/* Asset Content */}
                  {isExpanded && (
                    <div className="border-t border-border/50 p-4 space-y-3">
                      {assetEntry.description && (
                        <p className="text-xs text-muted-foreground">{assetEntry.description}</p>
                      )}

                      {isEditing ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <textarea
                            aria-label={`${assetName.replace(/_/g, ' ')} content`}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full min-h-[200px] rounded-md border border-input bg-background p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => void saveEditedContent()}
                              disabled={isSaving || !editContent.trim()}
                              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              {saveLabel}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={isSaving}
                              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View/Review Mode
                        <div className="space-y-3">
                          <textarea
                            aria-label={`${assetName.replace(/_/g, ' ')} content`}
                            value={state.content}
                            onChange={(e) => {
                              if (state.status === 'idle') {
                                setAssetStates((prev) => ({
                                  ...prev,
                                  [assetName]: {
                                    ...prev[assetName],
                                    content: e.target.value,
                                  },
                                }));
                              }
                            }}
                            readOnly={state.status !== 'idle'}
                            className={`w-full min-h-[200px] rounded-md border border-input bg-background p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              state.status !== 'idle' ? 'opacity-70' : ''
                            }`}
                          />

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            {state.status === 'idle' && (
                              <>
                                <button
                                  onClick={() => void regenerateAsset(assetName)}
                                  disabled={isGenerating}
                                  className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  {regenerateLabel}
                                </button>
                                {hasChanges && (
                                  <button
                                    onClick={() => {
                                      setRefinerError(null);
                                      setAssetStates((prev) => ({
                                        ...prev,
                                        [assetName]: {
                                          ...prev[assetName],
                                          status: 'saving',
                                        },
                                      }));
                                      updateAsset
                                        .mutateAsync({
                                          assetName,
                                          content: state.content,
                                          expectedPreviousContent: state.storedContent,
                                          overwrite: state.storedContent !== null,
                                        })
                                        .then(() => {
                                          setAssetStates((prev) => ({
                                            ...prev,
                                            [assetName]: {
                                              ...prev[assetName],
                                              status: 'idle',
                                              originalContent: state.content,
                                              storedContent: state.content,
                                            },
                                          }));
                                        })
                                        .catch(() => {
                                          setAssetStates((prev) => ({
                                            ...prev,
                                            [assetName]: {
                                              ...prev[assetName],
                                              status: 'idle',
                                            },
                                          }));
                                        });
                                    }}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                                  >
                                    <Save className="h-4 w-4" />
                                    {saveLabel}
                                  </button>
                                )}
                              </>
                            )}

                            {state.status === 'reviewing' && (
                              <>
                                <button
                                  onClick={() => void acceptRegenerated(assetName)}
                                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  {reviewLabel}
                                </button>
                                <button
                                  onClick={() => discardRegenerated(assetName)}
                                  className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
                                >
                                  Discard
                                </button>
                              </>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground">
                            {state.status === 'idle'
                              ? assetExists
                                ? 'Edit the content directly or regenerate with AI.'
                                : 'This asset is missing. Create it with AI or type content directly, then save.'
                              : state.status === 'reviewing'
                              ? assetExists
                                ? 'Review the regenerated content above. Accept to save, or discard to revert.'
                                : 'Review the generated content above. Create the asset to save it, or discard to keep this slot empty.'
                              : 'Processing...'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-4">
            <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  assetNames.forEach((name) => toggleExpand(name));
                }}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                <FileText className="h-4 w-4" />
                Expand All
              </button>
              <button
                onClick={() => {
                  setExpandedAssets(new Set());
                }}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                Collapse All
              </button>
              <button
                onClick={() => {
                  // Regenerate all assets sequentially
                  if (!draftTemplate) return;
                  const regenerateAll = async () => {
                    for (const asset of draftTemplate.assets) {
                      await regenerateAsset(asset.name);
                      await new Promise((resolve) => setTimeout(resolve, 500));
                    }
                  };
                  void regenerateAll();
                }}
                disabled={!draftTemplate || Object.values(assetStates).some((s) => s.status !== 'idle')}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-primary to-accent px-3 py-2 text-sm text-primary-foreground hover:from-primary/90 hover:to-accent/90 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                Regenerate All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
