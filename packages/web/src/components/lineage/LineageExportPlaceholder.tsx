export interface LineageExportPlaceholderProps {
  rootId?: string;
  format?: string;
}

export function LineageExportPlaceholder({
  rootId,
  format,
}: LineageExportPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Lineage Export</h3>
      <p className="mt-2">
        Planned integration point for exporting lineage data to various formats,
        including JSON, CSV, and visual diagram formats for external tools.
      </p>
      <div className="mt-3 space-y-1">
        <p>Root: {rootId ?? 'none selected'}</p>
        <p>Format: {format ?? 'JSON'}</p>
      </div>
    </section>
  );
}

export default LineageExportPlaceholder;
