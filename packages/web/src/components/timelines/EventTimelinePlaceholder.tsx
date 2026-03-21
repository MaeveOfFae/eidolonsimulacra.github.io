export interface EventTimelinePlaceholderProps {
  worldId?: string;
  eventCount?: number;
}

export function EventTimelinePlaceholder({
  worldId,
  eventCount,
}: EventTimelinePlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Event Timeline</h3>
      <p className="mt-2">
        Planned integration point for a chronological view of world events,
        character milestones, and story beats across your universe.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Events: {eventCount ?? 0}</p>
      </div>
    </section>
  );
}

export default EventTimelinePlaceholder;
