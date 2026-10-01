/**
 * Seed studio: deterministic seed remixing and the idea board contract.
 *
 * Remix folds two to four saved concepts into a single premise line without
 * an LLM — it is trimming, de-duplicating, and joining, pinned by tests. The
 * idea board stores tagged inspiration fragments that flow into the seed
 * generator; both stay pure so the web surfaces (and mobile later) share the
 * exact same behavior.
 */

export const MAX_REMIX_SEEDS = 4;
export const MAX_REMIX_SEED_LENGTH = 160;

const REMIX_CONNECTORS = [' — crossed with', ', and bound to', '; further tangled with'] as const;

/**
 * Fold two to four seeds into one premise line. Seeds are trimmed,
 * de-duplicated case-insensitively, capped at MAX_REMIX_SEEDS, and each
 * truncated to MAX_REMIX_SEED_LENGTH characters. Returns undefined when
 * fewer than two distinct seeds survive.
 */
export function buildRemixedSeed(seeds: readonly string[]): string | undefined {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const seed of seeds) {
    if (typeof seed !== 'string') {
      continue;
    }
    const trimmed = seed.trim().replace(/\s+/g, ' ');
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(
      trimmed.length > MAX_REMIX_SEED_LENGTH ? `${trimmed.slice(0, MAX_REMIX_SEED_LENGTH - 1).trimEnd()}…` : trimmed,
    );
    if (unique.length >= MAX_REMIX_SEEDS) {
      break;
    }
  }

  if (unique.length < 2) {
    return undefined;
  }

  return unique.reduce((combined, seed, index) =>
    index === 0 ? seed : `${combined}${REMIX_CONNECTORS[index - 1]} ${seed}`,
  );
}

export interface SeedIdeaRecord {
  id: string;
  text: string;
  tags: string[];
  createdAt: string;
}

export const MAX_SEED_IDEAS = 200;

export function createSeedIdeaId(): string {
  return `idea-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeTagList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const entry of value) {
    if (typeof entry !== 'string') {
      continue;
    }
    const tag = entry.trim().replace(/\s+/g, ' ').toLowerCase();
    if (!tag || seen.has(tag)) {
      continue;
    }
    seen.add(tag);
    tags.push(tag);
  }

  return tags;
}

export function normalizeSeedIdeaRecord(value: unknown): SeedIdeaRecord | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const id = typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : null;
  const text = typeof raw.text === 'string' && raw.text.trim().length > 0 ? raw.text.trim().replace(/\s+/g, ' ') : null;

  if (!id || !text) {
    return null;
  }

  const createdAt =
    typeof raw.createdAt === 'string' && !Number.isNaN(new Date(raw.createdAt).getTime())
      ? raw.createdAt
      : new Date().toISOString();

  return {
    id,
    text,
    tags: normalizeTagList(raw.tags),
    createdAt,
  };
}

/** Add or replace a seed idea by id, newest first, capped at `limit`. */
export function upsertSeedIdea(
  records: readonly SeedIdeaRecord[],
  record: SeedIdeaRecord,
  limit: number = MAX_SEED_IDEAS,
): SeedIdeaRecord[] {
  return [record, ...records.filter((entry) => entry.id !== record.id)].slice(0, Math.max(0, limit));
}
