import { describe, expect, it } from 'vitest';
import { chubPreflightHasErrors, runChubPreflight } from './validate';
import type { ChubCharacterCreate } from './types';

const base: ChubCharacterCreate = {
  name: 'Alice',
  description: 'notes',
  personality: 'persona',
  scenario: 'scene',
  example_dialogs: '<START>\n{{user}}: hi',
  first_message: 'Hey {{user}}!',
  tags: ['OC', 'SFW', 'student'],
  is_public: true,
  is_unlisted: false,
};

const codes = (issues: ReturnType<typeof runChubPreflight>) => issues.map((issue) => `${issue.severity}:${issue.code}`);

describe('runChubPreflight', () => {
  it('passes a complete listed public character', () => {
    expect(runChubPreflight(base)).toEqual([]);
  });

  it('requires a name and a first message', () => {
    const issues = runChubPreflight({ ...base, name: '  ', first_message: '' });
    expect(codes(issues)).toEqual(['error:name-required', 'error:greeting-required']);
    expect(chubPreflightHasErrors(issues)).toBe(true);
  });

  it('requires three tags for listed public characters only', () => {
    expect(codes(runChubPreflight({ ...base, tags: ['OC', 'SFW'] }))).toEqual(['error:tags-required']);
    // Unlisted characters are intentionally exempt — Chub hides them from search anyway.
    expect(codes(runChubPreflight({ ...base, tags: ['OC'], is_unlisted: true }))).toEqual([]);
    expect(codes(runChubPreflight({ ...base, tags: ['OC'], is_public: false, is_unlisted: true }))).toEqual([]);
  });

  it('warns about empty content sections and missing macros', () => {
    const issues = runChubPreflight({
      ...base,
      personality: '',
      description: '',
      example_dialogs: '',
      first_message: 'Just a bare greeting.',
    });
    expect(codes(issues)).toEqual([
      'warning:empty-personality',
      'warning:empty-creator-notes',
      'warning:empty-example-dialogs',
      'warning:macro-missing',
    ]);
    expect(chubPreflightHasErrors(issues)).toBe(false);
  });

  it('flags alternates missing the <START> marker', () => {
    const issues = runChubPreflight({ ...base, alternate_greetings: ['Second wave'] });
    expect(codes(issues)).toEqual(['warning:alternate-start-marker']);
  });
});
