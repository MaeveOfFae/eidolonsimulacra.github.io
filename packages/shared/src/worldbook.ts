/**
 * Worldbook: a world's structured canon as portable setting entries.
 *
 * A world already holds its own canon — description, characters, factions,
 * locations, timelines, canon locks, and canon-library entries. The worldbook
 * projects that into the entry format the repo already reads:
 *
 * - `renderWorldbookPacket` emits the `[[LOREBOOK_PACKET]]` / `[[ENTRY]]`
 *   plaintext that `parseLorebookPacket` round-trips, so a worldbook can be
 *   fed back through the existing lorebook-packet import flow.
 * - `renderWorldbookWorldInfo` emits a SillyTavern-compatible world-info JSON
 *   for other tools.
 *
 * Everything here is deterministic and runtime-free.
 */

import type { CanonEntryCategory, WorldCanonLockRecord, WorldRecord } from './types';
import type { LorebookPacketEntryType } from './lorebook-packets';

export type WorldbookEntrySource = 'world' | 'character' | 'faction' | 'location' | 'timeline' | 'lock' | 'library';

export interface WorldbookEntryRecord {
  id: string;
  type: LorebookPacketEntryType;
  title: string;
  keywords: string[];
  summary: string;
  content: string;
  continuityRole: string;
  linkedDraftIds: string[];
  /** Which world record produced the entry, for traceability in the UI. */
  source: WorldbookEntrySource;
}

export interface WorldbookRecord {
  title: string;
  scope: string;
  entries: WorldbookEntryRecord[];
}

export interface BuildWorldbookOptions {
  title?: string;
  scope?: string;
}

