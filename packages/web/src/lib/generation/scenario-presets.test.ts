import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ContentMode } from '@char-gen/shared';
import {
  SCENARIO_PRESETS_CHANGED_EVENT,
  deleteScenarioPreset,
  getScenarioPresets,
  saveScenarioPreset,
} from './scenario-presets';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('scenario presets', () => {
  it('starts empty and ignores corrupt storage', () => {
    expect(getScenarioPresets()).toEqual([]);

    localStorage.setItem('eidolon.web.generationLauncher.scenarioPresets', '{not json');
    expect(getScenarioPresets()).toEqual([]);
  });

  it('saves a preset with its launcher snapshot and emits the changed event', () => {
    const listener = vi.fn();
    window.addEventListener(SCENARIO_PRESETS_CHANGED_EVENT, listener);

    const saved = saveScenarioPreset({
      name: '  Fast draft  ',
      description: 'Quick single-pass',
      templateName: 'V2/V3 Card',
      mode: 'NSFW' as ContentMode,
      additionalInstructions: ['Favor dialogue', ''],
    });

    expect(saved).toMatchObject({
      name: 'Fast draft',
      description: 'Quick single-pass',
      templateName: 'V2/V3 Card',
      mode: 'NSFW',
      additionalInstructions: ['Favor dialogue'],
    });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getScenarioPresets()).toHaveLength(1);
  });

  it('rejects empty names, strips empty instructions, and deletes by id', () => {
    expect(saveScenarioPreset({ name: '   ', additionalInstructions: [] })).toBeNull();
    expect(getScenarioPresets()).toEqual([]);

    const first = saveScenarioPreset({ name: 'First', additionalInstructions: ['A'] });
    const second = saveScenarioPreset({ name: 'Second', additionalInstructions: ['B'] });
    expect(getScenarioPresets().map((entry) => entry.name)).toEqual(['Second', 'First']);

    deleteScenarioPreset(first!.id);
    expect(getScenarioPresets().map((entry) => entry.name)).toEqual(['Second']);
    expect(second).toBeDefined();
  });

  it('drops malformed stored records on read', () => {
    localStorage.setItem(
      'eidolon.web.generationLauncher.scenarioPresets',
      JSON.stringify([
        { id: 'x' },
        { id: 'ok', name: 'OK', additionalInstructions: [], createdAt: '2026-09-01T00:00:00.000Z' },
      ]),
    );

    const all = getScenarioPresets();
    expect(all).toHaveLength(1);
    expect(all[0]?.name).toBe('OK');
  });
});
