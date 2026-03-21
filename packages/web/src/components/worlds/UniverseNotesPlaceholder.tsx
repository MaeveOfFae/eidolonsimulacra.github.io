export interface UniverseNotesPlaceholderProps {
  worldId?: string;
  noteCount?: number;
}

export function UniverseNotesPlaceholder({
  worldId,
  noteCount,
}: UniverseNotesPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Universe Notes</h3>
      <p className="mt-2">
        Planned integration point for universe-level notes, lore documents, and
        reference materials that can be accessed during generation and review.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Notes: {noteCount ?? 0}</p>
      </div>
    </section>
  );
}

export default UniverseNotesPlaceholder;
