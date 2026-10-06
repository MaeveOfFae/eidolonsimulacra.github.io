/**
 * Danbooru-backed linter for the `a1111` image-prompt asset.
 *
 * The a1111 blueprint (`blueprints/system/a1111.md`) is the only asset that feeds
 * directly into the image pipeline, and until now nothing validated its vocabulary or
 * line contract beyond the shared placeholder sweep. This linter checks:
 *
 *   1. the five-line contract — person / clothes / location / action / anchor, raw
 *      plaintext, comma-separated tags, no fences, labels, or placeholders;
 *   2. the tag vocabulary against the local Danbooru index — canonical, alias
 *      (→ canonical suggestion), deprecated, or unknown (→ near-miss suggestions);
 *   3. the curated pseudo-tag overlay (`pseudo-tags.ts`) that automates the manual
 *      `fiery_redhead → red_hair` class of corrections;
 *   4. line-role heuristics from the blueprint's per-line goals (advisory warnings).
 *
 * Structural violations are `error`; vocabulary and ordering findings are `warning`.
 * `applyA1111TagFixes` applies the mechanical corrections (alias/pseudo/duplicate).
 */

import { isA1111QualityToken, lookupPseudoTagCorrection } from './pseudo-tags';
import { findSimilarTagNames, normalizeBooruTag, resolveBooruTag, type DanbooruTagIndex } from './tag-index';

export const A1111_EXPECTED_LINE_COUNT = 5;

/** The blueprint's line order, 1-based line number → role. */
export const A1111_LINE_ROLES = ['person', 'clothes', 'location', 'action', 'anchor'] as const;
export type A1111LineRole = (typeof A1111_LINE_ROLES)[number];

export type A1111LintSeverity = 'error' | 'warning';

export type A1111LintIssueCode =
  | 'empty-asset'
  | 'line-count'
  | 'empty-line'
  | 'fence'
  | 'control-line'
  | 'placeholder'
  | 'bare-text'
  | 'unknown-tag'
  | 'alias'
  | 'deprecated'
  | 'pseudo-tag'
  | 'duplicate-tag'
  | 'line-order';

export interface A1111LintIssue {
  severity: A1111LintSeverity;
  code: A1111LintIssueCode;
  message: string;
  /** 1-based line number; 0 for asset-wide findings. */
  line: number;
  /** 1-based column of the tag inside its line, when the issue targets one tag. */
  column?: number;
  /** The offending token as written in the asset. */
  tag?: string;
  /** The mechanical replacement for alias / pseudo-tag fixes. */
  suggestion?: string;
  /** Near-miss candidates for unknown tags. */
  suggestions?: string[];
}

export interface A1111LintOptions {
  maxSuggestions?: number;
}

/**
 * Lexicons for the line-role heuristics. Every entry is a canonical Danbooru tag that
 * exists in the bundled core index (pinned by `tag-linter.test.ts`), so a renames or a
 * typo here fails CI instead of silently never matching.
 */
const SUBJECT_TAGS: ReadonlySet<string> = new Set([
  '1girl',
  '1boy',
  '1other',
  '2girls',
  '2boys',
  '3girls',
  '3boys',
  'multiple_girls',
  'multiple_boys',
  'multiple_others',
  'solo',
]);

const CLOTHING_TAGS: ReadonlySet<string> = new Set([
  'armor',
  'belt',
  'bikini',
  'blouse',
  'boots',
  'cape',
  'cloak',
  'coat',
  'corset',
  'dress',
  'frilled_dress',
  'frilled_skirt',
  'gloves',
  'hat',
  'hoodie',
  'jacket',
  'jeans',
  'kimono',
  'necklace',
  'pantyhose',
  'pants',
  'scarf',
  'school_uniform',
  'shorts',
  'skirt',
  'sweater',
  'sweater_vest',
  'swimsuit',
  'thighhighs',
  'uniform',
]);

