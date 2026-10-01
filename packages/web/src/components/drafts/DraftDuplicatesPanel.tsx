import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Loader2, SearchX } from 'lucide-react';
import { buildSimilarityResult, findDuplicateDraftCandidates, type DraftMetadata } from '@char-gen/shared';
import { api } from '@/lib/api';

interface DuplicatePairView {
  leftId: string;
  rightId: string;
  leftName: string;
  rightName: string;
  reason: string;
  score?: number;
}

export interface DraftDuplicatesPanelProps {
  drafts: DraftMetadata[];
  onDraftsChanged?: () => void;
}

/**
 * Library duplicate scan: a metadata-only prefilter (shared helper) produces
 * candidate pairs, then each pair is scored with the similarity engine by
 * fetching the two full drafts. Candidates are capped by the shared contract
 * so the scan never fetches the whole library.
 */
export function DraftDuplicatesPanel({ drafts, onDraftsChanged }: DraftDuplicatesPanelProps) {
  const [scanning, setScanning] = useState(false);
  const [pairs, setPairs] = useState<DuplicatePairView[] | null>(null);

  const nameById = new Map(drafts.map((draft) => [draft.review_id, draft.character_name || draft.seed] as const));

  async function scan() {
    setScanning(true);

    try {
      const candidates = findDuplicateDraftCandidates(drafts);
      const resolved: DuplicatePairView[] = [];

      for (const candidate of candidates) {
        const [leftId, rightId] = candidate.draftIds;
        let score: number | undefined;

        try {
          const [left, right] = await Promise.all([api.getDraft(leftId!), api.getDraft(rightId!)]);
          if (left && right) {
            score = buildSimilarityResult(left, right).overall_score;
          }
        } catch {
          score = undefined;
        }

        resolved.push({
          leftId: leftId!,
          rightId: rightId!,
          leftName: nameById.get(leftId!) ?? leftId!,
          rightName: nameById.get(rightId!) ?? rightId!,
          reason: candidate.reason === 'same-seed' ? 'same seed' : 'same character name',
          score,
        });
      }

      setPairs(resolved);
    } finally {
      setScanning(false);
    }
  }

  async function archiveOne(reviewId: string) {
    await api.updateDraftsMetadata([reviewId], { archived_at: new Date().toISOString() });
    setPairs((current) => current?.filter((pair) => pair.leftId !== reviewId && pair.rightId !== reviewId) ?? null);
    onDraftsChanged?.();
  }

  return (
    <section className="app-panel p-5" aria-label="Duplicate drafts">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Duplicates</h2>
          <p className="text-sm text-muted-foreground">
            Flag drafts sharing a seed or character name, then score each pair with the similarity engine.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void scan()}
          disabled={scanning || drafts.length < 2}
          className="app-button app-button-secondary"
        >
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchX className="h-4 w-4" />}
          {scanning ? 'Scanning…' : 'Find duplicates'}
        </button>
      </div>

      {pairs !== null && pairs.length === 0 && (
        <p className="mt-4 rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground">
          No duplicate candidates found.
        </p>
      )}

      {pairs !== null && pairs.length > 0 && (
        <ul className="mt-4 space-y-2">
          {pairs.map((pair) => (
            <li
              key={`${pair.leftId}|${pair.rightId}`}
              className="rounded-lg border border-border bg-background/60 p-3 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <Link
                  to={`/drafts/${encodeURIComponent(pair.leftId)}`}
                  className="font-medium text-primary hover:underline"
                >
                  {pair.leftName}
                </Link>
                <span className="text-muted-foreground">vs</span>
                <Link
                  to={`/drafts/${encodeURIComponent(pair.rightId)}`}
                  className="font-medium text-primary hover:underline"
                >
                  {pair.rightName}
                </Link>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{pair.reason}</span>
                {pair.score !== undefined && (
                  <span className="text-xs text-muted-foreground">{Math.round(pair.score * 100)}% similar</span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <Link to="/similarity" className="text-primary hover:underline">
                  Open similarity
                </Link>
                <button
                  type="button"
                  onClick={() => void archiveOne(pair.leftId)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Archive “{pair.leftName}”
                </button>
                <button
                  type="button"
                  onClick={() => void archiveOne(pair.rightId)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Archive “{pair.rightName}”
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
