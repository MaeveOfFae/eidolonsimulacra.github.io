import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CheckCircle2, Circle, Loader2, XCircle, FileText, Clock, RotateCcw, Save } from 'lucide-react';
import type { GenerationComplete, ImportedCharacter, Template } from '@char-gen/shared';
import { GenerationService } from '../../lib/services/generation.js';
import { configManager } from '../../lib/config/manager.js';
import {
  clearActiveGenerationSession,
  loadActiveGenerationSession,
  matchesActiveGenerationSession,
  saveActiveGenerationSession,
  type ActiveGenerationSession,
  type ImportedCharacterSnapshot,
} from '../../lib/services/generation-session.js';
import { inferCharacterDisplayNameForTemplate } from '../../lib/templates/browser.js';
import { loadReferenceSuites, normalizeConnectedReferenceIds } from '../../lib/prompting/reference-context.js';

interface GenerationProgressProps {
  seed: string;
  mode: 'SFW' | 'NSFW' | 'Platform-Safe' | 'Auto';
  template?: string;
  selectedAssets?: string[];
  connectedDraftIds?: string[];
  additionalInstructions?: string[];
  importedCharacter?: Pick<ImportedCharacter, 'name' | 'sourceFormat' | 'sourcePreset' | 'assets'> | null;
  importedCharacterTemplateName?: string | null;
  templates: Template[];
  onComplete: (data: GenerationComplete) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

interface AssetProgress {
  name: string;
  status: 'pending' | 'generating' | 'reviewing' | 'complete' | 'error';
  content?: string;
}

type ResumeAction =
  | { type: 'idle' }
  | { type: 'new' }
  | { type: 'review' }
  | { type: 'generate'; assetIndex: number; approvedAssets: Record<string, string> }
  | { type: 'save'; approvedAssets: Record<string, string> };

function sortTemplateAssets(template?: Template): string[] {
  if (!template) {
    return [];
  }

  const assets = template.assets;
  const inDegree = new Map<string, number>();
  const edges = new Map<string, string[]>();

  for (const asset of assets) {
    inDegree.set(asset.name, asset.depends_on.length);
    edges.set(asset.name, []);
  }

  for (const asset of assets) {
    for (const dependency of asset.depends_on) {
      const dependents = edges.get(dependency);
      if (dependents) {
        dependents.push(asset.name);
      }
    }
  }

  const queue = assets.filter((asset) => asset.depends_on.length === 0).map((asset) => asset.name);
  const ordered: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    ordered.push(current);
    for (const dependent of edges.get(current) || []) {
      const nextDegree = (inDegree.get(dependent) || 0) - 1;
      inDegree.set(dependent, nextDegree);
      if (nextDegree === 0) {
        queue.push(dependent);
      }
    }
  }

  return ordered.length === assets.length ? ordered : assets.map((asset) => asset.name);
}

