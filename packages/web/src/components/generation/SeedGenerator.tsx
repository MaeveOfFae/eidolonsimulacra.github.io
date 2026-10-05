import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  RefreshCcw,
  Wand2,
  Star,
  Archive,
  Lightbulb,
  Shuffle,
} from 'lucide-react';
import { buildRemixedSeed, type SeedIdeaRecord } from '@char-gen/shared';
import type { FeatureCategory, SeedGenerationRequest } from '@char-gen/shared';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import { api } from '@/lib/api';
import type { Blueprint } from '@char-gen/shared';
import {
  archiveSeedRun,
  DEFAULT_SEED_COUNT,
  DEFAULT_SEED_COVERAGE_MODE,
  buildSeedGenerationLines,
  getFavoriteSeeds,
  getSeedRunHistory,
  getSeedSuggestionPresets,
  markSeedUsed,
  pickSurpriseSeedPreset,
  SEED_FAVORITES_CHANGED_EVENT,
  SEED_HISTORY_CHANGED_EVENT,
  sanitizeSeedCount,
  saveSeedRun,
  toggleFavoriteSeed,
  type FavoriteSeedRecord,
  type SeedGeneratorControls,
  type SeedRunRecord,
  type SeedSuggestionPreset,
} from '../../lib/seed-generator.js';
import { BlueprintPanel } from '../common/BlueprintPanel';
import CollapsibleSection from '../common/CollapsibleSection';
import {
  getBlueprintsForFeature,
  resolveBlueprintForFeature,
  toBlueprintOptions,
} from '@/lib/blueprints/featureSelection';
import { configManager } from '@/lib/config/manager';
import { SEED_IDEAS_CHANGED_EVENT, deleteSeedIdea, getSeedIdeas, saveSeedIdea } from '@/lib/generation/seed-ideas';
import {
  clearActiveSeedGeneratorSession,
  loadActiveSeedGeneratorSession,
  saveActiveSeedGeneratorSession,
} from '@/lib/services/generation-session';

const defaultPreset = pickSurpriseSeedPreset();
const PAGE_FEATURE_CATEGORY: FeatureCategory = 'seed_generation';

function countNonEmptyLines(value: string): number {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean).length;
}

type SeedGenerationRunRequest = SeedGenerationRequest & {
  blueprint_content?: string;
  blueprint_path?: string;
};

