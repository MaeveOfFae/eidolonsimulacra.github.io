/**
 * Publish record attached to a draft (`metadata.chub_publish`).
 *
 * The durable trace of one draft's Chub publication: where it lives on chub.ai
 * (`username/pathname`), the numeric id the update API needs, and when it was first
 * published / last updated. Deliberately standalone (no imports) so the draft types
 * can reference it without a cycle — the same trick keeps `comfyui/history.ts`
 * importable from `types/index.ts`.
 */

export interface ChubPublishRecord {
  /** Numeric character id from Chub (required by the update endpoint when known). */
  character_id?: number;
  /** Publisher's username as it appears in the full path. */
  username: string;
  /** Slug segment after the username. */
  pathname: string;
  /** `username/pathname` — stable identifier for update calls and links. */
  full_path: string;
  /** Character name at publish time. */
  name: string;
  /** ISO timestamp of the first publish. */
  published_at: string;
  /** ISO timestamp of the most recent update. */
  updated_at?: string;
  /** Chub-facing character version string at the most recent publish. */
  version?: string;
}

/** Canonical chub.ai page URL for a published character. */
export function chubCharacterUrl(fullPath: string): string {
  return `https://chub.ai/characters/${fullPath}`;
}

/** Coerce an untrusted `chub_publish` value (imported bundles, older drafts) into a record. */
export function normalizeChubPublishRecord(value: unknown): ChubPublishRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const candidate = value as Partial<ChubPublishRecord>;
  if (
    typeof candidate.full_path !== 'string' ||
    !candidate.full_path.includes('/') ||
    typeof candidate.username !== 'string' ||
    typeof candidate.pathname !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.published_at !== 'string'
  ) {
    return null;
  }
  const record: ChubPublishRecord = {
    username: candidate.username,
    pathname: candidate.pathname,
    full_path: candidate.full_path,
    name: candidate.name,
    published_at: candidate.published_at,
  };
  if (typeof candidate.character_id === 'number') {
    record.character_id = candidate.character_id;
  }
  if (typeof candidate.updated_at === 'string') {
    record.updated_at = candidate.updated_at;
  }
  if (typeof candidate.version === 'string') {
    record.version = candidate.version;
  }
  return record;
}

/**
 * Produce the record to store after a publish: first publish stamps
 * `published_at`, a republish keeps the original and refreshes `updated_at`.
 */
export function recordChubPublish(previous: unknown, next: Omit<ChubPublishRecord, 'published_at'>): ChubPublishRecord {
  const existing = normalizeChubPublishRecord(previous);
  const now = new Date().toISOString();
  const isSameCharacter = Boolean(existing && existing.full_path === next.full_path);
  const publishedAt = existing && isSameCharacter ? existing.published_at : (next.updated_at ?? now);
  const record: ChubPublishRecord = {
    ...next,
    published_at: publishedAt,
    updated_at: next.updated_at ?? now,
  };
  if (next.version === undefined && existing && existing.version !== undefined) {
    record.version = existing.version;
  }
  return record;
}
