import { describe, expect, it } from 'vitest';
import { parseLorebookPacket, type Draft, type DraftMetadata } from '@char-gen/shared';
import {
  DEFAULT_LOREBOOK_BLUEPRINT_PATH,
  buildLorebookMessages,
  buildLorebookReferenceSuites,
  normalizeLorebookReferenceIds,
  resolveLorebookBlueprintContent,
  resolveLorebookBlueprintPath,
  resolveLorebookBlueprintPathFromCatalog,
  restoreKnownLorebookDraftIds,
} from './lorebook';

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

describe('normalizeLorebookReferenceIds', () => {
  it('trims and de-duplicates the selected reference ids', () => {
    expect(normalizeLorebookReferenceIds([' draft-1 ', 'draft-1', 'draft-2'])).toEqual(['draft-1', 'draft-2']);
  });

  it('drops blank ids and non-string entries', () => {
    expect(normalizeLorebookReferenceIds(['  ', 'draft-1'])).toEqual(['draft-1']);
    expect(normalizeLorebookReferenceIds([undefined as unknown as string, 'draft-1'])).toEqual(['draft-1']);
  });

  it('returns an empty list when nothing is selected', () => {
    expect(normalizeLorebookReferenceIds(undefined)).toEqual([]);
    expect(normalizeLorebookReferenceIds([])).toEqual([]);
  });
});

describe('resolveLorebookBlueprintPath', () => {
  it('prefers an explicit override path', () => {
    expect(
      resolveLorebookBlueprintPath({ worldbook_generation: 'blueprints/system/other.md' }, 'blueprints/custom.md'),
    ).toBe('blueprints/custom.md');
  });

  it('falls back to the configured feature blueprint', () => {
    expect(resolveLorebookBlueprintPath({ worldbook_generation: 'blueprints/system/configured.md' })).toBe(
      'blueprints/system/configured.md',
    );
  });

  it('falls back to the bundled generator when nothing is configured', () => {
    expect(resolveLorebookBlueprintPath(undefined)).toBe(DEFAULT_LOREBOOK_BLUEPRINT_PATH);
    expect(resolveLorebookBlueprintPath({ worldbook_generation: '   ' })).toBe(DEFAULT_LOREBOOK_BLUEPRINT_PATH);
  });
});

describe('resolveLorebookBlueprintPathFromCatalog', () => {
  const blueprintList = {
    core: [],
    system: [
      {
        name: 'Lorebook Generator',
        description: 'Generate a lorebook packet.',
        invokable: true,
        version: '1.0',
        content: 'blueprint body',
        path: 'blueprints/system/lorebook_generator.md',
        category: 'system' as const,
        feature_category: 'worldbook_generation' as const,
      },
    ],
    templates: {},
    examples: [],
  };

  it('honours a preferred path that is tagged for worldbook generation', () => {
    expect(resolveLorebookBlueprintPathFromCatalog(blueprintList, 'blueprints/system/lorebook_generator.md')).toBe(
      'blueprints/system/lorebook_generator.md',
    );
  });

  it('ignores a preferred path that is not tagged for the feature', () => {
    expect(resolveLorebookBlueprintPathFromCatalog(blueprintList, 'blueprints/system/seed_generator.md')).toBe(
      'blueprints/system/lorebook_generator.md',
    );
  });

  it('falls back to the bundled default when the catalog has no match', () => {
    expect(resolveLorebookBlueprintPathFromCatalog({ core: [], system: [], templates: {}, examples: [] })).toBe(
      DEFAULT_LOREBOOK_BLUEPRINT_PATH,
    );
  });
});

describe('resolveLorebookBlueprintContent', () => {
  it('prefers the operator-supplied blueprint text', () => {
    expect(
      resolveLorebookBlueprintContent({ requested: 'custom blueprint', catalog: 'catalog', bundled: 'bundled' }),
    ).toBe('custom blueprint');
  });

  it('prefers the catalog copy over the bundled copy', () => {
    expect(resolveLorebookBlueprintContent({ catalog: 'catalog', bundled: 'bundled' })).toBe('catalog');
  });

  it('uses a safe fallback instead of sending an empty system prompt', () => {
    expect(resolveLorebookBlueprintContent({})).toContain('lorebook/worldbook packet');
  });
});

