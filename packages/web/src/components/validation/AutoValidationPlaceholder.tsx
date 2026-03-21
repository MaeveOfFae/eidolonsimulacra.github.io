export interface AutoValidationPlaceholderProps {
  enabled?: boolean;
  triggerCount?: number;
}

export function AutoValidationPlaceholder({
  enabled,
  triggerCount,
}: AutoValidationPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Auto-Validation</h3>
      <p className="mt-2">
        Planned integration point for automatic validation triggers on draft save,
        generation completion, and export operations.
      </p>
      <div className="mt-3 space-y-1">
        <p>Status: {enabled ? 'Enabled' : 'Disabled'}</p>
        <p>Auto-validations run: {triggerCount ?? 0}</p>
      </div>
    </section>
  );
}

export default AutoValidationPlaceholder;
