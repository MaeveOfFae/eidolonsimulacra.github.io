export interface EventEditorPlaceholderProps {
  eventId?: string;
  linkedCharacters?: number;
}

export function EventEditorPlaceholder({
  eventId,
  linkedCharacters,
}: EventEditorPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Event Editor</h3>
      <p className="mt-2">
        Planned integration point for creating and editing historical events,
        linking characters to events, and defining event relationships.
      </p>
      <div className="mt-3 space-y-1">
        <p>Event: {eventId ?? 'none selected'}</p>
        <p>Linked characters: {linkedCharacters ?? 0}</p>
      </div>
    </section>
  );
}

export default EventEditorPlaceholder;
