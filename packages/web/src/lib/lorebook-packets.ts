import { MAX_CONNECTED_DRAFT_REFERENCES } from '@char-gen/shared';

const LOREBOOK_PACKETS_STORAGE_KEY = 'eidolon.web.lorebookPackets';
const MAX_LOREBOOK_PACKETS = 24;

export interface SavedLorebookPacketRecord {
  id: string;
  title: string;
  content: string;
  draftIds: string[];
  focus?: string;
  blueprintPath?: string;
  blueprintOverride?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LorebookPacketEntryType =
  | 'character'
  | 'place'
  | 'event'
  | 'faction'
  | 'object'
  | 'custom'
  | 'rumor'
  | 'moment';

export interface ParsedLorebookPacketEntry {
  type: LorebookPacketEntryType;
  title: string;
  keywords: string[];
  linkedDrafts: string[];
  continuityRole: string;
  summary: string;
  content: string;
}

export interface ParsedLorebookPacket {
  title: string;
  scope?: string;
  sourceDrafts: string[];
  entries: ParsedLorebookPacketEntry[];
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeDraftIds(draftIds: string[] | undefined): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const draftId of draftIds ?? []) {
    if (typeof draftId !== 'string') {
      continue;
    }

    const trimmed = draftId.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    normalized.push(trimmed);

    if (normalized.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
      break;
    }
  }

  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toIsoString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function deriveLorebookPacketTitle(content: string): string {
  const titleMatch = content.match(/^title:\s*(.+)$/im);
  if (titleMatch?.[1]?.trim()) {
    return titleMatch[1].trim();
  }

  const scopeMatch = content.match(/^scope:\s*(.+)$/im);
  if (scopeMatch?.[1]?.trim()) {
    return scopeMatch[1].trim().slice(0, 80);
  }

  return 'Lorebook Packet';
}

function normalizeStringList(values: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
}

function parseCommaSeparatedField(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return normalizeStringList(value.split(',').map((entry) => entry.trim()));
}

function normalizeLorebookPacketRecord(value: unknown): SavedLorebookPacketRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const content = typeof value.content === 'string' ? value.content.trim() : '';
  if (!content) {
    return null;
  }

  const id =
    typeof value.id === 'string' && value.id.trim()
      ? value.id.trim()
      : `lorebook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const createdAt = toIsoString(value.createdAt) ?? new Date().toISOString();
  const updatedAt = toIsoString(value.updatedAt) ?? createdAt;
  const draftIds = normalizeDraftIds(
    Array.isArray(value.draftIds) ? value.draftIds.filter((entry): entry is string => typeof entry === 'string') : [],
  );
  const title =
    typeof value.title === 'string' && value.title.trim() ? value.title.trim() : deriveLorebookPacketTitle(content);

  const normalized: SavedLorebookPacketRecord = {
    id,
    title,
    content,
    draftIds,
    createdAt,
    updatedAt,
  };

  if (typeof value.focus === 'string' && value.focus.trim()) {
    normalized.focus = value.focus.trim();
  }

  if (typeof value.blueprintPath === 'string' && value.blueprintPath.trim()) {
    normalized.blueprintPath = value.blueprintPath.trim();
  }

  if (typeof value.blueprintOverride === 'string') {
    normalized.blueprintOverride = value.blueprintOverride;
  } else if (value.blueprintOverride === null) {
    normalized.blueprintOverride = null;
  }

  return normalized;
}

function readLorebookPackets(): SavedLorebookPacketRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOREBOOK_PACKETS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => normalizeLorebookPacketRecord(entry))
      .filter((entry): entry is SavedLorebookPacketRecord => Boolean(entry))
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
  } catch {
    return [];
  }
}

function writeLorebookPackets(records: SavedLorebookPacketRecord[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LOREBOOK_PACKETS_STORAGE_KEY, JSON.stringify(records));
}

export function listSavedLorebookPackets(): SavedLorebookPacketRecord[] {
  return readLorebookPackets();
}

export function saveLorebookPacket(input: {
  content: string;
  draftIds: string[];
  focus?: string;
  blueprintPath?: string;
  blueprintOverride?: string | null;
  id?: string;
}): SavedLorebookPacketRecord[] {
  const content = input.content.trim();
  if (!content) {
    return readLorebookPackets();
  }

  const existing = readLorebookPackets();
  const now = new Date().toISOString();
  const current = input.id ? existing.find((record) => record.id === input.id) : undefined;
  const record: SavedLorebookPacketRecord = {
    id: current?.id ?? `lorebook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: deriveLorebookPacketTitle(content),
    content,
    draftIds: normalizeDraftIds(input.draftIds),
    focus: input.focus?.trim() || undefined,
    blueprintPath: input.blueprintPath?.trim() || undefined,
    blueprintOverride: input.blueprintOverride ?? undefined,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };

  const next = [record, ...existing.filter((candidate) => candidate.id !== record.id)].slice(0, MAX_LOREBOOK_PACKETS);

  writeLorebookPackets(next);
  return next;
}

