import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import type { UsageGroupBy, UsageGroupSummary, UsageRecord } from '@char-gen/shared';
import { api } from '@/lib/api';

const GROUP_OPTIONS: Array<{ value: UsageGroupBy; label: string }> = [
  { value: 'provider', label: 'Provider' },
  { value: 'model', label: 'Model' },
  { value: 'kind', label: 'Call type' },
  { value: 'asset', label: 'Asset' },
  { value: 'template', label: 'Template' },
  { value: 'draft', label: 'Draft' },
  { value: 'day', label: 'Day' },
];

const RECENT_LIMIT = 20;

function formatCount(value: number): string {
  return value.toLocaleString();
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) {
    return '—';
  }
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function StatusBadge({ status }: { status: UsageRecord['status'] }) {
  const className =
    status === 'ok'
      ? 'text-emerald-600 dark:text-emerald-400'
      : status === 'aborted'
        ? 'text-muted-foreground'
        : 'text-red-600 dark:text-red-400';

  return <span className={`text-xs font-medium ${className}`}>{status}</span>;
}

export default function Insights() {
  const [groupBy, setGroupBy] = useState<UsageGroupBy>('provider');
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ['usage-summary', groupBy],
    queryFn: () => api.getUsageSummary({ groupBy }),
  });

  const recentQuery = useQuery({
    queryKey: ['usage-recent'],
    queryFn: () => api.getUsageRecords(),
  });

  const clearMutation = useMutation({
    mutationFn: () => api.clearUsageRecords(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usage-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['usage-recent'] });
    },
  });

  const totals = summaryQuery.data?.totals;
  const groups = summaryQuery.data?.groups ?? [];
  const recent = (recentQuery.data ?? []).slice(0, RECENT_LIMIT);
  const busy = summaryQuery.isLoading || recentQuery.isLoading;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Token and time usage for every LLM call made in this app. Records stay on this device.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['usage-summary'] })}
            disabled={busy}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
            onClick={() => {
              if (window.confirm('Delete every stored usage record on this device?')) {
                clearMutation.mutate();
              }
            }}
            disabled={clearMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            Clear history
          </button>
        </div>
      </header>

      {busy ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading usage records…
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Usage totals">
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Calls</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{formatCount(totals?.calls ?? 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCount(totals?.errorCalls ?? 0)} failed · {formatPercent(totals?.failureRate ?? 0)} failure rate
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total tokens</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{formatCount(totals?.totalTokens ?? 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCount(totals?.promptTokens ?? 0)} prompt · {formatCount(totals?.completionTokens ?? 0)}{' '}
                completion
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg tokens / call</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {formatCount(Math.round(totals?.avgTotalTokens ?? 0))}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg duration</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{formatDuration(totals?.avgDurationMs ?? 0)}</p>
            </div>
          </section>

          <section className="space-y-3" aria-label="Usage breakdown">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Breakdown</h2>
              <select
                className="rounded-lg border bg-transparent px-2 py-1 text-sm text-foreground"
                value={groupBy}
                onChange={(event) => setGroupBy(event.target.value as UsageGroupBy)}
              >
                {GROUP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    by {option.label}
                  </option>
                ))}
              </select>
            </div>
            {groups.length === 0 ? (
              <p className="rounded-lg border p-4 text-sm text-muted-foreground">
                No usage records yet. Generate something and come back.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-accent text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Group</th>
                      <th className="px-3 py-2">Calls</th>
                      <th className="px-3 py-2">Failures</th>
                      <th className="px-3 py-2">Total tokens</th>
                      <th className="px-3 py-2">Avg duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group: UsageGroupSummary) => (
                      <tr key={group.key} className="border-b last:border-b-0">
                        <td className="px-3 py-2 font-medium text-foreground">{group.key}</td>
                        <td className="px-3 py-2">{formatCount(group.calls)}</td>
                        <td className="px-3 py-2">{formatPercent(group.failureRate)}</td>
                        <td className="px-3 py-2">{formatCount(group.totalTokens)}</td>
                        <td className="px-3 py-2">{formatDuration(group.avgDurationMs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-3" aria-label="Recent calls">
            <h2 className="text-lg font-semibold text-foreground">Recent calls</h2>
            {recent.length === 0 ? (
              <p className="rounded-lg border p-4 text-sm text-muted-foreground">Nothing recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {recent.map((record: UsageRecord) => (
                  <li
                    key={record.id ?? record.timestamp}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-3 text-sm"
                  >
                    <StatusBadge status={record.status} />
                    <span className="font-medium text-foreground">{record.kind}</span>
                    <span className="text-muted-foreground">
                      {record.provider} · {record.model}
                    </span>
                    {record.assetName ? <span className="text-muted-foreground">{record.assetName}</span> : null}
                    <span className="text-muted-foreground">
                      {record.totalTokens !== undefined
                        ? `${formatCount(record.totalTokens)} tokens`
                        : 'no usage reported'}
                    </span>
                    <span className="text-muted-foreground">{formatDuration(record.durationMs)}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{formatTime(record.timestamp)}</span>
                    {record.errorMessage ? (
                      <span className="w-full text-xs text-red-600 dark:text-red-400">{record.errorMessage}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
