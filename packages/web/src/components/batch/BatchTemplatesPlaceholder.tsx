export interface BatchTemplatesPlaceholderProps {
  templateName?: string;
  seedCount?: number;
}

export function BatchTemplatesPlaceholder({
  templateName,
  seedCount,
}: BatchTemplatesPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Batch Templates</h3>
      <p className="mt-2">
        Planned integration point for saving and reusing batch configurations,
        including seed lists, generation settings, and output preferences.
      </p>
      <div className="mt-3 space-y-1">
        <p>Template: {templateName ?? 'none selected'}</p>
        <p>Saved seeds: {seedCount ?? 0}</p>
      </div>
    </section>
  );
}

export default BatchTemplatesPlaceholder;
