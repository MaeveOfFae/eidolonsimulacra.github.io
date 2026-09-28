import { beforeEach, describe, expect, it } from 'vitest';
import { APIError, api } from './api';
import { db } from './storage/draft-db';

async function resetStorage() {
  await db.drafts.clear();
  await db.assets.clear();
  await db.tags.clear();
  localStorage.clear();
  sessionStorage.clear();
}

async function seedDraft() {
  const draft = await api.createDraft({
    seed: 'a lonely space pirate',
    templateName: 'official_v2v3',
    characterName: 'Vesna Nova',
    assets: {
      character_sheet: '# Vesna Nova\n\nA pirate.',
      intro_scene: 'Scene text',
      creator_notes: 'Notes text',
      a1111: 'tags, here',
    },
  });

  return draft.metadata.review_id;
}

describe('browser api: export', () => {
  beforeEach(resetStorage);

  it('lists the built-in export presets', async () => {
    const presets = await api.getExportPresets();

    expect(presets.length).toBeGreaterThan(0);
    for (const preset of presets) {
      expect(typeof preset.name).toBe('string');
      expect(typeof preset.path).toBe('string');
    }

    expect(presets.map((preset) => preset.path)).toContain('pdf');
  });

  it('exports a draft as json using a slugified character name', async () => {
    const reviewId = await seedDraft();

    const download = await api.exportDraft({ draft_id: reviewId, preset: 'json' });

    expect(download.filename).toBe('vesna_nova.json');
    expect(download.contentType).toBe('application/json');
    expect(download.blob.size).toBeGreaterThan(0);
  });

  it('falls back to the json preset for an unknown preset name', async () => {
    const reviewId = await seedDraft();

    const json = await api.exportDraft({ draft_id: reviewId, preset: 'json' });
    const unknown = await api.exportDraft({ draft_id: reviewId, preset: 'not-a-preset' });

    expect(unknown.filename).toBe(json.filename);
    expect(unknown.contentType).toBe(json.contentType);
  });

  it('produces text and combined variants with their own extensions', async () => {
    const reviewId = await seedDraft();

    const text = await api.exportDraft({ draft_id: reviewId, preset: 'text' });
    const combined = await api.exportDraft({ draft_id: reviewId, preset: 'combined' });

    expect(text.filename).toMatch(/^vesna_nova\.[a-z0-9]+$/);
    expect(combined.filename).toMatch(/^vesna_nova\.[a-z0-9]+$/);
    expect(text.blob.size).toBeGreaterThan(0);
    expect(combined.blob.size).toBeGreaterThan(0);
  });

  it('exports a printable pdf with the metadata and assets', async () => {
    const reviewId = await seedDraft();

    const download = await api.exportDraft({ draft_id: reviewId, preset: 'pdf' });

    expect(download.filename).toBe('vesna_nova.pdf');
    expect(download.contentType).toBe('application/pdf');
    expect(download.blob.size).toBeGreaterThan(0);

    const bytes = new Uint8Array(await download.blob.arrayBuffer());
    expect(String.fromCharCode(...bytes.slice(0, 8))).toBe('%PDF-1.4');
  });

  it('404s when exporting an unknown draft', async () => {
    await expect(api.exportDraft({ draft_id: 'nope', preset: 'json' })).rejects.toBeInstanceOf(APIError);
  });
});
