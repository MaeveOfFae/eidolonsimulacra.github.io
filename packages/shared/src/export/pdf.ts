/**
 * Minimal, dependency-free PDF writer for text exports.
 *
 * Emits a PDF 1.4 document using the base-14 Helvetica faces, which every reader
 * ships. Text is sanitised to the WinAnsi range (U+0020..U+00FF) because the
 * base-14 fonts cannot render anything outside it without an embedded font.
 *
 * Deliberately small: no images, no links, no embedded fonts, one column.
 */

const PAGE_WIDTH = 595.28; // A4, in PDF points
const PAGE_HEIGHT = 841.89;
const MARGIN = 54;
const TOP_Y = PAGE_HEIGHT - MARGIN;
const BOTTOM_Y = MARGIN;

const BODY_SIZE = 10.5;
const HEADING_SIZE = 14;
const LINE_HEIGHT = 15;
const AVERAGE_GLYPH_EM = 0.5; // rough Helvetica average advance, in em

export interface PdfSection {
  heading: string;
  body: string;
}

export interface TextPdfOptions {
  title: string;
  subtitle?: string;
  sections: PdfSection[];
  generatedAt?: string;
}

type PdfFont = 'F1' | 'F2';

interface PdfLine {
  text: string;
  font: PdfFont;
  size: number;
}

/** Characters outside WinAnsi that are common in prose, mapped to safe stand-ins. */
const FALLBACK_GLYPHS: Record<string, string> = {
  '\u2018': "'",
  '\u2019': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u2013': '-',
  '\u2014': '--',
  '\u2026': '...',
  '\u00A0': ' ',
  '\u2022': '-',
};

function sanitizeText(value: string): string {
  let out = '';

  for (const char of value) {
    const fallback = FALLBACK_GLYPHS[char];
    if (fallback !== undefined) {
      out += fallback;
      continue;
    }

    const code = char.codePointAt(0) ?? 63;
    // Keep the printable WinAnsi range; replace anything else with '?'.
    out += code >= 32 && code <= 255 ? char : '?';
  }

  // Tabs and stray carriage returns would break the text matrix.
  return out.replace(/\t/g, '    ').replace(/\r/g, '');
}

function escapePdfString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function maxCharsFor(size: number): number {
  return Math.max(1, Math.floor((PAGE_WIDTH - MARGIN * 2) / (AVERAGE_GLYPH_EM * size)));
}

/** Greedy word wrap with a hard break for tokens longer than the line. */
function wrapLine(value: string, size: number): string[] {
  const limit = maxCharsFor(size);
  const lines: string[] = [];

  for (const paragraph of value.split('\n')) {
    const words = paragraph.split(/\s+/).filter((word) => word.length > 0);

    if (words.length === 0) {
      lines.push('');
      continue;
    }

    let current = '';

    for (const word of words) {
      const candidate = current.length === 0 ? word : `${current} ${word}`;

      if (candidate.length <= limit) {
        current = candidate;
        continue;
      }

      if (current.length > 0) {
        lines.push(current);
        current = '';
      }

      let remainder = word;
      while (remainder.length > limit) {
        lines.push(remainder.slice(0, limit));
        remainder = remainder.slice(limit);
      }

      current = remainder;
    }

    lines.push(current);
  }

  return lines.length > 0 ? lines : [''];
}

function toLines(options: TextPdfOptions): PdfLine[] {
  const lines: PdfLine[] = [];
  const heading = (text: string) => lines.push({ text: sanitizeText(text), font: 'F2', size: HEADING_SIZE });
  const body = (text: string, size = BODY_SIZE) => {
    for (const line of wrapLine(sanitizeText(text), size)) {
      lines.push({ text: line, font: 'F1', size });
    }
  };

  heading(options.title);
  if (options.subtitle) {
    body(options.subtitle);
  }
  if (options.generatedAt) {
    body(`Generated ${options.generatedAt}`);
  }

  for (const section of options.sections) {
    lines.push({ text: '', font: 'F1', size: BODY_SIZE });
    heading(section.heading);
    body(section.body);
  }

  return lines;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function buildContentStream(lines: PdfLine[]): string {
  const parts: string[] = [];

  lines.forEach((line, index) => {
    if (line.text.length === 0) {
      return;
    }

    const y = TOP_Y - (index + 1) * LINE_HEIGHT;
    parts.push(
      `BT\n/${line.font} ${formatNumber(line.size)} Tf\n${formatNumber(MARGIN)} ${formatNumber(y)} Td\n(${escapePdfString(line.text)}) Tj\nET`,
    );
  });

  return parts.join('\n');
}

function encodeLatin1(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length);

  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }

  return bytes;
}

/**
 * Build a single-column text PDF.
 *
 * Every character is one byte after sanitising, so string offsets double as the
 * byte offsets the cross-reference table needs.
 */
export function buildTextPdfDocument(options: TextPdfOptions): Uint8Array {
  const lines = toLines(options);
  const linesPerPage = Math.max(1, Math.floor((TOP_Y - BOTTOM_Y) / LINE_HEIGHT));
  const pages: PdfLine[][] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  if (pages.length === 0) {
    pages.push([]);
  }

  const catalogObject = 1;
  const pagesObject = 2;
  const bodyFontObject = 3;
  const headingFontObject = 4;
  const contentObjectStart = 5;
  const pageObjectStart = contentObjectStart + pages.length;

  const objects: string[] = [];
  const kids = pages.map((_, index) => `${pageObjectStart + index} 0 R`).join(' ');

  objects.push(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);
  objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  pages.forEach((pageLines, index) => {
    const stream = buildContentStream(pageLines);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);

    objects.push(
      `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${formatNumber(PAGE_WIDTH)} ${formatNumber(PAGE_HEIGHT)}]` +
        ` /Resources << /Font << /F1 ${bodyFontObject} 0 R /F2 ${headingFontObject} 0 R >> >>` +
        ` /Contents ${contentObjectStart + index} 0 R >>`,
    );
  });

  let file = '%PDF-1.4\n';
  const offsets: number[] = [];

  objects.forEach((body, index) => {
    offsets.push(file.length);
    file += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = file.length;
  file += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (const offset of offsets) {
    file += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  file += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return encodeLatin1(file);
}
