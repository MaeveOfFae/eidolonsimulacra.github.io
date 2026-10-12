/**
 * The data behind Home's live panels: what is parked mid-run, and which saved searches
 * match what.
 *
 * Every session loader is injectable and defaults to the real one. The alternative — a
 * component that reads six storage keys and can only be exercised by seeding them — is
 * how a panel ends up untested, and this is the part of the dashboard that can actually
 * be wrong: "is this run resumable, and where does it resume" is a decision, and it is
 * decided here rather than in JSX.
 */
import {
  applyDraftLibraryFilter,
  type DraftLibraryFilter,
  type DraftMetadata,
  type SavedSearchRecord,
} from '@char-gen/shared';
import {
  loadActiveAssetRegeneratorSession,
  loadActiveBatchGenerationSession,
  loadActiveDraftRefinerSession,
  loadActiveGenerationSession,
  loadActiveOffspringSession,
  loadActiveSeedGeneratorSession,
  type ActiveAssetRegeneratorSession,
  type ActiveBatchGenerationSession,
  type ActiveDraftRefinerSession,
  type ActiveGenerationSession,
  type ActiveOffspringSession,
  type ActiveSeedGeneratorSession,
} from './services/generation-session';

export type ResumableRunId =
  | 'generation'
  | 'batch'
  | 'seed-generator'
  | 'offspring'
  | 'asset-regenerator'
  | 'draft-refiner';

export interface ResumableRun {
  id: ResumableRunId;
  title: string;
  detail: string;
  /**
   * `in-progress` was parked mid-run and needs finishing; `ready` finished and is
   * waiting on a decision. The distinction is the whole point of the panel — "resume
   * this" and "look at this" are different instructions.
   */
  state: 'in-progress' | 'ready';
  /** Where the run picks up. */
  to: string;
  updatedAt: number;
}

export interface ResumableRunLoaders {
  generation: () => ActiveGenerationSession | null;
  batch: () => ActiveBatchGenerationSession | null;
  seedGenerator: () => ActiveSeedGeneratorSession | null;
  offspring: () => ActiveOffspringSession | null;
  assetRegenerator: () => ActiveAssetRegeneratorSession | null;
  draftRefiner: () => ActiveDraftRefinerSession | null;
}

export const defaultResumableRunLoaders: ResumableRunLoaders = {
  generation: loadActiveGenerationSession,
  batch: loadActiveBatchGenerationSession,
  seedGenerator: loadActiveSeedGeneratorSession,
  offspring: loadActiveOffspringSession,
  assetRegenerator: loadActiveAssetRegeneratorSession,
  draftRefiner: loadActiveDraftRefinerSession,
};

/** Most recently touched first: the run you were in is the one to resume. */
export function listResumableRuns(loaders: ResumableRunLoaders = defaultResumableRunLoaders): ResumableRun[] {
  return [
    buildGenerationRun(loaders.generation()),
    buildBatchRun(loaders.batch()),
    buildSeedGeneratorRun(loaders.seedGenerator()),
    buildOffspringRun(loaders.offspring()),
    buildAssetRegeneratorRun(loaders.assetRegenerator()),
    buildDraftRefinerRun(loaders.draftRefiner()),
  ]
    .filter((run): run is ResumableRun => run !== null)
    .sort((left, right) => right.updatedAt - left.updatedAt);
}

function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function buildGenerationRun(session: ActiveGenerationSession | null): ResumableRun | null {
  if (!session) {
    return null;
  }

  const written = Object.keys(session.assetDrafts ?? {}).length;
  const finished = session.currentStatus === 'paused' || session.currentStatus === 'reviewing';

  return {
    id: 'generation',
    title: 'Draft generation',
    detail: written > 0 ? `${session.seed} · ${countLabel(written, 'asset')} written` : session.seed,
    state: finished ? 'ready' : 'in-progress',
    to: '/generate',
    updatedAt: session.updatedAt,
  };
}

function buildBatchRun(session: ActiveBatchGenerationSession | null): ResumableRun | null {
  // Seeds typed into the form and not run are not a queue; only jobs that exist are.
  if (!session || (session.jobs ?? []).length === 0) {
    return null;
  }

  const jobs = session.jobs;
  const complete = jobs.filter((job) => job.status === 'complete').length;
  const failed = jobs.filter((job) => job.status === 'error').length;

  return {
    id: 'batch',
    title: 'Batch run',
    detail: [
      `${complete} of ${countLabel(jobs.length, 'seed')}`,
      failed > 0 ? `${failed} failed` : null,
      session.status === 'configuring' ? 'queued' : null,
    ]
      .filter(Boolean)
      .join(' · '),
    state: session.status === 'running' ? 'in-progress' : 'ready',
    to: '/batch',
    updatedAt: session.updatedAt,
  };
}

