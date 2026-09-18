import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, FolderSearch, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ValidationResponse } from '@char-gen/shared';
import { api } from '@/lib/api';
import CollapsibleSection from '../common/CollapsibleSection';
import { useAssistantScreenContext } from '../common/useAssistantContext';

export default function Validation() {
  const [path, setPath] = useState('');
  const [selectedDraftId, setSelectedDraftId] = useState('');
  const [result, setResult] = useState<ValidationResponse | null>(null);

  const { data: draftsData, isLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const validatePathMutation = useMutation({
    mutationFn: () => api.validatePath({ path }),
    onSuccess: (data) => setResult(data),
  });

  const validateDraftMutation = useMutation({
    mutationFn: (draftId: string) => api.validateDraft(draftId),
    onSuccess: (data) => setResult(data),
  });

  const findings = useMemo(() => {
    if (!result?.output) {
      return [] as string[];
    }
    return result.output.split('\n').map((line) => line.trim()).filter(Boolean);
  }, [result]);

  const isPending = validatePathMutation.isPending || validateDraftMutation.isPending;
  const mutationError = validatePathMutation.error || validateDraftMutation.error;

  useAssistantScreenContext({
    validation_path: path,
    selected_draft_id: selectedDraftId,
    has_result: Boolean(result),
    validation_success: result?.success ?? null,
    validation_output_preview: result?.output.slice(0, 500) ?? '',
    is_validating: isPending,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="app-page space-y-6 pb-10">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-3">
            <p className="app-page-eyebrow">Validation</p>
            <h1 className="app-page-title">Run structural checks</h1>
            <p className="app-page-summary">Validate a path or saved draft before export.</p>
          </div>

          <div className="app-panel-muted p-3.5">
            <p className="app-page-eyebrow">Current state</p>
            <div className="mt-3 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Drafts</p>
                <div className="app-page-metric-value text-2xl">{draftsData?.drafts.length ?? 0}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Last run</p>
                <div className="app-page-metric-value text-xl sm:text-2xl">{result ? (result.success ? 'Passed' : 'Failed') : 'Idle'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <CollapsibleSection
          title="Validate path"
          subtitle="Run the validator against a saved draft path"
          preview={path.trim() || 'No path selected'}
          defaultExpanded
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderSearch className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Validate path</h2>
            </div>
            <p className="text-sm text-muted-foreground">Run the validator against a saved draft path.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={path}
              onChange={(event) => setPath(event.target.value)}
              placeholder="drafts/20260307_203638_unnamed_character"
              className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={() => validatePathMutation.mutate()}
              disabled={isPending || !path.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:self-start"
            >
              {validatePathMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Validate
            </button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Validate draft"
          subtitle="Pick a reviewed draft and run the same checks"
          preview={selectedDraftId || 'No draft selected'}
          defaultExpanded={Boolean(selectedDraftId)}
          className="min-w-0"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Validate draft</h2>
            </div>
            <p className="text-sm text-muted-foreground">Pick a reviewed draft and run the same structural checks.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedDraftId}
              onChange={(event) => setSelectedDraftId(event.target.value)}
              aria-label="Select a draft to validate"
              className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a draft...</option>
              {draftsData?.drafts.map((draft) => (
                <option key={draft.review_id} value={draft.review_id}>
                  {draft.character_name || draft.seed}
                </option>
              ))}
            </select>
            <button
              onClick={() => validateDraftMutation.mutate(selectedDraftId)}
              disabled={isPending || !selectedDraftId}
              data-tour-anchor="validation-draft-run"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:self-start"
            >
              {validateDraftMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Validate Draft
            </button>
          </div>
        </CollapsibleSection>
      </div>

      {mutationError && (
        <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {mutationError instanceof Error ? mutationError.message : 'Validation failed'}
        </div>
      )}

      {result && (
        <CollapsibleSection
          title="Results"
          subtitle={result.path}
          preview={`${result.success ? 'Passed' : 'Failed'}${findings.length > 0 ? ` • ${findings.length} line${findings.length === 1 ? '' : 's'}` : ''}`}
          defaultExpanded
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Validation Results</h2>
              <p className="text-sm text-muted-foreground">{result.path}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${result.success ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-destructive/15 text-destructive'}`}>
              {result.success ? 'Passed' : 'Failed'}
            </span>
          </div>

          <div className="app-panel-muted p-4">
            {findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No validator output.</p>
            ) : (
              <div className="space-y-1.5 text-sm">
                {findings.map((line) => (
                  <div key={line} className={line.startsWith('OK') ? 'text-green-700 dark:text-green-400' : line.startsWith('VALIDATION FAILED') ? 'font-semibold text-destructive' : line.startsWith('- ') ? 'text-yellow-700 dark:text-yellow-400' : 'text-muted-foreground'}>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          {result.errors && (
            <div className="app-note border-destructive/40 bg-destructive/10 p-3.5">
              <h3 className="mb-2 text-sm font-semibold text-destructive">Stderr</h3>
              <pre className="whitespace-pre-wrap text-xs text-destructive">{result.errors}</pre>
            </div>
          )}
        </CollapsibleSection>
      )}

    </div>
  );
}