import { Clock3, GitBranch, History } from 'lucide-react';
import type { DraftMetadata } from '@char-gen/shared';

export interface GenerationHistoryPanelProps {
  drafts?: DraftMetadata[];
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

export function GenerationHistoryPanel({ drafts = [] }: GenerationHistoryPanelProps) {
  const sortedByCreated = [...drafts].sort((left, right) => {
    const leftTime = new Date(left.created || 0).getTime();
    const rightTime = new Date(right.created || 0).getTime();
    return leftTime - rightTime;
  });
  const sortedByModified = [...drafts].sort((left, right) => {
    const leftTime = new Date(left.modified || left.created || 0).getTime();
    const rightTime = new Date(right.modified || right.created || 0).getTime();
    return rightTime - leftTime;
  });

  const oldest = sortedByCreated[0];
  const newest = sortedByModified[0];
  const branchCount = drafts.filter((draft) => (draft.parent_drafts?.length ?? 0) > 0).length;

  return (
    <section className="rounded-lg border border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <History className="h-4 w-4 text-primary" />
            Generation History
          </h3>
          <p className="mt-2">
            Local chronology view for draft creation, recent edits, and parent-linked branches.
          </p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Live
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
        <div className="rounded-md border border-border p-3">
          <div className="font-medium text-foreground">Drafts tracked</div>
          <div className="mt-1">{drafts.length}</div>
        </div>
        <div className="rounded-md border border-border p-3">
          <div className="flex items-center gap-1 font-medium text-foreground">
            <GitBranch className="h-3.5 w-3.5" />
            Branch-linked drafts
          </div>
          <div className="mt-1">{branchCount}</div>
        </div>
        <div className="rounded-md border border-border p-3">
          <div className="flex items-center gap-1 font-medium text-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            Latest edit
          </div>
          <div className="mt-1">{newest ? formatTimestamp(newest.modified || newest.created) : 'None yet'}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-border p-3">
          <div className="font-medium text-foreground">Oldest generation</div>
          {oldest ? (
            <div className="mt-2 text-xs">
              <div className="font-medium text-foreground">{oldest.character_name || oldest.seed}</div>
              <div className="mt-1">Created {formatTimestamp(oldest.created)}</div>
            </div>
          ) : (
            <div className="mt-2 text-xs">No drafts available yet.</div>
          )}
        </div>

        <div className="rounded-md border border-border p-3">
          <div className="font-medium text-foreground">Most recent activity</div>
          {newest ? (
            <div className="mt-2 text-xs">
              <div className="font-medium text-foreground">{newest.character_name || newest.seed}</div>
              <div className="mt-1">Updated {formatTimestamp(newest.modified || newest.created)}</div>
            </div>
          ) : (
            <div className="mt-2 text-xs">No drafts available yet.</div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-md border border-border p-3">
        <div className="font-medium text-foreground">Recent chronology</div>
        {sortedByModified.length === 0 ? (
          <div className="mt-2 text-xs">Generate drafts to start building timeline history.</div>
        ) : (
          <div className="mt-2 space-y-2 text-xs">
            {sortedByModified.slice(0, 5).map((draft) => (
              <div key={draft.review_id} className="flex items-start justify-between gap-3 rounded-md border border-border bg-background/60 p-3">
                <div>
                  <div className="font-medium text-foreground">{draft.character_name || draft.seed}</div>
                  <div className="mt-1 text-muted-foreground">
                    {draft.template_name || 'Unknown template'} · {draft.mode || 'Unknown mode'}
                  </div>
                </div>
                <div className="shrink-0 text-muted-foreground">
                  {formatTimestamp(draft.modified || draft.created)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default GenerationHistoryPanel;