export interface CanonLibraryPlaceholderProps {
  worldId?: string;
  entryCount?: number;
}

export function CanonLibraryPlaceholder({
  worldId,
  entryCount,
}: CanonLibraryPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Canon Library</h3>
      <p className="mt-2">
        Planned integration point for reusable canon entries including traits, lore, tags,
        and recurring world details that can be referenced across multiple characters.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Canon entries: {entryCount ?? 0}</p>
      </div>
    </section>
  );
}

export default CanonLibraryPlaceholder;
