export interface GenerationHistoryPlaceholderProps {
  draftCount?: number;
  oldestGeneration?: string;
  newestGeneration?: string;
}

export function GenerationHistoryPlaceholder({
  draftCount,
  oldestGeneration,
  newestGeneration,
}: GenerationHistoryPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Generation History</h3>
      <p className="mt-2">
        Planned integration point for lineage timeline view showing how drafts
        evolved over time, including parent-offspring relationships.
      </p>
      <div className="mt-3 space-y-1">
        <p>Drafts tracked: {draftCount ?? 0}</p>
        <p>Oldest: {oldestGeneration ?? 'none'}</p>
        <p>Newest: {newestGeneration ?? 'none'}</p>
      </div>
    </section>
  );
}

export default GenerationHistoryPlaceholder;
