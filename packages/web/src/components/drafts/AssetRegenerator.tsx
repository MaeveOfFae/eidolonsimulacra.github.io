import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Loader2,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import type { Draft, Template } from '@char-gen/shared';
import { api } from '@/lib/api';
import { GenerationService } from '@/lib/services/generation';
import { resolveTemplateBlueprintContent } from '@/lib/templates/browser';
import {
  clearActiveAssetRegeneratorSession,
  loadActiveAssetRegeneratorSession,
  saveActiveAssetRegeneratorSession,
} from '@/lib/services/generation-session';
import { BlueprintPanel } from '../common/BlueprintPanel';
import { useAssistantScreenContext } from '../common/useAssistantContext';

interface AssetCandidate {
  id: string;
  content: string;
  timestamp: number;
}

export default function AssetRegenerator() {
  const { id, assetName } = useParams<{ id: string; assetName: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reviewId = decodeURIComponent(id || '');
  const decodedAssetName = decodeURIComponent(assetName || '');
  const assetLabel = decodedAssetName.replace(/_/g, ' ');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingContent, setGeneratingContent] = useState('');
  const [generatedCandidates, setGeneratedCandidates] = useState<AssetCandidate[]>([]);
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(3);
  const [customInstructions, setCustomInstructions] = useState('');
  const [blueprintOverrideContent, setBlueprintOverrideContent] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const restoredSessionRef = useRef(loadActiveAssetRegeneratorSession());

  const { data: draft, isLoading: draftLoading, error: draftError } = useQuery({
    queryKey: ['draft', reviewId],
    queryFn: () => api.getDraft(reviewId),
    enabled: !!reviewId,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const template = useMemo(() => {
    if (!draft) {
      return undefined;
    }

    return templates.find((entry) => entry.name === draft.metadata.template_name);
  }, [draft, templates]);

  const templateAssetIndex = useMemo(() => {
    if (!template) {
      return -1;
    }

    return template.assets.findIndex((asset) => asset.name === decodedAssetName);
  }, [decodedAssetName, template]);

  const currentAssetContent = draft?.assets[decodedAssetName] ?? '';
  const canRegenerate = Boolean(draft && template && templateAssetIndex >= 0 && decodedAssetName in draft.assets);
  const assetBlueprintFile = useMemo(() => {
    if (!template || templateAssetIndex < 0) {
      return `${decodedAssetName}.md`;
    }

    const asset = template.assets[templateAssetIndex];
    return asset.blueprint_file ?? `${asset.name}.md`;
  }, [decodedAssetName, template, templateAssetIndex]);
  const resolvedBlueprintContent = useMemo(() => {
    return resolveTemplateBlueprintContent(draft?.metadata.template_name, decodedAssetName) || '';
  }, [decodedAssetName, draft?.metadata.template_name]);
  const effectiveBlueprintContent = blueprintOverrideContent || resolvedBlueprintContent;
  const hasBlueprintOverride = blueprintOverrideContent.trim().length > 0;

  useEffect(() => {
    const session = restoredSessionRef.current;
    if (!session) {
      return;
    }

    if (session.draftId !== reviewId || session.assetName !== decodedAssetName) {
      return;
    }

    setGenerationCount(session.generationCount);
    setCustomInstructions(session.customInstructions);
    setBlueprintOverrideContent(session.blueprintOverrideContent ?? '');
    setGeneratedCandidates(session.generatedCandidates);
    setExpandedCandidates(new Set(session.expandedCandidates));
    setGeneratingContent(session.generatingContent);

    if (session.status === 'generating') {
      setResumeNotice('Asset regeneration was interrupted. Restored the variant snapshot; generate again to continue.');
    } else if (session.generatedCandidates.length > 0) {
      setResumeNotice('Restored generated asset variants.');
    } else {
      setResumeNotice('Restored asset regeneration settings.');
    }

    restoredSessionRef.current = null;
  }, [decodedAssetName, reviewId]);

  useAssistantScreenContext({
    draft_id: reviewId,
    asset_name: decodedAssetName,
    character_name: draft?.metadata.character_name || '',
    mode: draft?.metadata.mode || '',
    template_name: draft?.metadata.template_name || '',
    candidate_count: generatedCandidates.length,
    is_generating: isGenerating,
    has_blueprint_override: hasBlueprintOverride,
  });

  const updateAsset = useMutation({
    mutationFn: (content: string) => api.updateAsset(reviewId, decodedAssetName, content),
    onSuccess: (_, content) => {
      queryClient.setQueryData<Draft | undefined>(['draft', reviewId], (existingDraft) => {
        if (!existingDraft) {
          return existingDraft;
        }

        return {
          ...existingDraft,
          assets: {
            ...existingDraft.assets,
            [decodedAssetName]: content,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ['draft', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });

  const toggleExpand = useCallback((candidateId: string) => {
    setExpandedCandidates((previous) => {
      const next = new Set(previous);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  }, []);

  const copyCandidate = useCallback(async (candidateId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(candidateId);
      window.setTimeout(() => {
        setCopiedId((currentId) => (currentId === candidateId ? null : currentId));
      }, 1600);
    } catch (error) {
      console.error('Failed to copy candidate', error);
    }
  }, []);

  const buildPriorAssets = useCallback(() => {
    if (!draft || !template || templateAssetIndex < 0) {
      return {} as Record<string, string>;
    }

    const priorAssets: Record<string, string> = {};

    for (let index = 0; index < templateAssetIndex; index += 1) {
      const priorAssetName = template.assets[index].name;
      const priorAssetContent = draft.assets[priorAssetName];
      if (priorAssetContent) {
        priorAssets[priorAssetName] = priorAssetContent;
      }
    }

    return priorAssets;
  }, [draft, template, templateAssetIndex]);

  const generateCandidate = useCallback(async () => {
    if (!draft || !canRegenerate || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setGeneratingContent('');
    setGenerationError(null);

    const enhancedSeed = customInstructions.trim()
      ? `${draft.metadata.seed}\n\nAdditional ${assetLabel} instructions: ${customInstructions.trim()}`
      : draft.metadata.seed;

    try {
      let fullContent = '';

      const stream = hasBlueprintOverride
        ? GenerationService.previewBlueprint({
            seed: enhancedSeed,
            mode: draft.metadata.mode,
            template: draft.metadata.template_name,
            asset_name: decodedAssetName,
            prior_assets: buildPriorAssets(),
            blueprint_content: effectiveBlueprintContent,
          })
        : GenerationService.generateAsset({
            seed: enhancedSeed,
            mode: draft.metadata.mode,
            template: draft.metadata.template_name,
            asset_name: decodedAssetName,
            prior_assets: buildPriorAssets(),
          });

      for await (const progress of stream) {
        if (progress.type === 'chunk' && progress.content) {
          fullContent += progress.content;
          setGeneratingContent(fullContent);
        } else if (progress.type === 'asset' && progress.content) {
          fullContent = progress.content;
          setGeneratingContent(fullContent);
        }
      }

      if (!fullContent.trim()) {
        throw new Error('No content generated');
      }

      const candidate: AssetCandidate = {
        id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        content: fullContent,
        timestamp: Date.now(),
      };

      setGeneratedCandidates((previous) => [candidate, ...previous]);
      setExpandedCandidates((previous) => new Set(previous).add(candidate.id));
    } catch (error) {
      console.error('Asset regeneration failed', error);
      setGenerationError(error instanceof Error ? error.message : 'Asset regeneration failed');
    } finally {
      setIsGenerating(false);
      setGeneratingContent('');
    }
  }, [assetLabel, buildPriorAssets, canRegenerate, customInstructions, decodedAssetName, draft, effectiveBlueprintContent, hasBlueprintOverride, isGenerating]);

  const generateMultiple = useCallback(async () => {
    for (let index = 0; index < generationCount; index += 1) {
      await generateCandidate();
      if (index < generationCount - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 300));
      }
    }
  }, [generateCandidate, generationCount]);

  useEffect(() => {
    const hasState = Boolean(
      customInstructions.trim()
      || blueprintOverrideContent.trim()
      || generatedCandidates.length > 0
      || generatingContent.trim()
      || generationCount !== 3
    );

    if (!hasState || !reviewId || !decodedAssetName) {
      clearActiveAssetRegeneratorSession();
      return;
    }

    saveActiveAssetRegeneratorSession({
      version: 1,
      draftId: reviewId,
      assetName: decodedAssetName,
      generationCount,
      customInstructions,
      blueprintOverrideContent,
      generatedCandidates,
      expandedCandidates: Array.from(expandedCandidates),
      generatingContent,
      status: isGenerating ? 'generating' : (generatedCandidates.length > 0 || generatingContent.trim()) ? 'ready' : 'configuring',
      updatedAt: Date.now(),
    });
  }, [blueprintOverrideContent, customInstructions, decodedAssetName, expandedCandidates, generatedCandidates, generatingContent, generationCount, isGenerating, reviewId]);

  useEffect(() => {
    const hasWorkingState = Boolean(
      isGenerating
      || generatedCandidates.length > 0
      || customInstructions.trim()
      || blueprintOverrideContent.trim()
      || generatingContent.trim()
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
  }, [blueprintOverrideContent, customInstructions, generatedCandidates.length, generatingContent, isGenerating]);

  const removeCandidate = useCallback((candidateId: string) => {
    setGeneratedCandidates((previous) => previous.filter((candidate) => candidate.id !== candidateId));
    setExpandedCandidates((previous) => {
      const next = new Set(previous);
      next.delete(candidateId);
      return next;
    });
  }, []);

  const applyCandidate = useCallback(async (content: string, options?: { returnToReview?: boolean }) => {
    await updateAsset.mutateAsync(content);

    if (options?.returnToReview) {
      navigate(`/drafts/${encodeURIComponent(reviewId)}`);
    }
  }, [navigate, reviewId, updateAsset]);

  const renderCandidateCard = (candidate: AssetCandidate, index: number) => {
    const isExpanded = expandedCandidates.has(candidate.id);
    const isCopied = copiedId === candidate.id;
    const isActive = currentAssetContent === candidate.content;

    return (
      <div
        key={candidate.id}
        className={`rounded-xl border ${isActive ? 'border-primary/50 bg-primary/5' : 'border-border/50'}`}
      >
        <button
          onClick={() => toggleExpand(candidate.id)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">Variant #{index + 1}</span>
            {isActive && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Star className="h-3 w-3 fill-primary" />
                active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{new Date(candidate.timestamp).toLocaleTimeString()}</span>
            <span>•</span>
            <span>{candidate.content.length} chars</span>
          </div>
        </button>

        {isExpanded && (
          <div className="space-y-3 border-t border-border/50 p-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Current active</div>
                <div className="max-h-80 overflow-y-auto rounded-md bg-muted/50 p-3 text-sm font-mono whitespace-pre-wrap">
                  {currentAssetContent || 'No active content saved.'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Candidate</div>
                <div className="max-h-80 overflow-y-auto rounded-md bg-muted/50 p-3 text-sm font-mono whitespace-pre-wrap">
                  {candidate.content}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void copyCandidate(candidate.id, candidate.content)}
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={() => void applyCandidate(candidate.content)}
                disabled={updateAsset.isPending || isActive}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Star className="h-3.5 w-3.5" />
                {isActive ? 'Active' : 'Set Active'}
              </button>

              <button
                onClick={() => void applyCandidate(candidate.content, { returnToReview: true })}
                disabled={updateAsset.isPending || isActive}
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Apply and Return
              </button>

              <button
                onClick={() => removeCandidate(candidate.id)}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (draftLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading asset regenerator...</div>
      </div>
    );
  }

  if (draftError || !draft) {
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

  return (
    <div className="app-page space-y-6 pb-10 sm:space-y-8 sm:pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-3">
            <Link
              to={`/drafts/${encodeURIComponent(reviewId)}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Review
            </Link>
            <p className="app-page-eyebrow">Asset Regenerator</p>
            <div className="space-y-2">
              <h1 className="app-page-title text-[clamp(2rem,4vw,3.2rem)] capitalize">
                {assetLabel}
              </h1>
              <p className="app-page-summary max-w-4xl">
                Generate alternative versions of this asset without rerunning the entire draft.
              </p>
            </div>
          </div>

          <div className="app-panel-muted min-w-0 p-4 sm:p-5">
            <p className="app-page-eyebrow">Current draft</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Character</p>
                <div className="app-page-metric-value text-lg sm:text-2xl">{draft.metadata.character_name || 'Unnamed'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Mode</p>
                <div className="app-page-metric-value text-lg sm:text-2xl">{draft.metadata.mode || 'Unset'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Template</p>
                <div className="app-page-metric-value text-base sm:text-xl">{draft.metadata.template_name || 'Unset'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!canRegenerate && (
        <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          This asset cannot be regenerated because its template contract could not be resolved for the current draft.
        </div>
      )}

      {resumeNotice && (
        <div className="app-note border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          {resumeNotice}
        </div>
      )}

      {resolvedBlueprintContent && (
        <BlueprintPanel
          blueprintName={assetBlueprintFile}
          blueprintContent={effectiveBlueprintContent}
          title="Asset Blueprint"
          description="Inspect or override the blueprint used only for this regeneration session."
          editable
          defaultExpanded={false}
          onContentChange={setBlueprintOverrideContent}
        />
      )}

      {hasBlueprintOverride && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setBlueprintOverrideContent('')}
            className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
          >
            Clear Blueprint Override
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="app-panel space-y-4 p-4 sm:p-5">
          <div>
            <h2 className="text-lg font-semibold">Current Active Asset</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This is what the draft currently uses for {assetLabel}.
            </p>
          </div>

          <div className="max-h-[32rem] overflow-y-auto rounded-xl bg-muted/50 p-3 text-sm font-mono whitespace-pre-wrap">
            {currentAssetContent || 'No content saved for this asset.'}
          </div>
        </section>

        <section className="space-y-6">
          <div className="app-panel space-y-4 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 p-2.5 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Generate Variants</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use the saved draft context and prior asset order to spin alternative versions of this one asset.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Instructions</label>
              <textarea
                value={customInstructions}
                onChange={(event) => setCustomInstructions(event.target.value)}
                placeholder={`e.g., Make the ${assetLabel} sharper, more restrained, more vivid, or more specific.`}
                className="min-h-[96px] w-full rounded-xl border border-input bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={!canRegenerate || isGenerating}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                Batch size
                <select
                  value={generationCount}
                  onChange={(event) => setGenerationCount(Number(event.target.value))}
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                  disabled={!canRegenerate || isGenerating}
                >
                  {[1, 2, 3, 4, 5].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>

              <button
                onClick={() => void generateCandidate()}
                disabled={!canRegenerate || isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Generate One
              </button>

              <button
                onClick={() => void generateMultiple()}
                disabled={!canRegenerate || isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate {generationCount}
              </button>
            </div>

            {generationError && (
              <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {generationError}
              </div>
            )}

            {isGenerating && generatingContent && (
              <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Streaming draft candidate
                </div>
                <div className="max-h-56 overflow-y-auto rounded-md bg-background/70 p-3 text-sm font-mono whitespace-pre-wrap">
                  {generatingContent}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Generated Variants</h2>
                <p className="text-sm text-muted-foreground">
                  Keep generating until one is better than the current active version.
                </p>
              </div>
              <span className="app-pill app-pill-muted">{generatedCandidates.length} variants</span>
            </div>

            {generatedCandidates.length === 0 ? (
              <div className="app-note p-4 text-sm text-muted-foreground">
                No variants generated yet.
              </div>
            ) : (
              <div className="space-y-3">
                {generatedCandidates.map((candidate, index) => renderCandidateCard(candidate, index))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}