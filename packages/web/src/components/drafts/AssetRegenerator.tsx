import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Loader2,
  MessageSquarePlus,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import type { Draft, Template } from '@char-gen/shared';
import { api } from '@/lib/api';
import { unwrapSingleCodeFence } from '@/lib/content-format';
import { GenerationService } from '@/lib/services/generation';
import { resolveTemplateBlueprintContent } from '@/lib/templates/browser';
import {
  clearActiveAssetRegeneratorSession,
  loadActiveAssetRegeneratorSession,
  saveActiveAssetRegeneratorSession,
} from '@/lib/services/generation-session';
import { BlueprintPanel } from '../common/BlueprintPanel';
import { useAssistantScreenContext } from '../common/useAssistantContext';

interface AssetRegeneratorProps {
  templates?: Template[];
  fixedAssetName?: string;
  enableDraftSelection?: boolean;
  enableAssetSelection?: boolean;
  embedded?: boolean;
  externalBlueprintContent?: string;
  hideInternalBlueprintPanel?: boolean;
}

interface AssetCandidate {
  id: string;
  content: string;
  timestamp: number;
}

function draftHasAsset(draft: Draft | undefined, assetName: string): boolean {
  return Boolean(draft && Object.prototype.hasOwnProperty.call(draft.assets, assetName));
}