export default function GenerationProgress({
  seed,
  mode,
  template,
  selectedAssets = [],
  connectedDraftIds = [],
  additionalInstructions = [],
  importedCharacter = null,
  importedCharacterTemplateName = null,
  templates,
  onComplete,
  onCancel,
}: GenerationProgressProps) {
  const [status, setStatus] = useState<'initializing' | 'generating' | 'reviewing' | 'saving' | 'complete' | 'error'>(
    'initializing',
  );
  const [currentAsset, setCurrentAsset] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetProgress[]>([]);
  const [assetDrafts, setAssetDrafts] = useState<Record<string, string>>({});
  const [editorContent, setEditorContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [characterName, setCharacterName] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [resumeAction, setResumeAction] = useState<ResumeAction>({ type: 'idle' });
  const abortControllerRef = useRef<AbortController | null>(null);
  const restoredSessionRef = useRef<ActiveGenerationSession | null>(loadActiveGenerationSession());

  const selectedTemplate = useMemo(
    () => templates.find((candidate) => candidate.name === template),
    [template, templates],
  );
  const referenceDraftIds = useMemo(() => normalizeConnectedReferenceIds(connectedDraftIds), [connectedDraftIds]);
  const importedCharacterSnapshot = useMemo<ImportedCharacterSnapshot | undefined>(() => {
    if (!importedCharacter) {
      return undefined;
    }

    return {
      name: importedCharacter.name,
      sourceFormat: importedCharacter.sourceFormat,
      ...(importedCharacter.sourcePreset ? { sourcePreset: importedCharacter.sourcePreset } : {}),
      ...(importedCharacterTemplateName ? { templateName: importedCharacterTemplateName } : {}),
      assets: Object.fromEntries(
        Object.entries(importedCharacter.assets).sort(([left], [right]) => left.localeCompare(right)),
      ),
    };
  }, [importedCharacter, importedCharacterTemplateName]);
  const importedSourceContext = useMemo(() => {
    if (!importedCharacterSnapshot) {
      return undefined;
    }

    return {
      label: importedCharacterSnapshot.name,
      source: importedCharacterSnapshot.sourcePreset || importedCharacterSnapshot.sourceFormat,
      assets: importedCharacterSnapshot.assets,
      template: selectedTemplate,
    };
  }, [importedCharacterSnapshot, selectedTemplate]);
  const assetOrder = useMemo(() => sortTemplateAssets(selectedTemplate), [selectedTemplate]);
  const activeAssetOrder = useMemo(() => {
    if (!selectedTemplate || assetOrder.length === 0) {
      return assetOrder;
    }

    const selectedSet = new Set(selectedAssets);
    const assetsByName = new Map(selectedTemplate.assets.map((asset) => [asset.name, asset] as const));

    // Required assets are always active.
    selectedTemplate.assets.filter((asset) => asset.required).forEach((asset) => selectedSet.add(asset.name));

    // Ensure dependency closure for any selected asset.
    const visited = new Set<string>();
    const includeDependencies = (assetName: string) => {
      if (visited.has(assetName)) {
        return;
      }

      visited.add(assetName);
      const asset = assetsByName.get(assetName);
      if (!asset) {
        return;
      }

      asset.depends_on.forEach((dependencyName) => {
        selectedSet.add(dependencyName);
        includeDependencies(dependencyName);
      });
    };

    Array.from(selectedSet).forEach(includeDependencies);

    return assetOrder.filter((assetName) => selectedSet.has(assetName));
  }, [assetOrder, selectedAssets, selectedTemplate]);

  const updateAssetStatus = useCallback((assetName: string, nextStatus: AssetProgress['status'], content?: string) => {
    setAssets((previous) =>
      previous.map((asset) =>
        asset.name === assetName ? { ...asset, status: nextStatus, content: content ?? asset.content } : asset,
      ),
    );
  }, []);

  const getApprovedAssets = useCallback(
    (upToIndex: number, currentOverride?: { name: string; content: string }) => {
      const approved: Record<string, string> = {};
      for (let index = 0; index < upToIndex; index += 1) {
        const assetName = activeAssetOrder[index];
        const content = assetDrafts[assetName];
        if (content) {
          approved[assetName] = content;
        }
      }
      if (currentOverride) {
        approved[currentOverride.name] = currentOverride.content;
      }
      return approved;
    },
    [activeAssetOrder, assetDrafts],
  );

  const loadConnectedReferenceSuites = useCallback(
    async () =>
      loadReferenceSuites(referenceDraftIds, {
        resolveTemplate: (templateName) =>
          templateName ? templates.find((candidate) => candidate.name === templateName) : undefined,
      }),
    [referenceDraftIds, templates],
  );

  const generateAsset = useCallback(
    async (assetIndex: number, approvedAssets: Record<string, string>) => {
      const assetName = activeAssetOrder[assetIndex];
      if (!assetName) {
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setStatus('generating');
      setCurrentAsset(assetName);
      setEditorContent('');
      setError(null);
      updateAssetStatus(assetName, 'generating');

      let fullContent = '';

      try {
        // Use client-side GenerationService for single asset generation
        const referenceSuites = await loadConnectedReferenceSuites();

        for await (const progress of GenerationService.generateAsset(
          {
            seed,
            mode: mode as 'SFW' | 'NSFW' | 'Platform-Safe',
            template,
            asset_name: assetName,
            prior_assets: approvedAssets,
            additional_instructions: additionalInstructions,
            reference_suites: referenceSuites,
            imported_source: importedSourceContext,
          },
          true,
          { signal: controller.signal },
        )) {
          if (controller.signal.aborted) {
            return;
          }

          if (progress.type === 'chunk' && progress.content) {
            fullContent += progress.content;
            setEditorContent(fullContent);
            setStatus('generating');
          } else if (progress.type === 'asset' && progress.content) {
            fullContent = progress.content;
            setEditorContent(fullContent);
            updateAssetStatus(assetName, 'reviewing', fullContent);
            setStatus('reviewing');
            return;
          } else if (progress.type === 'error') {
            throw new Error(progress.error || 'Asset generation failed');
          }
        }

        if (!fullContent) {
          throw new Error('No content generated');
        }

        updateAssetStatus(assetName, 'reviewing', fullContent);
        setStatus('reviewing');
      } catch (generationError) {
        if (controller.signal.aborted) {
          return;
        }
        const message = generationError instanceof Error ? generationError.message : 'Asset generation failed';
        setError(message);
        updateAssetStatus(assetName, 'error', fullContent || undefined);
        setEditorContent(fullContent);
        setStatus('reviewing');
      }
    },
    [activeAssetOrder, importedSourceContext, loadConnectedReferenceSuites, mode, seed, template, updateAssetStatus],
  );

  const saveApprovedDraft = useCallback(
    async (approvedAssets: Record<string, string>) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setStatus('saving');

      try {
        const { DraftStorage } = await import('../../lib/storage/draft-db.js');
        const reviewId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const nextCharacterName = inferCharacterDisplayNameForTemplate(approvedAssets, template);

        const draft = {
          path: reviewId,
          metadata: {
            review_id: reviewId,
            seed,
            mode: mode as 'SFW' | 'NSFW' | 'Platform-Safe',
            model: configManager.getConfig().model,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            favorite: false,
            template_name: template,
            character_name: nextCharacterName,
            connected_drafts: referenceDraftIds.length > 0 ? referenceDraftIds : undefined,
          },
          assets: approvedAssets,
        };

        await DraftStorage.saveDraft(draft);

        clearActiveGenerationSession();
        setCharacterName(nextCharacterName ?? null);
        setStatus('complete');
        onComplete({
          draft_path: reviewId,
          draft_id: reviewId,
          character_name: nextCharacterName,
          duration_ms: Date.now() - startTime,
        });
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : 'Unknown storage error';
        setError(`Failed to save draft: ${message}`);
        setStatus('reviewing');
      }
    },
    [mode, onComplete, referenceDraftIds, seed, startTime, template],
  );

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'generating' || status === 'reviewing' || status === 'saving') {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, status]);

  // Initialize assets from template
  // Inline props (templates, selectedAssets, connectedDraftIds) get new identities on
  // every parent render, so this effect fires even when nothing meaningful changed.
  // Guard on a value signature so a re-run cannot reset state and loop forever.
  const initializationSignature = JSON.stringify({
    order: activeAssetOrder,
    seed,
    mode,
    template,
    references: referenceDraftIds,
    importedCharacter: importedCharacterSnapshot ?? null,
  });
  const appliedInitializationRef = useRef<string | null>(null);

  useEffect(() => {
    if (appliedInitializationRef.current === initializationSignature) {
      return;
    }

    appliedInitializationRef.current = initializationSignature;

    if (activeAssetOrder.length === 0) {
      setAssets([]);
      setResumeAction({ type: 'idle' });
      return;
    }

    const storedSession = restoredSessionRef.current;
    const canResume =
      storedSession &&
      matchesActiveGenerationSession(storedSession, {
        seed,
        mode,
        template,
        selectedAssets: activeAssetOrder,
        connectedDraftIds: referenceDraftIds,
        importedCharacter: importedCharacterSnapshot,
      }) &&
      Object.keys(storedSession.assetDrafts).every((assetName) => activeAssetOrder.includes(assetName));

    if (!canResume) {
      setAssets(activeAssetOrder.map((name) => ({ name, status: 'pending' })));
      setAssetDrafts({});
      setCurrentAsset(null);
      setEditorContent('');
      setError(null);
      setCharacterName(null);
      setResumeAction({ type: 'new' });
      return;
    }

    const approvedAssets = storedSession.assetDrafts;
    const restoredCurrentAsset =
      storedSession.currentAsset && activeAssetOrder.includes(storedSession.currentAsset)
        ? storedSession.currentAsset
        : null;
    const restoredAssets = activeAssetOrder.map((name) => {
      if (approvedAssets[name]) {
        return { name, status: 'complete' as const, content: approvedAssets[name] };
      }
      if (restoredCurrentAsset === name && storedSession.currentStatus === 'reviewing') {
        return { name, status: 'reviewing' as const, content: storedSession.currentAssetContent };
      }
      return { name, status: 'pending' as const };
    });

    setAssets(restoredAssets);
    setAssetDrafts(approvedAssets);
    setCurrentAsset(restoredCurrentAsset);
    setEditorContent(storedSession.currentStatus === 'reviewing' ? storedSession.currentAssetContent : '');
    setError(null);
    setCharacterName(inferCharacterDisplayNameForTemplate(approvedAssets, template) ?? null);

    if (storedSession.currentStatus === 'reviewing' && restoredCurrentAsset) {
      setStatus('reviewing');
      setResumeAction({ type: 'review' });
      return;
    }

    if (Object.keys(approvedAssets).length >= activeAssetOrder.length) {
      setStatus('saving');
      setResumeAction({ type: 'save', approvedAssets });
      return;
    }

    const nextAssetName = restoredCurrentAsset || activeAssetOrder[Object.keys(approvedAssets).length];
    const nextAssetIndex = activeAssetOrder.indexOf(nextAssetName);

    setStatus('initializing');
    setResumeAction({
      type: 'generate',
      assetIndex: nextAssetIndex >= 0 ? nextAssetIndex : 0,
      approvedAssets,
    });
  }, [activeAssetOrder, importedCharacterSnapshot, initializationSignature, mode, referenceDraftIds, seed, template]);

  // Start generation
  useEffect(() => {
    if (resumeAction.type === 'idle' || activeAssetOrder.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      // Clear the queued action before dispatching so identity churn in the
      // dependencies cannot re-schedule the same generation repeatedly.
      setResumeAction({ type: 'idle' });

      if (resumeAction.type === 'new') {
        void generateAsset(0, {});
        return;
      }

      if (resumeAction.type === 'generate') {
        void generateAsset(resumeAction.assetIndex, resumeAction.approvedAssets);
        return;
      }

      if (resumeAction.type === 'save') {
        void saveApprovedDraft(resumeAction.approvedAssets);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [activeAssetOrder.length, generateAsset, resumeAction, saveApprovedDraft]);

  useEffect(() => {
    if (status === 'complete' || status === 'error') {
      return;
    }

    const currentStatus = status === 'reviewing' || status === 'saving' ? status : 'generating';
    saveActiveGenerationSession({
      version: 1,
      seed,
      mode,
      template,
      selectedAssets: activeAssetOrder,
      connectedDraftIds: referenceDraftIds,
      importedCharacter: importedCharacterSnapshot,
      assetDrafts,
      currentAsset,
      currentAssetContent: currentStatus === 'reviewing' ? editorContent : '',
      currentStatus,
      startedAt: startTime,
      updatedAt: Date.now(),
    });
  }, [
    activeAssetOrder,
    assetDrafts,
    currentAsset,
    editorContent,
    importedCharacterSnapshot,
    mode,
    referenceDraftIds,
    seed,
    startTime,
    status,
    template,
  ]);

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
    clearActiveGenerationSession();
    onCancel();
  }, [onCancel]);

  const handleContinue = useCallback(async () => {
    if (!currentAsset) {
      return;
    }

    const assetIndex = activeAssetOrder.indexOf(currentAsset);
    if (assetIndex < 0) {
      return;
    }
    const hasCurrentContent = editorContent.trim().length > 0;
    const approved = hasCurrentContent
      ? getApprovedAssets(assetIndex, { name: currentAsset, content: editorContent })
      : getApprovedAssets(assetIndex);
    setError(null);
    setAssetDrafts(approved);
    if (hasCurrentContent) {
      updateAssetStatus(currentAsset, 'complete', editorContent);
    }

    const nextIndex = assetIndex + 1;
    if (nextIndex < activeAssetOrder.length) {
      await generateAsset(nextIndex, approved);
      return;
    }

    await saveApprovedDraft(approved);
  }, [
    activeAssetOrder,
    currentAsset,
    editorContent,
    generateAsset,
    getApprovedAssets,
    saveApprovedDraft,
    updateAssetStatus,
  ]);

  const handleRegenerate = useCallback(async () => {
    if (!currentAsset) {
      return;
    }
    const assetIndex = activeAssetOrder.indexOf(currentAsset);
    if (assetIndex < 0) {
      return;
    }
    const approved = getApprovedAssets(assetIndex);
    await generateAsset(assetIndex, approved);
  }, [activeAssetOrder, currentAsset, generateAsset, getApprovedAssets]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completedCount = assets.filter((a) => a.status === 'complete').length;
  const progress = assets.length > 0 ? (completedCount / assets.length) * 100 : 0;
  const currentAssetIndex = currentAsset ? activeAssetOrder.indexOf(currentAsset) : -1;
  const isFinalAsset = currentAssetIndex >= 0 && currentAssetIndex === activeAssetOrder.length - 1;
  const canSaveWithoutCurrentAsset =
    status === 'reviewing' && isFinalAsset && completedCount > 0 && !editorContent.trim();

  const getStageLabel = (s: typeof status) => {
    switch (s) {
      case 'initializing':
        return 'Preparing generation...';
      case 'generating':
        return 'Generating current asset...';
      case 'reviewing':
        return 'Review and edit this asset';
      case 'saving':
        return 'Saving reviewed draft...';
      case 'complete':
        return 'Complete!';
      case 'error':
        return 'Error';
      default:
        return s;
    }
  };

  const getAssetIcon = (status: AssetProgress['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'reviewing':
        return <FileText className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <h3 className="font-semibold">Generation Failed</h3>
        </div>
        <p className="mt-2 text-sm text-destructive/80">{error}</p>
        <button
          onClick={onCancel}
          className="mt-4 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{getStageLabel(status)}</h3>
          <p className="text-sm text-muted-foreground">
            {currentAsset ? `Current asset: ${currentAsset}` : 'Processing...'}
          </p>
          {characterName && <p className="text-sm text-muted-foreground">Character: {characterName}</p>}
          {referenceDraftIds.length > 0 && (
            <p className="text-sm text-muted-foreground">Connected references: {referenceDraftIds.length}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(elapsed)}
          </div>
          <button
            onClick={handleCancel}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>
            {completedCount} / {assets.length} assets
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Asset List */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {assets.map((asset) => (
          <div
            key={asset.name}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
              asset.status === 'generating'
                ? 'border-primary bg-primary/10'
                : asset.status === 'reviewing'
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : asset.status === 'complete'
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-border'
            }`}
          >
            {getAssetIcon(asset.status)}
            <span className="truncate">{asset.name}</span>
          </div>
        ))}
      </div>

      {/* Current Asset Editor */}
      {currentAsset && (status === 'reviewing' || status === 'generating' || status === 'saving') && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{currentAsset.replace(/_/g, ' ')}</span>
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {error?.startsWith('Failed to save draft:') && (
            <p className="text-xs text-muted-foreground">
              The current generation session is still open. Retry Save Draft after fixing the issue.
            </p>
          )}
          {canSaveWithoutCurrentAsset && (
            <p className="text-xs text-muted-foreground">
              You can save the draft without this asset and regenerate or add it later from review.
            </p>
          )}
          <textarea
            value={editorContent}
            onChange={(event) => setEditorContent(event.target.value)}
            disabled={status !== 'reviewing'}
            aria-label={`Content for ${currentAsset?.replace(/_/g, ' ') ?? 'asset'}`}
            placeholder="Generated content will appear here for review…"
            className="min-h-[280px] w-full rounded-md border border-input bg-background p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
          />
          <p className="text-xs text-muted-foreground">
            Downstream assets will use this reviewed text as source context.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => void handleRegenerate()}
              disabled={status !== 'reviewing'}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Regenerate Asset
            </button>
            <button
              onClick={() => void handleContinue()}
              disabled={status !== 'reviewing' || (!editorContent.trim() && !canSaveWithoutCurrentAsset)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {completedCount + 1 >= assets.length ? 'Save Draft' : 'Approve and Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
