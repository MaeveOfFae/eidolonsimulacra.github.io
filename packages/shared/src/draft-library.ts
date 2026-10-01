/**
 * Draft library organization: the pure contract behind smart collections,
 * bulk-edit filter semantics, and duplicate detection. `applyDraftLibraryFilter`
 * is the single filter/sort implementation the library sidebar consumes,
 * characterized against the sidebar's previous inline behavior. Saved searches
 * persist filter tuples; duplicate detection pre-filters on metadata only —
 * full-content similarity scoring stays at the call site.
 */

import type { DraftMetadata } from './types';

export type DraftLibrarySortField = 'created' | 'modified' | 'name';
export type DraftLibrarySortOrder = 'asc' | 'desc';
export type DraftLibraryMergeStrategyFilter = '' | 'single-asset' | 'staged-merge';

export interface DraftLibraryFilter {
  search?: string;
  favoritesOnly?: boolean;
  mergedOnly?: boolean;
  undoableOnly?: boolean;
  mergeStrategy?: DraftLibraryMergeStrategyFilter;
  mode?: string;
  genre?: string;
  sortField?: DraftLibrarySortField;
  sortOrder?: DraftLibrarySortOrder;
}

export const DEFAULT_DRAFT_LIBRARY_FILTER: DraftLibraryFilter = {
  search: '',
  favoritesOnly: false,
  mergedOnly: false,
  undoableOnly: false,
  mergeStrategy: '',
  mode: '',
  genre: '',
  sortField: 'modified',
  sortOrder: 'desc',
};

const SORT_FIELDS: readonly DraftLibrarySortField[] = ['created', 'modified', 'name'];
const SORT_ORDERS: readonly DraftLibrarySortOrder[] = ['asc', 'desc'];
const MERGE_STRATEGY_FILTERS: readonly DraftLibraryMergeStrategyFilter[] = ['', 'single-asset', 'staged-merge'];

export function normalizeDraftLibraryFilter(value: unknown): DraftLibraryFilter {
  const raw = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
  const filter: DraftLibraryFilter = {};

  if (typeof raw.search === 'string') {
    filter.search = raw.search;
  }
  if (raw.favoritesOnly === true) {
    filter.favoritesOnly = true;
  }
  if (raw.mergedOnly === true) {
    filter.mergedOnly = true;
  }
  if (raw.undoableOnly === true) {
    filter.undoableOnly = true;
  }
  if (MERGE_STRATEGY_FILTERS.includes(raw.mergeStrategy as DraftLibraryMergeStrategyFilter)) {
    filter.mergeStrategy = raw.mergeStrategy as DraftLibraryMergeStrategyFilter;
  }
  if (typeof raw.mode === 'string') {
    filter.mode = raw.mode;
  }
  if (typeof raw.genre === 'string') {
    filter.genre = raw.genre;
  }
  if (SORT_FIELDS.includes(raw.sortField as DraftLibrarySortField)) {
    filter.sortField = raw.sortField as DraftLibrarySortField;
  }
  if (SORT_ORDERS.includes(raw.sortOrder as DraftLibrarySortOrder)) {
    filter.sortOrder = raw.sortOrder as DraftLibrarySortOrder;
  }

  return filter;
}

/**
 * Apply the library filter to draft metadata. Filtering semantics and sort
 * order match the library sidebar exactly; an empty filter returns every
 * draft sorted by modified date, newest first.
 */
