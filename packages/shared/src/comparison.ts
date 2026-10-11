/**
 * Multi-model comparison runs: the shared contract that links drafts produced
 * by one experiment and summarizes each candidate from persisted state.
 *
 * A comparison run sends a template and content mode through a matrix of seeds
 * and candidate models: 1-4 seeds, each run through 2-4 models, so one run can
 * cover several premises at once. Every candidate saves a normal draft whose
 * metadata carries the shared `comparison_group` id, and the per-call usage
 * record (kind `comparison`) supplies tokens and duration. A candidate is
 * identified by its `(seed, model)` pair, since one group can hold several
 * drafts per model once more than one seed is used. This module stays pure so
 * both the launcher and the results table can be unit-tested without engines
 * or storage.
 */

import type { DraftMetadata } from './types';
import type { UsageRecord } from './usage/records';

export const MIN_COMPARISON_CANDIDATES = 2;
export const MAX_COMPARISON_CANDIDATES = 4;
export const MIN_COMPARISON_SEEDS = 1;
export const MAX_COMPARISON_SEEDS = 4;

export type ComparisonCandidateStatus = 'pending' | 'ok' | 'error' | 'aborted';

/** One cell of the comparison matrix: what to generate and which model to use. */
export interface ComparisonCandidateKey {
  seed: string;
  model: string;
}

export interface ComparisonCandidateSummary {
  seed: string;
  model: string;
  status: ComparisonCandidateStatus;
  draftId?: string;
  characterName?: string;
  templateName?: string;
  createdAt?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  durationMs?: number;
  errorMessage?: string;
}

/**
 * Normalize a seeds input into the ordered, de-duplicated list a run uses.
 * Accepts the launcher's multi-line textarea value (one seed per line) or an
 * array, trims each entry, drops blanks, and keeps the first occurrence of a
 * repeated seed so the matrix never generates the same `(seed, model)` twice.
 */
export function normalizeComparisonSeeds(input: string | readonly string[]): string[] {
  const lines = typeof input === 'string' ? input.split(/\r?\n/) : input;
  const seen = new Set<string>();
  const seeds: string[] = [];

  for (const line of lines) {
    const seed = String(line).trim();
    if (!seed || seen.has(seed)) {
      continue;
    }
    seen.add(seed);
    seeds.push(seed);
  }

  return seeds;
}

/**
 * The full comparison matrix in seed-major order: every model for the first
 * seed, then every model for the next, and so on. This is the order both the
 * run loop and the results table use, so a run's cells read top to bottom.
 */
export function buildComparisonCandidateKeys(
  seeds: readonly string[],
  models: readonly string[],
): ComparisonCandidateKey[] {
  const keys: ComparisonCandidateKey[] = [];

  for (const seed of seeds) {
    for (const model of models) {
      keys.push({ seed, model });
    }
  }

  return keys;
}

export function createComparisonGroupId(): string {
  return `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeComparisonGroupId(value: unknown): string | undefined {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Drafts that belong to one comparison group. */
export function filterComparisonGroupDrafts(drafts: readonly DraftMetadata[], groupId: string): DraftMetadata[] {
  const normalized = normalizeComparisonGroupId(groupId);
  if (!normalized) {
    return [];
  }

  return drafts.filter((draft) => draft.comparison_group === normalized);
}

function findDraftForCandidate(
  groupDrafts: readonly DraftMetadata[],
  candidate: ComparisonCandidateKey,
): DraftMetadata | undefined {
  return groupDrafts.find((draft) => draft.seed === candidate.seed && draft.model === candidate.model);
}

function findNewestUsageRecord(records: readonly UsageRecord[], draftId: string): UsageRecord | undefined {
  let newest: UsageRecord | undefined;

  for (const record of records) {
    if (record.draftId !== draftId) {
      continue;
    }
    if (!newest || record.timestamp > newest.timestamp) {
      newest = record;
    }
  }

  return newest;
}

/**
 * Summarize each `(seed, model)` candidate from persisted state, preserving the
 * requested matrix order. A candidate is `pending` until it has a draft or a
 * usage record; a draft without a usage record still counts as `ok` (the run
 * predates usage capture or the provider reported nothing). `running` is a
 * screen-local state and is never produced here.
 */
export function buildComparisonCandidateSummaries(
  candidates: readonly ComparisonCandidateKey[],
  groupDrafts: readonly DraftMetadata[],
  usageRecords: readonly UsageRecord[] = [],
): ComparisonCandidateSummary[] {
  return candidates.map((candidate) => {
    const draft = findDraftForCandidate(groupDrafts, candidate);
    const usage = draft ? findNewestUsageRecord(usageRecords, draft.review_id) : undefined;

    const summary: ComparisonCandidateSummary = {
      seed: candidate.seed,
      model: candidate.model,
      status: usage?.status ?? (draft ? 'ok' : 'pending'),
    };

    if (draft) {
      summary.draftId = draft.review_id;
      summary.characterName = draft.character_name;
      summary.templateName = draft.template_name;
      summary.createdAt = draft.created;
    }

    if (usage) {
      summary.promptTokens = usage.promptTokens;
      summary.completionTokens = usage.completionTokens;
      summary.totalTokens = usage.totalTokens;
      summary.durationMs = usage.durationMs;
      summary.errorMessage = usage.errorMessage;
    }

    return summary;
  });
}
