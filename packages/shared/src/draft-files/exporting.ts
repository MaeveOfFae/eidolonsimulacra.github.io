/**
 * The exporters: resolving a draft into a portable artifact (JSON, PNG card, Chub-compatible card, markdown bundle, PDF) and the library bundle.
 *
 * Split out of `draft-files.ts`, which is now a barrel over these modules.
 */
import { inferCharacterDisplayNameFromAssets } from '../parse/parse-blocks';
import { buildPngCardBytes, parseEmbeddedPngBytes } from '../png-card';
import { buildTextPdfDocument } from '../export/pdf';
import { normalizeAssetRecord } from '../templates';
import type { CharacterCardMetadata, Draft, ExportFormat } from '../types';
import { mergeCardMetadata, normalizeCardMetadata, slugifyCardPathSegment } from './normalizers';
import { escapeAssetContentForMarkdownBundle } from './importing';

export interface DraftExportArtifact {
  content: string | Uint8Array;
  contentType: string;
  extension: 'json' | 'txt' | 'md' | 'png' | 'pdf';
}

export function trimDraftText(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildMesExample(postHistory: string | undefined): string | undefined {
  const trimmed = trimDraftText(postHistory);
  if (!trimmed) {
    return undefined;
  }

  return trimmed.startsWith('<START>') ? trimmed : `<START>\n${trimmed}`;
}

export function parseJsonObjectAsset(raw: string | undefined): Record<string, unknown> | undefined {
  const trimmed = trimDraftText(raw);
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Ignore malformed optional metadata assets.
  }

  return undefined;
}

export function withOriginalPrefix(value: string | undefined): string {
  const trimmed = trimDraftText(value);
  if (!trimmed) {
    return '';
  }

  return trimmed.startsWith('{{original}}') ? trimmed : `{{original}}\n${trimmed}`;
}

export function tryParseStringArray(raw: string | undefined): string[] {
  const trimmed = trimDraftText(raw);
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    }
  } catch {
    // Fall through to plain-text fallback.
  }

  return [trimmed];
}

export function getPortableDraftAssets(draft: Draft): Record<string, string> {
  const normalizedAssets = normalizeAssetRecord(draft.assets, draft.metadata.template_name);

  return Object.fromEntries(
    Object.entries(normalizedAssets).filter(
      ([assetName, value]) => assetName !== 'card_image' && value.trim().length > 0,
    ),
  );
}

