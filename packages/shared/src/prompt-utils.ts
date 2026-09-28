import type { Template } from './types';

type JsonPromptValue = null | boolean | number | string | JsonPromptValue[] | { [key: string]: JsonPromptValue };

const REASONING_TAG_PATTERN = /<(think|thinking|reasoning|analysis)\b[^>]*>[\s\S]*?<\/\1>/gi;
const DANGLING_REASONING_TAG_PATTERN = /<(think|thinking|reasoning|analysis)\b[^>]*>[\s\S]*$/i;
const REASONING_TAG_ONLY_PATTERN = /<\/?(think|thinking|reasoning|analysis)\b[^>]*>/gi;
const TRAILING_TAG_FRAGMENT_PATTERN = /<[^>\n]*$/;

export interface AssetContextOptions {
  rawTextCharLimit?: number;
  rawTextLineLimit?: number;
  jsonInstruction?: string;
}

function normalizeJsonScalar(value: null | boolean | number | string): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return null;
    }

    return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized;
  }

  return String(value);
}

function isJsonRecord(value: JsonPromptValue): value is { [key: string]: JsonPromptValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectJsonContextLines(value: JsonPromptValue, path: string, lines: string[], depth: number = 0): void {
  if (lines.length >= 60 || depth > 4) {
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return;
    }

    const scalarValues = value
      .map((entry) =>
        entry === null || typeof entry === 'boolean' || typeof entry === 'number' || typeof entry === 'string'
          ? normalizeJsonScalar(entry)
          : null,
      )
      .filter((entry): entry is string => Boolean(entry));

    if (scalarValues.length === value.length) {
      lines.push(`- ${path}: ${scalarValues.slice(0, 8).join(', ')}`);
      if (value.length > 8) {
        lines.push(`- ${path}: (${value.length - 8} more values omitted)`);
      }
      return;
    }

    value.slice(0, 3).forEach((entry, index) => {
      collectJsonContextLines(entry, `${path}[${index}]`, lines, depth + 1);
    });

    if (value.length > 3) {
      lines.push(`- ${path}: (${value.length - 3} more items omitted)`);
    }
    return;
  }

  if (isJsonRecord(value)) {
    const entries = Object.entries(value);
    entries.slice(0, 15).forEach(([key, entryValue]) => {
      const nextPath = path ? `${path}.${key}` : key;
      collectJsonContextLines(entryValue, nextPath, lines, depth + 1);
    });

    if (entries.length > 15 && lines.length < 60) {
      lines.push(`- ${path || 'root'}: (${entries.length - 15} more fields omitted)`);
    }
    return;
  }

  const normalized = normalizeJsonScalar(value);
  if (!normalized) {
    return;
  }

  lines.push(`- ${path}: ${normalized}`);
}

function truncateRawText(content: string, options: AssetContextOptions): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return '';
  }

  const lineLimit = options.rawTextLineLimit;
  const charLimit = options.rawTextCharLimit;

  if (!lineLimit && !charLimit) {
    return content;
  }

  const allLines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  const selectedLines = typeof lineLimit === 'number' ? allLines.slice(0, lineLimit) : allLines;
  const compact = selectedLines.join('\n');

  if (typeof charLimit !== 'number') {
    return compact;
  }

  if (compact.length <= charLimit && (!lineLimit || allLines.length <= lineLimit)) {
    return compact;
  }

  const truncated = compact.slice(0, charLimit).trimEnd();
  return `${truncated}\n[truncated for context]`;
}

export function unwrapSingleCodeFence(content: string): string {
  const trimmed = content.trim();
  const match = trimmed.match(/^```[^\r\n]*\r?\n([\s\S]*?)\r?\n```$/);

  if (!match) {
    return trimmed;
  }

  return match[1]?.trim() ?? '';
}

export function stripReasoningArtifacts(content: string): string {
  return content
    .replace(REASONING_TAG_PATTERN, '')
    .replace(DANGLING_REASONING_TAG_PATTERN, '')
    .replace(REASONING_TAG_ONLY_PATTERN, '')
    .replace(TRAILING_TAG_FRAGMENT_PATTERN, '');
}

export function buildAssetContextLines(
  heading: string,
  assetName: string,
  assetContent: string,
  options: AssetContextOptions = {},
): string[] {
  const structuredHeading = heading.endsWith(':') ? heading.slice(0, -1) : heading;
  const trimmed = assetContent.trim();

  if (!trimmed) {
    return [heading, '```', '', '```', ''];
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as JsonPromptValue;
      const structuredLines: string[] = [];
      collectJsonContextLines(parsed, '', structuredLines);

      if (structuredLines.length > 0) {
        return [
          `${structuredHeading} (structured JSON context):`,
          options.jsonInstruction || 'Use the extracted fields below. Do not assume access to any external file.',
          ...structuredLines,
          '',
        ];
      }
    } catch {
      // Fall back to raw text output below.
    }
  }

  const rawContent = truncateRawText(assetContent, options);
  return [heading, '```', rawContent, '```', ''];
}

export function buildAssetContextBlock(
  assetName: string,
  assetContent: string,
  options: AssetContextOptions = {},
): string {
  return buildAssetContextLines(`### ${assetName}`, assetName, assetContent, options).join('\n').trimEnd();
}

export function selectRelevantPriorAssets(
  template: Template | undefined,
  assetName: string,
  priorAssets: Record<string, string>,
): Record<string, string> {
  if (!template || Object.keys(priorAssets).length === 0) {
    return priorAssets;
  }

  const targetAsset = template.assets.find((asset) => asset.name === assetName);
  if (!targetAsset || targetAsset.depends_on.length === 0) {
    return {};
  }

  const assetsByName = new Map(template.assets.map((asset) => [asset.name, asset] as const));
  const requiredDependencies = new Set<string>();

  const visitDependency = (dependencyName: string) => {
    if (requiredDependencies.has(dependencyName)) {
      return;
    }

    requiredDependencies.add(dependencyName);
    assetsByName.get(dependencyName)?.depends_on.forEach(visitDependency);
  };

  targetAsset.depends_on.forEach(visitDependency);

  return Object.fromEntries(Object.entries(priorAssets).filter(([priorName]) => requiredDependencies.has(priorName)));
}
