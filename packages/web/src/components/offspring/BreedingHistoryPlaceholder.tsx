export interface BreedingHistoryPlaceholderProps {
  offspringId?: string;
  generation?: number;
}

export function BreedingHistoryPlaceholder({
  offspringId,
  generation,
}: BreedingHistoryPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Breeding History</h3>
      <p className="mt-2">
        Planned integration point for viewing and managing multi-generation breeding chains,
        lineage tracking, and offspring ancestry visualization.
      </p>
      <div className="mt-3 space-y-1">
        <p>Offspring ID: {offspringId ?? 'none generated'}</p>
        <p>Generation: {generation ?? 0}</p>
      </div>
    </section>
  );
}

export default BreedingHistoryPlaceholder;
