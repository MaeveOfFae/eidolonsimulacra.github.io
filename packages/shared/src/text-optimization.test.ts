import { describe, expect, it } from 'vitest';
import { buildOptimizeTextMessages, estimateTextStats, estimateTokenCount } from './text-optimization';

describe('text optimization helpers', () => {
  it('estimates text stats consistently', () => {
    const stats = estimateTextStats('alpha beta gamma');

    expect(stats.characters).toBe(16);
    expect(stats.words).toBe(3);
    expect(stats.estimatedTokens).toBe(4);
  });

  it('returns zero tokens for empty text', () => {
    expect(estimateTokenCount('   ')).toBe(0);
  });

  it('builds an optimization prompt that preserves relevant data and clamps the target range', () => {
    const messages = buildOptimizeTextMessages({
      text: 'Keep every requirement, shorten every sentence.',
      target_reduction: 200,
      preserve_format: true,
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe('system');
    expect(messages[0]?.content).toContain('Do not delete relevant facts');
    expect(messages[0]?.content).toContain('Preserve the original structure');
    expect(messages[1]?.content).toContain('Target reduction: about 80% fewer tokens');
    expect(messages[1]?.content).toContain('Text to optimize:');
  });

  it('allows light reformatting when preserve_format is false and uses the default target', () => {
    const messages = buildOptimizeTextMessages({
      text: 'Condense this text.',
      preserve_format: false,
    });

    expect(messages[0]?.content).toContain('You may lightly normalize formatting');
    expect(messages[1]?.content).toContain('Target reduction: about 25% fewer tokens');
  });
});