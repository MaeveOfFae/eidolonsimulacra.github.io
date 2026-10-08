/**
 * Draft-reference selection normalizer.
 *
 * The trim / de-duplicate / cap-at-`MAX_CONNECTED_DRAFT_REFERENCES` rule is the
 * same whether the ids drive a generation request, the connected-reference
 * picker, a lorebook prompt, or a saved lorebook packet. It lives here once so
 * each surface stops carrying its own copy of the loop.
 */

import { MAX_CONNECTED_DRAFT_REFERENCES } from './types';

export interface NormalizeDraftReferenceIdsOptions {
  excludeIds?: string[];
}

export function normalizeDraftReferenceIds(
  draftIds: string[] | undefined,
  options: NormalizeDraftReferenceIdsOptions = {},
): string[] {
  const excludedIds = new Set(
    (options.excludeIds ?? [])
      .filter((draftId): draftId is string => typeof draftId === 'string')
      .map((draftId) => draftId.trim())
      .filter(Boolean),
  );

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const draftId of draftIds ?? []) {
    if (typeof draftId !== 'string') {
      continue;
    }

    const normalizedId = draftId.trim();
    if (!normalizedId || excludedIds.has(normalizedId) || seen.has(normalizedId)) {
      continue;
    }

    seen.add(normalizedId);
    normalized.push(normalizedId);

    if (normalized.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
      break;
    }
  }

  return normalized;
}
