import { Link } from 'react-router-dom';
import { Archive, Star } from 'lucide-react';
import SyncControls from '../common/SyncControls';
import { formatTimestamp } from '@/lib/format-timestamp';
import {
  getAllFavoriteSeeds,
  parseFavoriteSeedsPayload,
  replaceFavoriteSeedsFromServer,
  type FavoriteSeedRecord,
  type SeedRunRecord,
} from '@/lib/seed-generator';

/**
 * Seeds tab of the drafts library.
 *
 * Extracted from `Drafts` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). Behavior is pinned by
 * `Drafts.test.tsx` through the parent.
 */

interface LibrarySeedsTabProps {
  favoriteSeeds: FavoriteSeedRecord[];
  seedHistory: SeedRunRecord[];
  archivedFavoriteSeeds: FavoriteSeedRecord[];
  archivedSeedRuns: SeedRunRecord[];
  selfContainedDesktop: boolean;
  onArchiveFavoriteSeed: (seed: string) => void;
  onArchiveSeedRun: (id: string) => void;
  onRefreshSeedData: () => void;
}

export default function LibrarySeedsTab({
  favoriteSeeds,
  seedHistory,
  archivedFavoriteSeeds,
  archivedSeedRuns,
  selfContainedDesktop,
  onArchiveFavoriteSeed,
  onArchiveSeedRun,
  onRefreshSeedData,
}: LibrarySeedsTabProps) {
  const recentFavoriteSeeds = favoriteSeeds.slice(0, 6);
  const recentSeedRuns = seedHistory.slice(0, 4);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="app-panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Favorite seeds</h2>
            <p className="text-sm text-muted-foreground">
              Keep reusable concepts close to the review flow instead of bouncing back to the generator.
            </p>
          </div>
          <span className="app-pill app-pill-muted">{favoriteSeeds.length} saved</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-lg border border-border bg-background/60 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Favorites</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{favoriteSeeds.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent runs</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{seedHistory.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Archived</div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {archivedFavoriteSeeds.length} seeds · {archivedSeedRuns.length} runs
            </div>
          </div>
        </div>

        {!selfContainedDesktop && (
          <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
            <SyncControls
              dataType="seeds"
              label="Favorite seeds"
              onGetLocalData={() => ({ seeds: getAllFavoriteSeeds() })}
              onApplyData={(payload) => {
                const parsed = parseFavoriteSeedsPayload(payload);
                if (parsed) {
                  replaceFavoriteSeedsFromServer(parsed);
                  onRefreshSeedData();
                }
              }}
            />
          </div>
        )}

        {recentFavoriteSeeds.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-center">
            <Star className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-lg font-semibold">No favorite seeds yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate concepts in the seed generator, then star the ones worth keeping in the library.
            </p>
            <Link to="/seed-generator" className="app-button app-button-primary mt-4">
              Open Seed Generator
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {recentFavoriteSeeds.map((entry) => (
              <article
                key={`${entry.seed}-${entry.addedAt}`}
                className="rounded-lg border border-border bg-background/50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-warning">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Favorite Seed
                    </div>
                    <p className="mt-2 text-sm text-foreground">{entry.seed}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Added {formatTimestamp(entry.addedAt)}
                      {entry.lastUsedAt ? ` · Last used ${formatTimestamp(entry.lastUsedAt)}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link to="/generate" state={{ seed: entry.seed }} className="app-button app-button-secondary">
                      Use seed
                    </Link>
                    <button
                      type="button"
                      onClick={() => onArchiveFavoriteSeed(entry.seed)}
                      className="app-button app-button-secondary"
                    >
                      <Archive className="h-4 w-4" />
                      Archive
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="app-panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Seed run history</h2>
            <p className="text-sm text-muted-foreground">
              Recent batches stay visible here so it is easier to reuse concepts during review.
            </p>
          </div>
          <Link to="/seed-generator" className="app-button app-button-secondary">
            Open generator
          </Link>
        </div>

        {recentSeedRuns.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
            No recent seed runs yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {recentSeedRuns.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-border bg-background/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{entry.seeds.length} generated seeds</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {entry.request.count} requested · {formatTimestamp(entry.createdAt)}
                    </p>
                  </div>
                  <span className="app-pill app-pill-muted">Run</span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {entry.seeds.slice(0, 3).map((seed) => (
                    <div key={seed} className="rounded-md border border-border bg-background/60 px-3 py-2">
                      {seed}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onArchiveSeedRun(entry.id)}
                    className="app-button app-button-secondary"
                  >
                    <Archive className="h-4 w-4" />
                    Archive run
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