const LOCATION_TAGS: ReadonlySet<string> = new Set([
  'beach',
  'bedroom',
  'building',
  'city',
  'classroom',
  'day',
  'desert',
  'forest',
  'indoors',
  'mountain',
  'night',
  'ocean',
  'outdoors',
  'rain',
  'scenery',
  'school',
  'sea',
  'snow',
  'street',
  'sunset',
  'sunrise',
  'sky',
  'window',
  'winter',
]);

const POSE_EXPRESSION_TAGS: ReadonlySet<string> = new Set([
  'closed_eyes',
  'crossed_arms',
  'laughing',
  'looking_at_viewer',
  'open_mouth',
  'running',
  'sitting',
  'smile',
  'standing',
  'walking',
  'waving',
]);

const FRAMING_TAGS: ReadonlySet<string> = new Set([
  'blurry_background',
  'close-up',
  'cowboy_shot',
  'depth_of_field',
  'dutch_angle',
  'from_above',
  'from_below',
  'from_side',
  'full_body',
  'lower_body',
  'portrait',
  'upper_body',
  'wide_shot',
]);

/** Placeholder shapes the a1111 contract forbids (aligned with parse-blocks' a1111 rules). */
const A1111_PLACEHOLDER_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/\(\(\.\.\)\)/, 'unfilled ((...)) slot'],
  [/\(\([^)\n]*\.\.\.[^)\n]*\)/, 'unfilled ((...something...)) slot'],
  [/SFW\|NSFW/, 'unresolved SFW|NSFW mode switch'],
  [/\bTAGNAME\b/, 'TAGNAME placeholder'],
];

interface TagToken {
  /** 1-based char offset of the token within its line. */
  start: number;
  raw: string;
  /** Weight syntax stripped, normalized for lookup. */
  normalized: string;
}

/** Strip A1111 emphasis/weight syntax: `((tag))`, `(tag:1.1)`, `[tag:0.9]` → `tag`. */
export function stripTagWeightSyntax(token: string): string {
  let value = token.trim();
  while ((value.startsWith('(') && value.endsWith(')')) || (value.startsWith('[') && value.endsWith(']'))) {
    const inner = value.slice(1, -1).trim();
    if (!inner) {
      break;
    }
    value = inner;
  }
  for (;;) {
    const weighted = value.match(/^(.*):(-?\d+(?:\.\d+)?)$/);
    if (!weighted || !weighted[1]) {
      break;
    }
    value = weighted[1].trim();
  }
  return normalizeBooruTag(value);
}

/** Split one prompt line into comma-separated tag tokens with their offsets. */
export function splitTagTokens(line: string): TagToken[] {
  const tokens: TagToken[] = [];
  let offset = 0;
  for (const part of line.split(',')) {
    const leading = part.length - part.trimStart().length;
    const raw = part.trim();
    if (raw.length > 0) {
      tokens.push({
        start: offset + leading + 1,
        raw,
        normalized: stripTagWeightSyntax(raw),
      });
    }
    offset += part.length + 1;
  }
  return tokens;
}