export default function SeedGenerator() {
  const navigate = useNavigate();
  const [genreLines, setGenreLines] = useState(defaultPreset.genreLines);
  const [activePreset, setActivePreset] = useState<string | null>(defaultPreset.id);
  const [copiedSeed, setCopiedSeed] = useState<string | null>(null);
  const [controls, setControls] = useState<SeedGeneratorControls>({
    count: DEFAULT_SEED_COUNT,
    coverageMode: DEFAULT_SEED_COVERAGE_MODE,
  });
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<SeedRunRecord[]>(() => getSeedRunHistory());
  const [favorites, setFavorites] = useState<FavoriteSeedRecord[]>(() => getFavoriteSeeds());
  const [remixSelection, setRemixSelection] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<SeedIdeaRecord[]>(() => getSeedIdeas());
  const [ideaText, setIdeaText] = useState('');
  const [ideaTags, setIdeaTags] = useState('');

  useEffect(() => {
    const handleIdeasChanged = () => setIdeas(getSeedIdeas());
    window.addEventListener(SEED_IDEAS_CHANGED_EVENT, handleIdeasChanged);
    return () => window.removeEventListener(SEED_IDEAS_CHANGED_EVENT, handleIdeasChanged);
  }, []);

  const remixedSeed = useMemo(() => buildRemixedSeed(remixSelection), [remixSelection]);

  const toggleRemixSeed = (seed: string) => {
    setRemixSelection((current) =>
      current.includes(seed) ? current.filter((entry) => entry !== seed) : [...current, seed],
    );
  };
  const [restoredSeeds, setRestoredSeeds] = useState<string[]>(() => loadActiveSeedGeneratorSession()?.seeds ?? []);
  const restoredSessionRef = useRef(loadActiveSeedGeneratorSession());
  const presets = useMemo(() => getSeedSuggestionPresets(), []);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(true);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [selectedBlueprintPath, setSelectedBlueprintPath] = useState<string>(
    () => configManager.getConfig().feature_blueprints?.seed_generation || 'blueprints/system/seed_generator.md',
  );
  const [seedBlueprintOverride, setSeedBlueprintOverride] = useState<string | null>(null);
  const [availableBlueprints, setAvailableBlueprints] = useState<Array<{ name: string; label: string }>>([]);

  // Load the seed generator blueprint on mount
  useEffect(() => {
    (async () => {
      try {
        const list = await api.getBlueprints();
        const matching = getBlueprintsForFeature(list, PAGE_FEATURE_CATEGORY);
        setAvailableBlueprints(toBlueprintOptions(matching));

        const resolved = resolveBlueprintForFeature(list, PAGE_FEATURE_CATEGORY, selectedBlueprintPath);

        if (resolved) {
          setBlueprint(resolved);
          setSelectedBlueprintPath(resolved.path);
          setBlueprintError(null);
        } else {
          setBlueprintError('Seed generator blueprint could not be resolved from feature_category metadata.');
        }
      } catch (error) {
        console.error('Failed to load seed_generator blueprint:', error);
        setBlueprintError('Failed to load seed generator blueprint.');
      } finally {
        setBlueprintLoading(false);
      }
    })();
  }, [selectedBlueprintPath]);
  const seedMutation = useMutation({
    mutationFn: (request: SeedGenerationRunRequest) => api.generateSeeds(request),
    onSuccess: (data, variables) => {
      setRestoredSeeds(data.seeds);
      const nextHistory = saveSeedRun({
        request: {
          genreLines: variables.genre_lines,
          count: controls.count,
          coverageMode: DEFAULT_SEED_COVERAGE_MODE,
          surpriseMode: Boolean(variables.surprise_mode),
          presetId: activePreset || undefined,
        },
        seeds: data.seeds,
      });
      setHistory(nextHistory);
    },
  });

  const seeds = seedMutation.data?.seeds ?? restoredSeeds;
  const inputLineCount = countNonEmptyLines(genreLines);

  useEffect(() => {
    const session = restoredSessionRef.current;
    if (!session) {
      return;
    }

    setGenreLines(session.genreLines);
    setActivePreset(session.activePreset);
    setControls({
      count: session.controls.count,
      coverageMode: DEFAULT_SEED_COVERAGE_MODE,
    });

    if (session.status === 'generating') {
      setResumeNotice('Seed generation was interrupted. Review the restored inputs and generate again to continue.');
    } else if (session.status === 'ready' && session.seeds.length > 0) {
      setResumeNotice('Restored generated seeds.');
    } else {
      setResumeNotice('Restored seed generator inputs.');
    }

    restoredSessionRef.current = null;
  }, []);

  useEffect(() => {
    setFavorites(getFavoriteSeeds());
  }, []);

  useEffect(() => {
    const handleFavoriteSeedsChanged = () => {
      setFavorites(getFavoriteSeeds());
    };

    const handleSeedHistoryChanged = () => {
      setHistory(getSeedRunHistory());
    };

    window.addEventListener(SEED_FAVORITES_CHANGED_EVENT, handleFavoriteSeedsChanged);
    window.addEventListener(SEED_HISTORY_CHANGED_EVENT, handleSeedHistoryChanged);
    return () => {
      window.removeEventListener(SEED_FAVORITES_CHANGED_EVENT, handleFavoriteSeedsChanged);
      window.removeEventListener(SEED_HISTORY_CHANGED_EVENT, handleSeedHistoryChanged);
    };
  }, []);

  useAssistantScreenContext({
    genre_input_preview: genreLines.slice(0, 400),
    genre_line_count: inputLineCount,
    generated_seeds_count: seeds.length,
    seeds_preview: seeds.slice(0, 5),
    is_generating: seedMutation.isPending,
    surprise_mode: Boolean(seedMutation.variables?.surprise_mode),
    seed_count: controls.count,
    coverage_mode: DEFAULT_SEED_COVERAGE_MODE,
    history_count: history.length,
    favorite_seed_count: favorites.length,
  });

  const requestGenreLines = useMemo(() => buildSeedGenerationLines(genreLines, controls), [genreLines, controls]);

  const favoriteSeeds = useMemo(() => new Set(favorites.map((entry) => entry.seed)), [favorites]);
  const effectiveSeedBlueprint = seedBlueprintOverride ?? blueprint?.content;

  const handleBlueprintSelect = async (path: string) => {
    try {
      const nextBlueprint = await api.getBlueprint(path);
      setBlueprint(nextBlueprint);
      setSelectedBlueprintPath(path);
      setSeedBlueprintOverride(null);
      setBlueprintError(null);
    } catch (error) {
      console.error('Failed to switch blueprint:', error);
      setBlueprintError('Failed to switch selected blueprint.');
    }
  };

  const handleGenerate = () => {
    setResumeNotice(null);
    setRestoredSeeds([]);
    seedMutation.mutate({
      genre_lines: requestGenreLines,
      surprise_mode: false,
      blueprint_content: effectiveSeedBlueprint,
      blueprint_path: selectedBlueprintPath,
    });
  };

  const handleSurprise = () => {
    setResumeNotice(null);
    setRestoredSeeds([]);
    const preset = pickSurpriseSeedPreset();
    setGenreLines(preset.genreLines);
    setActivePreset(preset.id);
    seedMutation.mutate({
      genre_lines: buildSeedGenerationLines(preset.genreLines, controls),
      surprise_mode: true,
      blueprint_content: effectiveSeedBlueprint,
      blueprint_path: selectedBlueprintPath,
    });
  };

  const handlePreset = (preset: SeedSuggestionPreset) => {
    setGenreLines(preset.genreLines);
    setActivePreset(preset.id);
    setResumeNotice(null);
  };

  const handleReset = () => {
    setGenreLines(defaultPreset.genreLines);
    setActivePreset(defaultPreset.id);
    setControls({ count: DEFAULT_SEED_COUNT, coverageMode: DEFAULT_SEED_COVERAGE_MODE });
    setRestoredSeeds([]);
    setResumeNotice(null);
    clearActiveSeedGeneratorSession();
  };

  const handleCopyAll = async () => {
    if (seeds.length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(seeds.join('\n'));
      setCopiedSeed('__all__');
      window.setTimeout(() => setCopiedSeed(null), 1500);
    } catch (error) {
      console.error('Failed to copy seeds', error);
    }
  };

  const handleUseSeed = (seed: string) => {
    const nextFavorites = markSeedUsed(seed);
    setFavorites(nextFavorites);
    navigate('/generate', { state: { seed } });
  };

  const handleCopySeed = async (seed: string) => {
    try {
      await navigator.clipboard.writeText(seed);
      setCopiedSeed(seed);
      window.setTimeout(() => setCopiedSeed(null), 1500);
    } catch (error) {
      console.error('Failed to copy seed', error);
    }
  };

  const handleToggleFavorite = (seed: string) => {
    setFavorites(toggleFavoriteSeed(seed));
  };

  const handleUseHistoryEntry = (entry: SeedRunRecord) => {
    const lines = entry.request.genreLines
      .split('\n')
      .filter((line) => !/^count=\d+/i.test(line))
      .filter((line) => line !== 'per-genre' && line !== 'blended')
      .join('\n');
    setGenreLines(lines);
    setControls({
      count: entry.request.count,
      coverageMode: DEFAULT_SEED_COVERAGE_MODE,
    });
    setActivePreset(entry.request.presetId || null);
    setResumeNotice(null);
  };

  const handleArchiveHistoryEntry = (id: string) => {
    setHistory(archiveSeedRun(id));
  };

  const handleCountChange = (value: string) => {
    setControls((previous) => ({
      ...previous,
      count: sanitizeSeedCount(Number(value)),
    }));
  };

  useEffect(() => {
    const hasState = Boolean(
      genreLines.trim() || seeds.length > 0 || activePreset || controls.count !== DEFAULT_SEED_COUNT,
    );

    if (!hasState) {
      clearActiveSeedGeneratorSession();
      return;
    }

    saveActiveSeedGeneratorSession({
      version: 1,
      genreLines,
      activePreset,
      controls: {
        count: controls.count,
        coverageMode: DEFAULT_SEED_COVERAGE_MODE,
      },
      seeds,
      status: seedMutation.isPending ? 'generating' : seeds.length > 0 ? 'ready' : 'idle',
      updatedAt: Date.now(),
    });
  }, [activePreset, controls, genreLines, seedMutation.isPending, seeds]);

  useEffect(() => {
    if (!seedMutation.isPending && !genreLines.trim() && seeds.length === 0) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [genreLines, seedMutation.isPending, seeds.length]);

  return (
    <div className="app-page space-y-8 pb-10 sm:space-y-10 sm:pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4 sm:space-y-5">
            <p className="app-page-eyebrow">Seed Generator</p>
            <div className="space-y-3">
              <h1 className="app-page-title">Build seed batches</h1>
              <p className="app-page-summary">
                Turn genre clusters into reusable concept seeds, then send the strongest ones into draft generation.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link to="/generate" className="app-button app-button-secondary">
                Open Generate
              </Link>
              <Link to="/drafts?tab=seeds" className="app-button app-button-secondary">
                Open seed library
              </Link>
            </div>
          </div>

          <div className="app-panel-muted p-4 sm:p-5">
            <p className="app-page-eyebrow">Current batch</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Input lines</p>
                <div className="app-page-metric-value text-2xl">{inputLineCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Requested</p>
                <div className="app-page-metric-value text-2xl">{controls.count}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Favorites</p>
                <div className="app-page-metric-value text-2xl">{favorites.length}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">History</p>
                <div className="app-page-metric-value text-2xl">{history.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {resumeNotice && !seedMutation.error && (
        <div className="app-note px-4 py-3 text-sm text-foreground">{resumeNotice}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <CollapsibleSection
          title="Inputs"
          subtitle="Preset, batch controls, and genre lines"
          preview={`${inputLineCount} line${inputLineCount === 1 ? '' : 's'} • ${controls.count} requested`}
          actions={
            <button
              onClick={handleReset}
              type="button"
              className="app-button app-button-secondary !px-3 !py-2 !text-xs"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          }
          defaultExpanded
          className="app-panel"
          bodyClassName="space-y-5"
        >
          <div className="space-y-5">
            <div>
              <div className="mb-3">
                <label className="text-sm font-medium text-foreground">Select preset</label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Start from a preset when you want a fast genre scaffold.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      activePreset === preset.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-xs space-y-2">
              <label className="space-y-2 text-sm font-medium">
                <span>Seed Count</span>
                <input
                  type="number"
                  min="5"
                  max="30"
                  step="1"
                  value={controls.count}
                  onChange={(event) => handleCountChange(event.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>

            <div>
              <label htmlFor="seed-genre-lines" className="text-sm font-medium text-foreground">
                Genre or Theme Lines
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Use one line per genre or tone cluster. Inline tags like realism, slow-burn, low-magic, moreau, or
                count=12 can stay in place.
              </p>
              <textarea
                id="seed-genre-lines"
                value={genreLines}
                onChange={(event) => {
                  setGenreLines(event.target.value);
                  setActivePreset(null);
                }}
                placeholder="fantasy\ncyberpunk noir\nVictorian horror"
                className="mt-3 min-h-56 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="rounded-xl border border-border/60 bg-background/35 p-3 text-xs text-muted-foreground">
              {inputLineCount} input lines. Request count: {controls.count} seeds. All lines are blended into one batch,
              and output stays one seed per line with no numbering or headings.
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerate}
                disabled={seedMutation.isPending || !genreLines.trim()}
                className="app-button app-button-primary"
              >
                {seedMutation.isPending && !seedMutation.variables?.surprise_mode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Seeds
              </button>

              <button
                onClick={handleSurprise}
                disabled={seedMutation.isPending}
                className="app-button app-button-secondary"
              >
                {seedMutation.isPending && seedMutation.variables?.surprise_mode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Surprise Me
              </button>
            </div>

            {seedMutation.error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {seedMutation.error instanceof Error ? seedMutation.error.message : 'Seed generation failed'}
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Generated seeds"
          subtitle="Use any result directly in the draft generator or save it as a favorite"
          preview={`${seeds.length} seed${seeds.length === 1 ? '' : 's'}`}
          actions={
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={seeds.length === 0}
              className="app-button app-button-secondary !px-3 !py-2 !text-xs"
            >
              {copiedSeed === '__all__' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedSeed === '__all__' ? 'Copied All' : 'Copy All'}
            </button>
          }
          defaultExpanded={seeds.length > 0}
          className="app-panel"
          bodyClassName="space-y-3"
        >
          {seeds.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Generate a set of seeds to start exploring concepts.
            </div>
          ) : (
            <div className="space-y-3">
              {seeds.map((seed) => (
                <div key={seed} className="rounded-xl border border-border/60 bg-background/35 p-4">
                  <p className="text-sm leading-6 text-foreground">{seed}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUseSeed(seed)}
                      className="app-button app-button-primary !px-3 !py-2 !text-xs"
                    >
                      Use In Generate
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopySeed(seed)}
                      className="app-button app-button-secondary !px-3 !py-2 !text-xs"
                    >
                      {copiedSeed === seed ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedSeed === seed ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(seed)}
                      className={`app-button !px-3 !py-2 !text-xs ${
                        favoriteSeeds.has(seed)
                          ? 'border border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : 'app-button-secondary'
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${favoriteSeeds.has(seed) ? 'fill-current' : ''}`} />
                      {favoriteSeeds.has(seed) ? 'Archive Favorite' : 'Favorite'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      </div>

      {(favorites.length > 0 || history.length > 0) && (
        <section className="grid gap-6 xl:grid-cols-2">
          <CollapsibleSection
            title="Favorite seeds"
            subtitle="Keep reusable concepts close to generation"
            preview={`${favorites.length} favorite${favorites.length === 1 ? '' : 's'}`}
            className="app-panel"
            bodyClassName="space-y-2"
          >
            {favorites.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Favorite a seed to keep it around.
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.slice(0, 6).map((entry) => (
                  <div key={entry.seed} className="rounded-xl border border-border/60 bg-background/35 p-3">
                    <p className="text-sm leading-6 text-foreground">{entry.seed}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUseSeed(entry.seed)}
                        className="app-button app-button-primary !px-3 !py-2 !text-xs"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(entry.seed)}
                        className="app-button app-button-secondary !px-3 !py-2 !text-xs"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Recent batches"
            subtitle="Reuse or archive recent seed runs"
            preview={`${history.length} batch${history.length === 1 ? '' : 'es'}`}
            className="app-panel"
            bodyClassName="space-y-2"
          >
            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Generated batches will appear here.
              </div>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-border/60 bg-background/35 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => handleUseHistoryEntry(entry)} className="min-w-0 text-left">
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                        <p className="mt-2 line-clamp-2 text-sm text-foreground">{entry.request.genreLines}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{entry.seeds.length} generated seeds</p>
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="app-pill app-pill-muted !px-2 !py-1 !text-[11px]">
                          {entry.request.count} seeds
                        </span>
                        <button
                          type="button"
                          onClick={() => handleArchiveHistoryEntry(entry.id)}
                          className="app-button app-button-secondary !px-3 !py-2 !text-xs"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>
        </section>
      )}

      {/* Seed Remix */}
      {favorites.length >= 2 && (
        <CollapsibleSection
          title="Seed remix"
          subtitle="Fold two to four favorite seeds into one premise line"
          preview={
            remixedSeed ? remixedSeed.slice(0, 60) + (remixedSeed.length > 60 ? '…' : '') : 'Select seeds to remix'
          }
          className="app-panel"
          bodyClassName="space-y-3"
        >
          <div className="space-y-2">
            {favorites.slice(0, 8).map((entry) => {
              const selected = remixSelection.includes(entry.seed);
              return (
                <button
                  key={entry.seed}
                  type="button"
                  onClick={() => toggleRemixSeed(entry.seed)}
                  className={`block w-full rounded-xl border p-3 text-left text-sm transition-colors ${
                    selected
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border/60 bg-background/35 text-foreground hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shuffle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 truncate">{entry.seed}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {remixedSeed && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
              <p className="text-sm leading-6 text-foreground">{remixedSeed}</p>
              <button
                onClick={() => handleUseSeed(remixedSeed)}
                className="app-button app-button-primary mt-2 !px-3 !py-2 !text-xs"
              >
                Use remixed seed
              </button>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Idea Board */}
      <CollapsibleSection
        title="Idea board"
        subtitle="Save tagged inspiration fragments that can flow into generation"
        preview={`${ideas.length} idea${ideas.length === 1 ? '' : 's'}`}
        className="app-panel"
        bodyClassName="space-y-3"
      >
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="A duelist who fears mirrors…"
            value={ideaText}
            onChange={(event) => setIdeaText(event.target.value)}
            aria-label="Seed idea text"
            className="min-w-48 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            placeholder="tags, comma separated"
            value={ideaTags}
            onChange={(event) => setIdeaTags(event.target.value)}
            aria-label="Seed idea tags"
            className="w-44 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            disabled={!ideaText.trim()}
            onClick={() => {
              saveSeedIdea({
                text: ideaText,
                tags: ideaTags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              });
              setIdeaText('');
              setIdeaTags('');
            }}
            className="shrink-0 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50 disabled:opacity-50"
          >
            <Lightbulb className="mr-1.5 inline h-3.5 w-3.5" />
            Save idea
          </button>
        </div>
        {ideas.length > 0 && (
          <ul className="space-y-2">
            {ideas.slice(0, 12).map((idea) => (
              <li key={idea.id} className="rounded-xl border border-border/60 bg-background/35 p-3">
                <p className="text-sm leading-6 text-foreground">{idea.text}</p>
                {idea.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {idea.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleUseSeed(idea.text)}
                    className="app-button app-button-primary !px-3 !py-2 !text-xs"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => deleteSeedIdea(idea.id)}
                    className="app-button app-button-secondary !px-3 !py-2 !text-xs"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Blueprint override"
        subtitle="Inspect or replace the seed-generation blueprint only when you need to change composition behavior"
        preview={selectedBlueprintPath || blueprint?.path || 'No blueprint selected'}
        className="app-panel-muted"
      >
        {blueprintLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading blueprint controls...
          </div>
        )}

        {blueprintError && !blueprintLoading && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            {blueprintError}
          </div>
        )}

        {blueprint && !blueprintLoading && !blueprintError && (
          <div>
            <BlueprintPanel
              blueprintName={selectedBlueprintPath}
              blueprintContent={effectiveSeedBlueprint || blueprint.content}
              title="Seed Generator Blueprint"
              description={blueprint.description}
              editable
              availableBlueprints={availableBlueprints}
              onBlueprintSelect={handleBlueprintSelect}
              onContentChange={setSeedBlueprintOverride}
            />
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