export function deleteLorebookPacket(id: string): SavedLorebookPacketRecord[] {
  const next = readLorebookPackets().filter((record) => record.id !== id);
  writeLorebookPackets(next);
  return next;
}

export function getLorebookPacketFilename(title: string, extension: 'md' | 'txt'): string {
  const sanitizedBase =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'lorebook_packet';

  return `${sanitizedBase}.${extension}`;
}

export function extractLorebookPacketSourceDrafts(content: string): string[] {
  const match = content.match(/^source_drafts:\s*(.+)$/im);
  if (!match?.[1]) {
    return [];
  }

  return normalizeDraftIds(parseCommaSeparatedField(match[1]));
}

function parseLorebookEntry(block: string): ParsedLorebookPacketEntry | null {
  const normalized = block.replace(/\r\n?/g, '\n').trim();
  if (!normalized) {
    return null;
  }

  const contentMatch = normalized.match(/^content:\s*([\s\S]*)$/m);
  const contentIndex = contentMatch?.index ?? -1;
  const metadataSection = contentIndex >= 0 ? normalized.slice(0, contentIndex).trim() : normalized;
  const contentSection = contentMatch
    ? `${contentMatch[1] ?? ''}${normalized.slice((contentMatch.index ?? 0) + contentMatch[0].length)}`.trim()
    : '';

  const readField = (field: string): string => {
    const match = metadataSection.match(new RegExp(`^${field}:\\s*(.+)$`, 'mi'));
    return match?.[1]?.trim() ?? '';
  };

  const rawType = readField('type').toLowerCase();
  const type =
    rawType === 'character' ||
    rawType === 'place' ||
    rawType === 'event' ||
    rawType === 'faction' ||
    rawType === 'object' ||
    rawType === 'custom' ||
    rawType === 'rumor' ||
    rawType === 'moment'
      ? rawType
      : 'custom';
  const title = readField('title');

  if (!title) {
    return null;
  }

  return {
    type,
    title,
    keywords: parseCommaSeparatedField(readField('keywords')),
    linkedDrafts: normalizeDraftIds(parseCommaSeparatedField(readField('linked_drafts'))),
    continuityRole: readField('continuity_role'),
    summary: readField('summary'),
    content: contentSection,
  };
}

export function parseLorebookPacket(content: string): ParsedLorebookPacket {
  const normalized = content.replace(/\r\n?/g, '\n').trim();
  const title = deriveLorebookPacketTitle(normalized);
  const scopeMatch = normalized.match(/^scope:\s*(.+)$/im);
  const entryRegex = /\[\[ENTRY\]\]\s*([\s\S]*?)\s*\[\[\/ENTRY\]\]/g;
  const entries: ParsedLorebookPacketEntry[] = [];

  for (const match of normalized.matchAll(entryRegex)) {
    const entry = parseLorebookEntry(match[1] ?? '');
    if (entry) {
      entries.push(entry);
    }
  }

  return {
    title,
    scope: scopeMatch?.[1]?.trim() || undefined,
    sourceDrafts: extractLorebookPacketSourceDrafts(normalized),
    entries,
  };
}

export function importLorebookPacketText(input: {
  content: string;
  blueprintPath?: string;
  blueprintOverride?: string | null;
}): SavedLorebookPacketRecord[] {
  return saveLorebookPacket({
    content: input.content,
    draftIds: extractLorebookPacketSourceDrafts(input.content),
    blueprintPath: input.blueprintPath,
    blueprintOverride: input.blueprintOverride,
  });
}
