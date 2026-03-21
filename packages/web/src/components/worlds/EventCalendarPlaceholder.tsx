export interface EventCalendarPlaceholderProps {
  worldId?: string;
  eventCount?: number;
}

export function EventCalendarPlaceholder({
  worldId,
  eventCount,
}: EventCalendarPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Event Calendar</h3>
      <p className="mt-2">
        Planned integration point for a visual calendar view of events,
        supporting in-world and real-world date tracking.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Events: {eventCount ?? 0}</p>
      </div>
    </section>
  );
}

export default EventCalendarPlaceholder;
