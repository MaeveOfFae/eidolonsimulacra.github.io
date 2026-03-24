import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, FolderSearch, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ValidationResponse } from '@char-gen/shared';
import { api } from '@/lib/api';
import { VALIDATION_TOUR_ID } from '@/lib/help';
import InlineHelpTip from '../common/InlineHelpTip';
import { useGuidedTour } from '../common/GuidedTourContext';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import ValidationProfilesPlaceholder from './ValidationProfilesPlaceholder';
import AutoValidationPlaceholder from './AutoValidationPlaceholder';

export default function Validation() {
  const [path, setPath] = useState('');
  const [selectedDraftId, setSelectedDraftId] = useState('');
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const { isTourCompleted, restartTour, startTour } = useGuidedTour();

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
    <div className="app-page space-y-10 pb-12">
      <InlineHelpTip
        tipId="validation-before-export-tip"
        title="Validation is the last structural check"
        description="Catch missing sections before export. It's faster to fix here than after export."
        actionLabel={isTourCompleted(VALIDATION_TOUR_ID) ? 'Replay Validation Tour' : 'Start Validation Tour'}
        onAction={() => (isTourCompleted(VALIDATION_TOUR_ID) ? restartTour(VALIDATION_TOUR_ID) : startTour(VALIDATION_TOUR_ID))}
      />
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Structural checks</p>
            <h1 className="app-page-title">Catch issues before export</h1>
            <p className="app-page-summary">
              Validate a draft against its template structure. Run this before export to check for missing sections or structural errors.
            </p>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Current state</p>
            <div className="mt-4 app-page-metrics">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="app-panel space-y-3 p-6">
          <div className="flex items-center gap-2">
            <FolderSearch className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Validate path</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Paste a draft path or review ID.
          </p>
          <input
            type="text"
            value={path}
            onChange={(event) => setPath(event.target.value)}
            placeholder="drafts/20260307_203638_unnamed_character"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={() => validatePathMutation.mutate()}
            disabled={isPending || !path.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {validatePathMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Validate
          </button>
        </section>

        <section data-tour-anchor="validation-draft-panel" className="app-panel space-y-3 p-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Validate draft</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick a draft from your library.
          </p>
          <select
            value={selectedDraftId}
            onChange={(event) => setSelectedDraftId(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {validateDraftMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Validate Draft
          </button>
        </section>
      </div>

      {mutationError && (
        <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {mutationError instanceof Error ? mutationError.message : 'Validation failed'}
        </div>
      )}

      {result && (
        <section data-tour-anchor="validation-results" className="app-panel space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Validation Results</h2>
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
              <div className="space-y-2 text-sm">
                {findings.map((line) => (
                  <div key={line} className={line.startsWith('OK') ? 'text-green-700 dark:text-green-400' : line.startsWith('VALIDATION FAILED') ? 'font-semibold text-destructive' : line.startsWith('- ') ? 'text-yellow-700 dark:text-yellow-400' : 'text-muted-foreground'}>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          {result.errors && (
            <div className="app-note border-destructive/40 bg-destructive/10 p-4">
              <h3 className="mb-2 text-sm font-semibold text-destructive">Stderr</h3>
              <pre className="whitespace-pre-wrap text-xs text-destructive">{result.errors}</pre>
            </div>
          )}
        </section>
      )}

      {/* Planned Validation Tooling */}
      <section className="app-panel p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Planned Validation Tooling</h2>
            <p className="text-sm text-muted-foreground">
              These placeholders mark where profiles and auto-validation features will attach.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Planned
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ValidationProfilesPlaceholder
            profileName="default"
            ruleCount={undefined}
          />
          <AutoValidationPlaceholder
            enabled={false}
            triggerCount={0}
          />
        </div>
      </section>
    </div>
  );
}