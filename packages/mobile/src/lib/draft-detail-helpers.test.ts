import { describe, expect, it } from 'vitest';
import {
  EXPORT_EXTENSIONS,
  EXPORT_LABELS,
  createIntroCandidate,
  describeGenerationStage,
  formatAssetLabel,
  formatTimestamp,
  isVisibleDraftAsset,
  mergeNotesWithSavedIntros,
  parseSavedIntros,
  stripSavedIntrosBlock,
  summarizeText,
} from './draft-detail-helpers';

/**
 * The saved-intro helpers moved out of the screen hook verbatim, so this pins what they
 * actually do — including the two things I assumed wrong before reading them: the block
 * carries **JSON**, and `formatTimestamp` answers `'Unknown'` rather than an empty string.
 */
const CANDIDATES = [
  { id: 'intro_1', content: 'A clever opener', timestamp: 1 },
  { id: 'intro_2', content: 'Another opener', timestamp: 2 },
];
const SAVED = `[SAVED_INTROS]${JSON.stringify(CANDIDATES)}[/SAVED_INTROS]`;

describe('saved intros', () => {
  it('strips the saved-intro block out of the notes', () => {
    const stripped = stripSavedIntrosBlock(`Notes before\n\n${SAVED}\n\nNotes after`);

    expect(stripped).not.toContain('[SAVED_INTROS]');
    expect(stripped).toContain('Notes before');
    expect(stripped).toContain('Notes after');
  });

  it('handles notes that have no block at all', () => {
    expect(stripSavedIntrosBlock(undefined)).toBe('');
    expect(stripSavedIntrosBlock('plain notes')).toBe('plain notes');
  });

  it('parses the JSON payload back into candidates', () => {
    expect(parseSavedIntros(`Lead in\n${SAVED}`)).toEqual(CANDIDATES);
  });

  it('returns nothing rather than throwing on malformed payloads', () => {
    expect(parseSavedIntros('nothing here')).toEqual([]);
    expect(parseSavedIntros(undefined)).toEqual([]);
    expect(parseSavedIntros('[SAVED_INTROS]not json[/SAVED_INTROS]')).toEqual([]);
    expect(parseSavedIntros('[SAVED_INTROS]{"id":"x"}[/SAVED_INTROS]')).toEqual([]);
    expect(parseSavedIntros('[SAVED_INTROS][{"id":"x"}][/SAVED_INTROS]')).toEqual([]);
  });

  it('merges new notes with the saved intros so neither is lost', () => {
    const merged = mergeNotesWithSavedIntros('new notes', CANDIDATES) ?? '';

    expect(merged).toContain('new notes');
    expect(merged).toContain('A clever opener');
    expect(parseSavedIntros(merged)).toEqual(CANDIDATES);
    expect(stripSavedIntrosBlock(merged)).toBe('new notes');
  });

  it('drops the block entirely when there are no saved intros', () => {
    expect(mergeNotesWithSavedIntros(`notes\n${SAVED}`, [])).toBe('notes');
    expect(mergeNotesWithSavedIntros('   ', [])).toBeUndefined();
  });

  it('mints a candidate with an id, the content and a timestamp', () => {
    const candidate = createIntroCandidate('Fresh opener');

    expect(candidate.id).toMatch(/^intro_/);
    expect(candidate.content).toBe('Fresh opener');
    expect(typeof candidate.timestamp).toBe('number');
  });
});

describe('asset labels and visibility', () => {
  it('turns an asset name into a label', () => {
    expect(formatAssetLabel('character_sheet')).toBe('Character Sheet');
    expect(formatAssetLabel('intro_scene')).toBe('Intro Scene');
  });

  it('hides the card image, which is not a reviewable asset', () => {
    expect(isVisibleDraftAsset('character_sheet')).toBe(true);
    expect(isVisibleDraftAsset('card_image')).toBe(false);
  });
});

describe('export tables', () => {
  it('names every export format once, in both tables', () => {
    expect(Object.keys(EXPORT_EXTENSIONS).sort()).toEqual(Object.keys(EXPORT_LABELS).sort());
    expect(Object.keys(EXPORT_EXTENSIONS).length).toBeGreaterThan(0);
  });
});

describe('formatting', () => {
  it('collapses whitespace and truncates long text', () => {
    expect(summarizeText('  short   text  ')).toBe('short text');
    expect(summarizeText('x'.repeat(400))).toHaveLength(160);
    expect(summarizeText('x'.repeat(400)).endsWith('...')).toBe(true);
    expect(summarizeText(undefined)).toBe('');
  });

  it('answers "Unknown" for a missing or invalid date', () => {
    expect(formatTimestamp(undefined)).toBe('Unknown');
    expect(formatTimestamp('')).toBe('Unknown');
    expect(formatTimestamp('not-a-date')).toBe('Unknown');
    expect(formatTimestamp('2026-01-02T03:04:05.000Z')).not.toBe('Unknown');
  });

  it('describes a generation stage for the progress line', () => {
    expect(describeGenerationStage('complete')).toBe('Intro generation complete.');
    expect(describeGenerationStage('saving_draft', 0.5)).toContain('50%');
    expect(describeGenerationStage('some_other_stage')).toBe('some other stage');
  });
});
