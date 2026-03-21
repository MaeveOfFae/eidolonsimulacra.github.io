export interface ValidationProfilesPlaceholderProps {
  profileName?: string;
  ruleCount?: number;
}

export function ValidationProfilesPlaceholder({
  profileName,
  ruleCount,
}: ValidationProfilesPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Validation Profiles</h3>
      <p className="mt-2">
        Planned integration point for saving and managing validation rule sets,
        creating custom validation profiles for different character types, and
        sharing profiles across projects.
      </p>
      <div className="mt-3 space-y-1">
        <p>Active profile: {profileName ?? 'default'}</p>
        <p>Rules: {ruleCount ?? 'loading...'}</p>
      </div>
    </section>
  );
}

export default ValidationProfilesPlaceholder;
