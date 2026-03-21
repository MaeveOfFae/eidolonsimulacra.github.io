export interface EventEditorPlaceholderProps {
  eventId?: string;
}

export function EventEditorPlaceholder({
  eventId,
}: EventEditorPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Event Editor</h3>
      <p className="mt-2">
        Planned integration point for creating and editing events with
        participant linking, location assignment, and causal relationships.
      </p>
      <div className="mt-3 space-y-1">
        <p>Editing: {eventId ?? 'no event selected'}</p>
      </div>
    </section>
  );
}

export default EventEditorPlaceholder;
