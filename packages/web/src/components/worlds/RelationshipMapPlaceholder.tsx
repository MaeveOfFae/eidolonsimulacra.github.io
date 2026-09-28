export interface RelationshipMapPlaceholderProps {
  characterCount?: number;
  relationshipCount?: number;
}

export function RelationshipMapPlaceholder({ characterCount, relationshipCount }: RelationshipMapPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Relationship Map</h3>
      <p className="mt-2">
        Relationship records are live here now. A richer map or graph view can still land later for visualizing family
        ties, friendships, rivalries, and faction allegiances.
      </p>
      <div className="mt-3 space-y-1">
        <p>Characters: {characterCount ?? 0}</p>
        <p>Relationships: {relationshipCount ?? 0}</p>
      </div>
    </section>
  );
}

export default RelationshipMapPlaceholder;
