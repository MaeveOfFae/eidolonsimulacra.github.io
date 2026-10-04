import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Trash2 } from 'lucide-react';
import type { DraftMetadata } from '@char-gen/shared';
import { getLatestDraftSnapshotSummary } from '@/lib/drafts/revision-snapshots';
import type { FavoriteSeedRecord, SeedRunRecord } from '@/lib/seed-generator';

/**
 * Archive tab of the drafts library.
 *
 * Extracted from `Drafts` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). Behavior is pinned by
 * `Drafts.test.tsx` through the parent.
 */

interface LibraryArchiveTabProps {
  archivedDraftCount: number;
  archivedDrafts: DraftMetadata[];
  archivedDraftsLoading: boolean;
  archivedDraftError: Error | null;
  archivedFavoriteSeeds: FavoriteSeedRecord[];
  archivedSeedRuns: SeedRunRecord[];
  onRestoreDraft: (reviewId: string) => void | Promise<unknown>;
  onDeleteDraft: (reviewId: string) => void | Promise<unknown>;
  onRestoreFavoriteSeed: (seed: string) => void;
  onDeleteArchivedFavoriteSeed: (seed: string) => void;
  onRestoreSeedRun: (id: string) => void;
  onDeleteArchivedSeedRun: (id: string) => void;
}

function formatTimestamp(value?: string): string {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function LibraryArchiveTab({
  archivedDraftCount,
  archivedDrafts,
  archivedDraftsLoading,
  archivedDraftError,
  archivedFavoriteSeeds,
  archivedSeedRuns,
  onRestoreDraft,
  onDeleteDraft,
  onRestoreFavoriteSeed,
  onDeleteArchivedFavoriteSeed,
  onRestoreSeedRun,
  onDeleteArchivedSeedRun,
}: LibraryArchiveTabProps) {
  const archivedRevisionSnapshots = useMemo(
    () =>
      archivedDrafts
        .flatMap((draft) =>
          (draft.revision_snapshots ?? []).map((snapshot) => ({
            draftId: draft.review_id,
            draftName: draft.character_name || draft.seed,
            snapshot,
          })),
        )
        .sort(
          (left, right) => new Date(right.snapshot.created_at).getTime() - new Date(left.snapshot.created_at).getTime(),
        )
        .slice(0, 4),
    [archivedDrafts],
  );
  const recentArchivedFavoriteSeeds = archivedFavoriteSeeds.slice(0, 6);
  const recentArchivedSeedRuns = archivedSeedRuns.slice(0, 6);

  return (
    <div className="space-y-4">
      <section className="app-panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Archive</h2>
            <p className="text-sm text-muted-foreground">
              Keep source material recoverable without leaving it in the active library.
            </p>
          </div>
          <span className="app-pill app-pill-muted">
            {archivedDraftCount + archivedFavoriteSeeds.length + archivedSeedRuns.length} archived items
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-lg border border-border bg-background/60 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Drafts</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{archivedDraftCount}</div>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Favorite seeds</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{archivedFavoriteSeeds.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Seed runs</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{archivedSeedRuns.length}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="app-panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Archived drafts</h2>
              <p className="text-sm text-muted-foreground">
                Restore archived drafts back into the active workspace or remove them permanently.
              </p>
            </div>
          </div>

          {archivedDraftsLoading ? (
            <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
              Loading archived drafts...
            </div>
          ) : archivedDraftError ? (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              Error loading archive: {archivedDraftError.message}
            </div>
          ) : archivedDrafts.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
              No archived drafts yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {archivedDrafts.map((draft) => (
                <article key={draft.review_id} className="rounded-lg border border-border bg-background/50 p-4">
                  {(() => {
                    const latestSnapshot = getLatestDraftSnapshotSummary(draft);
                    return (
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            to={`/drafts/${encodeURIComponent(draft.review_id)}`}
                            className="text-sm font-semibold text-foreground hover:underline"
                          >
                            {draft.character_name || draft.seed}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Archived {formatTimestamp(draft.archived_at)}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{draft.seed}</p>
                          {latestSnapshot && (
                            <p className="mt-2 text-[11px] text-muted-foreground">
                              Snapshot: {latestSnapshot.label}
                              {latestSnapshot.reason ? ` · ${latestSnapshot.reason}` : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          {latestSnapshot && (
                            <Link
                              to={`/drafts/${encodeURIComponent(draft.review_id)}?historySnapshot=${encodeURIComponent(latestSnapshot.id)}`}
                              className="app-button app-button-secondary"
                            >
                              Preview snapshot
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => void onRestoreDraft(draft.review_id)}
                            className="app-button app-button-secondary"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDeleteDraft(draft.review_id)}
                            className="app-button app-button-secondary text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </article>
              ))}
            </div>
          )}
        </section>

        {archivedRevisionSnapshots.length > 0 && (
          <section className="app-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Recent archived restore points</h2>
                <p className="text-sm text-muted-foreground">
                  Jump straight into snapshot history for archived drafts without restoring them first.
                </p>
              </div>
              <span className="app-pill app-pill-muted">{archivedRevisionSnapshots.length} snapshots</span>
            </div>

            <div className="mt-4 space-y-3">
              {archivedRevisionSnapshots.map(({ draftId, draftName, snapshot }) => (
                <div key={`${draftId}-${snapshot.id}`} className="rounded-lg border border-border bg-background/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{snapshot.label || 'Restore point'}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {draftName} · {formatTimestamp(snapshot.created_at)}
                      </div>
                      {snapshot.reason && <div className="mt-1 text-xs text-muted-foreground">{snapshot.reason}</div>}
                    </div>
                    <Link
                      to={`/drafts/${encodeURIComponent(draftId)}?historySnapshot=${encodeURIComponent(snapshot.id)}`}
                      className="app-button app-button-secondary"
                    >
                      Open snapshot diff
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="app-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Archived favorite seeds</h2>
                <p className="text-sm text-muted-foreground">
                  Restore saved concepts when you want them back in the active seed shelf.
                </p>
              </div>
            </div>

            {recentArchivedFavoriteSeeds.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
                No archived favorite seeds yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentArchivedFavoriteSeeds.map((entry) => (
                  <article
                    key={`${entry.seed}-${entry.archivedAt}`}
                    className="rounded-lg border border-border bg-background/50 p-4"
                  >
                    <p className="text-sm text-foreground">{entry.seed}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Archived {formatTimestamp(entry.archivedAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onRestoreFavoriteSeed(entry.seed)}
                        className="app-button app-button-secondary"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </button>
                      <Link to="/generate" state={{ seed: entry.seed }} className="app-button app-button-secondary">
                        Use seed
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDeleteArchivedFavoriteSeed(entry.seed)}
                        className="app-button app-button-secondary text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="app-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Archived seed runs</h2>
                <p className="text-sm text-muted-foreground">
                  Restore old batches back into the active recent history or remove them permanently.
                </p>
              </div>
            </div>

            {recentArchivedSeedRuns.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
                No archived seed runs yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentArchivedSeedRuns.map((entry) => (
                  <article key={entry.id} className="rounded-lg border border-border bg-background/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{entry.seeds.length} generated seeds</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Archived {formatTimestamp(entry.archivedAt)}
                        </p>
                      </div>
                      <span className="app-pill app-pill-muted">Archived run</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{entry.request.genreLines}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onRestoreSeedRun(entry.id)}
                        className="app-button app-button-secondary"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteArchivedSeedRun(entry.id)}
                        className="app-button app-button-secondary text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
