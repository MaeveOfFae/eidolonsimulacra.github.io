/**
 * What a dropped file is, and where the app takes it.
 *
 * Two things make this a module rather than a few `endsWith` calls in a drop handler:
 * a `.json` is four different things in this app (a character card, a draft backup, a
 * workspace bundle, a theme), so the extension alone cannot answer the question; and the
 * answer has to be a *decision the user can act on* — either the app imports the file, or
 * it says which screen will.
 *
 * The file reading is deliberately not here. `classifyDroppedFile` takes the parsed JSON
 * when the caller could read it, so the rules stay pure and every branch is tested without
 * a File; `inspectDroppedFile` does the reading and is the only part that touches the blob
 * API.
 */

export type DroppedFileKind = 'character-card' | 'draft-backup' | 'theme' | 'template' | 'unknown';

export interface DroppedFileClassification {
  kind: DroppedFileKind;
  /** What the file looks like, phrased for a notice the user reads. */
  label: string;
  /** The screen that imports this kind, or null when there is nowhere to take it. */
  destination: string | null;
  /** Why it could not be placed. Only set for `unknown`. */
  reason: string | null;
}

interface DropKindDefinition {
  label: string;
  destination: string;
}

const KIND_DEFINITIONS: Record<Exclude<DroppedFileKind, 'unknown'>, DropKindDefinition> = {
  'character-card': { label: 'a character card', destination: '/generate' },
  'draft-backup': { label: 'a draft backup', destination: '/drafts' },
  theme: { label: 'a theme file', destination: '/themes' },
  template: { label: 'a template', destination: '/templates' },
};

function known(kind: Exclude<DroppedFileKind, 'unknown'>): DroppedFileClassification {
  const definition = KIND_DEFINITIONS[kind];
  return { kind, label: definition.label, destination: definition.destination, reason: null };
}

function unknown(reason: string): DroppedFileClassification {
  return { kind: 'unknown', label: 'an unrecognised file', destination: null, reason };
}

function extensionOf(name: string): string {
  const trimmed = name.trim().toLowerCase();
  const dot = trimmed.lastIndexOf('.');
  return dot === -1 ? '' : trimmed.slice(dot);
}

/** Whether a parsed document looks like one of the JSON shapes the app writes. */
function classifyParsedJson(json: unknown): DroppedFileClassification {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return unknown('that JSON is not one of the shapes this app writes');
  }

  const record = json as Record<string, unknown>;

  // Character cards: v2 carries `spec` + `data`, v1 carries the fields at the top level.
  if ('spec' in record || 'spec_version' in record || ('data' in record && 'name' in record)) {
    return known('character-card');
  }

  // A workspace bundle carries `payload`; a draft export carries `drafts`.
  if ('payload' in record || 'drafts' in record) {
    return known('draft-backup');
  }

  // Themes carry a name plus a colour block, either nested or at the top level.
  if ('theme' in record || 'colors' in record || ('app' in record && 'name' in record)) {
    return known('theme');
  }

  return unknown('that JSON is not a character card, a draft backup or a theme');
}

/**
 * The decision, from a file name and — for JSON — whatever the caller managed to parse.
 *
 * A JSON file with nothing parsed is reported as unknown rather than guessed at: guessing
 * between four importers would send the user to the wrong screen with the file in hand,
 * which is worse than saying "read it and I will know".
 */
export function classifyDroppedFile(input: { name: string; json?: unknown }): DroppedFileClassification {
  const extension = extensionOf(input.name);

  if (!input.name.trim()) {
    return unknown('that drop had no file name');
  }

  if (extension === '.png') {
    // Both a card image and a rendered asset are PNGs; the card importer reads the embedded
    // `chara` chunk and reports plainly when a PNG has none.
    return known('character-card');
  }

  if (extension === '.json') {
    return input.json === undefined
      ? unknown('JSON has to be read before the app can tell what it is')
      : classifyParsedJson(input.json);
  }

  if (extension === '.md' || extension === '.txt') {
    return known('template');
  }

  if (extension === '') {
    return unknown('that looks like a folder or a file with no extension');
  }

  return unknown(`files ending in "${extension}" are not something this app imports`);
}

/**
 * The file name at the end of a path.
 *
 * Desktop drops arrive as native paths rather than `File` objects, and those paths are
 * whatever the operating system uses: `C:\Users\me\Vesna.png` on Windows, `/home/me/Vesna.png`
 * elsewhere. Only the name matters for classification, and a trailing separator means the
 * user dropped a folder.
 */
export function fileNameFromPath(path: string): string {
  const withoutTrailingSeparators = path.trim().replace(/[\\/]+$/, '');
  const lastSeparator = Math.max(
    withoutTrailingSeparators.lastIndexOf('/'),
    withoutTrailingSeparators.lastIndexOf('\\'),
  );

  return lastSeparator === -1 ? withoutTrailingSeparators : withoutTrailingSeparators.slice(lastSeparator + 1);
}

export interface InspectedDrop {
  name: string;
  /** The parsed document, when the file turned out to be readable JSON. */
  json?: unknown;
}

/**
 * Reads just enough of a dropped file to classify it.
 *
 * Failures are not thrown: an unreadable file is a classification problem, and the caller
 * has one place to report it. A blob without `text()` — an older runtime, a fake in a test
 * — is inspected by name alone.
 */
export async function inspectDroppedFile(file: { name: string; text?: () => Promise<string> }): Promise<InspectedDrop> {
  if (typeof file.text !== 'function') {
    return { name: file.name };
  }

  try {
    const text = await file.text();
    return { name: file.name, json: JSON.parse(text) as unknown };
  } catch {
    // Either it is not JSON at all or it is malformed; the name still classifies it.
    return { name: file.name };
  }
}
