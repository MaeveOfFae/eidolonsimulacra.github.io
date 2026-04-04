import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight, Copy, Check, RefreshCcw, Wand2, Star, History, Archive } from 'lucide-react';
import type { FeatureCategory, SeedGenerationRequest } from '@char-gen/shared';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import { api } from '@/lib/api';
import type { Blueprint } from '@char-gen/shared';
import {
  archiveSeedRun,
  DEFAULT_SEED_COUNT,
  buildSeedGenerationLines,
  getFavoriteSeeds,
  getSeedRunHistory,
  getSeedSuggestionPresets,
  hydrateFavoriteSeedsFromServer,
  markSeedUsed,
  pickSurpriseSeedPreset,
  SEED_FAVORITES_CHANGED_EVENT,
  SEED_HISTORY_CHANGED_EVENT,
  sanitizeSeedCount,
  saveSeedRun,
  toggleFavoriteSeed,
  type FavoriteSeedRecord,
  type SeedCoverageMode,
  type SeedGeneratorControls,
  type SeedRunRecord,
  type SeedSuggestionPreset,
} from '../../lib/seed-generator.js';
import { queueAutoSync } from '../../lib/server/auto-sync.js';
import { BlueprintPanel } from '../common/BlueprintPanel';
import { getBlueprintsForFeature, resolveBlueprintForFeature, toBlueprintOptions } from '@/lib/blueprints/featureSelection';
import { configManager } from '@/lib/config/manager';
import {
  clearActiveSeedGeneratorSession,
  loadActiveSeedGeneratorSession,
  saveActiveSeedGeneratorSession,
} from '@/lib/services/generation-session';

const defaultPreset = pickSurpriseSeedPreset();
const PAGE_FEATURE_CATEGORY: FeatureCategory = 'seed_generation';

