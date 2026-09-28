import { describe, expect, it } from 'vitest';
import {
  buildCompactReferenceAssets,
  buildLorebookUserPrompt,
  buildReferenceSummary,
  buildReferenceSuiteSection,
  normalizeConnectedReferenceIds,
  truncateReferenceAssetContent,
} from './lorebook-prompt';
import type { Draft, DraftMetadata, Template } from './types';

function buildMetadata(overrides: Partial<DraftMetadata> = {}): DraftMetadata {
  return {
    review_id: 'draft-a',
    seed: 'A court intriguer bound to the Crimson Court',
    favorite: false,
    ...overrides,
  };
}

function buildDraft(overrides: { metadata?: Partial<DraftMetadata>; assets?: Record<string, string> }): Draft {
  return {
    path: 'drafts/draft-a',
    metadata: buildMetadata(overrides.metadata),
    assets: overrides.assets ?? {},
  };
}

function buildTemplate(overrides: Partial<Template> = {}): Template {
  return {
    name: 'V2/V3 Card',
    version: '1.0',
    description: '',
    assets: [],
    ...overrides,
  } as Template;
}

describe('truncateReferenceAssetContent', () => {
  it('returns compact content unchanged when it fits the limits', () => {
    expect(truncateReferenceAssetContent('character_sheet', 'line one\nline two')).toBe('line one\nline two');
  });

  it('returns an empty string for blank content', () => {
    expect(truncateReferenceAssetContent('character_sheet', '   ')).toBe('');
  });

  it('caps the line count and appends a truncation marker', () => {
    const content = Array.from({ length: 30 }, (_, index) => `line ${index}`).join('\n');
    const truncated = truncateReferenceAssetContent('character_sheet', content);

    expect(truncated.endsWith('[truncated for reference]')).toBe(true);
    expect(truncated.split('\n').length).toBeLessThanOrEqual(25);
  });

  it('caps the character count for an unlisted asset name', () => {
    const truncated = truncateReferenceAssetContent('unknown_asset', 'x'.repeat(600));

    expect(truncated.startsWith('x'.repeat(420))).toBe(true);
    expect(truncated).toContain('[truncated for reference]');
  });

  it('honours per-call limit overrides so a surface can tune its budget', () => {
    const truncated = truncateReferenceAssetContent('character_sheet', 'y'.repeat(100), {
      charLimits: { character_sheet: 10 },
      lineLimits: { character_sheet: 1 },
    });

    expect(truncated).toBe(`${'y'.repeat(10)}\n[truncated for reference]`);
  });
});

describe('buildReferenceSummary', () => {
  it('summarizes the draft metadata that grounds continuity', () => {
    const summary = buildReferenceSummary(
      buildDraft({ metadata: { character_name: 'Maeve', template_name: 'V2/V3 Card', mode: 'SFW', genre: 'noir' } }),
    );

    expect(summary).toContain('name: Maeve');
    expect(summary).toContain('template: V2/V3 Card');
    expect(summary).toContain('mode: SFW');
    expect(summary).toContain('seed: A court intriguer bound to the Crimson Court');
    expect(summary).toContain('genre: noir');
  });

  it('falls back to the review id when no character name is set', () => {
    expect(buildReferenceSummary(buildDraft({}))).toContain('name: draft-a');
  });

  it('omits optional metadata that is not set', () => {
    const summary = buildReferenceSummary(buildDraft({}));

    expect(summary).not.toContain('genre:');
    expect(summary).not.toContain('notes:');
  });
});

describe('buildCompactReferenceAssets', () => {
  it('always includes the reference summary first', () => {
    const assets = buildCompactReferenceAssets(buildDraft({ assets: { character_sheet: 'Sheet.' } }));

    expect(Object.keys(assets)[0]).toBe('reference_summary');
  });

  it('includes preferred assets that have content and skips empty ones', () => {
    const assets = buildCompactReferenceAssets(
      buildDraft({ assets: { character_sheet: 'Sheet.', post_history: '   ', system_prompt: 'Rules.' } }),
    );

    expect(Object.keys(assets)).toEqual(['reference_summary', 'character_sheet', 'system_prompt']);
  });

  it('adds prefixed assets that are outside the preferred order', () => {
    const assets = buildCompactReferenceAssets(
      buildDraft({ assets: { character_sheet: 'Sheet.', lorebook_factions: 'Crimson Court.' } }),
      { includeAssetPrefixes: ['lorebook_'] },
    );

    expect(Object.keys(assets)).toContain('lorebook_factions');
  });

  it('falls back to the first usable asset when nothing matched', () => {
    const assets = buildCompactReferenceAssets(buildDraft({ assets: { odd_asset: 'Only usable content.' } }), {
      preferredAssetOrder: ['character_sheet'],
    });

    expect(assets.odd_asset).toBe('Only usable content.');
  });
});

describe('normalizeConnectedReferenceIds', () => {
  it('trims, de-duplicates and excludes ids', () => {
    expect(normalizeConnectedReferenceIds([' draft-1 ', 'draft-1', 'draft-2'], { excludeIds: [' draft-2 '] })).toEqual([
      'draft-1',
    ]);
  });

  it('caps the list at the shared connected-reference ceiling', () => {
    const draftIds = Array.from({ length: 25 }, (_, index) => `draft-${index}`);

    expect(normalizeConnectedReferenceIds(draftIds)).toHaveLength(10);
  });

  it('returns an empty list for undefined input', () => {
    expect(normalizeConnectedReferenceIds(undefined)).toEqual([]);
  });
});

describe('buildReferenceSuiteSection', () => {
  it('labels the suite and lists template-ordered assets', () => {
    const lines = buildReferenceSuiteSection('REFERENCE DRAFT 1', 'Maeve', { character_sheet: 'Sheet.' });

    expect(lines[0]).toContain('## REFERENCE DRAFT 1: Maeve');
    expect(lines.join('\n')).toContain('### character_sheet:');
  });

  it('appends the template contract line when a template is supplied', () => {
    const lines = buildReferenceSuiteSection(
      'REFERENCE DRAFT 1',
      'Maeve',
      { character_sheet: 'Sheet.' },
      buildTemplate(),
    );

    expect(lines.join('\n')).toContain('Template: V2/V3 Card (1.0)');
  });
});

describe('buildLorebookUserPrompt', () => {
  it('states the synthesis task and never asks for a new character', () => {
    const prompt = buildLorebookUserPrompt([{ label: 'Maeve', assets: { reference_summary: 'name: Maeve' } }]);

    expect(prompt).toContain('REFERENCE_DRAFT_COUNT: 1');
    expect(prompt).toContain('TASK: Synthesize a connected lorebook/worldbook packet from these reference drafts.');
    expect(prompt).toContain('CONSTRAINT: Do not generate a new standalone character.');
    expect(prompt).toContain('## REFERENCE DRAFT 1: Maeve');
  });

  it('includes the focus only when one is provided', () => {
    expect(buildLorebookUserPrompt([], { focus: '  faction pressure  ' })).toContain('FOCUS: faction pressure');
    expect(buildLorebookUserPrompt([], { focus: '   ' })).not.toContain('FOCUS:');
  });
});