export function lintA1111Tags(
  content: string,
  index: DanbooruTagIndex,
  options: A1111LintOptions = {},
): A1111LintIssue[] {
  const issues: A1111LintIssue[] = [];
  const maxSuggestions = options.maxSuggestions ?? 3;
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return [{ severity: 'error', code: 'empty-asset', message: 'The a1111 asset is empty.', line: 0 }];
  }

  const rawLines = content.replace(/\r\n?/g, '\n').split('\n');
  const nonEmptyLineNumbers: number[] = [];
  rawLines.forEach((line, position) => {
    if (line.trim().length === 0) {
      return;
    }
    nonEmptyLineNumbers.push(position + 1);
  });

  if (nonEmptyLineNumbers.length !== A1111_EXPECTED_LINE_COUNT) {
    issues.push({
      severity: 'error',
      code: 'line-count',
      line: nonEmptyLineNumbers[0] ?? 1,
      message: `Expected exactly ${A1111_EXPECTED_LINE_COUNT} prompt lines (person, clothes, location, action, anchor); found ${nonEmptyLineNumbers.length}.`,
    });
  }

  const seenNormalized = new Map<string, { line: number; column: number }>();
  const roleReady = nonEmptyLineNumbers.length === A1111_EXPECTED_LINE_COUNT;

  for (const lineNumber of nonEmptyLineNumbers) {
    const line = rawLines[lineNumber - 1]!.trim();
    const roleIndex = nonEmptyLineNumbers.indexOf(lineNumber);
    const role = roleReady && roleIndex >= 0 ? A1111_LINE_ROLES[roleIndex] : undefined;

    for (const [pattern, description] of A1111_PLACEHOLDER_PATTERNS) {
      if (pattern.test(line)) {
        issues.push({
          severity: 'error',
          code: 'placeholder',
          line: lineNumber,
          message: `Unresolved placeholder: ${description}.`,
        });
      }
    }

    if (line.startsWith('```')) {
      issues.push({
        severity: 'error',
        code: 'fence',
        line: lineNumber,
        message: 'Code fences are not part of the a1111 contract; return raw plaintext lines only.',
      });
      continue;
    }
    if (/^\[[^\]\n]*\]/.test(line)) {
      issues.push({
        severity: 'error',
        code: 'control-line',
        line: lineNumber,
        message: 'Bracketed control/metadata lines ([Control], [Subject: …]) are not part of the a1111 contract.',
      });
      continue;
    }
    if (/^[A-Za-z][A-Za-z ]{2,}:$/.test(line)) {
      issues.push({
        severity: 'error',
        code: 'control-line',
        line: lineNumber,
        message: 'Section labels are not part of the a1111 contract; lines must be comma-separated tags only.',
      });
      continue;
    }

    issues.push(...lintLineTokens(line, lineNumber, role, index, seenNormalized, maxSuggestions));
  }

  issues.push(...lintLineRoles(rawLines, nonEmptyLineNumbers, roleReady));
  return issues;
}

function lintLineTokens(
  line: string,
  lineNumber: number,
  role: A1111LineRole | undefined,
  index: DanbooruTagIndex,
  seenNormalized: Map<string, { line: number; column: number }>,
  maxSuggestions: number,
): A1111LintIssue[] {
  const issues: A1111LintIssue[] = [];
  const tokens = splitTagTokens(line);
  if (tokens.length === 0) {
    return issues;
  }

  for (const token of tokens) {
    if (/\b\w+\s+\w+\s+\w+\s+\w+\b/.test(token.raw)) {
      issues.push({
        severity: 'warning',
        code: 'bare-text',
        line: lineNumber,
        column: token.start,
        tag: token.raw,
        message: `"${token.raw}" reads as prose, not a tag; the contract wants compact comma-separated visual tags.`,
      });
    }

    const normalized = token.normalized;
    if (!normalized) {
      continue;
    }

    const previous = seenNormalized.get(normalized);
    if (previous) {
      issues.push({
        severity: 'warning',
        code: 'duplicate-tag',
        line: lineNumber,
        column: token.start,
        tag: token.raw,
        message: `"${token.raw}" already appears on line ${previous.line}; drop the duplicate.`,
      });
    } else {
      seenNormalized.set(normalized, { line: lineNumber, column: token.start });
    }

    if (isA1111QualityToken(normalized)) {
      if (role !== 'anchor') {
        issues.push({
          severity: 'warning',
          code: 'line-order',
          line: lineNumber,
          column: token.start,
          tag: token.raw,
          message: `Style/quality token "${token.raw}" belongs on the anchor line (5), not the ${role ?? 'prompt'} line.`,
        });
      }
      continue;
    }

    const pseudoCorrection = lookupPseudoTagCorrection(normalized);
    if (pseudoCorrection) {
      issues.push({
        severity: 'warning',
        code: 'pseudo-tag',
        line: lineNumber,
        column: token.start,
        tag: token.raw,
        suggestion: pseudoCorrection,
        message: `"${token.raw}" is an invented pseudo-tag; Danbooru's term is "${pseudoCorrection}".`,
      });
      continue;
    }

    const resolution = resolveBooruTag(index, normalized);
    if (resolution.status === 'alias' && resolution.canonical) {
      issues.push({
        severity: 'warning',
        code: 'alias',
        line: lineNumber,
        column: token.start,
        tag: token.raw,
        suggestion: resolution.canonical,
        message: `"${token.raw}" is a Danbooru alias; the canonical tag is "${resolution.canonical}".`,
      });
    } else if (resolution.status === 'unknown') {
      const suggestions = findSimilarTagNames(index, normalized, { limit: maxSuggestions });
      issues.push({
        severity: 'warning',
        code: 'unknown-tag',
        line: lineNumber,
        column: token.start,
        tag: token.raw,
        ...(suggestions.length > 0 ? { suggestions } : {}),
        message:
          suggestions.length > 0
            ? `"${token.raw}" is not a Danbooru tag; did you mean ${suggestions.map((suggestion) => `"${suggestion}"`).join(', ')}?`
            : `"${token.raw}" is not a Danbooru tag; replace it with a simpler common visual tag.`,
      });
    } else if (resolution.entry?.deprecated) {
      issues.push({
        severity: 'warning',
        code: 'deprecated',
        line: lineNumber,
        column: token.start,
        tag: token.raw,
        message: `"${token.raw}" is deprecated on Danbooru; prefer its replacement.`,
      });
    }
  }

  return issues;
}

