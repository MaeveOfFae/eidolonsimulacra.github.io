import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Loader2, Pencil, RefreshCw, Trash2, X } from 'lucide-react';
import {
  buildProviderScorecard,
  calculateUsageCost,
  findPricingForModel,
  usageRecordsToCsv,
  usageRecordsToJson,
  type ModelPricing,
  type UsageGroupBy,
  type UsageGroupSummary,
  type UsageRecord,
} from '@char-gen/shared';
import { api } from '@/lib/api';
import { MODEL_PRICING_CHANGED_EVENT } from '@/lib/usage/pricing-store';
import { saveBlobDownload } from '@/utils/download';

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

function formatCost(value: number, currency: string): string {
  const digits = value === 0 ? 2 : value < 0.01 ? 4 : value < 1 ? 3 : 2;
  return `${currency} ${value.toFixed(digits)}`;
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

function PricingEditor({ pricingTable }: { pricingTable: ModelPricing[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [model, setModel] = useState('');
  const [inputRate, setInputRate] = useState('');
  const [outputRate, setOutputRate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState<string | null>(null);

  function resetForm(): void {
    setEditingId(null);
    setModel('');
    setInputRate('');
    setOutputRate('');
    setCurrency('USD');
    setError(null);
  }

  function startEdit(entry: ModelPricing): void {
    setEditingId(entry.id);
    setModel(entry.model);
    setInputRate(String(entry.inputCostPerMillionTokens));
    setOutputRate(String(entry.outputCostPerMillionTokens));
    setCurrency(entry.currency);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();

    const saved = api.saveModelPricing({
      ...(editingId ? { id: editingId } : {}),
      model,
      inputCostPerMillionTokens: Number.parseFloat(inputRate),
      outputCostPerMillionTokens: Number.parseFloat(outputRate),
      currency,
    });

    if (!saved) {
      setError('Enter a model name, non-negative rates, and a currency code.');
      return;
    }

    resetForm();
  }

  return (
    <details className="rounded-lg border p-4">
      <summary className="cursor-pointer text-sm font-medium text-foreground">
        Model pricing ({pricingTable.length} {pricingTable.length === 1 ? 'entry' : 'entries'})
      </summary>
      <div className="mt-4 space-y-4">
        <p className="text-xs text-muted-foreground">
          Cost figures are estimates from your own per-1M-token rates. Eidolon ships no price tables — enter what your
          provider actually charges you.
        </p>

        {pricingTable.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-accent text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Model</th>
                  <th className="px-3 py-2">In / 1M</th>
                  <th className="px-3 py-2">Out / 1M</th>
                  <th className="px-3 py-2">Currency</th>
                  <th className="px-3 py-2 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pricingTable.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-medium text-foreground">{entry.model}</td>
                    <td className="px-3 py-2">{entry.inputCostPerMillionTokens}</td>
                    <td className="px-3 py-2">{entry.outputCostPerMillionTokens}</td>
                    <td className="px-3 py-2">{entry.currency}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        aria-label={`Edit pricing for ${entry.model}`}
                        className="mr-2 inline-flex items-center rounded p-1 text-muted-foreground hover:bg-accent"
                        onClick={() => startEdit(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete pricing for ${entry.model}`}
                        className="inline-flex items-center rounded p-1 text-red-600 hover:bg-accent"
                        onClick={() => api.deleteModelPricing(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No pricing configured yet. Add per-model rates to see estimated costs in the scorecard and breakdown.
          </p>
        )}

        <form className="flex flex-wrap items-end gap-2" onSubmit={handleSubmit}>
          <label className="min-w-40 flex-1 text-xs text-muted-foreground">
            Model
            <input
              className="mt-1 w-full rounded-lg border bg-transparent px-2 py-1 text-sm text-foreground"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="gpt-4o"
            />
          </label>
          <label className="w-28 text-xs text-muted-foreground">
            In / 1M
            <input
              className="mt-1 w-full rounded-lg border bg-transparent px-2 py-1 text-sm text-foreground"
              value={inputRate}
              onChange={(event) => setInputRate(event.target.value)}
              inputMode="decimal"
              placeholder="2.50"
            />
          </label>
          <label className="w-28 text-xs text-muted-foreground">
            Out / 1M
            <input
              className="mt-1 w-full rounded-lg border bg-transparent px-2 py-1 text-sm text-foreground"
              value={outputRate}
              onChange={(event) => setOutputRate(event.target.value)}
              inputMode="decimal"
              placeholder="10.00"
            />
          </label>
          <label className="w-20 text-xs text-muted-foreground">
            Currency
            <input
              className="mt-1 w-full rounded-lg border bg-transparent px-2 py-1 text-sm text-foreground"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              placeholder="USD"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId ? (
              <button
                type="button"
                aria-label="Cancel editing"
                className="inline-flex items-center rounded-lg border px-2 py-1.5 text-sm text-foreground hover:bg-accent"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </form>
        {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
      </div>
    </details>
  );
}

// __INSIGHTS_PART3__

export default function Insights() {
  const [groupBy, setGroupBy] = useState<UsageGroupBy>('provider');
  const [pricingTable, setPricingTable] = useState<ModelPricing[]>(() => api.getModelPricing());
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = () => setPricingTable(api.getModelPricing());
    window.addEventListener(MODEL_PRICING_CHANGED_EVENT, handler);
    return () => window.removeEventListener(MODEL_PRICING_CHANGED_EVENT, handler);
  }, []);

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

  const exportMutation = useMutation({
    mutationFn: async (format: 'csv' | 'json') => {
      const records = await api.getUsageRecords();
      const content = format === 'csv' ? usageRecordsToCsv(records) : usageRecordsToJson(records);
      await saveBlobDownload(
        new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' }),
        `eidolon-usage-${new Date().toISOString().slice(0, 10)}.${format}`,
      );
    },
  });

  const totals = summaryQuery.data?.totals;
  const groups = summaryQuery.data?.groups ?? [];
  const allRecords = recentQuery.data ?? [];
  const recent = allRecords.slice(0, RECENT_LIMIT);
  const scorecard = buildProviderScorecard(allRecords, pricingTable);
  const anyPriced = scorecard.some((entry) => entry.totalCost !== undefined);
  const showCostColumn = groupBy === 'model' && pricingTable.length > 0;
  const busy = summaryQuery.isLoading || recentQuery.isLoading;

  function formatGroupCost(group: UsageGroupSummary): string {
    const pricing = findPricingForModel(pricingTable, group.key);
    if (!pricing) {
      return '—';
    }
    return formatCost(
      calculateUsageCost({ promptTokens: group.promptTokens, completionTokens: group.completionTokens }, pricing),
      pricing.currency,
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Token and time usage for every LLM call made in this app. Records stay on this device.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            onClick={() => exportMutation.mutate('csv')}
            disabled={exportMutation.isPending || busy}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            onClick={() => exportMutation.mutate('json')}
            disabled={exportMutation.isPending || busy}
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
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
                      {showCostColumn ? <th className="px-3 py-2">Est. cost</th> : null}
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
                        {showCostColumn ? <td className="px-3 py-2">{formatGroupCost(group)}</td> : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-3" aria-label="Provider scorecard">
            <h2 className="text-lg font-semibold text-foreground">Provider scorecard</h2>
            {scorecard.length === 0 ? (
              <p className="rounded-lg border p-4 text-sm text-muted-foreground">
                No models recorded yet. Generate something and come back.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-accent text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Model</th>
                      <th className="px-3 py-2">Calls</th>
                      <th className="px-3 py-2">Failure rate</th>
                      <th className="px-3 py-2">Tokens</th>
                      <th className="px-3 py-2">Avg duration</th>
                      {anyPriced ? <th className="px-3 py-2">Est. cost</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {scorecard.map((entry) => (
                      <tr key={entry.model} className="border-b last:border-b-0">
                        <td className="px-3 py-2 font-medium text-foreground">{entry.model}</td>
                        <td className="px-3 py-2">{formatCount(entry.calls)}</td>
                        <td className="px-3 py-2">{formatPercent(entry.failureRate)}</td>
                        <td className="px-3 py-2">{formatCount(entry.totalTokens)}</td>
                        <td className="px-3 py-2">{formatDuration(entry.avgDurationMs)}</td>
                        {anyPriced ? (
                          <td className="px-3 py-2">
                            {entry.totalCost !== undefined && entry.currency
                              ? formatCost(entry.totalCost, entry.currency)
                              : '—'}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <PricingEditor pricingTable={pricingTable} />

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
