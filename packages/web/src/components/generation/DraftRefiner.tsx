import { useState, useCallback, useMemo } from 'react';
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
import { GenerationService } from '@/lib/services/generation';
import type { Draft, Template } from '@char-gen/shared';

interface DraftRefinerProps {
  templates: Template[];
}

interface AssetRegenerationState {
  assetName: string;
  status: 'idle' | 'generating' | 'reviewing' | 'saving';
  content: string;
  originalContent: string;
}

export default function DraftRefiner({ templates }: DraftRefinerProps) {
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [assetStates, setAssetStates] = useState<Record<string, AssetRegenerationState>>({});
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
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

  // Asset names from draft
  const assetNames = useMemo(() => {
    return draft ? Object.keys(draft.assets) : [];
  }, [draft]);

  // Initialize asset states when draft loads
  useMemo(() => {
    if (draft && Object.keys(assetStates).length === 0) {
      const states: Record<string, AssetRegenerationState> = {};
      for (const name of Object.keys(draft.assets)) {
        states[name] = {
          assetName: name,
          status: 'idle',
          content: draft.assets[name],
          originalContent: draft.assets[name],
        };
      }
      setAssetStates(states);
    }
  }, [draft, assetStates]);

  // Update asset mutation
  const updateAsset = useMutation({
    mutationFn: ({ assetName, content }: { assetName: string; content: string }) =>
      api.updateAsset(selectedDraftId, assetName, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', selectedDraftId] });
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
      setEditContent(draft.assets[assetName]);
    }
  }, [draft]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingAsset(null);
    setEditContent('');
  }, []);

  // Save edited content
  const saveEditedContent = useCallback(async () => {
    if (!editingAsset || !editContent.trim()) return;

    setAssetStates((prev) => ({
      ...prev,
      [editingAsset]: {
        ...prev[editingAsset],
        status: 'saving',
      },
    }));

    try {
      await updateAsset.mutateAsync({ assetName: editingAsset, content: editContent });
      setAssetStates((prev) => ({
        ...prev,
        [editingAsset]: {
          ...prev[editingAsset],
          status: 'idle',
          content: editContent,
          originalContent: editContent,
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
  }, [editingAsset, editContent, updateAsset]);

  // Regenerate a single asset
  const regenerateAsset = useCallback(async (assetName: string) => {
    if (!draft || !draftTemplate) return;

    setAssetStates((prev) => ({
      ...prev,
      [assetName]: {
        ...prev[assetName],
        status: 'generating',
      },
    }));

    // Get prior assets (all assets that come before this one in the template)
    const assetIndex = draftTemplate.assets.findIndex((a) => a.name === assetName);
    const priorAssets: Record<string, string> = {};

    for (let i = 0; i < assetIndex; i++) {
      const priorName = draftTemplate.assets[i].name;
      if (draft.assets[priorName]) {
        priorAssets[priorName] = draft.assets[priorName];
      }
    }

    try {
      let newContent = '';

      for await (const progress of GenerationService.generateAsset({
        seed: draft.metadata.seed,
        mode: draft.metadata.mode,
        template: draft.metadata.template_name,
        asset_name: assetName,
        prior_assets: priorAssets,
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
          newContent = progress.content;
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
      setAssetStates((prev) => ({
        ...prev,
        [assetName]: {
          ...prev[assetName],
          status: 'idle',
        },
      }));
    }
  }, [draft, draftTemplate]);

  // Accept regenerated content
  const acceptRegenerated = useCallback(async (assetName: string) => {
    const state = assetStates[assetName];
    if (!state || state.status !== 'reviewing') return;

    setAssetStates((prev) => ({
      ...prev,
      [assetName]: {
        ...prev[assetName],
        status: 'saving',
      },
    }));

    try {
      await updateAsset.mutateAsync({ assetName, content: state.content });
      setAssetStates((prev) => ({
        ...prev,
        [assetName]: {
          ...prev[assetName],
          status: 'idle',
          originalContent: state.content,
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
  }, []);

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

          {/* Asset List */}
          <div className="space-y-2">
            {assetNames.map((assetName) => {
              const state = assetStates[assetName];
              if (!state) return null;

              const isExpanded = expandedAssets.has(assetName);
              const isEditing = editingAsset === assetName;
              const isGenerating = state.status === 'generating';
              const isReviewing = state.status === 'reviewing';
              const isSaving = state.status === 'saving';
              const hasChanges = state.content !== state.originalContent;

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
                      <span className="font-medium capitalize">
                        {assetName.replace(/_/g, ' ')}
                      </span>
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
                      {isEditing ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <textarea
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
                              Save Changes
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
                                  Regenerate
                                </button>
                                {hasChanges && (
                                  <button
                                    onClick={() => {
                                      setAssetStates((prev) => ({
                                        ...prev,
                                        [assetName]: {
                                          ...prev[assetName],
                                          status: 'saving',
                                        },
                                      }));
                                      updateAsset
                                        .mutateAsync({ assetName, content: state.content })
                                        .then(() => {
                                          setAssetStates((prev) => ({
                                            ...prev,
                                            [assetName]: {
                                              ...prev[assetName],
                                              status: 'idle',
                                              originalContent: state.content,
                                            },
                                          }));
                                        });
                                    }}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                                  >
                                    <Save className="h-4 w-4" />
                                    Save Changes
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
                                  Accept
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
                              ? 'Edit the content directly or regenerate with AI.'
                              : state.status === 'reviewing'
                              ? 'Review the regenerated content above. Accept to save, or discard to revert.'
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