export function applyDraftLibraryFilter(
  drafts: readonly DraftMetadata[],
  filter: DraftLibraryFilter = {},
): DraftMetadata[] {
  const search = filter.search?.trim().toLowerCase() ?? '';
  let result = [...drafts];

  if (search) {
    result = result.filter(
      (draft) =>
        draft.character_name?.toLowerCase().includes(search) ||
        draft.seed.toLowerCase().includes(search) ||
        draft.template_name?.toLowerCase().includes(search) ||
        draft.notes?.toLowerCase().includes(search),
    );
  }

  if (filter.favoritesOnly) {
    result = result.filter((draft) => draft.favorite);
  }

  if (filter.mergedOnly) {
    result = result.filter((draft) => Boolean((draft.merge_history?.length ?? 0) > 0 || draft.merge_provenance));
  }

  if (filter.undoableOnly) {
    result = result.filter((draft) => Boolean(draft.merge_history?.some((entry) => Boolean(entry.undo_snapshot_id))));
  }

  const mergeStrategy = filter.mergeStrategy ?? '';
  if (mergeStrategy) {
    result = result.filter((draft) => {
      const mergeStrategies = draft.merge_history?.length
        ? draft.merge_history.map((entry) => entry.strategy)
        : draft.merge_provenance
          ? [draft.merge_provenance.strategy]
          : [];

      return mergeStrategies.includes(mergeStrategy);
    });
  }

  if (filter.mode) {
    result = result.filter((draft) => draft.mode === filter.mode);
  }

  if (filter.genre) {
    result = result.filter((draft) => draft.genre === filter.genre);
  }

  const sortField = filter.sortField ?? 'modified';
  const sortOrder = filter.sortOrder ?? 'desc';

  result.sort((left, right) => {
    let comparison = 0;

    switch (sortField) {
      case 'created': {
        const aDate = left.created ? new Date(left.created).getTime() : 0;
        const bDate = right.created ? new Date(right.created).getTime() : 0;
        comparison = aDate - bDate;
        break;
      }
      case 'modified': {
        const aDate = left.modified
          ? new Date(left.modified).getTime()
          : left.created
            ? new Date(left.created).getTime()
            : 0;
        const bDate = right.modified
          ? new Date(right.modified).getTime()
          : right.created
            ? new Date(right.created).getTime()
            : 0;
        comparison = aDate - bDate;
        break;
      }
      case 'name': {
        const aName = left.character_name || left.seed;
        const bName = right.character_name || right.seed;
        comparison = aName.localeCompare(bName);
        break;
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return result;
}

/** True when the filter narrows the list beyond sorting alone. */
export function isActiveDraftLibraryFilter(filter: DraftLibraryFilter): boolean {
  return Boolean(
    filter.search?.trim() ||
    filter.favoritesOnly ||
    filter.mergedOnly ||
    filter.undoableOnly ||
    filter.mergeStrategy ||
    filter.mode ||
    filter.genre,
  );
}

export interface SavedSearchRecord {
  id: string;
  name: string;
  filter: DraftLibraryFilter;
  createdAt: string;
}

export const MAX_SAVED_SEARCHES = 30;

export function createSavedSearchId(): string {
  return `search-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeSavedSearchRecord(value: unknown): SavedSearchRecord | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const id = typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : null;
  const name = typeof raw.name === 'string' && raw.name.trim().length > 0 ? raw.name.trim() : null;

  if (!id || !name) {
    return null;
  }

  const createdAt =
    typeof raw.createdAt === 'string' && !Number.isNaN(new Date(raw.createdAt).getTime())
      ? raw.createdAt
      : new Date().toISOString();

  return {
    id,
    name,
    filter: normalizeDraftLibraryFilter(raw.filter),
    createdAt,
  };
}

/**
 * Add or replace a saved search by id, newest first, capped at `limit`.
 */
export function upsertSavedSearch(
  records: readonly SavedSearchRecord[],
  record: SavedSearchRecord,
  limit: number = MAX_SAVED_SEARCHES,
): SavedSearchRecord[] {
  const next = [record, ...records.filter((entry) => entry.id !== record.id)];
  return next.slice(0, Math.max(0, limit));
}

export type DuplicateDraftReason = 'same-seed' | 'same-name';

export interface DuplicateDraftCandidatePair {
  draftIds: [string, string];
  reason: DuplicateDraftReason;
}

export const MAX_DUPLICATE_CANDIDATE_PAIRS = 50;

function normalizeDuplicateKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Metadata-only duplicate prefilter: pairs of drafts sharing an exactly
 * normalized seed or character name. Full-content similarity scoring stays at
 * the call site because it needs asset bodies; this exists so that scoring
 * only ever runs on a small candidate set.
 */
export function findDuplicateDraftCandidates(
  drafts: readonly DraftMetadata[],
  options: { maxPairs?: number } = {},
): DuplicateDraftCandidatePair[] {
  const maxPairs = options.maxPairs ?? MAX_DUPLICATE_CANDIDATE_PAIRS;
  const bySeed = new Map<string, string[]>();
  const byName = new Map<string, string[]>();

  for (const draft of drafts) {
    const seedKey = normalizeDuplicateKey(draft.seed);
    if (seedKey) {
      const bucket = bySeed.get(seedKey);
      if (bucket) {
        bucket.push(draft.review_id);
      } else {
        bySeed.set(seedKey, [draft.review_id]);
      }
    }

    const nameKey = draft.character_name ? normalizeDuplicateKey(draft.character_name) : '';
    if (nameKey) {
      const bucket = byName.get(nameKey);
      if (bucket) {
        bucket.push(draft.review_id);
      } else {
        byName.set(nameKey, [draft.review_id]);
      }
    }
  }

  const seen = new Set<string>();
  const pairs: DuplicateDraftCandidatePair[] = [];

  const consider = (ids: string[], reason: DuplicateDraftReason): void => {
    if (pairs.length >= maxPairs || ids.length < 2) {
      return;
    }

    const sorted = [...ids].sort();
    for (let left = 0; left < sorted.length; left += 1) {
      for (let right = left + 1; right < sorted.length; right += 1) {
        const key = `${sorted[left]}|${sorted[right]}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        pairs.push({ draftIds: [sorted[left]!, sorted[right]!], reason });
        if (pairs.length >= maxPairs) {
          return;
        }
      }
    }
  };

  for (const ids of bySeed.values()) {
    consider(ids, 'same-seed');
  }
  for (const ids of byName.values()) {
    consider(ids, 'same-name');
  }

  return pairs;
}
