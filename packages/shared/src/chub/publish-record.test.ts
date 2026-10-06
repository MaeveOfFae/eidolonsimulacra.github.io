import { describe, expect, it } from 'vitest';
import { chubCharacterUrl, normalizeChubPublishRecord, recordChubPublish } from './publish-record';

const record = {
  character_id: 211500,
  username: 'maeve',
  pathname: 'alice-9f2',
  full_path: 'maeve/alice-9f2',
  name: 'Alice',
  published_at: '2026-10-06T10:00:00.000Z',
  version: '1.0',
};

describe('normalizeChubPublishRecord', () => {
  it('accepts a complete record', () => {
    expect(normalizeChubPublishRecord(record)).toEqual(record);
  });

  it('drops junk, partials, and non-objects', () => {
    expect(normalizeChubPublishRecord(null)).toBeNull();
    expect(normalizeChubPublishRecord('maeve/alice')).toBeNull();
    expect(
      normalizeChubPublishRecord({
        full_path: 'missing-slash',
        username: 'u',
        pathname: 'p',
        name: 'n',
        published_at: 't',
      }),
    ).toBeNull();
    expect(normalizeChubPublishRecord({ ...record, character_id: 'nope' as unknown as number })).toMatchObject({
      full_path: 'maeve/alice-9f2',
    });
    const stripped = normalizeChubPublishRecord({ ...record, character_id: 'nope' as unknown as number })!;
    expect(stripped.character_id).toBeUndefined();
  });
});

describe('recordChubPublish', () => {
  it('stamps published_at on first publish', () => {
    const next = recordChubPublish(undefined, {
      character_id: 211500,
      username: 'maeve',
      pathname: 'alice-9f2',
      full_path: 'maeve/alice-9f2',
      name: 'Alice',
      updated_at: '2026-10-06T10:00:00.000Z',
      version: '1.0',
    });
    expect(next.published_at).toBe('2026-10-06T10:00:00.000Z');
    expect(next.full_path).toBe('maeve/alice-9f2');
  });

  it('keeps the original published_at for the same character on republish', () => {
    const next = recordChubPublish(record, {
      character_id: 211500,
      username: 'maeve',
      pathname: 'alice-9f2',
      full_path: 'maeve/alice-9f2',
      name: 'Alice (revised)',
      updated_at: '2026-10-07T12:00:00.000Z',
      version: '1.1',
    });
    expect(next.published_at).toBe('2026-10-06T10:00:00.000Z');
    expect(next.updated_at).toBe('2026-10-07T12:00:00.000Z');
    expect(next.version).toBe('1.1');
  });

  it('re-stamps published_at when the draft was re-published as a new character', () => {
    const next = recordChubPublish(record, {
      username: 'maeve',
      pathname: 'other-1',
      full_path: 'maeve/other-1',
      name: 'Other',
      updated_at: '2026-10-08T00:00:00.000Z',
    });
    expect(next.published_at).toBe('2026-10-08T00:00:00.000Z');
    // The version string carries over from the previous record when not restated.
    expect(next.version).toBe('1.0');
  });
});

describe('chubCharacterUrl', () => {
  it('builds the canonical page link', () => {
    expect(chubCharacterUrl('maeve/alice-9f2')).toBe('https://chub.ai/characters/maeve/alice-9f2');
  });
});