function buildSeedGeneratorRun(session: ActiveSeedGeneratorSession | null): ResumableRun | null {
  if (!session || session.status === 'idle' || (session.seeds ?? []).length === 0) {
    return null;
  }

  return {
    id: 'seed-generator',
    title: 'Seed ideas',
    detail: countLabel(session.seeds.length, 'seed'),
    state: session.status === 'generating' ? 'in-progress' : 'ready',
    to: '/seed-generator',
    updatedAt: session.updatedAt,
  };
}

function buildOffspringRun(session: ActiveOffspringSession | null): ResumableRun | null {
  // `configuring` means parents are picked but nothing has been synthesised yet.
  if (!session || session.status === 'configuring') {
    return null;
  }

  return {
    id: 'offspring',
    title: 'Offspring blend',
    detail: session.offspringSeed ?? 'Seed not synthesised yet',
    state: session.status === 'review_seed' ? 'ready' : 'in-progress',
    to: '/offspring',
    updatedAt: session.updatedAt,
  };
}

function buildAssetRegeneratorRun(session: ActiveAssetRegeneratorSession | null): ResumableRun | null {
  if (!session || session.status === 'configuring') {
    return null;
  }

  return {
    id: 'asset-regenerator',
    title: 'Asset regeneration',
    detail: `${session.assetName} · ${countLabel((session.generatedCandidates ?? []).length, 'candidate')}`,
    state: session.status === 'generating' ? 'in-progress' : 'ready',
    to: `/drafts/${encodeURIComponent(session.draftId)}/assets/${encodeURIComponent(session.assetName)}/regenerate`,
    updatedAt: session.updatedAt,
  };
}

function buildDraftRefinerRun(session: ActiveDraftRefinerSession | null): ResumableRun | null {
  if (!session) {
    return null;
  }

  // A refiner session exists as soon as the panel opens, so "is anything different from
  // where it started" is what decides whether there is work to come back to.
  const touched = Object.values(session.assetStates ?? {}).filter(
    (state) => state.status === 'reviewing' || state.content !== state.originalContent,
  );

  if (touched.length === 0) {
    return null;
  }

  return {
    id: 'draft-refiner',
    title: 'Draft refinement',
    detail: `${countLabel(touched.length, 'asset')} refined`,
    state: session.interrupted ? 'in-progress' : 'ready',
    to: '/generate',
    updatedAt: session.updatedAt,
  };
}

export interface PinnedSavedSearch {
  id: string;
  name: string;
  /** What the filter selects, so the row is not just a name. */
  summary: string;
  matchCount: number;
  to: string;
}

/**
 * Saved searches with their match counts, in the order they were saved.
 *
 * The count is what makes the panel worth having: a name alone does not tell you whether
 * the collection is worth opening, and running the filter against the drafts already on
 * hand costs one pass over an array the library has loaded anyway.
 */
export function buildPinnedSavedSearches(
  records: readonly SavedSearchRecord[],
  drafts: readonly DraftMetadata[],
): PinnedSavedSearch[] {
  return records.map((record) => ({
    id: record.id,
    name: record.name,
    summary: describeDraftLibraryFilter(record.filter),
    matchCount: applyDraftLibraryFilter([...drafts], record.filter).length,
    // The library applies a saved search from its own sidebar, so this is as deep as a
    // link reaches today. `?savedSearch=<id>` is the follow-up that would land on the
    // results already filtered.
    to: '/drafts',
  }));
}

/** `"space pirate" · favorites · NSFW` — what a saved search actually asks for. */
export function describeDraftLibraryFilter(filter: DraftLibraryFilter): string {
  const parts: string[] = [];
  const search = filter.search?.trim();

  if (search) {
    parts.push(`"${search}"`);
  }
  if (filter.favoritesOnly) {
    parts.push('favorites');
  }
  if (filter.mergedOnly) {
    parts.push('merged');
  }
  if (filter.undoableOnly) {
    parts.push('undoable');
  }
  if (filter.mergeStrategy) {
    parts.push(filter.mergeStrategy);
  }
  if (filter.mode) {
    parts.push(filter.mode);
  }
  if (filter.genre) {
    parts.push(filter.genre);
  }

  return parts.length > 0 ? parts.join(' · ') : 'every draft';
}
