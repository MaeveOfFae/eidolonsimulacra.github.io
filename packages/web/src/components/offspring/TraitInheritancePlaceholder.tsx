export interface TraitInheritancePlaceholderProps {
  parent1Name?: string;
  parent2Name?: string;
  traitCount?: number;
}

export function TraitInheritancePlaceholder({
  parent1Name,
  parent2Name,
  traitCount,
}: TraitInheritancePlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Trait Inheritance Preview</h3>
      <p className="mt-2">
        Planned integration point for visualizing trait inheritance from parents to offspring,
        including dominant/recessive trait logic and genetic probability distributions.
      </p>
      <div className="mt-3 space-y-1">
        <p>Parent 1: {parent1Name ?? 'not selected'}</p>
        <p>Parent 2: {parent2Name ?? 'not selected'}</p>
        <p>Estimated traits: {traitCount ?? 'calculating...'}</p>
      </div>
    </section>
  );
}

export default TraitInheritancePlaceholder;