export function resolveDraftCardImageBytes(
  draft: Draft,
  cardMetadata: CharacterCardMetadata | undefined,
): Uint8Array | null {
  const candidates = [
    trimDraftText(draft.assets.card_image),
    trimDraftText(cardMetadata?.avatar),
    trimDraftText(draft.assets.avatar),
  ];

  for (const candidate of candidates) {
    const parsed = parseEmbeddedPngBytes(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

export function lorebookAssetSort(left: string, right: string): number {
  const parseIndex = (value: string) => {
    const match = value.match(/^lorebook(?:_(\d+))?$/);
    return match?.[1] ? Number(match[1]) : 1;
  };

  return parseIndex(left) - parseIndex(right);
}

export function parseLorebookEntrySections(content: string): {
  bookName?: string;
  description?: string;
  entries: Array<Record<string, unknown>>;
} {
  const trimmed = content.trim();
  if (!trimmed) {
    return { entries: [] };
  }

  const lines = trimmed.split('\n');
  let bookName: string | undefined;
  let cursor = 0;

  if (lines[0]?.startsWith('# ')) {
    bookName = lines[0].slice(2).trim() || undefined;
    cursor = 1;
  }

  const remaining = lines.slice(cursor).join('\n').trim();
  const sectionRegex = /^##\s+(.+)$/gm;
  const sections: Array<{ title: string; start: number; bodyStart: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = sectionRegex.exec(remaining)) !== null) {
    sections.push({
      title: match[1].trim(),
      start: match.index,
      bodyStart: sectionRegex.lastIndex,
    });
  }

  const description = sections.length > 0 ? remaining.slice(0, sections[0].start).trim() || undefined : undefined;

  if (sections.length === 0) {
    return {
      bookName,
      description,
      entries: [
        {
          name: bookName || 'Entry 1',
          keys: [],
          secondary_keys: [],
          content: remaining,
          enabled: true,
          insertion_order: 10,
          case_sensitive: false,
          priority: 10,
          id: 1,
          comment: '',
          selective: false,
          constant: false,
          position: '',
          extensions: {},
          probability: 100,
          selectiveLogic: 0,
        },
      ],
    };
  }

  const entries = sections
    .map((section, index) => {
      const next = sections[index + 1];
      const rawBody = remaining.slice(section.bodyStart, next ? next.start : remaining.length).trim();
      const bodyLines = rawBody.split('\n');
      const keysLine = bodyLines.find((line) => line.startsWith('Keys: '));
      const secondaryKeysLine = bodyLines.find((line) => line.startsWith('Secondary Keys: '));
      const commentLine = bodyLines.find((line) => line.startsWith('Comment: '));
      const contentLines = bodyLines.filter((line) => !/^Keys: |^Secondary Keys: |^Comment: /i.test(line));
      const entryContent = contentLines.join('\n').trim();
      const keys = keysLine
        ? keysLine
            .slice('Keys: '.length)
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
        : [];
      const secondaryKeys = secondaryKeysLine
        ? secondaryKeysLine
            .slice('Secondary Keys: '.length)
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
        : [];
      const comment = commentLine ? commentLine.slice('Comment: '.length).trim() : '';

      return {
        name: section.title || `Entry ${index + 1}`,
        keys,
        secondary_keys: secondaryKeys,
        content: entryContent,
        enabled: true,
        insertion_order: (index + 1) * 10,
        case_sensitive: false,
        priority: 10,
        id: index + 1,
        comment,
        selective: false,
        constant: false,
        position: '',
        extensions: {},
        probability: 100,
        selectiveLogic: 0,
      };
    })
    .filter((entry) => typeof entry.content === 'string' && entry.content.trim().length > 0);

  return { bookName, description, entries };
}

export function buildCharacterBook(draft: Draft, fallbackName: string): Record<string, unknown> | undefined {
  const rawCharacterBook = trimDraftText(draft.assets.character_book);
  if (rawCharacterBook) {
    const parsed = parseJsonObjectAsset(rawCharacterBook);
    if (parsed) {
      return parsed;
    }
  }

  const lorebookAssetNames = Object.keys(draft.assets)
    .filter((assetName) => /^lorebook(?:_\d+)?$/i.test(assetName))
    .sort(lorebookAssetSort);

  if (lorebookAssetNames.length === 0) {
    return undefined;
  }

  let bookName = `${fallbackName} lorebook`;
  let description = '';
  const entries: Array<Record<string, unknown>> = [];

  lorebookAssetNames.forEach((assetName) => {
    const parsed = parseLorebookEntrySections(draft.assets[assetName]);
    if (parsed.bookName && entries.length === 0) {
      bookName = parsed.bookName;
    }
    if (parsed.description && !description) {
      description = parsed.description;
    }

    parsed.entries.forEach((entry) => {
      entries.push({
        ...entry,
        id: entries.length + 1,
        insertion_order: (entries.length + 1) * 10,
      });
    });
  });

  return {
    name: bookName,
    description,
    scan_depth: 2,
    token_budget: 512,
    recursive_scanning: false,
    extensions: {},
    entries,
  };
}

export function buildChubCompatibleCardExport(draft: Draft, includeMetadata: boolean): Record<string, unknown> {
  const assetCardMetadata = normalizeCardMetadata({
    avatar: draft.assets.avatar,
    creator: draft.assets.creator,
    character_version: draft.assets.character_version,
    depth_prompt: parseJsonObjectAsset(draft.assets.depth_prompt),
    chub: parseJsonObjectAsset(draft.assets.chub_extension),
  });
  const cardMetadata = mergeCardMetadata(assetCardMetadata, normalizeCardMetadata(draft.metadata.card_metadata));
  const embeddedCardImage = trimDraftText(draft.assets.card_image);
  const portableAssets = getPortableDraftAssets(draft);
  const name =
    trimDraftText(draft.metadata.character_name) ??
    inferCharacterDisplayNameFromAssets(draft.assets) ??
    trimDraftText(draft.metadata.seed) ??
    draft.metadata.review_id;
  const alternateGreetings = tryParseStringArray(draft.assets.alternate_greetings);
  const characterBook = buildCharacterBook(draft, name);
  const creator = cardMetadata?.creator ?? trimDraftText(draft.assets.creator) ?? 'Eidolon Simulacra';
  const characterVersion =
    cardMetadata?.character_version ??
    trimDraftText(draft.assets.character_version) ??
    trimDraftText(draft.metadata.modified) ??
    trimDraftText(draft.metadata.created) ??
    '1.0';
  const depthPrompt = cardMetadata?.depth_prompt ??
    parseJsonObjectAsset(draft.assets.depth_prompt) ?? { depth: 0, prompt: '' };
  const normalizedAssets = normalizeAssetRecord(draft.assets, draft.metadata.template_name);
  const relatedLorebooks = characterBook
    ? [{ id: -1, book: null, path: 'embedded', version: characterVersion, commit_ref: characterVersion }]
    : [];
  const chubExtension = {
    id: cardMetadata?.chub?.id ?? -1,
    preset: cardMetadata?.chub?.preset ?? null,
    full_path: cardMetadata?.chub?.full_path ?? `${slugifyCardPathSegment(creator)}/${slugifyCardPathSegment(name)}`,
    custom_css: cardMetadata?.chub?.custom_css ?? null,
    extensions: cardMetadata?.chub?.extensions ?? [],
    expressions: cardMetadata?.chub?.expressions ?? null,
    alt_expressions: cardMetadata?.chub?.alt_expressions ?? {},
    background_image: cardMetadata?.chub?.background_image ?? '',
    related_lorebooks: cardMetadata?.chub?.related_lorebooks ?? relatedLorebooks,
  };

  const extensionPayload: Record<string, unknown> = {
    format: 'eidolon-simulacra/v1',
    exported_at: new Date().toISOString(),
    asset_order: Object.keys(portableAssets),
    assets: portableAssets,
  };

  if (includeMetadata) {
    extensionPayload.metadata = draft.metadata;
  }

  const data: Record<string, unknown> = {
    name,
    description: trimDraftText(draft.assets.character_sheet) ?? '',
    personality: trimDraftText(draft.assets.personality) ?? '',
    scenario: trimDraftText(draft.assets.scenario) ?? '',
    first_mes: trimDraftText(draft.assets.intro_scene) ?? '',
    avatar: cardMetadata?.avatar ?? embeddedCardImage ?? trimDraftText(draft.assets.avatar) ?? '',
    mes_example: buildMesExample(draft.assets.mes_example) ?? '',
    creator_notes:
      trimDraftText(normalizedAssets.creator_notes) ??
      (includeMetadata ? (trimDraftText(draft.metadata.notes) ?? '') : ''),
    system_prompt: withOriginalPrefix(draft.assets.system_prompt),
    post_history_instructions: withOriginalPrefix(draft.assets.post_history),
    alternate_greetings: alternateGreetings,
    tags: includeMetadata ? (draft.metadata.tags ?? []) : [],
    creator,
    character_version: characterVersion,
    extensions: {
      chub: chubExtension,
      depth_prompt: depthPrompt,
      eidolon: extensionPayload,
    },
  };

  if (characterBook) {
    data.character_book = characterBook;
  }

  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data,
  };
}

export function buildDraftExportArtifact(
  draft: Draft,
  format: ExportFormat,
  includeMetadata = true,
): DraftExportArtifact {
  if (format === 'text') {
    const content = Object.entries(draft.assets)
      .map(([assetName, value]) => `## ${assetName}\n\n${escapeAssetContentForMarkdownBundle(value)}`)
      .join('\n\n');
    return {
      content,
      contentType: 'text/plain',
      extension: 'txt',
    };
  }

  if (format === 'combined') {
    const sections = [
      `# ${draft.metadata.character_name || draft.metadata.seed}`,
      includeMetadata ? `## Metadata\n\n${JSON.stringify(draft.metadata, null, 2)}` : '',
      ...Object.entries(draft.assets).map(
        ([assetName, value]) => `## ${assetName}\n\n${escapeAssetContentForMarkdownBundle(value)}`,
      ),
    ].filter(Boolean);

    return {
      content: sections.join('\n\n'),
      contentType: 'text/markdown',
      extension: 'md',
    };
  }

  if (format === 'png') {
    const assetCardMetadata = normalizeCardMetadata({
      avatar: draft.assets.avatar,
      creator: draft.assets.creator,
      character_version: draft.assets.character_version,
      depth_prompt: parseJsonObjectAsset(draft.assets.depth_prompt),
      chub: parseJsonObjectAsset(draft.assets.chub_extension),
    });
    const cardMetadata = mergeCardMetadata(assetCardMetadata, normalizeCardMetadata(draft.metadata.card_metadata));
    const imageBytes = resolveDraftCardImageBytes(draft, cardMetadata);

    if (!imageBytes) {
      throw new Error('PNG export requires a draft card image. Attach or import a PNG image for this draft first.');
    }

    return {
      content: buildPngCardBytes(imageBytes, JSON.stringify(buildChubCompatibleCardExport(draft, includeMetadata))),
      contentType: 'image/png',
      extension: 'png',
    };
  }

  if (format === 'pdf') {
    const sections = [
      ...(includeMetadata ? [{ heading: 'Metadata', body: JSON.stringify(draft.metadata, null, 2) }] : []),
      ...Object.entries(draft.assets).map(([assetName, value]) => ({ heading: assetName, body: value })),
    ];

    return {
      content: buildTextPdfDocument({
        title: draft.metadata.character_name || draft.metadata.seed || draft.metadata.review_id,
        subtitle: draft.metadata.seed,
        generatedAt: new Date().toISOString(),
        sections,
      }),
      contentType: 'application/pdf',
      extension: 'pdf',
    };
  }

  return {
    content: JSON.stringify(buildChubCompatibleCardExport(draft, includeMetadata), null, 2),
    contentType: 'application/json',
    extension: 'json',
  };
}

export function buildDraftLibraryExport(drafts: Draft[]): string {
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      drafts,
    },
    null,
    2,
  );
}
