/**
 * Universe notes: free-form canon context attached to a world.
 *
 * Where a canon-library entry is a curated, categorised one-liner, a note is
 * whatever the author needs it to be — tone rules, continuity reminders, how
 * magic feels. Pinned notes lead every list and every context block, so the
 * notes that matter most are the ones a generator is told first. This module is
 * runtime-free so the editor, the ordering, and the context projection cannot
 * drift apart.
 */

import type { WorldUniverseNoteRecord } from './types';

/** Collapse a title to one trimmed line; non-strings become empty. */
export function normalizeUniverseNoteTitle(input: unknown): string {
  return typeof input === 'string' ? input.replace(/\s+/g, ' ').trim() : '';
}

/** Trim a body and collapse runs of blank lines, keeping its paragraphing. */
export function normalizeUniverseNoteBody(input: unknown): string {
  return typeof input === 'string'
    ? input
        .replace(/\r\n?/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : '';
}

/** Pinned first, then most recently updated, then title. */
export function sortUniverseNotes(notes: readonly WorldUniverseNoteRecord[]): WorldUniverseNoteRecord[] {
  return [...notes].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }

    const updated = (right.updatedAt ?? '').localeCompare(left.updatedAt ?? '');
    if (updated !== 0) {
      return updated;
    }

    return normalizeUniverseNoteTitle(left.title) < normalizeUniverseNoteTitle(right.title) ? -1 : 1;
  });
}

/**
 * The context lines a run receives: `Title: body`, with the body flattened to a
 * single line so a note cannot break the bullet list it is rendered into. Blank
 * titles are dropped and duplicates collapse.
 */
export function buildUniverseNoteContextLines(notes: readonly WorldUniverseNoteRecord[]): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();

  for (const note of sortUniverseNotes(notes)) {
    const title = normalizeUniverseNoteTitle(note.title);
    if (!title) {
      continue;
    }

    const body = normalizeUniverseNoteBody(note.body).replace(/\s+/g, ' ');
    const line = body ? `${title}: ${body}` : title;

    if (seen.has(line)) {
      continue;
    }

    seen.add(line);
    lines.push(line);
  }

  return lines;
}
