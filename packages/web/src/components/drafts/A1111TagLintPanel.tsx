import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { applyA1111TagFixes } from '@char-gen/shared';
import { lintA1111Asset } from '@/lib/drafts/a1111-tag-lint';

/**
 * Danbooru-backed lint panel for the a1111 asset, rendered inside its review card.
 * Shows the line-contract errors and tag-vocabulary warnings from the shared linter
 * and applies the mechanical fixes (alias → canonical, pseudo-tag → canonical,
 * duplicate removal) through the parent's save-asset mutation, so snapshots, approval
 * fingerprints and export gating all see the corrected content.
 */
export interface A1111TagLintPanelProps {
  content: string;
  onApplyFixes: (nextContent: string) => void;
  isSaving?: boolean;
}

export default function A1111TagLintPanel({ content, onApplyFixes, isSaving = false }: A1111TagLintPanelProps) {
  const lintQuery = useQuery({
    queryKey: ['a1111-tag-lint', content],
    queryFn: () => lintA1111Asset(content),
    enabled: content.trim().length > 0,
  });

  const issues = lintQuery.data?.issues ?? [];
  const fixCount = useMemo(
    () =>
      issues.filter((issue) => issue.code === 'alias' || issue.code === 'pseudo-tag' || issue.code === 'duplicate-tag')
        .length,
    [issues],
  );
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.length - errorCount;

  const handleApplyFixes = () => {
    const result = applyA1111TagFixes(content, issues);
    if (result.applied.length > 0) {
      onApplyFixes(result.content);
    }
  };

  return (
    <section
      aria-label="Danbooru tag lint"
      className="rounded-xl border border-border/60 bg-background/45 p-2.5 text-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {lintQuery.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : issues.length === 0 ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
          <span className="text-xs font-medium text-muted-foreground">
            {lintQuery.isPending
              ? 'Loading Danbooru tag index…'
              : issues.length === 0
                ? 'Tags pass the Danbooru lint'
                : `${errorCount} error${errorCount === 1 ? '' : 's'} · ${warningCount} warning${warningCount === 1 ? '' : 's'}`}
          </span>
          {lintQuery.data?.tier && (
            <span className="app-pill app-pill-muted" title="Which Danbooru index tier produced these findings">
              {lintQuery.data.tier === 'full' ? 'full index' : 'bundled core index'}
            </span>
          )}
        </div>
        {fixCount > 0 && (
          <button
            type="button"
            onClick={handleApplyFixes}
            disabled={isSaving}
            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3" />
            {isSaving ? 'Applying…' : `Apply ${fixCount} fix${fixCount === 1 ? '' : 'es'}`}
          </button>
        )}
      </div>

      {lintQuery.isError && (
        <p className="mt-2 text-xs text-muted-foreground">
          The tag index could not be loaded; showing no findings. {(lintQuery.error as Error).message}
        </p>
      )}

      {issues.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {issues.slice(0, 12).map((issue, position) => (
            <li
              key={`${issue.code}-${issue.line}-${issue.column ?? 0}-${position}`}
              className={`flex items-start gap-2 rounded-md border p-2 text-xs ${
                issue.severity === 'error'
                  ? 'border-destructive/40 bg-destructive/10 text-destructive'
                  : 'border-warning/40 bg-warning/10 text-warning'
              }`}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {issue.line > 0 && <span className="font-mono opacity-80">L{issue.line} · </span>}
                {issue.message}
              </span>
            </li>
          ))}
          {issues.length > 12 && (
            <li className="px-2 text-xs text-muted-foreground">+ {issues.length - 12} more findings</li>
          )}
        </ul>
      )}
    </section>
  );
}
