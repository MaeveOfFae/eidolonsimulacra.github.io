export interface ContinuityAssistantPlaceholderProps {
  worldId?: string;
  conflictCount?: number;
}

export function ContinuityAssistantPlaceholder({
  worldId,
  conflictCount,
}: ContinuityAssistantPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Continuity Assistant</h3>
      <p className="mt-2">
        Planned integration point for cross-draft continuity checking that helps
        keep related characters aligned and identifies potential canon conflicts.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Detected conflicts: {conflictCount ?? 0}</p>
      </div>
    </section>
  );
}

export default ContinuityAssistantPlaceholder;
