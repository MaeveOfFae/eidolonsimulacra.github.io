import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearActiveGenerationSession,
  loadActiveGenerationSession,
  saveActiveGenerationSession,
  type ActiveGenerationSession,
} from './generation-session';

const SESSION_STORAGE_KEY = 'eidolon.active-generation-session';

function buildSession(overrides: Partial<ActiveGenerationSession> = {}): ActiveGenerationSession {
  return {
    version: 1,
    seed: 'a lonely space pirate',
    mode: 'SFW',
    template: 'official_v2v3',
    assetDrafts: { character_sheet: 'Sheet' },
    currentAsset: 'intro_scene',
    currentAssetContent: '',
    currentStatus: 'paused',
    startedAt: 1,
    updatedAt: 2,
    ...overrides,
  };
}

describe('active generation session persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a paused session through storage', () => {
    saveActiveGenerationSession(buildSession());

    expect(loadActiveGenerationSession()).toEqual(buildSession());
  });

  it('rejects a stored session with an unknown status', () => {
    saveActiveGenerationSession(buildSession());

    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    expect(stored).toBeTruthy();
    localStorage.setItem(SESSION_STORAGE_KEY, stored!.replace('"paused"', '"mischief"'));

    expect(loadActiveGenerationSession()).toBeNull();
  });

  it('clears the stored session', () => {
    saveActiveGenerationSession(buildSession());
    clearActiveGenerationSession();

    expect(loadActiveGenerationSession()).toBeNull();
  });
});
