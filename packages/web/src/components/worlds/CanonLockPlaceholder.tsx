export interface CanonLockPlaceholderProps {
  worldId?: string;
  lockedFactCount?: number;
}

export function CanonLockPlaceholder({
  worldId,
  lockedFactCount,
}: CanonLockPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Canon Lock</h3>
      <p className="mt-2">
        Planned integration point for canon lock system that ensures specific facts
        and details remain stable across derivative drafts and offspring characters.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Locked facts: {lockedFactCount ?? 0}</p>
      </div>
    </section>
  );
}

export default CanonLockPlaceholder;
