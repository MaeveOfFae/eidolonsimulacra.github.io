import { beforeEach, describe, expect, it } from 'vitest';
import type { AssetDefinition } from '@char-gen/shared';
import { APIError, api } from './api';

const ASSETS: AssetDefinition[] = [
  { name: 'character_sheet', required: true, depends_on: [], description: 'Sheet' },
  { name: 'intro_scene', required: true, depends_on: ['character_sheet'], description: 'Scene' },
];

const CREATE = {
  name: 'test_template',
  version: '1.0',
  description: 'A test template',
  assets: ASSETS,
  blueprint_contents: {},
};

/** Minimal stored-record payload accepted by `importTemplate`. */
const IMPORT_RECORD = {
  template: { name: 'test_template', version: '1.0', description: 'A test template', assets: ASSETS },
  blueprint_contents: {},
};

function storedFile() {
  return new File([JSON.stringify(IMPORT_RECORD)], 'test_template.json', { type: 'application/json' });
}

describe('browser api: templates', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts from the builtin templates with no custom entries', async () => {
    const templates = await api.getTemplates();

    expect(templates.length).toBeGreaterThan(0);
    expect(templates.map((template) => template.name)).not.toContain('test_template');
    expect((await api.listTemplates()).map((template) => template.name)).toEqual(
      templates.map((template) => template.name),
    );
  });

  it('exposes blueprint contents for a builtin template and 404s otherwise', async () => {
    const [builtin] = await api.getTemplates();

    const contents = await api.getTemplateBlueprintContents(builtin!.name);
    expect(typeof contents.blueprint_contents).toBe('object');

    await expect(api.getTemplateBlueprintContents('nope')).rejects.toBeInstanceOf(APIError);
  });

  it('adds exactly one entry when a custom template is created', async () => {
    const before = (await api.getTemplates()).length;

    const created = await api.createTemplate(CREATE);

    expect(created.name).toBe('test_template');
    expect(created.version).toBe('1.0');
    expect(created.assets.map((asset) => asset.name)).toEqual(['character_sheet', 'intro_scene']);

    const after = await api.getTemplates();
    expect(after).toHaveLength(before + 1);
    expect(after.map((template) => template.name)).toContain('test_template');
    expect((await api.getTemplate('test_template')).name).toBe('test_template');
  });

  it('rejects a duplicate template name', async () => {
    await api.createTemplate(CREATE);
    await expect(api.createTemplate(CREATE)).rejects.toBeInstanceOf(APIError);
  });

  it('updates a custom template in place', async () => {
    await api.createTemplate(CREATE);

    const updated = await api.updateTemplate('test_template', {
      ...CREATE,
      version: '2.0',
      description: 'Updated',
      assets: [ASSETS[0]!],
    });

    expect(updated.version).toBe('2.0');
    expect(updated.description).toBe('Updated');
    expect(updated.assets).toHaveLength(1);
    expect((await api.getTemplate('test_template')).version).toBe('2.0');
  });

  it('duplicates a builtin template', async () => {
    const [builtin] = await api.getTemplates();

    const copy = await api.duplicateTemplate(builtin!.name, { name: 'copy-of-builtin' });

    expect(copy.name).toBe('copy-of-builtin');
    expect(copy.version).toBe(builtin!.version);
    expect(copy.assets.map((asset) => asset.name)).toEqual(builtin!.assets.map((asset) => asset.name));
  });

  it('404s for unknown templates across the read and write paths', async () => {
    await expect(api.getTemplate('nope')).rejects.toBeInstanceOf(APIError);
    await expect(api.duplicateTemplate('nope', { name: 'x' })).rejects.toBeInstanceOf(APIError);
    await expect(api.validateTemplate('nope')).rejects.toBeInstanceOf(APIError);
    await expect(api.exportTemplate('nope')).rejects.toBeInstanceOf(APIError);
  });

  it('validates a template and always returns error and warning lists', async () => {
    await api.createTemplate(CREATE);

    const result = await api.validateTemplate('test_template');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('exports a custom template as a slugified json download', async () => {
    await api.createTemplate(CREATE);

    const download = await api.exportTemplate('test_template');
    expect(download.filename).toBe('test_template.json');
    expect(download.contentType).toBe('application/json');
    expect(download.blob.size).toBeGreaterThan(0);
  });

  it('imports a stored template record and round-trips it', async () => {
    const imported = await api.importTemplate(storedFile());

    expect(imported.name).toBe('test_template');
    expect(imported.version).toBe('1.0');
    expect((await api.getTemplate('test_template')).assets.map((asset) => asset.name)).toEqual([
      'character_sheet',
      'intro_scene',
    ]);
  });

  it('deletes only custom templates and leaves builtins intact', async () => {
    await api.createTemplate(CREATE);
    const [builtin] = await api.getTemplates();

    expect(await api.deleteTemplate('test_template')).toEqual({ status: 'deleted', name: 'test_template' });
    expect((await api.getTemplates()).some((template) => template.name === 'test_template')).toBe(false);

    await api.deleteTemplate(builtin!.name);
    expect((await api.getTemplates()).some((template) => template.name === builtin!.name)).toBe(true);
  });
});
