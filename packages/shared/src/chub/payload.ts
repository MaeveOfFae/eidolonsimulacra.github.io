/**
 * Draft → Chub character payload mapping.
 *
 * Field mapping follows the gateway spec's own V2 notes: the `description` parameter
 * is V2 `creator_notes`, the `personality` parameter is V2 `description` (the persona
 * prose). That yields the mapping below, seeded from `presets/chubai.toml` and the
 * official template's asset list:
 *
 *   character_sheet → personality   (V2 description / persona)
 *   creator_notes   → description   (V2 creator_notes)
 *   intro_scene     → first_message (raw greeting)
 *   post_history    → example_dialogs (`<START>`-wrapped, per the Chub packaging
 *                     workflow: every example-dialog block starts with `<START>`)
 *   system_prompt   → system_prompt
 *   card_image      → avatar (data URL unwrapped to bare base64)
 */
import { CREATOR_NOTES_ASSET_NAME } from '../templates';
import type { ChubCharacterCreate, ChubCharacterUpdate } from './types';

export type ChubPublishRating = 'SFW' | 'NSFW';
export type ChubPublishVisibility = 'public' | 'unlisted';

/** Editable publish form state; the panel pre-fills this from the draft. */
export interface ChubPublishForm {
  name: string;
  tagline: string;
  scenario: string;
  tags: string[];
  rating: ChubPublishRating;
  visibility: ChubPublishVisibility;
  /** Raw alternates; each is `<START>`-wrapped by the builder. */
  alternateGreetings: string[];
  version: string;
}

/** The draft-side inputs the builder reads. */
export interface ChubDraftSource {
  assets: Record<string, string>;
  characterName?: string;
}

/** Prefix a greeting/dialog block with `<START>` unless it already leads with one. */
export function chubGreetingStart(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return '';
  }
  if (trimmed.startsWith('<START>')) {
    return trimmed;
  }
  return `<START>\n${trimmed}`;
}

/**
 * Normalize an avatar value for the `avatar` field: data URLs become their bare
 * base64 payload (the spec wants "Base64 image string"), https URLs pass through,
 * anything else yields null (field omitted).
 */
export function chubAvatarValue(value: string | undefined | null): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const dataUrl = /^data:image\/[a-z0-9.+-]+;base64,([\s\S]+)$/i.exec(trimmed);
  if (dataUrl) {
    const base64 = dataUrl[1]!.replace(/\s/g, '');
    return base64.length > 0 ? base64 : null;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/** Trimmed, de-duplicated (case-insensitive), non-empty tags. */
export function normalizeChubTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const tag = raw.trim();
    const key = tag.toLowerCase();
    if (tag.length === 0 || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(tag);
  }
  return result;
}

function pickAsset(assets: Record<string, string>, name: string): string {
  const value = assets[name];
  return typeof value === 'string' ? value : '';
}

function creatorNotesOf(assets: Record<string, string>): string {
  const canonical = pickAsset(assets, CREATOR_NOTES_ASSET_NAME);
  if (canonical.trim().length > 0) {
    return canonical;
  }
  // Legacy templates stored creator notes as `intro_page`.
  return pickAsset(assets, 'intro_page');
}

/** Build the `POST /api/core/characters` body from a draft plus the publish form. */
export function buildChubCharacterCreate(source: ChubDraftSource, form: ChubPublishForm): ChubCharacterCreate {
  const { assets } = source;
  const payload: ChubCharacterCreate = {
    name: form.name.trim(),
    description: creatorNotesOf(assets),
    personality: pickAsset(assets, 'character_sheet'),
    scenario: form.scenario.trim(),
    example_dialogs: chubGreetingStart(pickAsset(assets, 'post_history')),
    first_message: pickAsset(assets, 'intro_scene'),
    is_nsfw: form.rating === 'NSFW',
    is_nsfl: false,
    // Both visibility options are publicly reachable: `unlisted` keeps the page
    // live for link-shares but flags it out of search listings.
    is_public: true,
    is_unlisted: form.visibility === 'unlisted',
    tags: normalizeChubTags(form.tags),
    version: form.version.trim().length > 0 ? form.version.trim() : '1.0',
  };
  const tagline = form.tagline.trim();
  if (tagline.length > 0) {
    payload.tagline = tagline;
  }
  const systemPrompt = pickAsset(assets, 'system_prompt');
  if (systemPrompt.trim().length > 0) {
    payload.system_prompt = systemPrompt;
  }
  const avatar = chubAvatarValue(assets.card_image);
  if (avatar) {
    payload.avatar = avatar;
  }
  const greetings = form.alternateGreetings.map(chubGreetingStart).filter((entry) => entry.length > 0);
  if (greetings.length > 0) {
    payload.alternate_greetings = greetings;
  }
  return payload;
}

/**
 * Build the `PUT /api/core/characters/{username}/{pathname}` body. `name` is
 * included deliberately — the spec marks it "Ignored if not creation" but sending it
 * keeps the record coherent when the user renamed the draft before republishing.
 */
export function buildChubCharacterUpdate(
  source: ChubDraftSource,
  form: ChubPublishForm,
  characterId: number,
): ChubCharacterUpdate {
  const create = buildChubCharacterCreate(source, form);
  const payload: ChubCharacterUpdate = {
    character_id: characterId,
    name: create.name,
    description: create.description,
    personality: create.personality,
    scenario: create.scenario,
    example_dialogs: create.example_dialogs,
    first_message: create.first_message,
    tags: create.tags,
    is_nsfw: create.is_nsfw,
    is_public: create.is_public,
    is_unlisted: create.is_unlisted,
    character_version: create.version ?? '1.0',
  };
  if (create.tagline !== undefined) {
    payload.tagline = create.tagline;
  }
  if (create.system_prompt !== undefined) {
    payload.system_prompt = create.system_prompt;
  }
  if (create.avatar !== undefined) {
    payload.avatar = create.avatar;
  }
  if (create.alternate_greetings !== undefined) {
    payload.alternate_greetings = create.alternate_greetings;
  }
  return payload;
}

/** Default publish form for a draft (name/tags/rating seeded from metadata + mode). */
export function defaultChubPublishForm(metadata: {
  character_name?: string;
  tags?: string[];
  mode?: string;
}): ChubPublishForm {
  return {
    name: metadata.character_name ?? '',
    tagline: '',
    scenario: '',
    tags: Array.isArray(metadata.tags) ? [...metadata.tags] : [],
    rating: metadata.mode === 'NSFW' ? 'NSFW' : 'SFW',
    visibility: 'public',
    alternateGreetings: [],
    version: '1.0',
  };
}
