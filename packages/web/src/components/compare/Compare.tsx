import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { GitCompare, Loader2, Play, Plus, X } from 'lucide-react';
import {
  MAX_COMPARISON_CANDIDATES,
  MIN_COMPARISON_CANDIDATES,
  buildComparisonCandidateSummaries,
  createComparisonGroupId,
  type ComparisonCandidateStatus,
  type ContentMode,
  type DraftMetadata,
  type UsageRecord,
} from '@char-gen/shared';
import { api } from '@/lib/api';
import { GenerationService } from '@/lib/services/generation';
import DraftComparisonPanel from '../drafts/DraftComparisonPanel';

const CONTENT_MODES: ContentMode[] = ['Auto', 'SFW', 'NSFW', 'Platform-Safe'];

const COMPARISON_PROVIDERS = ['openai', 'openrouter', 'anthropic', 'google', 'deepseek', 'zai', 'moonshot', 'ollama'];

function formatCount(value: number): string {
  return value.toLocaleString();
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) {
    return '—';
  }
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function StatusPill({ status }: { status: ComparisonCandidateStatus | 'running' }) {
  const className =
    status === 'ok'
      ? 'text-success'
      : status === 'error'
        ? 'text-destructive'
        : status === 'running'
          ? 'text-primary'
          : 'text-muted-foreground';

  return <span className={`text-xs font-medium ${className}`}>{status}</span>;
}

