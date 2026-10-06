import { describe, expect, it } from 'vitest';
import {
  buildChubCharacterCreate,
  buildChubCharacterUpdate,
  chubAvatarValue,
  chubGreetingStart,
  defaultChubPublishForm,
  normalizeChubTags,
  type ChubPublishForm,
} from './payload';

const form = (overrides: Partial<ChubPublishForm> = {}): ChubPublishForm => ({
  name: 'Alice',
  tagline: 'A nice girl',
  scenario: 'On a summer night',
  tags: ['OC', 'SFW', 'student'],
  rating: 'SFW',
  visibility: 'public',
  alternateGreetings: [],
  version: '1.0',
  ...overrides,
});

const assets = {
  character_sheet: 'Persona prose (V2 description).',
  creator_notes: 'Creator notes prose (V2 creator_notes).',
  intro_scene: '*waves* Hey {{user}}.',
  post_history: '{{user}}: Hi\n{{char}}: Hello',
  system_prompt: 'Stay in character.',
  card_image: 'data:image/png;base64,aGVsbG8=',
};

describe('buildChubCharacterCreate', () => {
  it("maps V2 assets onto the spec's V2-aware parameter names", () => {
    const payload = buildChubCharacterCreate({ assets, characterName: 'Alice' }, form());
    expect(payload.name).toBe('Alice');
    expect(payload.personality).toBe('Persona prose (V2 description).');
    expect(payload.description).toBe('Creator notes prose (V2 creator_notes).');
    expect(payload.first_message).toBe('*waves* Hey {{user}}.');
    expect(payload.system_prompt).toBe('Stay in character.');
    expect(payload.scenario).toBe('On a summer night');
    expect(payload.tags).toEqual(['OC', 'SFW', 'student']);
    expect(payload.is_nsfw).toBe(false);
    expect(payload.is_public).toBe(true);
    expect(payload.is_unlisted).toBe(false);
    expect(payload.version).toBe('1.0');
  });

  it('prefixes example dialogs with <START> and unwraps the avatar data URL', () => {
    const payload = buildChubCharacterCreate({ assets }, form());
    expect(payload.example_dialogs!.startsWith('<START>\n')).toBe(true);
    expect(payload.avatar).toBe('aGVsbG8=');
  });

  it('falls back to legacy intro_page for creator notes', () => {
    const payload = buildChubCharacterCreate(
      { assets: { ...assets, creator_notes: '', intro_page: 'Legacy notes' } },
      form(),
    );
    expect(payload.description).toBe('Legacy notes');
  });

  it('omits optional fields that are empty and marks NSFW/unlisted correctly', () => {
    const payload = buildChubCharacterCreate(
      { assets: { intro_scene: 'hi {{user}}', card_image: 'not-an-image' } },
      form({ rating: 'NSFW', visibility: 'unlisted', tagline: '  ', version: '  ' }),
    );
    expect(payload.tagline).toBeUndefined();
    expect(payload.avatar).toBeUndefined();
    expect(payload.system_prompt).toBeUndefined();
    expect(payload.alternate_greetings).toBeUndefined();
    expect(payload.is_nsfw).toBe(true);
    expect(payload.is_public).toBe(true);
    expect(payload.is_unlisted).toBe(true);
    expect(payload.version).toBe('1.0');
  });

  it('wraps alternate greetings in <START>', () => {
    const payload = buildChubCharacterCreate({ assets }, form({ alternateGreetings: ['Second wave', '<START>Third'] }));
    expect(payload.alternate_greetings).toEqual(['<START>\nSecond wave', '<START>Third']);
  });
});

describe('buildChubCharacterUpdate', () => {
  it('carries the character id and mirrors the create mapping', () => {
    const payload = buildChubCharacterUpdate({ assets }, form(), 211500);
    expect(payload.character_id).toBe(211500);
    expect(payload.personality).toBe('Persona prose (V2 description).');
    expect(payload.description).toBe('Creator notes prose (V2 creator_notes).');
    expect(payload.character_version).toBe('1.0');
    expect(payload.avatar).toBe('aGVsbG8=');
  });
});

describe('helpers', () => {
  it('adds <START> once and normalizes tags', () => {
    expect(chubGreetingStart('hello')).toBe('<START>\nhello');
    expect(chubGreetingStart('<START>hello')).toBe('<START>hello');
    expect(chubGreetingStart('   ')).toBe('');
    expect(normalizeChubTags([' OC ', 'oc', '', 'SFW'])).toEqual(['OC', 'SFW']);
  });

  it('accepts data and https avatars only', () => {
    expect(chubAvatarValue('data:image/png;base64,aGVsbG8=')).toBe('aGVsbG8=');
    expect(chubAvatarValue('https://x/a.png')).toBe('https://x/a.png');
    expect(chubAvatarValue('data:text/plain,hi')).toBeNull();
    expect(chubAvatarValue(undefined)).toBeNull();
  });

  it('seeds the default form from draft metadata', () => {
    const form = defaultChubPublishForm({ character_name: 'Selene', tags: ['fantasy'], mode: 'NSFW' });
    expect(form.name).toBe('Selene');
    expect(form.tags).toEqual(['fantasy']);
    expect(form.rating).toBe('NSFW');
    expect(defaultChubPublishForm({}).rating).toBe('SFW');
  });
});
