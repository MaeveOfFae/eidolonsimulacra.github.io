export interface FactionManagerPlaceholderProps {
  worldId?: string;
  factionCount?: number;
}

export function FactionManagerPlaceholder({
  worldId,
  factionCount,
}: FactionManagerPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Faction Manager</h3>
      <p className="mt-2">
        Planned integration point for creating and managing shared factions, organizations,
        and groups that can be referenced by multiple characters within a universe.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Factions: {factionCount ?? 0}</p>
      </div>
    </section>
  );
}

export default FactionManagerPlaceholder;
