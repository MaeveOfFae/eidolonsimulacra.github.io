/**
 * Minimal markdown reader for the mobile info screens.
 *
 * The shared legal documents are markdown, and the mobile app has no markdown
 * renderer dependency. Rather than add one, this module converts the small
 * subset those documents actually use (headings, paragraphs, bullet and ordered
 * lists, blockquotes, fenced code, rules and GFM tables) into a block list that
 * a themed React Native component renders.
 *
 * Pure on purpose: it runs in the node test environment, so the rendering rules
 * are pinned by tests instead of eyeballed on a device.
 */

export type MarkdownInline =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'code'; text: string };

export interface MarkdownListItem {
  spans: MarkdownInline[];
}

export type MarkdownBlock =
  | { kind: 'heading'; level: number; spans: MarkdownInline[] }
  | { kind: 'paragraph'; spans: MarkdownInline[] }
  | { kind: 'list'; ordered: boolean; items: MarkdownListItem[] }
  | { kind: 'quote'; spans: MarkdownInline[] }
  | { kind: 'code'; text: string }
  | { kind: 'rule' }
  | { kind: 'table'; header: string[]; rows: string[][] };

const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const BULLET_PATTERN = /^\s*[-*+]\s+(.*)$/;
const ORDERED_PATTERN = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE_PATTERN = /^>\s?(.*)$/;
const RULE_PATTERN = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const FENCE_PATTERN = /^\s*```/;
const TABLE_DIVIDER_PATTERN = /^\s*\|?[\s:|-]+\|[\s:|-]*$/;

/** `**bold**`, `__bold__` and `` `code` `` are the only inline marks the docs use. */
export function parseInline(text: string): MarkdownInline[] {
  const spans: MarkdownInline[] = [];
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/g;
  let lastIndex = 0;

  for (let match = pattern.exec(text); match !== null; match = pattern.exec(text)) {
    if (match.index > lastIndex) {
      spans.push({ kind: 'text', text: text.slice(lastIndex, match.index) });
    }

    const token = match[0];
    if (token.startsWith('`')) {
      spans.push({ kind: 'code', text: token.slice(1, -1) });
    } else {
      spans.push({ kind: 'strong', text: token.slice(2, -2) });
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    spans.push({ kind: 'text', text: text.slice(lastIndex) });
  }

  return spans.length > 0 ? spans : [{ kind: 'text', text }];
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableStart(lines: readonly string[], index: number): boolean {
  const header = lines[index];
  const divider = lines[index + 1];

  if (!header || !divider) {
    return false;
  }

  return header.includes('|') && TABLE_DIVIDER_PATTERN.test(divider) && divider.includes('-');
}

export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (line.trim().length === 0) {
      index += 1;
      continue;
    }

    if (FENCE_PATTERN.test(line)) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !FENCE_PATTERN.test(lines[index] ?? '')) {
        codeLines.push(lines[index] ?? '');
        index += 1;
      }

      index += 1;
      blocks.push({ kind: 'code', text: codeLines.join('\n') });
      continue;
    }

    if (RULE_PATTERN.test(line)) {
      blocks.push({ kind: 'rule' });
      index += 1;
      continue;
    }

    const heading = HEADING_PATTERN.exec(line);
    if (heading) {
      blocks.push({
        kind: 'heading',
        level: heading[1]?.length ?? 1,
        spans: parseInline(heading[2] ?? ''),
      });
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const header = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && (lines[index] ?? '').includes('|') && (lines[index] ?? '').trim().length > 0) {
        rows.push(splitTableRow(lines[index] ?? ''));
        index += 1;
      }

      blocks.push({ kind: 'table', header, rows });
      continue;
    }

    const bullet = BULLET_PATTERN.exec(line);
    const ordered = ORDERED_PATTERN.exec(line);
    if (bullet || ordered) {
      const items: MarkdownListItem[] = [];
      const matcher = bullet ? BULLET_PATTERN : ORDERED_PATTERN;

      while (index < lines.length) {
        const itemMatch = matcher.exec(lines[index] ?? '');
        if (!itemMatch) {
          break;
        }

        items.push({ spans: parseInline(itemMatch[1] ?? '') });
        index += 1;
      }

      blocks.push({ kind: 'list', ordered: Boolean(ordered), items });
      continue;
    }

    if (QUOTE_PATTERN.test(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length) {
        const quoteMatch = QUOTE_PATTERN.exec(lines[index] ?? '');
        if (!quoteMatch) {
          break;
        }

        quoteLines.push(quoteMatch[1] ?? '');
        index += 1;
      }

      blocks.push({ kind: 'quote', spans: parseInline(quoteLines.join(' ').trim()) });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const candidate = lines[index] ?? '';
      const isBlockStart =
        candidate.trim().length === 0 ||
        FENCE_PATTERN.test(candidate) ||
        RULE_PATTERN.test(candidate) ||
        HEADING_PATTERN.test(candidate) ||
        BULLET_PATTERN.test(candidate) ||
        ORDERED_PATTERN.test(candidate) ||
        QUOTE_PATTERN.test(candidate) ||
        isTableStart(lines, index);

      if (isBlockStart) {
        break;
      }

      paragraphLines.push(candidate.trim());
      index += 1;
    }

    blocks.push({ kind: 'paragraph', spans: parseInline(paragraphLines.join(' ')) });
  }

  return blocks;
}
