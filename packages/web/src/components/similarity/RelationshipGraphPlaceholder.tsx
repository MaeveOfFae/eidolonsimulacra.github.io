export interface RelationshipGraphPlaceholderProps {
  characterCount?: number;
  relationshipCount?: number;
}

export function RelationshipGraphPlaceholder({
  characterCount,
  relationshipCount,
}: RelationshipGraphPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Relationship Graph</h3>
      <p className="mt-2">
        Planned integration point for visualizing character relationship networks,
        including family trees, social connections, and conflict/synergy mapping.
      </p>
      <div className="mt-3 space-y-1">
        <p>Characters in graph: {characterCount ?? 0}</p>
        <p>Relationships mapped: {relationshipCount ?? 0}</p>
      </div>
    </section>
  );
}

export default RelationshipGraphPlaceholder;
