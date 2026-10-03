import { beforeEach, describe, expect, it } from 'vitest';
import { buildAssetApprovalSummary } from '@char-gen/shared';
import { APIError, api } from './api';
import { db } from './storage/draft-db';

const TEMPLATE = 'official_v2v3';

async function resetStorage() {
  await db.drafts.clear();
  await db.assets.clear();
  await db.tags.clear();
  localStorage.clear();
  sessionStorage.clear();
}

/**
 * Characterization tests for the draft domain of `EidolonBrowserAPI`.
 *
 * Note the two shapes: `getDraft` returns a full `Draft` (`{ path, metadata, assets }`),
 * while `getDrafts`/`listDrafts` return bare `DraftMetadata[]` inside `DraftListResponse`.
 */
describe('browser api: draft lifecycle', () => {
  beforeEach(resetStorage);

  it('rejects a blank seed and a blank template', async () => {
    await expect(api.createDraft({ seed: '   ', templateName: TEMPLATE })).rejects.toThrow('Seed is required');
    await expect(api.createDraft({ seed: 'seed', templateName: '  ' })).rejects.toThrow('Template is required');
  });

  it('creates a draft with the supplied metadata, trimmed and normalised', async () => {
    const draft = await api.createDraft({
      seed: '  a lonely space pirate  ',
      templateName: TEMPLATE,
      mode: 'NSFW',
      characterName: 'Vesna',
      genre: 'sci-fi',
      tags: ['pirate', '   '],
      assets: { character_sheet: '# Vesna' },
    });

    expect(draft.metadata.review_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(draft.path).toBe(draft.metadata.review_id);
    expect(draft.metadata.seed).toBe('a lonely space pirate');
    expect(draft.metadata.mode).toBe('NSFW');
    expect(draft.metadata.favorite).toBe(false);
    expect(draft.metadata.character_name).toBe('Vesna');
    expect(draft.metadata.genre).toBe('sci-fi');
    expect(draft.metadata.tags).toEqual(['pirate']);
    expect(draft.metadata.template_name).toBe(TEMPLATE);
    expect(draft.assets.character_sheet).toBe('# Vesna');
  });

  it('defaults the mode to Auto and the character name to the seed', async () => {
    const draft = await api.createDraft({ seed: 'unnamed concept', templateName: TEMPLATE });

    expect(draft.metadata.mode).toBe('Auto');
    expect(draft.metadata.character_name).toBe('unnamed concept');
  });

  it('round-trips a draft and 404s for an unknown id', async () => {
    const created = await api.createDraft({ seed: 'seed', templateName: TEMPLATE });
    const reviewId = created.metadata.review_id;

    expect((await api.getDraft(reviewId)).metadata.review_id).toBe(reviewId);
    await expect(api.getDraft('missing-id')).rejects.toBeInstanceOf(APIError);
  });

  it('lists drafts through both getDrafts and listDrafts, with stats', async () => {
    await api.createDraft({ seed: 'one', templateName: TEMPLATE });
    await api.createDraft({ seed: 'two', templateName: TEMPLATE });

    const response = await api.getDrafts();
    expect(response.drafts).toHaveLength(2);
    expect(response.total).toBe(2);
    expect(response.drafts[0]?.seed).toBeTruthy();
    expect(typeof response.stats.total_drafts).toBe('number');

    expect((await api.listDrafts()).drafts).toHaveLength(2);
  });

  it('honours the search and limit filters', async () => {
    await api.createDraft({ seed: 'one', templateName: TEMPLATE });
    await api.createDraft({ seed: 'two', templateName: TEMPLATE });
    await api.createDraft({ seed: 'three', templateName: TEMPLATE });

    expect((await api.getDrafts({ limit: 2 })).drafts).toHaveLength(2);

    const searched = await api.getDrafts({ search: 'TWO' });
    expect(searched.drafts).toHaveLength(1);
    expect(searched.drafts[0]?.seed).toBe('two');
  });

  it('persists metadata updates and filters by favourite', async () => {
    const first = await api.createDraft({ seed: 'alpha', templateName: TEMPLATE });
    await api.createDraft({ seed: 'beta', templateName: TEMPLATE });

    await api.updateMetadata(first.metadata.review_id, { favorite: true, character_name: 'Starred' });

    const favorites = await api.getDrafts({ favorite: true });
    expect(favorites.drafts.map((draft) => draft.review_id)).toEqual([first.metadata.review_id]);
    expect(favorites.drafts[0]?.character_name).toBe('Starred');
  });

  it('writes assets and reports whether the asset was created or updated', async () => {
    const created = await api.createDraft({ seed: 'seed', templateName: TEMPLATE });
    const reviewId = created.metadata.review_id;

    const first = await api.updateAsset(reviewId, 'intro_scene', 'First pass');
    expect(first).toEqual({ status: 'created', draft_id: reviewId, asset_name: 'intro_scene' });

    const second = await api.updateAsset(reviewId, 'intro_scene', 'Second pass');
    expect(second.status).toBe('updated');

    expect((await api.getDraft(reviewId)).assets.intro_scene).toBe('Second pass');
  });

  it('archives, restores and deletes drafts', async () => {
    const created = await api.createDraft({ seed: 'archive me', templateName: TEMPLATE });
    const keeper = await api.createDraft({ seed: 'keep me', templateName: TEMPLATE });
    const reviewId = created.metadata.review_id;

    await api.archiveDraft(reviewId);

    expect((await api.getDraft(reviewId)).metadata.archived_at).toBeTruthy();
    expect((await api.getDrafts()).drafts.map((draft) => draft.review_id)).toEqual([keeper.metadata.review_id]);
    expect((await api.getDrafts({ archived: true })).drafts.map((draft) => draft.review_id)).toEqual([reviewId]);
    expect((await api.getDrafts({ include_archived: true })).drafts).toHaveLength(2);

    await api.restoreDraft(reviewId);
    expect((await api.getDraft(reviewId)).metadata.archived_at).toBeFalsy();
    expect((await api.getDrafts()).drafts).toHaveLength(2);

    await api.deleteDraft(reviewId);
    await expect(api.getDraft(reviewId)).rejects.toThrow();
    expect((await api.getDrafts()).drafts.map((draft) => draft.review_id)).toEqual([keeper.metadata.review_id]);
  });

  it('creates a revision snapshot and restores the draft from it', async () => {
    const created = await api.createDraft({
      seed: 'seed',
      templateName: TEMPLATE,
      assets: { character_sheet: 'v1' },
    });
    const reviewId = created.metadata.review_id;

    await api.updateAsset(reviewId, 'character_sheet', 'v2');

    const snapshot = await api.createDraftSnapshot(reviewId, { label: 'before v3', reason: 'manual' });
    expect(snapshot.status).toBe('created');
    expect(snapshot.snapshot_id).toBeTruthy();

    const withSnapshot = await api.getDraft(reviewId);
    expect(withSnapshot.metadata.revision_snapshots?.length).toBeGreaterThan(0);
    expect(withSnapshot.metadata.revision_snapshots?.some((entry) => entry.label === 'before v3')).toBe(true);

    await api.updateAsset(reviewId, 'character_sheet', 'v3');
    expect((await api.getDraft(reviewId)).assets.character_sheet).toBe('v3');

    const restored = await api.restoreDraftSnapshot(reviewId, snapshot.snapshot_id);
    expect(restored.status).toBe('restored');
    expect((await api.getDraft(reviewId)).assets.character_sheet).toBe('v2');
  });

  it('404s when restoring an unknown snapshot', async () => {
    const created = await api.createDraft({ seed: 'seed', templateName: TEMPLATE });

    await expect(api.restoreDraftSnapshot(created.metadata.review_id, 'no-such-snapshot')).rejects.toBeInstanceOf(
      APIError,
    );
  });

  it('validates a saved draft and reports a failure for an unknown path', async () => {
    const created = await api.createDraft({
      seed: 'seed',
      templateName: TEMPLATE,
      assets: { character_sheet: '# Sheet', intro_scene: 'Scene', creator_notes: 'Notes', a1111: 'tags' },
    });

    const validation = await api.validateDraft(created.metadata.review_id);
    expect(validation.path).toBeTruthy();
    expect(typeof validation.success).toBe('boolean');

    const missing = await api.validatePath({ path: 'drafts/does-not-exist' });
    expect(missing.success).toBe(false);
    expect(missing.exit_code).toBe(1);
  });

  it('approves an asset and persists the decision in review annotations', async () => {
    const created = await api.createDraft({
      seed: 'seed',
      templateName: TEMPLATE,
      assets: { character_sheet: 'v1' },
    });
    const reviewId = created.metadata.review_id;

    const result = await api.setAssetApproval(reviewId, 'character_sheet', { status: 'approved' });

    expect(result).toEqual({ status: 'updated', draft_id: reviewId, asset_name: 'character_sheet' });

    const annotations = (await api.getDraft(reviewId)).metadata.review_annotations;
    expect(annotations?.asset_approvals?.character_sheet?.status).toBe('approved');
    expect(annotations?.asset_approvals?.character_sheet?.content_fingerprint).toBeTruthy();
  });

  it('marks an approval stale after the approved content changes', async () => {
    const created = await api.createDraft({
      seed: 'seed',
      templateName: TEMPLATE,
      assets: { character_sheet: 'v1' },
    });
    const reviewId = created.metadata.review_id;

    await api.setAssetApproval(reviewId, 'character_sheet', { status: 'approved' });
    await api.updateAsset(reviewId, 'character_sheet', 'v2');

    const summary = buildAssetApprovalSummary(await api.getDraft(reviewId));
    expect(summary.entries.find((entry) => entry.assetName === 'character_sheet')?.status).toBe('stale');
    expect(summary.approvedCount).toBe(0);
  });

  it('clears a recorded approval decision', async () => {
    const created = await api.createDraft({
      seed: 'seed',
      templateName: TEMPLATE,
      assets: { character_sheet: 'v1' },
    });
    const reviewId = created.metadata.review_id;

    await api.setAssetApproval(reviewId, 'character_sheet', { status: 'changes_requested' });
    await api.setAssetApproval(reviewId, 'character_sheet', null);

    const annotations = (await api.getDraft(reviewId)).metadata.review_annotations;
    expect(annotations?.asset_approvals?.character_sheet).toBeUndefined();
  });

  it('404s when approving an unknown asset or draft', async () => {
    const created = await api.createDraft({ seed: 'seed', templateName: TEMPLATE, assets: {} });

    await expect(
      api.setAssetApproval(created.metadata.review_id, 'nope', { status: 'approved' }),
    ).rejects.toBeInstanceOf(APIError);
    await expect(api.setAssetApproval('missing-id', 'character_sheet', { status: 'approved' })).rejects.toBeInstanceOf(
      APIError,
    );
  });
});
