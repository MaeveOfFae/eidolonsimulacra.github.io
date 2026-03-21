export interface WorldbookPlaceholderProps {
  worldName?: string;
  settingCount?: number;
  characterCount?: number;
}

export function WorldbookPlaceholder({
  worldName,
  settingCount,
  characterCount,
}: WorldbookPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Worldbook</h3>
      <p className="mt-2">
        Planned integration point for worldbook entries including locations, factions,
        historical events, and setting details that can be attached to multiple related drafts.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldName ?? 'none created'}</p>
        <p>Settings: {settingCount ?? 0}</p>
        <p>Linked characters: {characterCount ?? 0}</p>
      </div>
    </section>
  );
}

export default WorldbookPlaceholder;
