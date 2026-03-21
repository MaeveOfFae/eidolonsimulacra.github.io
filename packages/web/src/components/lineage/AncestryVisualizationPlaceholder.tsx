export interface AncestryVisualizationPlaceholderProps {
  characterId?: string;
  ancestorCount?: number;
  maxGeneration?: number;
}

export function AncestryVisualizationPlaceholder({
  characterId,
  ancestorCount,
  maxGeneration,
}: AncestryVisualizationPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Ancestry Visualization</h3>
      <p className="mt-2">
        Planned integration point for interactive ancestry charts, genetic trait tracking
        across generations, and exportable family tree diagrams.
      </p>
      <div className="mt-3 space-y-1">
        <p>Character: {characterId ?? 'none selected'}</p>
        <p>Ancestors traced: {ancestorCount ?? 0}</p>
        <p>Generations visible: {maxGeneration ?? 0}</p>
      </div>
    </section>
  );
}

export default AncestryVisualizationPlaceholder;