describe('buildLorebookReferenceSuites', () => {
  it('builds a suite per draft with a reference summary and lorebook assets first', () => {
    const suites = buildLorebookReferenceSuites([
      buildDraft({
        metadata: { character_name: 'Maeve', mode: 'SFW' },
        assets: {
          lorebook: '## Crimson Court\n\nControls the inland passes.',
          character_sheet: 'Maeve, checkpoint broker.',
        },
      }),
    ]);

    expect(suites).toHaveLength(1);
    expect(suites[0].label).toBe('Maeve');
    expect(Object.keys(suites[0].assets)).toEqual(['reference_summary', 'lorebook', 'character_sheet']);
    expect(suites[0].assets.reference_summary).toContain('name: Maeve');
    expect(suites[0].assets.lorebook).toContain('Crimson Court');
  });

  it('includes prefixed lorebook_* assets that are not in the preferred order', () => {
    const suites = buildLorebookReferenceSuites([
      buildDraft({
        assets: {
          character_sheet: 'Sheet content.',
          lorebook_factions: 'Crimson Court, Harbor Watch.',
        },
      }),
    ]);

    expect(Object.keys(suites[0].assets)).toContain('lorebook_factions');
  });

  it('drops unresolvable drafts while keeping drafts with only metadata context', () => {
    const suites = buildLorebookReferenceSuites([
      null,
      undefined,
      buildDraft({ metadata: { review_id: 'draft-b' }, assets: { character_sheet: 'Real content.' } }),
    ]);

    expect(suites).toHaveLength(1);
    expect(suites[0].label).toBe('draft-b');
  });

  it('still yields a reference summary for a draft with no assets at all', () => {
    // Mirrors web: the metadata summary alone is usable context, so a resolved
    // draft is never silently dropped from the packet.
    const suites = buildLorebookReferenceSuites([buildDraft({ assets: {} })]);

    expect(suites).toHaveLength(1);
    expect(Object.keys(suites[0].assets)).toEqual(['reference_summary']);
    expect(suites[0].assets.reference_summary).toContain('seed: A court intriguer bound to the Crimson Court');
  });
});

describe('buildLorebookMessages', () => {
  it('sends the blueprint as the system prompt and a synthesis task as the user prompt', () => {
    const messages = buildLorebookMessages({
      referenceSuites: [{ label: 'Maeve', assets: { reference_summary: 'name: Maeve' } }],
      blueprintContent: 'Lorebook Generator blueprint',
      focus: 'Extract faction pressure.',
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({ role: 'system', content: 'Lorebook Generator blueprint' });
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toContain(
      'TASK: Synthesize a connected lorebook/worldbook packet from these reference drafts.',
    );
    expect(messages[1].content).toContain('CONSTRAINT: Do not generate a new standalone character.');
    expect(messages[1].content).toContain('FOCUS: Extract faction pressure.');
    expect(messages[1].content).toContain('## REFERENCE DRAFT 1: Maeve');
  });

  it('omits the focus block when the focus is blank', () => {
    const messages = buildLorebookMessages({
      referenceSuites: [{ label: 'Maeve', assets: { reference_summary: 'name: Maeve' } }],
      blueprintContent: 'blueprint',
      focus: '   ',
    });

    expect(messages[1].content).not.toContain('FOCUS:');
    expect(messages[1].content).toContain('REFERENCE_DRAFT_COUNT: 1');
  });
});

describe('restoreKnownLorebookDraftIds', () => {
  it('keeps only source ids that still exist locally', () => {
    expect(restoreKnownLorebookDraftIds(['draft-1', 'draft-gone'], ['draft-1', 'draft-2'])).toEqual(['draft-1']);
  });

  it('returns an empty list when none of the packet sources exist', () => {
    expect(restoreKnownLorebookDraftIds(['draft-gone'], ['draft-1'])).toEqual([]);
  });
});

describe('shared packet parsing contract', () => {
  it('parses the packet entries the mobile screen reports', () => {
    const parsed = parseLorebookPacket(`title: Crimson Court Dossier
[[ENTRY]]
type: faction
title: Crimson Court
keywords: toll bells, inland passes
linked_drafts: draft-1
summary: Controls the inland passes.
content:
Bribes and soft terror keep the passes open.
[[/ENTRY]]`);

    expect(parsed.title).toBe('Crimson Court Dossier');
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].type).toBe('faction');
    expect(parsed.entries[0].linkedDrafts).toEqual(['draft-1']);
  });

  it('keeps the bundled lorebook generator blueprint path stable', () => {
    // The bundled content map is keyed by this path; changing it silently breaks
    // mobile lorebook generation.
    expect(DEFAULT_LOREBOOK_BLUEPRINT_PATH).toBe('blueprints/system/lorebook_generator.md');
  });
});