/** Collapse to one trimmed line; non-strings become empty. */
function singleLine(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

/** A keyword is a single comma-free line, so the packet's comma list round-trips. */
function keywordLine(value: unknown): string {
  return singleLine(value).replace(/,/g, ' ');
}

/** Strip the packet's own delimiters so generated text cannot break framing. */
function stripPacketTokens(value: string): string {
  return value
    .replace(/\[\[\/?[A-Z_]+\]\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function paragraph(...parts: Array<string | undefined>): string {
  return stripPacketTokens(
    parts
      .map((part) => (typeof part === 'string' ? part.trim() : ''))
      .filter((part) => part.length > 0)
      .join('\n\n'),
  );
}

function uniqueLines(values: ReadonlyArray<unknown>): string[] {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const value of values) {
    const line = keywordLine(value);
    if (!line || seen.has(line)) {
      continue;
    }
    seen.add(line);
    lines.push(line);
  }

  return lines;
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = (value ?? '').trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return '';
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'entry'
  );
}

/** How a canon-library category projects onto the packet's entry types. */
const LIBRARY_CATEGORY_TYPES: Record<CanonEntryCategory, LorebookPacketEntryType> = {
  trait: 'character',
  lore: 'custom',
  relationship: 'custom',
  setting: 'place',
};

function lockScope(lock: Pick<WorldCanonLockRecord, 'targetKind' | 'targetLabel'>): string {
  if (lock.targetKind === 'world') {
    return 'World';
  }
  return singleLine(lock.targetLabel) || lock.targetKind;
}

interface WorldbookPushInput {
  source: WorldbookEntrySource;
  recordId: string;
  type: LorebookPacketEntryType;
  title: string;
  keywords: Array<string | undefined>;
  summary?: string;
  content: string;
  continuityRole: string;
  linkedDraftIds?: string[];
}

export function buildWorldbook(world: WorldRecord, options: BuildWorldbookOptions = {}): WorldbookRecord {
  const worldName = singleLine(world.name) || 'Untitled World';
  const entries: WorldbookEntryRecord[] = [];

  const push = (input: WorldbookPushInput): void => {
    const title = singleLine(input.title);
    if (!title) {
      return;
    }

    const summary = singleLine(input.summary);
    entries.push({
      id: `${input.source}-${slug(input.recordId)}`,
      type: input.type,
      title,
      keywords: uniqueLines(input.keywords),
      summary,
      // Every packet entry needs content; fall back to the summary, then the title.
      content: firstNonEmpty(stripPacketTokens(input.content), summary, `${title} (${input.type})`),
      continuityRole: singleLine(input.continuityRole),
      linkedDraftIds: uniqueLines(input.linkedDraftIds ?? []),
      source: input.source,
    });
  };

  push({
    source: 'world',
    recordId: world.id,
    type: 'custom',
    title: worldName,
    keywords: [worldName, world.genre, ...(world.tags ?? [])],
    summary: world.genre,
    content: paragraph(world.description, world.setting ? `Setting: ${world.setting}` : '', world.notes),
    continuityRole: `Overall setting canon for ${worldName}.`,
  });

  for (const character of world.characters ?? []) {
    push({
      source: 'character',
      recordId: character.id,
      type: 'character',
      title: character.characterName,
      keywords: [character.characterName, character.role],
      summary: character.role,
      content: paragraph(character.role ? `Role: ${character.role}` : '', character.notes),
      continuityRole: `Existing character node in ${worldName}.`,
      linkedDraftIds: character.draftId ? [character.draftId] : [],
    });
  }

  for (const faction of world.factions ?? []) {
    push({
      source: 'faction',
      recordId: faction.id,
      type: 'faction',
      title: faction.name,
      keywords: [faction.name, faction.role, ...(faction.tags ?? [])],
      summary: faction.role,
      content: paragraph(faction.role ? `Role: ${faction.role}` : '', faction.description, faction.notes),
      continuityRole: `Shared power structure in ${worldName}.`,
      linkedDraftIds: faction.draftIds ?? [],
    });
  }

  for (const location of world.locations ?? []) {
    push({
      source: 'location',
      recordId: location.id,
      type: 'place',
      title: location.name,
      keywords: [location.name, location.category, ...(location.tags ?? [])],
      summary: location.category,
      content: paragraph(
        location.category ? `Category: ${location.category}` : '',
        location.description,
        location.notes,
      ),
      continuityRole: `Recurring setting anchor in ${worldName}.`,
      linkedDraftIds: location.draftIds ?? [],
    });
  }

  for (const timeline of world.timelines ?? []) {
    const eventCount = timeline._count?.events ?? 0;
    push({
      source: 'timeline',
      recordId: timeline.id,
      type: 'event',
      title: timeline.name,
      keywords: [timeline.name, ...(timeline.tags ?? [])],
      summary: [timeline.startDate, timeline.endDate].map(singleLine).filter(Boolean).join(' - '),
      content: paragraph(timeline.description, `${eventCount} recorded event${eventCount === 1 ? '' : 's'}.`),
      continuityRole: `Chronology anchor in ${worldName}.`,
    });
  }

  for (const lock of world.canonLocks ?? []) {
    const scope = lockScope(lock);
    push({
      source: 'lock',
      recordId: lock.id,
      type: 'custom',
      title: singleLine(lock.statement).slice(0, 80),
      keywords: [scope, lock.targetLabel, lock.statement],
      summary: lock.statement,
      content: paragraph(lock.statement, lock.notes),
      continuityRole: `${scope} fact locked against change in derivative drafts.`,
    });
  }

  for (const entry of world.canonEntries ?? []) {
    push({
      source: 'library',
      recordId: entry.id,
      type: LIBRARY_CATEGORY_TYPES[entry.category],
      title: entry.title,
      keywords: [entry.title, ...(entry.tags ?? [])],
      summary: entry.summary,
      content: paragraph(entry.summary, entry.body),
      continuityRole: `Curated ${entry.category} material for ${worldName}.`,
    });
  }

  return {
    title: singleLine(options.title) || worldName,
    scope: singleLine(options.scope) || singleLine(world.description) || `Setting canon for ${worldName}.`,
    entries,
  };
}

/** The `[[LOREBOOK_PACKET]]` plaintext that `parseLorebookPacket` round-trips. */
export function renderWorldbookPacket(worldbook: WorldbookRecord): string {
  const lines: string[] = ['[[LOREBOOK_PACKET]]', `title: ${singleLine(worldbook.title) || 'Worldbook'}`];

  const scope = singleLine(worldbook.scope);
  if (scope) {
    lines.push(`scope: ${scope}`);
  }

  const sourceDrafts = uniqueLines(worldbook.entries.flatMap((entry) => entry.linkedDraftIds));
  if (sourceDrafts.length > 0) {
    lines.push(`source_drafts: ${sourceDrafts.join(', ')}`);
  }

  lines.push('');

  for (const entry of worldbook.entries) {
    // Optional fields are omitted when empty: the packet parser reads a field
    // with `\s*(.+)`, which would otherwise swallow the newline and capture the
    // next line as this field's value.
    const fields: string[] = [`type: ${entry.type}`, `title: ${singleLine(entry.title)}`];

    const keywords = uniqueLines(entry.keywords);
    if (keywords.length > 0) {
      fields.push(`keywords: ${keywords.join(', ')}`);
    }

    const linkedDrafts = uniqueLines(entry.linkedDraftIds);
    if (linkedDrafts.length > 0) {
      fields.push(`linked_drafts: ${linkedDrafts.join(', ')}`);
    }

    const continuityRole = singleLine(entry.continuityRole);
    if (continuityRole) {
      fields.push(`continuity_role: ${continuityRole}`);
    }

    const summary = singleLine(entry.summary);
    if (summary) {
      fields.push(`summary: ${summary}`);
    }

    lines.push('[[ENTRY]]', ...fields, 'content:', stripPacketTokens(entry.content), '[[/ENTRY]]', '');
  }

  lines.push('[[/LOREBOOK_PACKET]]');
  return lines.join('\n');
}

/**
 * A SillyTavern-compatible world-info document: the fields that matter are the
 * trigger keys, the content, and `constant` for keyword-less canon so an entry
 * with no retrieval hook is still always included.
 */
export function renderWorldbookWorldInfo(worldbook: WorldbookRecord): string {
  const entries: Record<string, Record<string, unknown>> = {};

  worldbook.entries.forEach((entry, index) => {
    const keywords = uniqueLines(entry.keywords);
    entries[String(index)] = {
      uid: index,
      key: keywords,
      keysecondary: [],
      comment: `${singleLine(entry.title)} (${entry.type})`,
      content: stripPacketTokens(entry.content),
      constant: keywords.length === 0,
      selective: false,
      disable: false,
      order: 100,
      position: 0,
    };
  });

  return JSON.stringify(
    {
      name: singleLine(worldbook.title),
      description: singleLine(worldbook.scope),
      entries,
    },
    null,
    2,
  );
}

export function getWorldbookFilename(title: string, extension: 'md' | 'json'): string {
  const base =
    singleLine(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'worldbook';

  return `${base}_worldbook.${extension}`;
}
