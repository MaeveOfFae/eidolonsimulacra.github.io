import type { ChatMessage, OptimizeTextRequest } from './types';

export interface TextOptimizationStats {
  characters: number;
  words: number;
  estimatedTokens: number;
}

export function estimateTextStats(text: string): TextOptimizationStats {
  const normalized = typeof text === 'string' ? text : '';
  const trimmed = normalized.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;

  return {
    characters: normalized.length,
    words,
    estimatedTokens: estimateTokenCount(normalized),
  };
}

export function estimateTokenCount(text: string): number {
  const normalized = typeof text === 'string' ? text : '';
  const trimmed = normalized.trim();
  if (!trimmed) {
    return 0;
  }

  // Lightweight approximation suitable for relative before/after comparisons.
  return Math.max(1, Math.ceil(trimmed.length / 4));
}

export function buildOptimizeTextMessages(request: OptimizeTextRequest): ChatMessage[] {
  const preserveFormat = request.preserve_format !== false;
  const targetReduction = Number.isFinite(request.target_reduction)
    ? Math.min(Math.max(Math.round(request.target_reduction as number), 5), 80)
    : 25;

  const systemPrompt = [
    'You optimize text for lower token usage without removing relevant information.',
    'Your job is compression by shortening, tightening, deduplicating, and removing bloat only.',
    'Do not delete relevant facts, requirements, constraints, names, relationships, instructions, or semantic content.',
    'Do not summarize away meaning.',
    'Do not add new information.',
    preserveFormat
      ? 'Preserve the original structure and formatting style as closely as possible unless shorter phrasing requires minimal cleanup.'
      : 'You may lightly normalize formatting when it helps shorten the text.',
    'Prefer shorter wording, denser sentences, fewer repeated qualifiers, and less throat-clearing language.',
    'If a phrase can be made shorter without losing meaning, shorten it.',
    'Return only the optimized text with no commentary, labels, bullets about what changed, or code fences.',
  ].join(' ');

  const userPrompt = [
    `Target reduction: about ${targetReduction}% fewer tokens if achievable without losing relevant data.`,
    preserveFormat ? 'Preserve formatting where practical.' : 'Formatting may be normalized if needed.',
    '',
    'Text to optimize:',
    request.text,
  ].join('\n');

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}
