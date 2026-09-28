import { validateAssetContent } from '@char-gen/shared';

describe('validateAssetContent placeholder detection', () => {
  it('flags generic single-brace placeholders in creator notes', () => {
    expect(validateAssetContent('creator_notes', '# {CHARACTER NAME}\n\n## {SHORT DESCRIPTION}')).toContain(
      'Generic {...} placeholder',
    );
  });

  it('flags bracket placeholders in character sheets', () => {
    expect(validateAssetContent('character_sheet', 'name: [Character Name]\nage: [Age]')).toContain(
      'Character sheet bracket placeholders',
    );
  });

  it('flags unresolved A1111 slots', () => {
    expect(validateAssetContent('a1111', '[Subject: ((subject tags...)), solo]')).toContain(
      'A1111 any slot ((...something...)) left',
    );
  });

  it('does not flag normal {{user}} references by themselves', () => {
    expect(validateAssetContent('system_prompt', 'Address {{user}} directly and keep the tone clipped.')).toEqual([]);
  });
});
