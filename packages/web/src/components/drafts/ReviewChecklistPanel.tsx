import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ClipboardList, Loader2, RotateCcw, Save } from 'lucide-react';
import type { DraftAssetReviewScore } from '@char-gen/shared';
import { api } from '@/lib/api';

type AssetScoreMap = Record<string, DraftAssetReviewScore>;
type AssetNoteMap = Record<string, string>;

export interface ReviewChecklistPanelProps {
  draftId?: string;
}

export function ReviewChecklistPanel({ draftId }: ReviewChecklistPanelProps) {
  const queryClient = useQueryClient();
  const draftQuery = useQuery({
    queryKey: ['draft', draftId, 'checklist'],
    queryFn: () => api.getDraft(draftId || ''),
    enabled: Boolean(draftId),
  });

  const validationQuery = useQuery({
    queryKey: ['draft', draftId, 'validation-checklist'],
    queryFn: () => api.validateDraft(draftId || ''),
    enabled: Boolean(draftId),
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [assetScores, setAssetScores] = useState<AssetScoreMap>({});
  const [assetNotes, setAssetNotes] = useState<AssetNoteMap>({});
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const checklist = useMemo(() => {
    const draft = draftQuery.data;
    const validation = validationQuery.data;
    if (!draft) {
      return [] as Array<{ label: string; passed: boolean }>;
    }

    return [
      { label: 'Character name inferred or set', passed: Boolean(draft.metadata.character_name) },
      { label: 'Template recorded', passed: Boolean(draft.metadata.template_name) },
      { label: 'At least three assets saved', passed: Object.keys(draft.assets).length >= 3 },
      { label: 'Validation passes without placeholder failures', passed: validation?.success ?? false },
    ];
  }, [draftQuery.data, validationQuery.data]);

  const reviewAssetNames = useMemo(() => {
    const draft = draftQuery.data;
    if (!draft) {
      return [] as string[];
    }

    return Object.keys(draft.assets)
      .filter((assetName) => assetName !== 'card_image')
      .sort((left, right) => left.localeCompare(right));
  }, [draftQuery.data]);

  const ratedScores = useMemo(
    () => Object.values(assetScores).filter((score) => Number.isFinite(score) && score >= 1 && score <= 5),
    [assetScores],
  );
  const averageScore =
    ratedScores.length > 0 ? ratedScores.reduce((total, score) => total + score, 0) / ratedScores.length : null;
  const notedAssetCount = useMemo(
    () => Object.values(assetNotes).filter((note) => note.trim().length > 0).length,
    [assetNotes],
  );

  useEffect(() => {
    const annotations = draftQuery.data?.metadata.review_annotations;
    setReviewNotes(annotations?.notes ?? '');
    setAssetScores(annotations?.asset_scores ?? {});
    setAssetNotes(annotations?.asset_notes ?? {});
    setSaveFeedback(null);
  }, [draftQuery.data?.metadata.review_annotations, draftQuery.data?.metadata.review_id]);

  const saveReviewAnnotations = useMutation({
    mutationFn: async () => {
      if (!draftId) {
        return null;
      }

      const currentAnnotations = draftQuery.data?.metadata.review_annotations;
      const validAssetNames = new Set(reviewAssetNames);
      const cleanedNotes = reviewNotes.trim();
      const cleanedScores = Object.fromEntries(
        Object.entries(assetScores)
          .filter(
            ([assetName, score]) =>
              validAssetNames.has(assetName) && Number.isFinite(score) && score >= 1 && score <= 5,
          )
          .map(([assetName, score]) => [assetName, Math.round(score) as DraftAssetReviewScore] as const),
      ) as Record<string, DraftAssetReviewScore>;
      const cleanedAssetNotes = Object.fromEntries(
        Object.entries(assetNotes)
          .map(([assetName, note]) => [assetName, note.trim()] as const)
          .filter(([assetName, note]) => validAssetNames.has(assetName) && note.length > 0),
      );

      const nextAnnotations =
        cleanedNotes || Object.keys(cleanedScores).length > 0 || Object.keys(cleanedAssetNotes).length > 0
          ? {
              ...(cleanedNotes ? { notes: cleanedNotes } : {}),
              ...(Object.keys(cleanedScores).length > 0 ? { asset_scores: cleanedScores } : {}),
              ...(Object.keys(cleanedAssetNotes).length > 0 ? { asset_notes: cleanedAssetNotes } : {}),
              updated_at: new Date().toISOString(),
            }
          : undefined;

      if (JSON.stringify(currentAnnotations ?? null) === JSON.stringify(nextAnnotations ?? null)) {
        return { skipped: true as const };
      }

      await api.createDraftSnapshot(draftId, {
        label: 'Before review annotation update',
        reason: 'pre-review-annotation-update',
      });

      await api.updateMetadata(draftId, {
        review_annotations: nextAnnotations,
      });

      return { skipped: false as const };
    },
    onSuccess: (result) => {
      if (result?.skipped) {
        setSaveFeedback('No review annotation changes to save.');
        return;
      }

      setSaveFeedback('Review notes saved.');
      void queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      void queryClient.invalidateQueries({ queryKey: ['draft', draftId, 'checklist'] });
      void queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: (error) => {
      setSaveFeedback(error instanceof Error ? error.message : 'Failed to save review notes.');
    },
  });

  const resetReviewAnnotations = () => {
    const annotations = draftQuery.data?.metadata.review_annotations;
    setReviewNotes(annotations?.notes ?? '');
    setAssetScores(annotations?.asset_scores ?? {});
    setAssetNotes(annotations?.asset_notes ?? {});
    setSaveFeedback(null);
  };

  const setAssetScore = (assetName: string, value: string) => {
    setAssetScores((current) => {
      const next = { ...current };
      const parsed = Number.parseInt(value, 10);

      if (!value || Number.isNaN(parsed)) {
        delete next[assetName];
        return next;
      }

      if (parsed >= 1 && parsed <= 5) {
        next[assetName] = parsed as DraftAssetReviewScore;
      }
      return next;
    });
    setSaveFeedback(null);
  };

  const setAssetNote = (assetName: string, value: string) => {
    setAssetNotes((current) => ({
      ...current,
      [assetName]: value,
    }));
    setSaveFeedback(null);
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">Review Checklist</h3>
          <p className="mt-1">Quick readiness pass from draft metadata and validation.</p>
        </div>
        <ClipboardList className="h-5 w-5 text-primary" />
      </div>

      {(draftQuery.isLoading || validationQuery.isLoading) && (
        <div className="mt-4 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading review checklist...
        </div>
      )}

      {!draftId ? <div className="mt-4 rounded-md border border-border p-3">Select a draft to load checks.</div> : null}

      {checklist.length > 0 && (
        <div className="mt-4 space-y-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5">
              <CheckCircle2 className={`h-4 w-4 shrink-0 ${item.passed ? 'text-success' : 'text-muted-foreground'}`} />
              <span className={item.passed ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
            </div>
          ))}

          {validationQuery.data && !validationQuery.data.success && (
            <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-warning">
              {validationQuery.data.output}
            </div>
          )}

          <div className="rounded-md border border-border/70 bg-background/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="font-medium text-foreground">Persistent review notes</h4>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Save reviewer notes and per-asset scores into the draft metadata so they survive reloads and workspace
                  transfer.
                </p>
              </div>
              <div className="rounded-md border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                <div>
                  {ratedScores.length}/{reviewAssetNames.length} assets rated
                </div>
                {averageScore !== null && (
                  <div className="mt-1 text-foreground">Average {averageScore.toFixed(1)}/5</div>
                )}
                {notedAssetCount > 0 && (
                  <div className="mt-1">
                    {notedAssetCount} asset note{notedAssetCount === 1 ? '' : 's'}
                  </div>
                )}
              </div>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Reviewer summary
              </span>
              <textarea
                value={reviewNotes}
                onChange={(event) => {
                  setReviewNotes(event.target.value);
                  setSaveFeedback(null);
                }}
                rows={4}
                placeholder="Capture consistency concerns, export blockers, or follow-up edits worth revisiting later."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <div className="mt-4 space-y-3">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Asset scores</div>
              {reviewAssetNames.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {reviewAssetNames.map((assetName) => (
                    <label key={assetName} className="rounded-md border border-border/60 bg-background/60 p-3">
                      <div className="text-sm font-medium capitalize text-foreground">
                        {assetName.replace(/_/g, ' ')}
                      </div>
                      <select
                        value={assetScores[assetName] ? String(assetScores[assetName]) : ''}
                        onChange={(event) => setAssetScore(assetName, event.target.value)}
                        className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Unrated</option>
                        <option value="1">1 - Blocked</option>
                        <option value="2">2 - Weak</option>
                        <option value="3">3 - Usable</option>
                        <option value="4">4 - Strong</option>
                        <option value="5">5 - Ready</option>
                      </select>
                      <textarea
                        value={assetNotes[assetName] ?? ''}
                        onChange={(event) => setAssetNote(assetName, event.target.value)}
                        rows={3}
                        placeholder="Asset-specific follow-up, blocking issues, or rationale for the score."
                        className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-border px-3 py-2.5">
                  Generate or import draft assets before rating them.
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => saveReviewAnnotations.mutate()}
                disabled={saveReviewAnnotations.isPending || !draftId}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saveReviewAnnotations.isPending ? 'Saving…' : 'Save review notes'}
              </button>
              <button
                type="button"
                onClick={resetReviewAnnotations}
                disabled={saveReviewAnnotations.isPending}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              {saveFeedback && (
                <span
                  className={`text-xs ${saveReviewAnnotations.isError ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  {saveFeedback}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReviewChecklistPanel;