/**
 * Advisory ordering checks from the blueprint's per-line goals. Only meaningful when the
 * asset actually has the five expected lines; every finding is a warning.
 */
function lintLineRoles(rawLines: string[], nonEmptyLineNumbers: number[], roleReady: boolean): A1111LintIssue[] {
  const issues: A1111LintIssue[] = [];
  if (!roleReady) {
    return issues;
  }

  const lines = nonEmptyLineNumbers.map((lineNumber) => rawLines[lineNumber - 1]!.trim());
  const tokensPerLine = lines.map((line) => splitTagTokens(line));
  const normalizedPerLine = tokensPerLine.map((tokens) => tokens.map((token) => token.normalized));

  if (!normalizedPerLine[0]!.some((tag) => SUBJECT_TAGS.has(tag))) {
    issues.push({
      severity: 'warning',
      code: 'line-order',
      line: nonEmptyLineNumbers[0]!,
      message: 'The person line (1) has no subject tag such as 1girl, 1boy, solo, or multiple_girls.',
    });
  }
  if (!normalizedPerLine[1]!.some((tag) => CLOTHING_TAGS.has(tag))) {
    issues.push({
      severity: 'warning',
      code: 'line-order',
      line: nonEmptyLineNumbers[1]!,
      message: 'The clothes line (2) has no clothing tag (dress, uniform, boots, armour, …).',
    });
  }
  if (!normalizedPerLine[2]!.some((tag) => LOCATION_TAGS.has(tag))) {
    issues.push({
      severity: 'warning',
      code: 'line-order',
      line: nonEmptyLineNumbers[2]!,
      message: 'The location line (3) has no environment tag (indoors, street, night, scenery, …).',
    });
  }
  if (!normalizedPerLine.some((tags) => tags.some((tag) => POSE_EXPRESSION_TAGS.has(tag)))) {
    issues.push({
      severity: 'warning',
      code: 'line-order',
      line: nonEmptyLineNumbers[3]!,
      message: 'The action line (4) has no pose or expression tag (standing, sitting, smile, …).',
    });
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    for (const token of tokensPerLine[lineIndex]!) {
      const normalized = token.normalized;
      if (CLOTHING_TAGS.has(normalized) && lineIndex !== 1) {
        issues.push({
          severity: 'warning',
          code: 'line-order',
          line: nonEmptyLineNumbers[lineIndex]!,
          column: token.start,
          tag: token.raw,
          message: `Clothing tag "${token.raw}" belongs on the clothes line (2).`,
        });
      }
      if (LOCATION_TAGS.has(normalized) && lineIndex !== 2) {
        issues.push({
          severity: 'warning',
          code: 'line-order',
          line: nonEmptyLineNumbers[lineIndex]!,
          column: token.start,
          tag: token.raw,
          message: `Location tag "${token.raw}" belongs on the location line (3).`,
        });
      }
      if (FRAMING_TAGS.has(normalized) && lineIndex !== 4) {
        issues.push({
          severity: 'warning',
          code: 'line-order',
          line: nonEmptyLineNumbers[lineIndex]!,
          column: token.start,
          tag: token.raw,
          message: `Framing tag "${token.raw}" belongs on the anchor line (5).`,
        });
      }
    }
  }

  // The blueprint asks for scene-category tags at the very end of the anchor line.
  const anchorTokens = tokensPerLine[4]!;
  const framingOnAnchor = anchorTokens.filter((token) => FRAMING_TAGS.has(token.normalized));
  const lastAnchorToken = anchorTokens[anchorTokens.length - 1]!;
  if (framingOnAnchor.length > 0 && !FRAMING_TAGS.has(lastAnchorToken.normalized)) {
    issues.push({
      severity: 'warning',
      code: 'line-order',
      line: nonEmptyLineNumbers[4]!,
      message: 'Scene-category/framing tags should sit at the very end of the anchor line (5).',
    });
  }

  return issues;
}

