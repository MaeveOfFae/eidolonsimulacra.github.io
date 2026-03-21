export interface CharacterLifespanPlaceholderProps {
  characterId?: string;
  birthYear?: string;
  deathYear?: string;
}

export function CharacterLifespanPlaceholder({
  characterId,
  birthYear,
  deathYear,
}: CharacterLifespanPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Character Lifespan</h3>
      <p className="mt-2">
        Planned integration point for tracking character lifespans, ages,
        and life events within the world timeline.
      </p>
      <div className="mt-3 space-y-1">
        <p>Character: {characterId ?? 'none selected'}</p>
        <p>Birth: {birthYear ?? 'unknown'}</p>
        <p>Death: {deathYear ?? 'unknown'}</p>
      </div>
    </section>
  );
}

export default CharacterLifespanPlaceholder;
