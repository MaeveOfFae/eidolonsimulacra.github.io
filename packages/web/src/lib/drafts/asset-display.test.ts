import { formatAssetLabel, summarizeText } from './asset-display';

describe('formatAssetLabel', () => {
  it('turns an internal asset key into a readable label', () => {
    expect(formatAssetLabel('intro_scene')).toBe('intro scene');
  });

  it('leaves an already readable name alone', () => {
    expect(formatAssetLabel('speech')).toBe('speech');
  });
});

describe('summarizeText', () => {
  it('collapses whitespace and keeps short content intact', () => {
    expect(summarizeText('  a\n  b  ')).toBe('a b');
  });

  it('truncates long content to the default limit with an ellipsis', () => {
    const summarized = summarizeText('x'.repeat(200));

    expect(summarized).toHaveLength(120);
    expect(summarized.endsWith('...')).toBe(true);
  });

  it('honours a caller-supplied limit', () => {
    // The review cards ask for 180 characters; the comparison panes ask for 140.
    expect(summarizeText('y'.repeat(50), 20)).toHaveLength(20);
    expect(summarizeText('z'.repeat(500), 180)).toHaveLength(180);
  });
});