const FIXABLE_CODES: ReadonlySet<A1111LintIssueCode> = new Set(['alias', 'pseudo-tag', 'duplicate-tag']);

export interface A1111TagFixResult {
  content: string;
  /** The issues whose fix was applied, in order. */
  applied: A1111LintIssue[];
}

/**
 * Apply the mechanical corrections (alias → canonical, pseudo-tag → canonical, drop
 * duplicate tags), preserving the line layout. Tokens are re-joined with ", "; weighted
 * spellings are kept as written except for corrected tokens themselves.
 */
export function applyA1111TagFixes(content: string, issues: A1111LintIssue[]): A1111TagFixResult {
  const applied: A1111LintIssue[] = [];
  const replacements = new Map<string, string>();
  const duplicateColumns = new Set<string>();

  for (const issue of issues) {
    if (!FIXABLE_CODES.has(issue.code) || !issue.line) {
      continue;
    }
    if (issue.code === 'duplicate-tag') {
      duplicateColumns.add(`${issue.line}:${issue.column ?? 0}`);
      applied.push(issue);
      continue;
    }
    if (issue.tag && issue.suggestion) {
      replacements.set(stripTagWeightSyntax(issue.tag), issue.suggestion);
      applied.push(issue);
    }
  }

  if (applied.length === 0) {
    return { content, applied };
  }

  const rawLines = content.replace(/\r\n?/g, '\n').split('\n');
  const rebuiltLines = rawLines.map((line, position) => {
    const lineNumber = position + 1;
    if (line.trim().length === 0) {
      return line;
    }

    const kept: string[] = [];
    const seen = new Set<string>();
    for (const token of splitTagTokens(line)) {
      if (duplicateColumns.has(`${lineNumber}:${token.start}`)) {
        continue;
      }
      const replacement = replacements.get(token.normalized);
      const value = replacement ?? token.raw;
      const dedupeKey = replacement ?? token.normalized;
      if (seen.has(dedupeKey)) {
        continue;
      }
      seen.add(dedupeKey);
      kept.push(value);
    }
    return kept.join(', ');
  });

  return { content: rebuiltLines.join('\n'), applied };
}
