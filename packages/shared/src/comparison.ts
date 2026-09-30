/**
 * Multi-model comparison runs: the shared contract that links drafts produced
 * by one experiment and summarizes each candidate from persisted state.
 *
 * A comparison run sends the same seed, template, and content mode through
 * 2-4 candidate models. Every candidate saves a normal draft whose metadata
 * carries the shared `comparison_group` id, and the per-call usage record
 * (kind `comparison`) supplies tokens and duration. This module stays pure so
 * both the launcher and the results table can be unit-tested without engines
 * or storage.
 */

import type { DraftMetadata } from './types';
import type { UsageRecord } from './usage/records';

export const MIN_COMPARISON_CANDIDATES = 2;
export const MAX_COMPARISON_CANDIDATES = 4;

export type ComparisonCandidateStatus = 'pending' | 'ok' | 'error' | 'aborted';

export interface ComparisonCandidateSummary {
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

function findDraftForModel(groupDrafts: readonly DraftMetadata[], model: string): DraftMetadata | undefined {
  return groupDrafts.find((draft) => draft.model === model);
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
 * Summarize each candidate model from persisted state, preserving the
 * requested model order. A candidate is `pending` until it has a draft or a
 * usage record; a draft without a usage record still counts as `ok` (the run
 * predates usage capture or the provider reported nothing). `running` is a
 * screen-local state and is never produced here.
 */
export function buildComparisonCandidateSummaries(
  models: readonly string[],
  groupDrafts: readonly DraftMetadata[],
  usageRecords: readonly UsageRecord[] = [],
): ComparisonCandidateSummary[] {
  return models.map((model) => {
    const draft = findDraftForModel(groupDrafts, model);
    const usage = draft ? findNewestUsageRecord(usageRecords, draft.review_id) : undefined;

    const summary: ComparisonCandidateSummary = {
      model,
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