export default function Compare() {
  const queryClient = useQueryClient();
  const [seed, setSeed] = useState('');
  const [templateName, setTemplateName] = useState<string>('');
  const [mode, setMode] = useState<ContentMode>('Auto');
  const [candidates, setCandidates] = useState<string[]>([]);
  const [candidateInput, setCandidateInput] = useState('');
  const [provider, setProvider] = useState<string>(COMPARISON_PROVIDERS[0]!);
  const [running, setRunning] = useState(false);
  const [runningModel, setRunningModel] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [runModels, setRunModels] = useState<string[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const [leftId, setLeftId] = useState<string>('');
  const [rightId, setRightId] = useState<string>('');

  const templatesQuery = useQuery({ queryKey: ['compare-templates'], queryFn: () => api.listTemplates() });
  const configQuery = useQuery({ queryKey: ['compare-config'], queryFn: () => api.getConfig() });
  const modelsQuery = useQuery({ queryKey: ['compare-models', provider], queryFn: () => api.getModels(provider) });

  const groupQuery = useQuery({
    queryKey: ['comparison-group', groupId],
    queryFn: () => api.getComparisonGroupDrafts(groupId ?? ''),
    enabled: Boolean(groupId),
  });
  const usageQuery = useQuery({
    queryKey: ['comparison-usage', groupId],
    queryFn: () => api.getUsageRecords({ kinds: ['comparison'] }),
    enabled: Boolean(groupId),
  });

  const groupDrafts: DraftMetadata[] = groupQuery.data ?? [];
  const groupUsage: UsageRecord[] = usageQuery.data ?? [];
  const summaries = buildComparisonCandidateSummaries(runModels, groupDrafts, groupUsage);
  const modelSuggestions = (modelsQuery.data?.models ?? []).map((model) => model.name).slice(0, 100);
  const canRun = !running && seed.trim().length > 0 && candidates.length >= MIN_COMPARISON_CANDIDATES;

  function addCandidate(value: string) {
    const model = value.trim();
    if (!model || candidates.includes(model) || candidates.length >= MAX_COMPARISON_CANDIDATES) {
      return;
    }
    setCandidates((current) => [...current, model]);
    setCandidateInput('');
  }

  function removeCandidate(model: string) {
    setCandidates((current) => current.filter((entry) => entry !== model));
  }

  async function runComparison() {
    if (!canRun) {
      return;
    }

    const nextGroupId = createComparisonGroupId();
    const models = [...candidates];

    setRunning(true);
    setRunError(null);
    setGroupId(nextGroupId);
    setRunModels(models);
    setLeftId('');
    setRightId('');

    for (const model of models) {
      setRunningModel(model);

      try {
        for await (const _progress of GenerationService.generate({
          seed: seed.trim(),
          template: templateName || undefined,
          mode,
          stream: true,
          model_override: model,
          comparison_group: nextGroupId,
        })) {
          void _progress;
        }
      } catch {
        // The candidate's usage record already carries the error outcome;
        // a failed candidate must not stop the rest of the run.
      }

      await queryClient.invalidateQueries({ queryKey: ['comparison-group', nextGroupId] });
      await queryClient.invalidateQueries({ queryKey: ['comparison-usage', nextGroupId] });
    }

    setRunningModel(null);
    setRunning(false);
  }

  const resolvedLeft = leftId || groupDrafts[0]?.review_id || '';
  const resolvedRight = rightId || groupDrafts[1]?.review_id || '';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Compare models</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Run one seed and template through {MIN_COMPARISON_CANDIDATES}–{MAX_COMPARISON_CANDIDATES} candidate models,
          then judge the drafts side by side with their token and time cost. Every candidate needs its provider key
          configured in Settings.
        </p>
      </header>

      <section className="space-y-4 rounded-lg border p-4" aria-label="Comparison launcher">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="compare-seed">
            Seed
          </label>
          <textarea
            id="compare-seed"
            className="min-h-20 w-full rounded-lg border bg-transparent p-2 text-sm text-foreground"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
            placeholder="The seed every candidate model will generate from"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="compare-template">
              Template
            </label>
            <select
              id="compare-template"
              className="w-full rounded-lg border bg-transparent px-2 py-2 text-sm text-foreground"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
            >
              <option value="">Default template</option>
              {(templatesQuery.data ?? []).map((template) => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="compare-mode">
              Content mode
            </label>
            <select
              id="compare-mode"
              className="w-full rounded-lg border bg-transparent px-2 py-2 text-sm text-foreground"
              value={mode}
              onChange={(event) => setMode(event.target.value as ContentMode)}
            >
              {CONTENT_MODES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="compare-candidate">
            Candidate models ({candidates.length}/{MAX_COMPARISON_CANDIDATES})
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Candidate provider"
              className="rounded-lg border bg-transparent px-2 py-2 text-sm text-foreground"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            >
              {COMPARISON_PROVIDERS.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
            <input
              id="compare-candidate"
              className="min-w-56 flex-1 rounded-lg border bg-transparent px-2 py-2 text-sm text-foreground"
              list="compare-model-suggestions"
              value={candidateInput}
              onChange={(event) => setCandidateInput(event.target.value)}
              placeholder="Model name, e.g. gpt-4o or claude-3-5-sonnet-latest"
            />
            <datalist id="compare-model-suggestions">
              {modelSuggestions.map((model) => (
                <option key={model} value={model} />
              ))}
            </datalist>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              onClick={() => addCandidate(candidateInput)}
              disabled={candidates.length >= MAX_COMPARISON_CANDIDATES}
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
            {configQuery.data?.model ? (
              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent"
                onClick={() => addCandidate(configQuery.data?.model ?? '')}
              >
                Use current ({configQuery.data.model})
              </button>
            ) : null}
          </div>
          {candidates.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {candidates.map((model) => (
                <li key={model} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm">
                  <span className="text-foreground">{model}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${model}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => removeCandidate(model)}
                    disabled={running}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              Add at least {MIN_COMPARISON_CANDIDATES} candidates to enable a run.
            </p>
          )}
        </div>

        {runError ? <p className="text-sm text-destructive">{runError}</p> : null}

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          onClick={() => void runComparison()}
          disabled={!canRun}
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? 'Running…' : `Run comparison (${candidates.length})`}
        </button>
      </section>

      {groupId ? (
        <section className="space-y-3" aria-label="Comparison results">
          <h2 className="text-lg font-semibold text-foreground">Results</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-accent text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Model</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Tokens</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">Character</th>
                  <th className="px-3 py-2">Draft</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((summary) => (
                  <tr key={summary.model} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-medium text-foreground">
                      {summary.model}
                      {runningModel === summary.model ? (
                        <Loader2 className="ml-2 inline h-3 w-3 animate-spin text-primary" />
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill status={runningModel === summary.model ? 'running' : summary.status} />
                      {summary.errorMessage ? (
                        <span className="ml-2 text-xs text-destructive">{summary.errorMessage}</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      {summary.totalTokens !== undefined ? formatCount(summary.totalTokens) : '—'}
                    </td>
                    <td className="px-3 py-2">{formatDuration(summary.durationMs ?? 0)}</td>
                    <td className="px-3 py-2">{summary.characterName ?? '—'}</td>
                    <td className="px-3 py-2">
                      {summary.draftId ? (
                        <Link className="text-primary hover:underline" to={`/drafts/${summary.draftId}`}>
                          Review
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {groupDrafts.length >= 2 ? (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <GitCompare className="h-4 w-4" />
                Side by side
              </h3>
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Left draft"
                  className="rounded-lg border bg-transparent px-2 py-1 text-sm text-foreground"
                  value={resolvedLeft}
                  onChange={(event) => setLeftId(event.target.value)}
                >
                  {groupDrafts.map((draft) => (
                    <option key={draft.review_id} value={draft.review_id}>
                      {draft.model} · {draft.character_name || draft.review_id}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Right draft"
                  className="rounded-lg border bg-transparent px-2 py-1 text-sm text-foreground"
                  value={resolvedRight}
                  onChange={(event) => setRightId(event.target.value)}
                >
                  {groupDrafts.map((draft) => (
                    <option key={draft.review_id} value={draft.review_id}>
                      {draft.model} · {draft.character_name || draft.review_id}
                    </option>
                  ))}
                </select>
              </div>
              <DraftComparisonPanel
                leftDraftId={resolvedLeft}
                rightDraftId={resolvedRight}
                draftOptions={groupDrafts}
                onLeftDraftChange={setLeftId}
                onRightDraftChange={setRightId}
              />
            </div>
          ) : (
            <p className="rounded-lg border p-4 text-sm text-muted-foreground">
              The side-by-side diff appears once at least two candidates have finished.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
