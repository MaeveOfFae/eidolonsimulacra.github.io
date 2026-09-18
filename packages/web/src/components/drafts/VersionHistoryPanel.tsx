import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock3, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import CollapsibleSection from '../common/CollapsibleSection';
import { DraftStorage } from '@/lib/storage/draft-db';
import { isDesktopRuntime } from '@/lib/runtime';

export interface VersionHistoryPanelProps {
  draftId?: string;
  assetName?: string;
}

function formatTimestamp(value?: string | number): string {
  if (!value) {
    return 'Unknown';
  }

  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function VersionHistoryPanel({
  draftId,
  assetName,
}: VersionHistoryPanelProps) {
  const desktopRuntime = isDesktopRuntime();
  const draftQuery = useQuery({
    queryKey: ['draft', draftId, 'version-history'],
    queryFn: () => api.getDraft(draftId || ''),
    enabled: Boolean(draftId),
  });

  const activityQuery = useQuery({
    queryKey: ['draft', draftId, 'asset-activity'],
    queryFn: () => DraftStorage.getAssetActivity(draftId || ''),
    enabled: Boolean(draftId),
  });

  const assetActivity = useMemo(() => {
    const rows = activityQuery.data ?? [];
    const filtered = assetName ? rows.filter((row) => row.assetName === assetName) : rows;
    return filtered.slice(0, 6);
  }, [activityQuery.data, assetName]);

  const draft = draftQuery.data;
  const assetCount = draft ? Object.keys(draft.assets).length : 0;
  const parentCount = draft?.metadata.parent_drafts?.length ?? 0;

  return (
    <CollapsibleSection
      title="Version activity"
      subtitle={`Recent timestamps and asset touches from ${desktopRuntime ? 'desktop app data' : 'browser storage'}`}
      preview={draftId || 'Select a draft to inspect activity'}
      meta={<span className="app-pill app-pill-muted">Local</span>}
      defaultExpanded={Boolean(assetName)}
      className="border-dashed text-sm text-muted-foreground"
      bodyClassName="space-y-4"
    >

      {(draftQuery.isLoading || activityQuery.isLoading) && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading draft activity...
        </div>
      )}

      {!draftId ? (
        <div className="rounded-md border border-border p-3">
          Select a draft to inspect activity.
        </div>
      ) : null}

      {draft && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-xs">
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Created</div>
              <div className="mt-1">{formatTimestamp(draft.metadata.created)}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Last modified</div>
              <div className="mt-1">{formatTimestamp(draft.metadata.modified)}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Tracked assets</div>
              <div className="mt-1">{assetCount}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Parent drafts</div>
              <div className="mt-1">{parentCount}</div>
            </div>
          </div>

          <div className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              Recent asset activity
            </div>

            {assetActivity.length === 0 ? (
              <div className="mt-3 rounded-md border border-border bg-background/60 p-3 text-xs">
                No per-asset activity has been recorded yet for this draft{assetName ? ' and asset filter' : ''}.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {assetActivity.map((row) => {
                  const content = draft.assets[row.assetName] || '';
                  return (
                    <div key={`${row.assetName}-${row.createdAt}`} className="flex items-start justify-between gap-3 rounded-md border border-border bg-background/60 px-3 py-2.5">
                      <div>
                        <div className="font-medium text-foreground">{row.assetName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {content.length} chars · {content.split('\n').length} lines
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {formatTimestamp(row.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            Restore points and true diffs are still planned.
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}

export default VersionHistoryPanel;