import { describe, expect, it } from 'vitest';
import { codeOfConductDocumentText, licenseDocumentText, securityDocumentText, termsMarkdown } from '@char-gen/shared';
import { parseInline, parseMarkdown, type MarkdownBlock } from './markdown';

function blocksOf(source: string): MarkdownBlock[] {
  return parseMarkdown(source);
}

describe('parseInline', () => {
  it('returns plain text as a single span', () => {
    expect(parseInline('hello world')).toEqual([{ kind: 'text', text: 'hello world' }]);
  });

  it('splits strong and code spans', () => {
    expect(parseInline('a **b** c `d` e')).toEqual([
      { kind: 'text', text: 'a ' },
      { kind: 'strong', text: 'b' },
      { kind: 'text', text: ' c ' },
      { kind: 'code', text: 'd' },
      { kind: 'text', text: ' e' },
    ]);
  });

  it('handles a document line that is only a mark', () => {
    expect(parseInline('**bold**')).toEqual([{ kind: 'strong', text: 'bold' }]);
  });

  it('keeps an empty string renderable instead of returning no spans', () => {
    expect(parseInline('')).toEqual([{ kind: 'text', text: '' }]);
  });
});

describe('parseMarkdown blocks', () => {
  it('reads heading levels', () => {
    expect(blocksOf('# One\n\n### Three')).toEqual([
      { kind: 'heading', level: 1, spans: [{ kind: 'text', text: 'One' }] },
      { kind: 'heading', level: 3, spans: [{ kind: 'text', text: 'Three' }] },
    ]);
  });

  it('joins wrapped paragraph lines into one block', () => {
    expect(blocksOf('first line\nsecond line\n\nnext')).toEqual([
      { kind: 'paragraph', spans: [{ kind: 'text', text: 'first line second line' }] },
      { kind: 'paragraph', spans: [{ kind: 'text', text: 'next' }] },
    ]);
  });

  it('reads bullet lists as one block and ordered lists separately', () => {
    expect(blocksOf('- a\n- b\n\n1. c\n2. d')).toEqual([
      {
        kind: 'list',
        ordered: false,
        items: [{ spans: [{ kind: 'text', text: 'a' }] }, { spans: [{ kind: 'text', text: 'b' }] }],
      },
      {
        kind: 'list',
        ordered: true,
        items: [{ spans: [{ kind: 'text', text: 'c' }] }, { spans: [{ kind: 'text', text: 'd' }] }],
      },
    ]);
  });

  it('reads blockquotes and rules', () => {
    expect(blocksOf('> note one\n> note two\n\n---')).toEqual([
      { kind: 'quote', spans: [{ kind: 'text', text: 'note one note two' }] },
      { kind: 'rule' },
    ]);
  });

  it('reads fenced code without interpreting its contents', () => {
    expect(blocksOf('```\n# not a heading\n- not a list\n```')).toEqual([
      { kind: 'code', text: '# not a heading\n- not a list' },
    ]);
  });

  it('reads a GFM table with header and rows', () => {
    expect(blocksOf('| Version | Supported |\n| --- | --- |\n| 3.1.x | Yes |')).toEqual([
      { kind: 'table', header: ['Version', 'Supported'], rows: [['3.1.x', 'Yes']] },
    ]);
  });

  it('does not treat a paragraph containing a pipe as a table', () => {
    expect(blocksOf('a | b but not a table')).toEqual([
      { kind: 'paragraph', spans: [{ kind: 'text', text: 'a | b but not a table' }] },
    ]);
  });

  it('returns no blocks for an empty or whitespace-only document', () => {
    expect(blocksOf('')).toEqual([]);
    expect(blocksOf('\n\n   \n')).toEqual([]);
  });
});

describe('real shared documents', () => {
  it('parses every shared legal document into renderable blocks', () => {
    const documents = [licenseDocumentText, securityDocumentText, codeOfConductDocumentText, termsMarkdown];

    documents.forEach((document) => {
      const blocks = blocksOf(document);

      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks.some((block) => block.kind === 'paragraph' || block.kind === 'heading')).toBe(true);
    });
  });

  it('never emits an empty heading or paragraph block', () => {
    [licenseDocumentText, securityDocumentText, codeOfConductDocumentText, termsMarkdown].forEach((document) => {
      blocksOf(document).forEach((block) => {
        if (block.kind === 'heading' || block.kind === 'paragraph' || block.kind === 'quote') {
          const text = block.spans
            .map((span) => span.text)
            .join('')
            .trim();
          expect(text.length).toBeGreaterThan(0);
        }

        if (block.kind === 'list') {
          expect(block.items.length).toBeGreaterThan(0);
        }
      });
    });
  });

  it('renders the security policy table as a table', () => {
    const table = blocksOf(securityDocumentText).find((block) => block.kind === 'table');

    expect(table).toBeDefined();
    if (table?.kind === 'table') {
      expect(table.header).toContain('Version');
      expect(table.rows.length).toBeGreaterThan(0);
    }
  });

  it('renders the license as text-only blocks (it has no markdown headings)', () => {
    const blocks = blocksOf(licenseDocumentText);

    expect(blocks.some((block) => block.kind === 'heading')).toBe(false);
    expect(blocks[0]?.kind).toBe('paragraph');
  });
});
