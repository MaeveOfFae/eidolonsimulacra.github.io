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
          <div className="space-y-2">
            <label htmlFor="blueprint-orchestration" className="text-sm font-medium">
              Orchestration
            </label>
            <select
              id="blueprint-orchestration"
              value={featureBlueprints?.orchestration || 'blueprints/system/generator.md'}
              onChange={(e) => onFeatureBlueprintChange('orchestration', e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="blueprints/system/generator.md">Orchestrator (Default)</option>
              {featureBlueprintOptions.orchestration
                .filter((option) => option.value !== 'blueprints/system/generator.md')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              <option value="">None (Built-in)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Blueprint used for the orchestrator on the Generate New tab.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="blueprint-seed" className="text-sm font-medium">
              Seed Generation
            </label>
            <select
              id="blueprint-seed"
              value={featureBlueprints?.seed_generation || 'blueprints/system/seed_generator.md'}
              onChange={(e) => onFeatureBlueprintChange('seed_generation', e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="blueprints/system/seed_generator.md">Seed Generator (Default)</option>
              {featureBlueprintOptions.seed_generation
                .filter((option) => option.value !== 'blueprints/system/seed_generator.md')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              <option value="">None (Built-in)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Blueprint used for generating seed batches from genre lines.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="blueprint-offspring" className="text-sm font-medium">
              Offspring Generation
            </label>
            <select
              id="blueprint-offspring"
              value={featureBlueprints?.offspring_generation || 'blueprints/system/offspring_generator.md'}
              onChange={(e) => onFeatureBlueprintChange('offspring_generation', e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="blueprints/system/offspring_generator.md">Offspring Generator (Default)</option>
              {featureBlueprintOptions.offspring_generation
                .filter((option) => option.value !== 'blueprints/system/offspring_generator.md')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              <option value="">None (Built-in)</option>
            </select>
            <p className="text-xs text-muted-foreground">Blueprint used for breeding characters.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="blueprint-intro-scene" className="text-sm font-medium">
              Intro Scene Generation
            </label>
            <select
              id="blueprint-intro-scene"
              value={featureBlueprints?.intro_scene_generation || 'blueprints/system/intro_scene.md'}
              onChange={(e) => onFeatureBlueprintChange('intro_scene_generation', e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="blueprints/system/intro_scene.md">Intro Scene (Default)</option>
              {featureBlueprintOptions.intro_scene_generation
                .filter((option) => option.value !== 'blueprints/system/intro_scene.md')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              <option value="">None (Built-in)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Blueprint used by the Assets tab when generating additional intro scenes.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="blueprint-worldbook" className="text-sm font-medium">
              Worldbook Generation
            </label>
            <select
              id="blueprint-worldbook"
              value={featureBlueprints?.worldbook_generation || 'blueprints/system/lorebook_generator.md'}
              onChange={(e) => onFeatureBlueprintChange('worldbook_generation', e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="blueprints/system/lorebook_generator.md">Lorebook Generator (Default)</option>
              {featureBlueprintOptions.worldbook_generation
                .filter((option) => option.value !== 'blueprints/system/lorebook_generator.md')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              <option value="">None (Built-in)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Blueprint for synthesizing connected lorebook entries from reference drafts.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="blueprint-validation" className="text-sm font-medium">
              Validation
            </label>
            <select
              id="blueprint-validation"
              value={featureBlueprints?.validation || ''}
              onChange={(e) => onFeatureBlueprintChange('validation', e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Built-in Validation (Default)</option>
              {featureBlueprintOptions.validation.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Blueprint for character validation checks.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="blueprint-similarity" className="text-sm font-medium">
              Similarity Analysis
            </label>
            <select
              id="blueprint-similarity"
              value={featureBlueprints?.similarity || ''}
              onChange={(e) => onFeatureBlueprintChange('similarity', e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Built-in Analysis (Default)</option>
              {featureBlueprintOptions.similarity.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Blueprint for comparing character relationships.</p>
          </div>
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