function countNonEmptyLines(value: string): number {
  return value.split('\n').map((line) => line.trim()).filter(Boolean).length;
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
    coverageMode: 'per-genre',
  });
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<SeedRunRecord[]>(() => getSeedRunHistory());
  const [favorites, setFavorites] = useState<FavoriteSeedRecord[]>(() => getFavoriteSeeds());
  const [restoredSeeds, setRestoredSeeds] = useState<string[]>(() => loadActiveSeedGeneratorSession()?.seeds ?? []);
  const restoredSessionRef = useRef(loadActiveSeedGeneratorSession());
  const presets = useMemo(() => getSeedSuggestionPresets(), []);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(true);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [selectedBlueprintPath, setSelectedBlueprintPath] = useState<string>(
    () => configManager.getConfig().feature_blueprints?.seed_generation || 'blueprints/system/seed_generator.md'
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

        const resolved = resolveBlueprintForFeature(
          list,
          PAGE_FEATURE_CATEGORY,
          selectedBlueprintPath
        );

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
          coverageMode: controls.coverageMode,
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
    setControls(session.controls);

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
    let cancelled = false;

    const syncFavorites = async () => {
      try {
        const syncedFavorites = await hydrateFavoriteSeedsFromServer();
        if (!cancelled && syncedFavorites) {
          setFavorites(syncedFavorites);
        }
      } catch (error) {
        console.warn('Failed to hydrate favorite seeds from server:', error);
      }
    };

    void syncFavorites();

    return () => {
      cancelled = true;
    };
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
    coverage_mode: controls.coverageMode,
    history_count: history.length,
    favorite_seed_count: favorites.length,
  });

  const requestGenreLines = useMemo(
    () => buildSeedGenerationLines(genreLines, controls),
    [genreLines, controls]
  );

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
    setControls({ count: DEFAULT_SEED_COUNT, coverageMode: 'per-genre' });
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
    if (nextFavorites.some((entry) => entry.seed === seed)) {
      queueAutoSync('seeds');
    }
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
    queueAutoSync('seeds');
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
      coverageMode: entry.request.coverageMode,
    });
    setActivePreset(entry.request.presetId || null);
    setResumeNotice(null);
  };

  const handleArchiveHistoryEntry = (id: string) => {
    setHistory(archiveSeedRun(id));
    queueAutoSync('seeds');
  };

  const handleCountChange = (value: string) => {
    setControls((previous) => ({
      ...previous,
      count: sanitizeSeedCount(Number(value)),
    }));
  };

  const handleCoverageMode = (coverageMode: SeedCoverageMode) => {
    setControls((previous) => ({ ...previous, coverageMode }));
  };

  useEffect(() => {
    const hasState = Boolean(
      genreLines.trim()
      || seeds.length > 0
      || activePreset
      || controls.count !== DEFAULT_SEED_COUNT
      || controls.coverageMode !== 'per-genre'
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
        coverageMode: controls.coverageMode,
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Seed Generator</h1>
        <p className="text-muted-foreground">
          Generate seed ideas from genre constraints. Pick a preset, edit lines, generate, then push to generation.
        </p>
      </div>

      {blueprint && !blueprintLoading && (
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
      )}

      {blueprintError && !blueprintLoading && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {blueprintError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-lg border border-border bg-card p-6 space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-medium">Select preset</label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Edit the lines, then generate seeds.
                </p>
              </div>
              <button
                onClick={handleReset}
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-accent"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Reset
              </button>
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

          <div>
            <label className="text-sm font-medium">Genre or Theme Lines</label>
            <p className="mt-1 text-xs text-muted-foreground">
              Use one line per genre/tone cluster. Tags like realism, slow-burn, low-magic, moreau, or count=12 can stay inline.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Seed Count</span>
              <input
                type="number"
                min="5"
                max="30"
                step="1"
                value={controls.count}
                onChange={(event) => handleCountChange(event.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>

            <div className="space-y-2">
              <span className="text-sm font-medium">Coverage Mode</span>
              <div className="flex rounded-md border border-input bg-background p-1">
                {(['per-genre', 'blended'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleCoverageMode(mode)}
                    className={`flex-1 rounded px-3 py-2 text-xs font-medium transition-colors ${
                      controls.coverageMode === mode
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {mode === 'per-genre' ? 'Per Genre' : 'Blended'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <textarea
            value={genreLines}
            onChange={(event) => {
              setGenreLines(event.target.value);
              setActivePreset(null);
            }}
            placeholder="fantasy\ncyberpunk noir\nVictorian horror"
            className="min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            {inputLineCount} input lines. Request controls: {controls.count} seeds, {controls.coverageMode}. Output stays one seed per line with no numbering or headings.
          </div>

          {resumeNotice && !seedMutation.error && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">
              {resumeNotice}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerate}
              disabled={seedMutation.isPending || !genreLines.trim()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
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
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Generated Seeds</h2>
              <p className="text-sm text-muted-foreground">
                Click any result to send it directly into the character generator.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="app-pill app-pill-muted">
                {seeds.length} seeds
              </span>
              <button
                type="button"
                onClick={handleCopyAll}
                disabled={seeds.length === 0}
                className="app-button app-button-secondary !px-3 !py-2 !text-xs"
              >
                {copiedSeed === '__all__' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedSeed === '__all__' ? 'Copied All' : 'Copy All'}
              </button>
            </div>
          </div>

          {seeds.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              Generate a set of seeds to start exploring concepts.
            </div>
          ) : (
            <div className="space-y-3">
              {seeds.map((seed) => (
                <div key={seed} className="rounded-lg border border-border p-4">
                  <p className="text-sm leading-6">{seed}</p>
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

          {(favorites.length > 0 || history.length > 0) && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-semibold">Favorite Seeds</h3>
                </div>
                {favorites.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Favorite a seed to keep it around.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favorites.slice(0, 6).map((entry) => (
                      <div key={entry.seed} className="rounded-lg border border-border p-3">
                        <p className="text-sm leading-6">{entry.seed}</p>
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
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Recent Batches</h3>
                </div>
                {history.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Generated batches will appear here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.slice(0, 6).map((entry) => (
                      <div key={entry.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleUseHistoryEntry(entry)}
                            className="min-w-0 text-left"
                          >
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleString()}
                            </span>
                            <p className="mt-2 line-clamp-2 text-sm text-foreground">
                              {entry.request.genreLines}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {entry.seeds.length} generated seeds
                            </p>
                          </button>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="app-pill app-pill-muted !px-2 !py-1 !text-[11px]">
                              {entry.request.count} seeds • {entry.request.coverageMode}
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
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}