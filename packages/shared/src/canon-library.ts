/**
 * Canon library: curated, reusable setting material attached to a world.
 *
 * Where a canon lock says "this must not change", a library entry says "this is
 * how the setting works" — a titled, categorised one-liner (with optional
 * long-form body and tags) that can be browsed, cited, and copied as context.
 * The registry itself is desktop-persisted; this module is the runtime-free
 * contract so the editor and any consumer format an entry the same way.
 */

import type { CanonEntryCategory, WorldCanonEntryRecord } from './types';

export const CANON_ENTRY_CATEGORIES: readonly CanonEntryCategory[] = ['trait', 'lore', 'relationship', 'setting'];

/** Collapse text to a single trimmed line; non-strings become empty. */
export function normalizeCanonEntryText(input: unknown): string {
  return typeof input === 'string' ? input.replace(/\s+/g, ' ').trim() : '';
}

/** Coerce a category, defaulting to `lore` for anything unrecognised. */
export function normalizeCanonEntryCategory(input: unknown): CanonEntryCategory {
  return typeof input === 'string' && (CANON_ENTRY_CATEGORIES as readonly string[]).includes(input)
    ? (input as CanonEntryCategory)
    : 'lore';
}

/** How an entry is cited in prose: `Blood Price (lore)`. */
export function formatCanonEntryCitation(entry: Pick<WorldCanonEntryRecord, 'title' | 'category'>): string {
  return `${normalizeCanonEntryText(entry.title)} (${entry.category})`;
}

/**
 * The ordered, de-duplicated context lines for a set of entries: the title and
 * category, then the summary when there is one. Blank titles are dropped so an
 * unfinished entry never reaches a prompt as an empty line.
 */
export function buildCanonContextLines(
  entries: readonly Pick<WorldCanonEntryRecord, 'title' | 'category' | 'summary'>[],
): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const title = normalizeCanonEntryText(entry.title);
    if (!title) {
      continue;
    }

    const summary = normalizeCanonEntryText(entry.summary);
    const line = summary
      ? `${title} (${normalizeCanonEntryCategory(entry.category)}): ${summary}`
      : formatCanonEntryCitation(entry);

    if (seen.has(line)) {
      continue;
    }

    seen.add(line);
    lines.push(line);
  }

  return lines;
}