const exportIntrosAsMarkdown = (
  characterName: string,
  savedIntros: AssetCandidate[],
  activeIntroContent: string | undefined
) => {
  const lines: string[] = [
    `# Intro Scenes for ${characterName}`,
    '',
    `Generated: ${new Date().toLocaleString()}`,
    `Total intros: ${savedIntros.length}`,
    '',
    '---',
    '',
  ];

  if (activeIntroContent) {
    lines.push('## Currently Active Intro Scene', '');
    lines.push('```');
    lines.push(activeIntroContent);
    lines.push('```');
    lines.push('', '---', '');
  }

  savedIntros.forEach((intro, index) => {
    const date = new Date(intro.timestamp).toLocaleString();
    lines.push(`## Intro Scene #${index + 1}`);
    lines.push(`*Created: ${date}*`);
    lines.push('');
    lines.push('```');
    lines.push(intro.content);
    lines.push('```');
    lines.push('');
    if (index < savedIntros.length - 1) {
      lines.push('---', '');
    }
  });

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${characterName.replace(/[^a-z0-9]/gi, '_')}_intro_scenes.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const exportIntrosAsJson = (
  characterName: string,
  savedIntros: AssetCandidate[],
  activeIntroContent: string | undefined
) => {
  const data = {
    character_name: characterName,
    exported_at: new Date().toISOString(),
    active_intro: activeIntroContent || null,
    saved_intros: savedIntros.map((intro) => ({
      id: intro.id,
      content: intro.content,
      created_at: new Date(intro.timestamp).toISOString(),
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${characterName.replace(/[^a-z0-9]/gi, '_')}_intro_scenes.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export default function AssetRegenerator({
  templates: providedTemplates,
  fixedAssetName,
  enableDraftSelection = false,
  enableAssetSelection = false,
  embedded = false,
  externalBlueprintContent,
  hideInternalBlueprintPanel = false,
}: AssetRegeneratorProps = {}) {
  const { id, assetName } = useParams<{ id: string; assetName: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routeDraftId = decodeURIComponent(id || '');
  const routeAssetName = decodeURIComponent(assetName || '');
  const [selectedDraftId, setSelectedDraftId] = useState<string>(routeDraftId || '');
  const [selectedAssetName, setSelectedAssetName] = useState<string>(fixedAssetName || routeAssetName || '');
  const assetLabel = (selectedAssetName || 'asset').replace(/_/g, ' ');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingContent, setGeneratingContent] = useState('');
  const [generatedCandidates, setGeneratedCandidates] = useState<AssetCandidate[]>([]);
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(3);
  const [customInstructions, setCustomInstructions] = useState('');
  const [blueprintOverrideContent, setBlueprintOverrideContent] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [assetWriteError, setAssetWriteError] = useState<string | null>(null);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const restoredSessionRef = useRef(loadActiveAssetRegeneratorSession());

  const { data: draftsResponse } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
    enabled: enableDraftSelection,
  });

  const { data: draft, isLoading: draftLoading, error: draftError } = useQuery({
    queryKey: ['draft', selectedDraftId],
    queryFn: () => api.getDraft(selectedDraftId),
    enabled: !!selectedDraftId,
  });

  const { data: queriedTemplates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
    enabled: !providedTemplates,
  });

  const templates = providedTemplates ?? queriedTemplates;

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

    return template.assets.findIndex((asset) => asset.name === selectedAssetName);
  }, [selectedAssetName, template]);

  const assetExists = draftHasAsset(draft, selectedAssetName);
  const currentAssetContent = draft?.assets[selectedAssetName] ?? '';
  const canGenerateAsset = Boolean(draft && template && templateAssetIndex >= 0 && selectedAssetName);
  const primaryActionLabel = assetExists ? 'Replace Asset' : 'Create Asset';
  const secondaryActionLabel = assetExists ? 'Replace and Return' : 'Create and Return';
  const isIntroAsset = selectedAssetName === 'intro_scene';
  const assetBlueprintFile = useMemo(() => {
    if (!template || templateAssetIndex < 0) {
      return `${selectedAssetName || 'asset'}.md`;
    }

    const asset = template.assets[templateAssetIndex];
    return asset.blueprint_file ?? `${asset.name}.md`;
  }, [selectedAssetName, template, templateAssetIndex]);
  const resolvedBlueprintContent = useMemo(() => {
    return resolveTemplateBlueprintContent(draft?.metadata.template_name, selectedAssetName) || '';
  }, [selectedAssetName, draft?.metadata.template_name]);
  const effectiveBlueprintContent = blueprintOverrideContent || externalBlueprintContent || resolvedBlueprintContent;
  const hasBlueprintOverride = blueprintOverrideContent.trim().length > 0 || Boolean(externalBlueprintContent?.trim());
  const savedIntros = useMemo((): AssetCandidate[] => {
    if (!isIntroAsset || !draft?.metadata.notes) {
      return [];
    }

    try {
      const match = draft.metadata.notes.match(/\[SAVED_INTROS\]([\s\S]*?)\[\/SAVED_INTROS\]/);
      if (match?.[1]) {
        return JSON.parse(match[1]);
      }
    } catch {
      return [];
    }

    return [];
  }, [draft?.metadata.notes, isIntroAsset]);

  useEffect(() => {
    const session = restoredSessionRef.current;
    if (!session) {
      return;
    }

    if (routeDraftId && session.draftId !== routeDraftId) {
      return;
    }

    if ((fixedAssetName || routeAssetName) && session.assetName !== (fixedAssetName || routeAssetName)) {
      return;
    }

    setSelectedDraftId(session.draftId);
    setSelectedAssetName(session.assetName);
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
  }, [fixedAssetName, routeAssetName, routeDraftId]);

  useEffect(() => {
    if (fixedAssetName) {
      setSelectedAssetName(fixedAssetName);
    }
  }, [fixedAssetName]);

  useEffect(() => {
    if (!enableAssetSelection || fixedAssetName || !template) {
      return;
    }

    const assetExists = template.assets.some((asset) => asset.name === selectedAssetName);
    if (!assetExists) {
      setSelectedAssetName(template.assets[0]?.name ?? '');
    }
  }, [enableAssetSelection, fixedAssetName, selectedAssetName, template]);

  useAssistantScreenContext({
    draft_id: selectedDraftId,
    asset_name: selectedAssetName,
    character_name: draft?.metadata.character_name || '',
    mode: draft?.metadata.mode || '',
    template_name: draft?.metadata.template_name || '',
    candidate_count: generatedCandidates.length,
    is_generating: isGenerating,
    has_blueprint_override: hasBlueprintOverride,
    asset_exists: assetExists,
  });

  const updateAsset = useMutation({
    mutationFn: ({
      content,
      expectedPreviousContent,
      overwrite,
    }: {
      content: string;
      expectedPreviousContent: string | null;
      overwrite: boolean;
    }) => api.updateAsset(selectedDraftId, selectedAssetName, content, {
      expectedPreviousContent,
      overwrite,
    }),
    onSuccess: (_, content) => {
      queryClient.setQueryData<Draft | undefined>(['draft', selectedDraftId], (existingDraft) => {
        if (!existingDraft) {
          return existingDraft;
        }

        return {
          ...existingDraft,
          assets: {
            ...existingDraft.assets,
            [selectedAssetName]: content.content,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ['draft', selectedDraftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });

  const updateMetadata = useMutation({
    mutationFn: (metadata: Record<string, unknown>) => api.updateMetadata(selectedDraftId, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', selectedDraftId] });
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
    if (!draft || !canGenerateAsset || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setGeneratingContent('');
    setGenerationError(null);
    setAssetWriteError(null);

    const enhancedSeed = customInstructions.trim()
      ? `${draft.metadata.seed}\n\nAdditional ${assetLabel} instructions: ${customInstructions.trim()}`
      : draft.metadata.seed;

    try {
      let fullContent = '';

      const stream = hasBlueprintOverride
        ? GenerationService.previewBlueprint({
            seed: enhancedSeed,
            mode: draft.metadata.mode ?? 'Auto',
            template: draft.metadata.template_name,
            asset_name: selectedAssetName,
            prior_assets: buildPriorAssets(),
            blueprint_content: effectiveBlueprintContent,
          })
        : GenerationService.generateAsset({
            seed: enhancedSeed,
            mode: draft.metadata.mode ?? 'Auto',
            template: draft.metadata.template_name,
            asset_name: selectedAssetName,
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
        content: unwrapSingleCodeFence(fullContent),
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
  }, [assetLabel, buildPriorAssets, canGenerateAsset, customInstructions, draft, effectiveBlueprintContent, hasBlueprintOverride, isGenerating, selectedAssetName]);

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

    if (!hasState || !selectedDraftId || !selectedAssetName) {
      clearActiveAssetRegeneratorSession();
      return;
    }

    saveActiveAssetRegeneratorSession({
      version: 1,
      draftId: selectedDraftId,
      assetName: selectedAssetName,
      generationCount,
      customInstructions,
      blueprintOverrideContent,
      generatedCandidates,
      expandedCandidates: Array.from(expandedCandidates),
      generatingContent,
      status: isGenerating ? 'generating' : (generatedCandidates.length > 0 || generatingContent.trim()) ? 'ready' : 'configuring',
      updatedAt: Date.now(),
    });
  }, [blueprintOverrideContent, customInstructions, expandedCandidates, generatedCandidates, generatingContent, generationCount, isGenerating, selectedAssetName, selectedDraftId]);

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
    if (!draft) {
      return;
    }

    setAssetWriteError(null);

    const sanitizedContent = unwrapSingleCodeFence(content);

    try {
      const expectedPreviousContent = draftHasAsset(draft, selectedAssetName)
        ? draft.assets[selectedAssetName]
        : null;

      await updateAsset.mutateAsync({
        content: sanitizedContent,
        expectedPreviousContent,
        overwrite: draftHasAsset(draft, selectedAssetName),
      });

      if (options?.returnToReview) {
        navigate(`/drafts/${encodeURIComponent(selectedDraftId)}`);
      }
    } catch (error) {
      setAssetWriteError(error instanceof Error ? error.message : 'Unable to save asset');
    }
  }, [draft, navigate, selectedAssetName, selectedDraftId, updateAsset]);

  const saveToIntroCollection = useCallback(async (intro: AssetCandidate) => {
    if (!draft || !isIntroAsset) {
      return;
    }

    const newSavedIntros = [...savedIntros];
    if (!newSavedIntros.find((entry) => entry.id === intro.id)) {
      newSavedIntros.unshift(intro);
    }

    const introsJson = JSON.stringify(newSavedIntros);
    const existingNotes = draft.metadata.notes || '';
    const notesWithoutIntros = existingNotes.replace(/\[SAVED_INTROS\][\s\S]*?\[\/SAVED_INTROS\]/g, '').trim();
    const newNotes = `${notesWithoutIntros}\n\n[SAVED_INTROS]${introsJson}[/SAVED_INTROS]`.trim();

    await updateMetadata.mutateAsync({ notes: newNotes });
    setGeneratedCandidates((previous) => previous.filter((candidate) => candidate.id !== intro.id));
  }, [draft, isIntroAsset, savedIntros, updateMetadata]);

  const deleteSavedIntro = useCallback(async (introId: string) => {
    if (!draft || !isIntroAsset) {
      return;
    }

    const newSavedIntros = savedIntros.filter((intro) => intro.id !== introId);
    const introsJson = JSON.stringify(newSavedIntros);
    const existingNotes = draft.metadata.notes || '';
    const notesWithoutIntros = existingNotes.replace(/\[SAVED_INTROS\][\s\S]*?\[\/SAVED_INTROS\]/g, '').trim();
    const newNotes = newSavedIntros.length > 0
      ? `${notesWithoutIntros}\n\n[SAVED_INTROS]${introsJson}[/SAVED_INTROS]`.trim()
      : notesWithoutIntros;

    await updateMetadata.mutateAsync({ notes: newNotes });
  }, [draft, isIntroAsset, savedIntros, updateMetadata]);

  const handleDraftSelect = useCallback((nextDraftId: string) => {
    setSelectedDraftId(nextDraftId);
    setGeneratedCandidates([]);
    setExpandedCandidates(new Set());
    setCustomInstructions('');
    setBlueprintOverrideContent('');
    setGeneratingContent('');
    setAssetWriteError(null);
    setGenerationError(null);
    setResumeNotice(null);
  }, []);

  const handleAssetSelect = useCallback((nextAssetName: string) => {
    setSelectedAssetName(nextAssetName);
    setGeneratedCandidates([]);
    setExpandedCandidates(new Set());
    setBlueprintOverrideContent('');
    setGeneratingContent('');
    setAssetWriteError(null);
    setGenerationError(null);
    setResumeNotice(null);
  }, []);

  const eligibleDrafts = useMemo(() => {
    if (!enableDraftSelection || !draftsResponse?.drafts) {
      return [];
    }

    if (fixedAssetName) {
      return draftsResponse.drafts.filter((entry) => {
        const entryTemplate = templates.find((templateEntry) => templateEntry.name === entry.template_name);
        return entryTemplate?.assets.some((asset) => asset.name === fixedAssetName);
      });
    }

    return draftsResponse.drafts;
  }, [draftsResponse, enableDraftSelection, fixedAssetName, templates]);

  const renderCandidateCard = (candidate: AssetCandidate, index: number, isSaved: boolean = false) => {
    const isExpanded = expandedCandidates.has(candidate.id);
    const isCopied = copiedId === candidate.id;
    const isActive = currentAssetContent === candidate.content;
    const cardLabel = isIntroAsset ? 'Intro' : 'Variant';

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
            <span className="font-medium">{cardLabel} #{index + 1}</span>
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

              {!isSaved && isIntroAsset && (
                <button
                  onClick={() => void saveToIntroCollection(candidate)}
                  disabled={updateMetadata.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/80 disabled:opacity-50"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  Keep
                </button>
              )}

              <button
                onClick={() => void applyCandidate(candidate.content)}
                disabled={updateAsset.isPending || isActive}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Star className="h-3.5 w-3.5" />
                {isActive ? 'Active' : primaryActionLabel}
              </button>

              {!embedded && (
                <button
                  onClick={() => void applyCandidate(candidate.content, { returnToReview: true })}
                  disabled={updateAsset.isPending || isActive}
                  className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {secondaryActionLabel}
                </button>
              )}

              <button
                onClick={() => isSaved ? void deleteSavedIntro(candidate.id) : removeCandidate(candidate.id)}
                disabled={isSaved && updateMetadata.isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/20 disabled:opacity-50"
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

  if (draftError || (!draft && !embedded)) {
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

  return (
    <div className={embedded ? 'space-y-6' : 'app-page space-y-6 pb-10 sm:space-y-8 sm:pb-12'}>
      {embedded ? (
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 text-white">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Generate Asset Variants</h3>
              <p className="text-sm text-muted-foreground">
                Choose a draft and asset, then generate focused alternatives without rerunning the full suite.
              </p>
            </div>
          </div>

          {enableDraftSelection && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Draft</label>
              <select
                aria-label="Draft"
                value={selectedDraftId}
                onChange={(event) => handleDraftSelect(event.target.value)}
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a draft...</option>
                {eligibleDrafts.map((entry) => (
                  <option key={entry.review_id} value={entry.review_id}>
                    {entry.character_name || entry.seed} ({entry.template_name || 'default'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {enableAssetSelection && !fixedAssetName && draft && template && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset</label>
              <select
                aria-label="Asset"
                value={selectedAssetName}
                onChange={(event) => handleAssetSelect(event.target.value)}
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {template.assets.map((asset) => (
                  <option key={asset.name} value={asset.name}>
                    {asset.name.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <section className="app-page-hero">
          <div className="app-page-hero-grid">
            <div className="space-y-3">
              <Link
                to={`/drafts/${encodeURIComponent(selectedDraftId)}`}
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
                  <div className="app-page-metric-value text-lg sm:text-2xl">{draft?.metadata.character_name || 'Unnamed'}</div>
                </div>
                <div className="app-page-metric">
                  <p className="app-page-metric-label">Mode</p>
                  <div className="app-page-metric-value text-lg sm:text-2xl">{draft?.metadata.mode || 'Unset'}</div>
                </div>
                <div className="app-page-metric">
                  <p className="app-page-metric-label">Template</p>
                  <div className="app-page-metric-value text-base sm:text-xl">{draft?.metadata.template_name || 'Unset'}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {draft && !canGenerateAsset && (
        <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          This asset cannot be regenerated because its template contract could not be resolved for the current draft.
        </div>
      )}

      {draft && canGenerateAsset && !assetExists && (
        <div className="app-note border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          This draft does not have a saved {assetLabel} yet. Generate a candidate to create it from the current seed and prior asset chain.
        </div>
      )}

      {resumeNotice && (
        <div className="app-note border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          {resumeNotice}
        </div>
      )}

      {draft && !hideInternalBlueprintPanel && Boolean(resolvedBlueprintContent) && (
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

      {draft && !hideInternalBlueprintPanel && blueprintOverrideContent.trim() && (
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

      {draft && (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="app-panel space-y-4 p-4 sm:p-5">
          <div>
            <h2 className="text-lg font-semibold">Current Active Asset</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {assetExists
                ? `This is what the draft currently uses for ${assetLabel}.`
                : `No ${assetLabel} is saved yet for this draft.`}
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
                  {assetExists
                    ? 'Use the saved draft context and prior asset order to spin alternative versions of this one asset.'
                    : 'Use the saved draft context and prior asset order to generate this missing asset without rerunning the full draft.'}
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
                disabled={!canGenerateAsset || isGenerating}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                Batch size
                <select
                  value={generationCount}
                  onChange={(event) => setGenerationCount(Number(event.target.value))}
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                  disabled={!canGenerateAsset || isGenerating}
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
                disabled={!canGenerateAsset || isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Generate One
              </button>

              <button
                onClick={() => void generateMultiple()}
                disabled={!canGenerateAsset || isGenerating}
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

            {assetWriteError && (
              <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {assetWriteError}
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

          {isIntroAsset && savedIntros.length > 0 && draft && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-semibold">Saved Intros ({savedIntros.length})</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportIntrosAsMarkdown(draft.metadata.character_name || draft.metadata.seed, savedIntros, draft.assets.intro_scene)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Export MD
                  </button>
                  <button
                    onClick={() => exportIntrosAsJson(draft.metadata.character_name || draft.metadata.seed, savedIntros, draft.assets.intro_scene)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export JSON
                  </button>
                </div>
              </div>
              {savedIntros.map((intro, index) => renderCandidateCard(intro, index, true))}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{isIntroAsset ? `New Intros (${generatedCandidates.length})` : 'Generated Variants'}</h2>
                <p className="text-sm text-muted-foreground">
                  {isIntroAsset
                    ? 'Generate intros, keep the ones worth curating, or set one active immediately.'
                    : 'Keep generating until one is better than the current active version.'}
                </p>
              </div>
              {!isIntroAsset && <span className="app-pill app-pill-muted">{generatedCandidates.length} variants</span>}
            </div>

            {generatedCandidates.length === 0 ? (
              <div className="app-note p-4 text-sm text-muted-foreground">
                {isIntroAsset ? 'No intros generated yet.' : 'No variants generated yet.'}
              </div>
            ) : (
              <div className="space-y-3">
                {generatedCandidates.map((candidate, index) => renderCandidateCard(candidate, index))}
              </div>
            )}
          </div>
        </section>
      </div>
      )}
    </div>
  );
}