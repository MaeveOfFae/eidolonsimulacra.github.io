export interface EventCategoriesPlaceholderProps {
  worldId?: string;
  categoryCount?: number;
}

export function EventCategoriesPlaceholder({
  worldId,
  categoryCount,
}: EventCategoriesPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Event Categories</h3>
      <p className="mt-2">
        Planned integration point for organizing events into categories
        like battles, discoveries, relationships, and world-changing moments.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Categories: {categoryCount ?? 0}</p>
      </div>
    </section>
  );
}

export default EventCategoriesPlaceholder;
