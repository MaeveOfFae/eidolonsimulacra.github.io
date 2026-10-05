import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Pause, Upload, X, CheckCircle, XCircle, Loader2, List, Users, Plus } from 'lucide-react';
import { MAX_CONNECTED_DRAFT_REFERENCES, type ContentMode } from '@char-gen/shared';
import { api } from '@/lib/api';
import CollapsibleSection from '../common/CollapsibleSection';
import {
  clearActiveBatchGenerationSession,
  loadActiveBatchGenerationSession,
  saveActiveBatchGenerationSession,
} from '@/lib/services/generation-session';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import { normalizeConnectedReferenceIds } from '@/lib/prompting/reference-context';

const PLANNED_BATCH_MODULES = [
  {
    name: 'Scheduling',
    description:
      'Timed and recurring batch execution remains staged until the queue model supports real scheduling state.',
  },
  {
    name: 'Template batch presets',
    description: 'Reusable batch template packs stay staged until the live batch workflow has clearer reuse rules.',
  },
];

interface BatchJob {
  seed: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  draftPath?: string;
  error?: string;
}

function getDefaultSelectedTemplateAssets(templateDefinition?: {
  assets: Array<{ name: string; required: boolean }>;
}): string[] {
  if (!templateDefinition) {
    return [];
  }

  return templateDefinition.assets
    .filter((asset) => {
      if (asset.required) {
        return true;
      }

      if (asset.name === 'system_prompt' || asset.name === 'post_history') {
        return false;
      }

      return true;
    })
    .map((asset) => asset.name);
}

function normalizeAssetSelection(
  selection: readonly string[],
  templateDefinition?: { assets: Array<{ name: string; required: boolean }> },
): string[] {
  if (!templateDefinition) {
    return [];
  }

  const templateAssetNames = new Set(templateDefinition.assets.map((asset) => asset.name));
  const requiredNames = new Set(templateDefinition.assets.filter((asset) => asset.required).map((asset) => asset.name));
  const selected = new Set<string>();

  selection.forEach((assetName) => {
    if (templateAssetNames.has(assetName)) {
      selected.add(assetName);
    }
  });

  requiredNames.forEach((assetName) => selected.add(assetName));

  return templateDefinition.assets.map((asset) => asset.name).filter((assetName) => selected.has(assetName));
}

