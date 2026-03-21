export interface LocationManagerPlaceholderProps {
  worldId?: string;
  locationCount?: number;
}

export function LocationManagerPlaceholder({
  worldId,
  locationCount,
}: LocationManagerPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Location Manager</h3>
      <p className="mt-2">
        Planned integration point for creating and managing shared locations, regions,
        and landmarks that can be referenced by multiple characters within a universe.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Locations: {locationCount ?? 0}</p>
      </div>
    </section>
  );
}

export default LocationManagerPlaceholder;
