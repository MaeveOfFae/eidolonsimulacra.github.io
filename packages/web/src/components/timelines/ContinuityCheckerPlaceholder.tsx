export interface ContinuityCheckerPlaceholderProps {
  worldId?: string;
  issueCount?: number;
}

export function ContinuityCheckerPlaceholder({
  worldId,
  issueCount,
}: ContinuityCheckerPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Continuity Checker</h3>
      <p className="mt-2">
        Planned integration point for cross-draft continuity assistant that
        identifies timeline conflicts, anachronisms, and consistency issues.
      </p>
      <div className="mt-3 space-y-1">
        <p>World: {worldId ?? 'none selected'}</p>
        <p>Issues found: {issueCount ?? 0}</p>
      </div>
    </section>
  );
}

export default ContinuityCheckerPlaceholder;
