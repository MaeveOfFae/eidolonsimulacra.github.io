import { describe, expect, it } from 'vitest';
import {
  CONSTRAINT_CATEGORIES,
  MAX_SCENARIO_PRESETS,
  applyScenarioPreset,
  buildConstraintInstructions,
  createScenarioPresetId,
  normalizeInstructionLines,
  normalizeScenarioPresetRecord,
  upsertScenarioPreset,
} from './generation-launcher';

describe('scenario presets', () => {
  it('normalizes valid records and rejects incomplete ones', () => {
    const record = normalizeScenarioPresetRecord({
      id: ' preset-1 ',
      name: '  Fast draft ',
      description: '  Quick single-pass runs  ',
      templateName: 'V2/V3 Card',
      mode: 'NSFW',
      additionalInstructions: ['  Keep it terse  ', '', 'Keep it terse', 'Favor dialogue'],
      createdAt: '2026-09-28T00:00:00.000Z',
    });

    expect(record).toEqual({
      id: 'preset-1',
      name: 'Fast draft',
      description: 'Quick single-pass runs',
      templateName: 'V2/V3 Card',
      mode: 'NSFW',
      additionalInstructions: ['Keep it terse', 'Favor dialogue'],
      createdAt: '2026-09-28T00:00:00.000Z',
    });

    expect(normalizeScenarioPresetRecord({ id: 'x' })).toBeNull();
    expect(normalizeScenarioPresetRecord({ name: 'no id' })).toBeNull();
    expect(normalizeScenarioPresetRecord('nope')).toBeNull();
    expect(normalizeScenarioPresetRecord({ id: 'x', name: 'X', mode: 'bogus' })?.mode).toBeUndefined();
  });

  it('creates unique ids and upserts newest-first with a cap', () => {
    expect(createScenarioPresetId()).toMatch(/^preset-\d+-[a-z0-9]+$/);

    const base = [
      { id: 'a', name: 'A', additionalInstructions: [], createdAt: '2026-09-01T00:00:00.000Z' },
      { id: 'b', name: 'B', additionalInstructions: [], createdAt: '2026-09-02T00:00:00.000Z' },
    ];
    const added = upsertScenarioPreset(base, {
      id: 'c',
      name: 'C',
      additionalInstructions: [],
      createdAt: '2026-09-03T00:00:00.000Z',
    });
    expect(added.map((entry) => entry.id)).toEqual(['c', 'a', 'b']);

    const replaced = upsertScenarioPreset(added, {
      id: 'a',
      name: 'A2',
      additionalInstructions: [],
      createdAt: '2026-09-04T00:00:00.000Z',
    });
    expect(replaced.map((entry) => entry.id)).toEqual(['a', 'c', 'b']);

    const capped = upsertScenarioPreset(
      Array.from({ length: MAX_SCENARIO_PRESETS }, (_, index) => ({
        id: `id-${index}`,
        name: `Preset ${index}`,
        additionalInstructions: [],
        createdAt: '2026-09-01T00:00:00.000Z',
      })),
      { id: 'newest', name: 'Newest', additionalInstructions: [], createdAt: '2026-09-05T00:00:00.000Z' },
    );
    expect(capped).toHaveLength(MAX_SCENARIO_PRESETS);
    expect(capped[0]?.id).toBe('newest');
  });

  it('applies presets without overriding undefined launcher fields', () => {
    const preset = normalizeScenarioPresetRecord({
      id: 'p',
      name: 'Art pack',
      mode: 'SFW',
      additionalInstructions: ['Anchor scenes in sensory detail.'],
    })!;

    const applied = applyScenarioPreset(preset, {
      templateName: 'V2/V3 Card',
      mode: 'NSFW',
      additionalInstructions: ['Old line'],
    });

    expect(applied).toEqual({
      templateName: 'V2/V3 Card',
      mode: 'SFW',
      additionalInstructions: ['Anchor scenes in sensory detail.'],
    });
  });

  it('normalizes instruction lines by trimming and de-duplicating', () => {
    expect(normalizeInstructionLines([' a ', '', 'a', 'b', 42, undefined])).toEqual(['a', 'b']);
    expect(normalizeInstructionLines('not-an-array')).toEqual([]);
  });
});

describe('constraint catalog', () => {
  it('exposes categories with stable ids and unique option ids', () => {
    const categoryIds = new Set<string>();
    const instructionTexts = new Set<string>();

    for (const category of CONSTRAINT_CATEGORIES) {
      expect(categoryIds.has(category.id)).toBe(false);
      categoryIds.add(category.id);

      const optionIds = new Set<string>();
      for (const option of category.options) {
        expect(optionIds.has(option.id)).toBe(false);
        optionIds.add(option.id);
        expect(instructionTexts.has(option.instruction)).toBe(false);
        instructionTexts.add(option.instruction);
      }
    }

    expect(CONSTRAINT_CATEGORIES.length).toBeGreaterThanOrEqual(5);
  });

  it('builds instruction lines in catalog order and ignores unknown ids', () => {
    const lines = buildConstraintInstructions({
      framing: ['dialogue-forward', 'unknown-option'],
      tone: ['dark'],
      'not-a-category': ['whatever'],
    });

    expect(lines).toEqual([
      'Keep the tone dark and severe; do not soften outcomes.',
      'Prefer dialogue over exposition to carry information.',
    ]);
  });

  it('returns an empty list for empty selections', () => {
    expect(buildConstraintInstructions({})).toEqual([]);
    expect(buildConstraintInstructions({ tone: [], pacing: [] })).toEqual([]);
  });
});