export default function BatchGenerate() {
  const [seeds, setSeeds] = useState<string[]>([]);
  const [mode, setMode] = useState<ContentMode>('SFW');
  const [template, setTemplate] = useState<string>('');
  const [selectedConnectedDraftIds, setSelectedConnectedDraftIds] = useState<string[]>([]);
  const [pendingConnectedDraftId, setPendingConnectedDraftId] = useState('');
  const [parallel, setParallel] = useState(true);
  const [maxConcurrent, setMaxConcurrent] = useState(3);
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSeed, setCurrentSeed] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [selectedTemplateAssets, setSelectedTemplateAssets] = useState<string[]>([]);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const restoredSessionRef = useRef(loadActiveBatchGenerationSession());
  const abortRef = useRef<(() => void) | null>(null);

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const { data: draftsData } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const connectedDraftLookup = new Map((draftsData?.drafts ?? []).map((draft) => [draft.review_id, draft] as const));
  const availableConnectedDrafts = (draftsData?.drafts ?? []).filter(
    (draft) => !selectedConnectedDraftIds.includes(draft.review_id),
  );
  const selectedTemplate = useMemo(
    () =>
      templates?.find((candidate) => candidate.name === template) ??
      templates?.find((candidate) => candidate.is_default) ??
      templates?.[0],
    [template, templates],
  );
  const optionalTemplateAssets = useMemo(
    () => selectedTemplate?.assets.filter((asset) => !asset.required) ?? [],
    [selectedTemplate],
  );

  useEffect(() => {
    const session = restoredSessionRef.current;
    if (!session) {
      return;
    }

    setSeeds(session.seeds);
    setMode(session.mode);
    setTemplate(session.template || '');
    setSelectedTemplateAssets(session.selectedAssets ?? []);
    setSelectedConnectedDraftIds(normalizeConnectedReferenceIds(session.connectedDraftIds));
    setParallel(session.parallel);
    setMaxConcurrent(session.maxConcurrent);
    setInputText(session.inputText);
    setJobs(session.jobs);
    setCurrentSeed(session.currentSeed);

    if (session.status === 'running') {
      setResumeNotice(
        'Batch generation was interrupted. Restored the queue snapshot; start again to continue remaining work.',
      );
    } else if (session.jobs.length > 0) {
      setResumeNotice('Restored batch queue and progress snapshot.');
    } else {
      setResumeNotice('Restored batch queue settings.');
    }

    restoredSessionRef.current = null;
  }, []);

  useEffect(() => {
    if (!selectedTemplate) {
      setSelectedTemplateAssets([]);
      return;
    }

    setSelectedTemplateAssets((previous) => {
      if (previous.length === 0) {
        return getDefaultSelectedTemplateAssets(selectedTemplate);
      }

      return normalizeAssetSelection(previous, selectedTemplate);
    });
  }, [selectedTemplate]);

  const handleAddSeeds = () => {
    const newSeeds = inputText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !seeds.includes(s));
    if (newSeeds.length > 0) {
      setSeeds((prev) => [...prev, ...newSeeds]);
      setInputText('');
      setResumeNotice(null);
    }
  };

  const handleRemoveSeed = (seed: string) => {
    setSeeds((prev) => prev.filter((s) => s !== seed));
    setResumeNotice(null);
  };

  const handleClearAll = () => {
    setSeeds([]);
    setJobs([]);
    setCurrentSeed('');
    setInputText('');
    setSelectedConnectedDraftIds([]);
    setPendingConnectedDraftId('');
    setResumeNotice(null);
    clearActiveBatchGenerationSession();
  };

  const handleAddConnectedDraft = () => {
    if (!pendingConnectedDraftId) {
      return;
    }

    setSelectedConnectedDraftIds((previous) => {
      if (previous.includes(pendingConnectedDraftId) || previous.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
        return previous;
      }

      return [...previous, pendingConnectedDraftId];
    });
    setPendingConnectedDraftId('');
  };

  const handleRemoveConnectedDraft = (draftId: string) => {
    setSelectedConnectedDraftIds((previous) => previous.filter((candidate) => candidate !== draftId));
  };

  const handleRunBatch = async () => {
    if (seeds.length === 0 || isRunning) return;

    setIsRunning(true);
    setResumeNotice(null);
    setJobs(seeds.map((seed) => ({ seed, status: 'pending' as const })));

    try {
      const stream = api.generateBatch(seeds, {
        mode,
        template: template || undefined,
        selected_assets: selectedTemplateAssets,
        connected_draft_ids: selectedConnectedDraftIds.length > 0 ? selectedConnectedDraftIds : undefined,
        parallel,
        max_concurrent: maxConcurrent,
      });

      abortRef.current = () => stream.abort();

      stream.subscribe((event) => {
        if (event.event === 'batch_start') {
          const data = event.data as unknown as { index: number; seed: string };
          setCurrentSeed(data.seed);
          setJobs((prev) => prev.map((job, i) => (i === data.index ? { ...job, status: 'generating' } : job)));
        }
        if (event.event === 'batch_complete') {
          const data = event.data as unknown as { index: number; seed: string; draft_path: string };
          setJobs((prev) =>
            prev.map((job, i) => (i === data.index ? { ...job, status: 'complete', draftPath: data.draft_path } : job)),
          );
        }
        if (event.event === 'batch_error') {
          const data = event.data as unknown as { index: number; seed: string; error: string };
          setJobs((prev) =>
            prev.map((job, i) => (i === data.index ? { ...job, status: 'error', error: data.error } : job)),
          );
        }
      });

      stream.onError_((error) => {
        console.error('Batch error:', error);
        setIsRunning(false);
        setCurrentSeed('');
        setResumeNotice('Batch run stopped after an error. Queue snapshot is still available.');
      });

      stream.onComplete_(() => {
        setIsRunning(false);
        setCurrentSeed('');
      });

      await stream.start();
    } catch (err) {
      console.error(err);
      setIsRunning(false);
      setCurrentSeed('');
      setResumeNotice('Batch run was interrupted. Queue snapshot was preserved.');
    }
  };

  const handleToggleOptionalAsset = (assetName: string) => {
    if (!selectedTemplate) {
      return;
    }

    const isRequired = selectedTemplate.assets.find((asset) => asset.name === assetName)?.required;
    if (isRequired) {
      return;
    }

    setSelectedTemplateAssets((previous) => {
      const next = new Set(previous);
      if (next.has(assetName)) {
        next.delete(assetName);
      } else {
        next.add(assetName);
      }

      return normalizeAssetSelection(Array.from(next), selectedTemplate);
    });
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current();
      setIsRunning(false);
      setCurrentSeed('');
      setResumeNotice('Batch run stopped. Queue snapshot is still available.');
    }
  };

  useEffect(() => {
    const hasState = Boolean(
      seeds.length > 0 ||
      inputText.trim() ||
      jobs.length > 0 ||
      template ||
      selectedTemplateAssets.length > 0 ||
      selectedConnectedDraftIds.length > 0 ||
      mode !== 'SFW' ||
      !parallel ||
      maxConcurrent !== 3,
    );

    if (!hasState) {
      clearActiveBatchGenerationSession();
      return;
    }

    saveActiveBatchGenerationSession({
      version: 1,
      seeds,
      mode,
      template: template || undefined,
      selectedAssets: selectedTemplateAssets,
      connectedDraftIds: selectedConnectedDraftIds,
      parallel,
      maxConcurrent,
      inputText,
      jobs,
      currentSeed,
      status: isRunning ? 'running' : jobs.length > 0 ? 'ready' : 'configuring',
      updatedAt: Date.now(),
    });
  }, [
    currentSeed,
    inputText,
    isRunning,
    jobs,
    maxConcurrent,
    mode,
    parallel,
    seeds,
    selectedConnectedDraftIds,
    selectedTemplateAssets,
    template,
  ]);

  useEffect(() => {
    if (!isRunning && seeds.length === 0 && !inputText.trim() && jobs.length === 0) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [inputText, isRunning, jobs.length, seeds.length]);

  const modes: ContentMode[] = ['SFW', 'NSFW', 'Platform-Safe', 'Auto'];

  const completedCount = jobs.filter((j) => j.status === 'complete').length;
  const errorCount = jobs.filter((j) => j.status === 'error').length;
  const progress = jobs.length > 0 ? ((completedCount + errorCount) / jobs.length) * 100 : 0;

  useAssistantScreenContext({
    seed_count: seeds.length,
    current_seed: currentSeed,
    mode,
    template: template || 'default',
    parallel,
    max_concurrent: maxConcurrent,
    is_running: isRunning,
    progress_percent: Number(progress.toFixed(0)),
    completed_jobs: completedCount,
    error_jobs: errorCount,
    connected_reference_count: selectedConnectedDraftIds.length,
  });

  return (
    <div className="app-page max-w-5xl space-y-10 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Batch generation</p>
            <h1 className="app-page-title">Generate multiple characters at once</h1>
            <p className="app-page-summary">Queue seeds, set defaults, and monitor progress.</p>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Queue state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Seeds</p>
                <div className="app-page-metric-value text-2xl">{seeds.length}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Mode</p>
                <div className="app-page-metric-value text-2xl">{mode}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Concurrency</p>
                <div className="app-page-metric-value text-2xl">{parallel ? maxConcurrent : 1}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CollapsibleSection
        title="Seeds"
        subtitle="Queue one seed per line"
        preview={`${seeds.length} queued`}
        defaultExpanded
      >
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Seeds</h2>
          <span className="text-sm text-muted-foreground">({seeds.length} added)</span>
        </div>

        <div className="space-y-2">
          <textarea
            aria-label="Seeds, one per line"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter seeds, one per line...&#10;Example:&#10;Space pirate captain with a secret&#10;Medieval healer with forbidden knowledge&#10;Cyberpunk hacker on the run"
            className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isRunning}
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddSeeds}
              disabled={!inputText.trim() || isRunning}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Add Seeds
            </button>
            <button
              onClick={handleClearAll}
              disabled={seeds.length === 0 || isRunning}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          </div>
        </div>

        {resumeNotice && (
          <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
            {resumeNotice}
          </div>
        )}

        {/* Seed List */}
        {seeds.length > 0 && (
          <div className="max-h-48 overflow-auto rounded-md border border-border">
            <div className="divide-y divide-border">
              {seeds.map((seed, index) => (
                <div key={index} className="flex min-w-0 items-center justify-between gap-2 px-3 py-2 text-sm">
                  <span className="truncate break-all flex-1">{seed}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSeed(seed)}
                    disabled={isRunning}
                    aria-label={`Remove seed: ${seed}`}
                    className="ml-2 text-muted-foreground hover:text-destructive disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Options"
        subtitle="Mode, template, references, and concurrency"
        preview={`${mode} • ${template || 'Default'} • ${parallel ? `parallel ${maxConcurrent}` : 'serial'}`}
      >
        <h2 className="text-lg font-semibold">Options</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Mode</label>
            <div className="flex flex-wrap gap-2">
              {modes.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  disabled={isRunning}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === m ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                  } disabled:opacity-50`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Template */}
          <div className="space-y-2">
            <label htmlFor="batch-template" className="text-sm font-medium">
              Template
            </label>
            <select
              id="batch-template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              disabled={isRunning}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Default</option>
              {templates?.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {optionalTemplateAssets.length > 0 && (
          <div className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-4">
            <div>
              <label className="text-sm font-medium">Optional blueprint assets</label>
              <p className="mt-1 text-xs text-muted-foreground">
                Toggle non-required assets for every seed in this batch run.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {optionalTemplateAssets.map((asset) => {
                const enabled = selectedTemplateAssets.includes(asset.name);
                return (
                  <label
                    key={asset.name}
                    className="flex items-start gap-3 rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleToggleOptionalAsset(asset.name)}
                      disabled={isRunning}
                      className="mt-0.5 rounded border-input"
                    />
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground">{asset.name}</span>
                      {asset.description && (
                        <span className="block text-xs text-muted-foreground">{asset.description}</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-4">
          <div>
            <label className="text-sm font-medium">Connected character references</label>
            <p className="mt-1 text-xs text-muted-foreground">
              Attach up to {MAX_CONNECTED_DRAFT_REFERENCES} saved drafts as continuity anchors for every seed in this
              batch.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={pendingConnectedDraftId}
              onChange={(e) => setPendingConnectedDraftId(e.target.value)}
              disabled={
                isRunning ||
                availableConnectedDrafts.length === 0 ||
                selectedConnectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES
              }
              aria-label="Batch connected draft reference"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">Add a saved draft...</option>
              {availableConnectedDrafts.map((draft) => (
                <option key={draft.review_id} value={draft.review_id}>
                  {draft.character_name || draft.review_id}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddConnectedDraft}
              disabled={
                !pendingConnectedDraftId ||
                isRunning ||
                selectedConnectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES
              }
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add reference
            </button>
          </div>
          {selectedConnectedDraftIds.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="h-4 w-4 text-primary" />
                {selectedConnectedDraftIds.length} connected reference
                {selectedConnectedDraftIds.length === 1 ? '' : 's'} selected
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedConnectedDraftIds.map((draftId) => (
                  <span
                    key={draftId}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {connectedDraftLookup.get(draftId)?.character_name || draftId}
                    <button
                      type="button"
                      onClick={() => handleRemoveConnectedDraft(draftId)}
                      disabled={isRunning}
                      aria-label={`Remove ${connectedDraftLookup.get(draftId)?.character_name || draftId}`}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No connected references selected.</p>
          )}
        </div>

        {/* Parallel Settings */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={parallel}
              onChange={(e) => setParallel(e.target.checked)}
              disabled={isRunning}
              className="rounded border-input"
            />
            <span className="text-sm">Run in parallel</span>
          </label>

          {parallel && (
            <div className="flex items-center gap-2">
              <label htmlFor="batch-max-concurrent" className="text-sm text-muted-foreground">
                Max concurrent:
              </label>
              <input
                id="batch-max-concurrent"
                type="number"
                min="1"
                max="10"
                value={maxConcurrent}
                onChange={(e) => setMaxConcurrent(parseInt(e.target.value) || 3)}
                disabled={isRunning}
                className="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {jobs.length > 0 && (
        <CollapsibleSection
          title="Progress"
          subtitle="Live queue status"
          preview={`${completedCount}/${jobs.length} complete${errorCount > 0 ? ` • ${errorCount} failed` : ''}`}
          defaultExpanded
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Progress</h2>
            <span className="text-sm text-muted-foreground">
              {completedCount} / {jobs.length} complete
              {errorCount > 0 && ` (${errorCount} failed)`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          {/* Current Seed */}
          {currentSeed && (
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="truncate">Generating: {currentSeed}</span>
            </div>
          )}

          {/* Job List */}
          <div className="max-h-64 overflow-auto rounded-md border border-border">
            <div className="divide-y divide-border">
              {jobs.map((job, index) => (
                <div key={index} className="flex min-w-0 items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="truncate break-all flex-1">{job.seed}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    {job.status === 'pending' && <span className="text-muted-foreground">Pending</span>}
                    {job.status === 'generating' && (
                      <span className="flex items-center gap-1 text-primary">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating
                      </span>
                    )}
                    {job.status === 'complete' && (
                      <a
                        href={`/drafts/${encodeURIComponent(job.draftPath || '')}`}
                        className="flex items-center gap-1 text-green-500 hover:underline"
                      >
                        <CheckCircle className="h-4 w-4" />
                        View
                      </a>
                    )}
                    {job.status === 'error' && (
                      <span className="flex items-center gap-1 text-destructive">
                        <XCircle className="h-4 w-4" />
                        {job.error || 'Error'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      <div className="flex flex-wrap gap-4">
        {isRunning ? (
          <button
            onClick={handleStop}
            className="inline-flex items-center gap-2 rounded-md bg-destructive px-6 py-3 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            <Pause className="h-5 w-5" />
            Stop
          </button>
        ) : (
          <button
            onClick={handleRunBatch}
            disabled={seeds.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Play className="h-5 w-5" />
            Start Generation ({seeds.length} seeds)
          </button>
        )}
      </div>

      <CollapsibleSection
        title="Staged modules"
        subtitle="Scheduling and reusable batch presets stay out of the live flow"
        preview="Not live"
        className="border-dashed"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Staged batch modules</h2>
            <p className="text-sm text-muted-foreground">
              The live batch flow stays focused on queueing and run progress. Scheduling and reusable template packs
              remain staged until the queue model supports them properly.
            </p>
          </div>
          <span className="app-pill app-pill-muted">Not live</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {PLANNED_BATCH_MODULES.map((module) => (
            <article key={module.name} className="rounded-lg border border-border bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{module.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                </div>
                <span className="app-pill app-pill-muted">Staged</span>
              </div>
            </article>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
