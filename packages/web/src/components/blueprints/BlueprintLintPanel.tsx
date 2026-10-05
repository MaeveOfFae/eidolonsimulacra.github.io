import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, FileWarning, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { lintBlueprintContent } from './blueprintLint';

export interface BlueprintLintPanelProps {
  blueprintPath?: string;
}

export function BlueprintLintPanel({ blueprintPath }: BlueprintLintPanelProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['blueprint', blueprintPath, 'lint'],
    queryFn: () => api.getBlueprint(blueprintPath || ''),
    enabled: Boolean(blueprintPath),
  });

  const issues = useMemo(() => {
    if (!data?.content) {
      return [];
    }
    return lintBlueprintContent(data.content, {
      category: data.category,
      path: data.path,
      featureCategory: data.feature_category,
    });
  }, [data]);

  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;

  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">Blueprint Lint</h3>
          <p className="mt-1">Checks frontmatter and structural issues for the selected blueprint.</p>
        </div>
        {issues.length === 0 && data ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <FileWarning className="h-5 w-5 text-warning" />
        )}
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Running lint...
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">
          Failed to load blueprint: {error.message}
        </div>
      )}

      {!isLoading && !error && data && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="app-pill app-pill-muted">{errorCount} errors</span>
            <span className="app-pill app-pill-muted">{warningCount} warnings</span>
          </div>

          {issues.length === 0 ? (
            <div className="rounded-md border border-success/40 bg-success/10 p-3 text-success">
              No obvious issues found.
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((issue) => (
                <div
                  key={`${issue.severity}-${issue.message}`}
                  className={`flex items-start gap-2 rounded-md border p-3 ${issue.severity === 'error' ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-warning/40 bg-warning/10 text-warning'}`}
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default BlueprintLintPanel;
