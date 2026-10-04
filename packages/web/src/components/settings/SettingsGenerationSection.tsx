import type { Config, FeatureCategory } from '@char-gen/shared';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { countFeatureBlueprintOverrides } from '@/lib/blueprints/defaults';
import CollapsibleSection from '../common/CollapsibleSection';

/**
 * Generation tab for the settings screen.
 *
 * Extracted from `Settings` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). Holds the batch pacing inputs
 * and the advanced feature-blueprint defaults. The config draft and its nested merge
 * logic stay in the parent, which owns `localConfig`; this section receives the current
 * values plus two narrow change callbacks. Behavior is pinned by `SettingsGeneration.test.tsx`.
 */

interface SettingsGenerationSectionProps {
  batch?: Config['batch'];
  onBatchChange: (key: 'max_concurrent' | 'rate_limit_delay', value: number) => void;
  featureBlueprints?: Config['feature_blueprints'];
  onFeatureBlueprintChange: (feature: FeatureCategory, value: string) => void;
  featureBlueprintOptions: Record<FeatureCategory, Array<{ value: string; label: string }>>;
}

const BLUEPRINT_SELECT_CLASS =
  'w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface BlueprintSelectProps {
  id: string;
  label: string;
  value: string;
  defaultPath: string;
  defaultLabel: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  help: string;
}

/**
 * Feature blueprint picker.
 *
 * A `<select>` whose value matches no `<option>` renders its first option instead, so a
 * stored path that is missing from the loaded blueprint list used to read as the default.
 * When that happens the stored path is added as its own option. Features whose built-in
 * default *is* "no path" (validation, similarity) pass `defaultPath=""`, in which case the
 * default option already represents "None (Built-in)".
 */
function BlueprintSelect({
  id,
  label,
  value,
  defaultPath,
  defaultLabel,
  options,
  onChange,
  help,
}: BlueprintSelectProps) {
  const storedPathIsListed = !value || value === defaultPath || options.some((option) => option.value === value);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={BLUEPRINT_SELECT_CLASS}
      >
        <option value={defaultPath}>{defaultLabel}</option>
        {!storedPathIsListed && <option value={value}>Stored blueprint ({value})</option>}
        {options
          .filter((option) => option.value !== defaultPath)
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        {defaultPath !== '' && <option value="">None (Built-in)</option>}
      </select>
      <p className="text-xs text-muted-foreground">{help}</p>
    </div>
  );
}

export default function SettingsGenerationSection({
  batch,
  onBatchChange,
  featureBlueprints,
  onFeatureBlueprintChange,
  featureBlueprintOptions,
}: SettingsGenerationSectionProps) {
  // Only custom paths count: the five shipped defaults are not user overrides.
  const configuredFeatureBlueprintCount = countFeatureBlueprintOverrides(featureBlueprints);

  return (
    <div className="space-y-6">
      <section className="app-panel p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 p-2">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Batch Generation</h2>
            <p className="text-sm text-muted-foreground">Control concurrency and pacing for multi-draft runs.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="max-concurrent-input" className="text-sm font-medium">
              Max Concurrent
            </label>
            <input
              id="max-concurrent-input"
              type="number"
              min="1"
              max="10"
              value={batch?.max_concurrent ?? 3}
              onChange={(e) => onBatchChange('max_concurrent', parseInt(e.target.value, 10) || 1)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="rate-limit-input" className="text-sm font-medium">
              Rate Limit Delay
            </label>
            <input
              id="rate-limit-input"
              type="number"
              min="0"
              max="60"
              step="0.5"
              value={batch?.rate_limit_delay ?? 1}
              onChange={(e) => onBatchChange('rate_limit_delay', parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </section>

      <CollapsibleSection
        title="Feature blueprint defaults"
        subtitle="Advanced compiler defaults"
        preview={`${configuredFeatureBlueprintCount} override${configuredFeatureBlueprintCount === 1 ? '' : 's'} configured`}
        className="app-panel"
        bodyClassName="space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <BlueprintSelect
            id="blueprint-orchestration"
            label="Orchestration"
            value={featureBlueprints?.orchestration || 'blueprints/system/generator.md'}
            defaultPath="blueprints/system/generator.md"
            defaultLabel="Orchestrator (Default)"
            options={featureBlueprintOptions.orchestration}
            onChange={(value) => onFeatureBlueprintChange('orchestration', value)}
            help="Blueprint used for the orchestrator on the Generate New tab."
          />

          <BlueprintSelect
            id="blueprint-seed"
            label="Seed Generation"
            value={featureBlueprints?.seed_generation || 'blueprints/system/seed_generator.md'}
            defaultPath="blueprints/system/seed_generator.md"
            defaultLabel="Seed Generator (Default)"
            options={featureBlueprintOptions.seed_generation}
            onChange={(value) => onFeatureBlueprintChange('seed_generation', value)}
            help="Blueprint used for generating seed batches from genre lines."
          />

          <BlueprintSelect
            id="blueprint-offspring"
            label="Offspring Generation"
            value={featureBlueprints?.offspring_generation || 'blueprints/system/offspring_generator.md'}
            defaultPath="blueprints/system/offspring_generator.md"
            defaultLabel="Offspring Generator (Default)"
            options={featureBlueprintOptions.offspring_generation}
            onChange={(value) => onFeatureBlueprintChange('offspring_generation', value)}
            help="Blueprint used for breeding characters."
          />

          <BlueprintSelect
            id="blueprint-intro-scene"
            label="Intro Scene Generation"
            value={featureBlueprints?.intro_scene_generation || 'blueprints/system/intro_scene.md'}
            defaultPath="blueprints/system/intro_scene.md"
            defaultLabel="Intro Scene (Default)"
            options={featureBlueprintOptions.intro_scene_generation}
            onChange={(value) => onFeatureBlueprintChange('intro_scene_generation', value)}
            help="Blueprint used by the Assets tab when generating additional intro scenes."
          />

          <BlueprintSelect
            id="blueprint-worldbook"
            label="Worldbook Generation"
            value={featureBlueprints?.worldbook_generation || 'blueprints/system/lorebook_generator.md'}
            defaultPath="blueprints/system/lorebook_generator.md"
            defaultLabel="Lorebook Generator (Default)"
            options={featureBlueprintOptions.worldbook_generation}
            onChange={(value) => onFeatureBlueprintChange('worldbook_generation', value)}
            help="Blueprint for synthesizing connected lorebook entries from reference drafts."
          />

          <BlueprintSelect
            id="blueprint-validation"
            label="Validation"
            value={featureBlueprints?.validation || ''}
            defaultPath=""
            defaultLabel="Built-in Validation (Default)"
            options={featureBlueprintOptions.validation}
            onChange={(value) => onFeatureBlueprintChange('validation', value)}
            help="Blueprint for character validation checks."
          />

          <BlueprintSelect
            id="blueprint-similarity"
            label="Similarity Analysis"
            value={featureBlueprints?.similarity || ''}
            defaultPath=""
            defaultLabel="Built-in Analysis (Default)"
            options={featureBlueprintOptions.similarity}
            onChange={(value) => onFeatureBlueprintChange('similarity', value)}
            help="Blueprint for comparing character relationships."
          />
        </div>

        <div className="mt-4 border-t border-border/50 pt-4">
          <p className="text-xs text-muted-foreground">
            Create custom blueprints in the{' '}
            <Link to="/blueprints" className="text-primary hover:underline">
              Blueprint Editor
            </Link>{' '}
            and they will appear here.
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
}
