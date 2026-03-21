export interface TimelineViewPlaceholderProps {
  worldId?: string;
  eventCount?: number;
  timespan?: string;
}

export function TimelineViewPlaceholder({
  worldId,
  eventCount,
  timespan,
}: TimelineViewPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Timeline View</h3>
      <p className="mt-2">
        Planned integration point for visualizing world history, major events,
        and character lifespans across chronological periods.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Events: {eventCount ?? 0}</p>
        <p>Timespan: {timespan ?? 'not defined'}</p>
      </div>
    </section>
  );
}

export default TimelineViewPlaceholder;
