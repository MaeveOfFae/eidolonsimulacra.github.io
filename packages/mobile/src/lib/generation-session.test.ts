import { describe, expect, it } from 'vitest';
import {
  isMobileGenerationSession,
  isResumableMobileGenerationSession,
  orderedCompletedAssetNames,
  remainingAssetNames,
  trimSessionFromAsset,
  type MobileGenerationSession,
} from './generation-session';

function buildSession(overrides: Partial<MobileGenerationSession> = {}): MobileGenerationSession {
  return {
    version: 1,
    seed: 'a lonely space pirate',
    mode: 'SFW',
    template: 'official_v2v3',
    selectedAssets: ['character_sheet'],
    completedAssets: { character_sheet: 'Sheet content' },
    updatedAt: 2,
    ...overrides,
  };
}

describe('mobile generation session', () => {
  it('accepts a valid session and rejects malformed ones', () => {
    expect(isMobileGenerationSession(buildSession())).toBe(true);
    expect(isMobileGenerationSession({ ...buildSession(), version: 2 })).toBe(false);
    expect(isMobileGenerationSession({ ...buildSession(), completedAssets: { character_sheet: 7 } })).toBe(false);
    expect(isMobileGenerationSession({ ...buildSession(), seed: undefined })).toBe(false);
    expect(isMobileGenerationSession(null)).toBe(false);
  });

  it('is only resumable once at least one asset completed', () => {
    expect(isResumableMobileGenerationSession(buildSession())).toBe(true);
    expect(isResumableMobileGenerationSession(buildSession({ completedAssets: {} }))).toBe(false);
  });

  it('computes the remaining assets in template order', () => {
    const session = buildSession({ completedAssets: { character_sheet: 'Sheet', intro_scene: 'Scene' } });

    expect(remainingAssetNames(session, ['system_prompt', 'character_sheet', 'intro_scene', 'a1111'])).toEqual([
      'system_prompt',
      'a1111',
    ]);
  });

  it('accepts a captured imported source and rejects malformed ones', () => {
    expect(
      isMobileGenerationSession(
        buildSession({ importedSource: { label: 'Maeve', source: 'json', assets: { system_prompt: 'x' } } }),
      ),
    ).toBe(true);
    expect(
      isMobileGenerationSession({
        ...buildSession(),
        importedSource: { label: 'Maeve', source: 7, assets: {} },
      }),
    ).toBe(false);
  });

  it('lists completed assets in template order', () => {
    const session = buildSession({ completedAssets: { a1111: 'Tags', character_sheet: 'Sheet' } });

    expect(orderedCompletedAssetNames(session, ['system_prompt', 'character_sheet', 'intro_scene', 'a1111'])).toEqual([
      'character_sheet',
      'a1111',
    ]);
  });

  it('trims a checkpoint from a chosen asset, keeping only the prefix before it', () => {
    const session = buildSession({
      completedAssets: { system_prompt: 'System', character_sheet: 'Sheet', intro_scene: 'Scene', a1111: 'Tags' },
    });
    const order = ['system_prompt', 'character_sheet', 'intro_scene', 'a1111'];

    const trimmed = trimSessionFromAsset(session, order, 'character_sheet');

    expect(Object.keys(trimmed.completedAssets)).toEqual(['system_prompt']);
    // An unknown asset name leaves the checkpoint untouched.
    expect(trimSessionFromAsset(session, order, 'nope')).toBe(session);
  });
});
