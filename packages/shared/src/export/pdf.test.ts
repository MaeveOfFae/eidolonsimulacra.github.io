import { describe, expect, it } from 'vitest';
import { buildTextPdfDocument } from './pdf';

function decodeLatin1(bytes: Uint8Array): string {
  let out = '';

  for (const byte of bytes) {
    out += String.fromCharCode(byte);
  }

  return out;
}

describe('buildTextPdfDocument', () => {
  it('emits a well-formed single-page document', () => {
    const pdf = buildTextPdfDocument({
      title: 'Vesna Nova',
      subtitle: 'a lonely space pirate',
      sections: [{ heading: 'character_sheet', body: 'A pirate with a past.' }],
    });
    const text = decodeLatin1(pdf);

    expect(pdf).toBeInstanceOf(Uint8Array);
    expect(text.startsWith('%PDF-1.4\n')).toBe(true);
    expect(text.endsWith('%%EOF\n')).toBe(true);
    expect(text).toContain('/Type /Catalog');
    expect(text).toContain('/BaseFont /Helvetica');
    expect(text).toContain('/Count 1');
    expect(text).toContain('(Vesna Nova) Tj');
    expect(text).toContain('(A pirate with a past.) Tj');
  });

  it('writes a cross-reference table whose offsets point at the right objects', () => {
    const text = decodeLatin1(
      buildTextPdfDocument({ title: 'Doc', sections: [{ heading: 'one', body: 'body text' }] }),
    );

    const entries = [...text.matchAll(/^(\d{10}) (\d{5}) ([nf]) $/gm)];
    expect(entries.length).toBeGreaterThan(3);
    expect(entries[0]?.[3]).toBe('f');

    entries.slice(1).forEach((entry, index) => {
      expect(text.startsWith(`${index + 1} 0 obj`, Number(entry[1]))).toBe(true);
    });

    // The startxref offset must land on the xref keyword itself.
    const startxref = Number(/startxref\n(\d+)/.exec(text)?.[1]);
    expect(text.startsWith('xref', startxref)).toBe(true);
  });

  it('escapes parentheses and backslashes', () => {
    const text = decodeLatin1(
      buildTextPdfDocument({ title: 'Title', sections: [{ heading: 'h', body: 'a (b) c \\ d' }] }),
    );

    expect(text).toContain('(a \\(b\\) c \\\\ d) Tj');
  });

  it('replaces characters the base-14 font cannot render', () => {
    const text = decodeLatin1(
      buildTextPdfDocument({
        title: 'Title',
        sections: [{ heading: 'h', body: 'quotes \u2019 and dash \u2014 and cjk \u4e2d' }],
      }),
    );

    expect(text).toContain("quotes ' and dash -- and cjk ?");
  });

  it('paginates long content across multiple pages', () => {
    const text = decodeLatin1(
      buildTextPdfDocument({ title: 'Long', sections: [{ heading: 'body', body: 'word '.repeat(4000) }] }),
    );

    const pageCount = Number(/\/Count (\d+)/.exec(text)?.[1]);
    expect(pageCount).toBeGreaterThan(1);
    expect(text.match(/\/Type \/Page /g)).toHaveLength(pageCount);
  });

  it('declares a stream length that matches the actual stream bytes', () => {
    const text = decodeLatin1(
      buildTextPdfDocument({
        title: 'Lengths',
        sections: [
          { heading: 'one', body: 'first body' },
          { heading: 'two', body: 'second body' },
        ],
      }),
    );

    const streams = [...text.matchAll(/<< \/Length (\d+) >>\nstream\n([\s\S]*?)\nendstream/g)];
    expect(streams.length).toBeGreaterThan(0);

    for (const [, declared, content] of streams) {
      expect(content.length).toBe(Number(declared));
    }
  });

  it('still produces a valid document with no sections', () => {
    const text = decodeLatin1(buildTextPdfDocument({ title: 'Empty', sections: [] }));

    expect(text).toContain('/Count 1');
    expect(text).toContain('(Empty) Tj');
    expect(text).toContain('trailer');
  });
});
