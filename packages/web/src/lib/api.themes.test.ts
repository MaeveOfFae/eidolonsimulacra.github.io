import { beforeEach, describe, expect, it } from 'vitest';
import { APIError, api } from './api';
import { builtinThemes } from './themes/builtin-themes';

const COLORS = builtinThemes[0]!.colors;
const DARK_JSON = JSON.stringify(builtinThemes.find((theme) => theme.name === 'dark'));

function themeFile() {
  return new File([DARK_JSON], 'dark.json', { type: 'application/json' });
}

describe('browser api: themes', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('lists only the builtin themes on a clean profile', async () => {
    const themes = await api.getThemes();

    expect(themes).toHaveLength(builtinThemes.length);
    expect(themes.every((theme) => theme.is_builtin)).toBe(true);
    expect(api.getThemesSnapshot()).toHaveLength(builtinThemes.length);
  });

  it('creates, updates and deletes a custom theme', async () => {
    const created = await api.createTheme({ name: 'my-theme', display_name: 'My Theme', colors: COLORS });

    expect(created.is_builtin).toBe(false);
    expect(created.author).toBe('');
    expect(created.tags).toEqual([]);
    expect(created.description).toBe('');
    expect((await api.getThemes()).some((theme) => theme.name === 'my-theme')).toBe(true);

    const updated = await api.updateTheme('my-theme', { display_name: 'Renamed', tags: ['custom'] });
    expect(updated.display_name).toBe('Renamed');
    expect(updated.tags).toEqual(['custom']);

    expect(await api.deleteTheme('my-theme')).toEqual({ status: 'deleted', name: 'my-theme' });
    expect((await api.getThemes()).some((theme) => theme.name === 'my-theme')).toBe(false);
  });

  it('rejects a duplicate name and refuses to mutate a builtin theme', async () => {
    await expect(api.createTheme({ name: 'dark', display_name: 'Dark', colors: COLORS })).rejects.toBeInstanceOf(
      APIError,
    );
    await expect(api.updateTheme('dark', { display_name: 'Nope' })).rejects.toBeInstanceOf(APIError);
  });

  it('duplicates a builtin theme and records the source', async () => {
    const copy = await api.duplicateTheme('dark', { new_name: 'dark-copy' });

    expect(copy.name).toBe('dark-copy');
    expect(copy.based_on).toBe('dark');
    expect(copy.is_builtin).toBe(false);
    expect(copy.display_name).toBe('Dark');
    expect(copy.colors).toEqual(COLORS);
  });

  it('renames a custom theme', async () => {
    await api.createTheme({ name: 'temp', display_name: 'Temp', colors: COLORS });

    const renamed = await api.renameTheme('temp', { new_name: 'renamed-theme', display_name: 'Renamed' });

    expect(renamed.name).toBe('renamed-theme');
    expect(renamed.display_name).toBe('Renamed');

    const names = (await api.getThemes()).map((theme) => theme.name);
    expect(names).not.toContain('temp');
    expect(names).toContain('renamed-theme');
  });

  it('exports a theme as a slugified json download and 404s for an unknown name', async () => {
    const download = await api.exportTheme('dark');

    expect(download.filename).toBe('dark.json');
    expect(download.contentType).toBe('application/json');
    expect(download.blob.size).toBeGreaterThan(0);

    await expect(api.exportTheme('nope')).rejects.toBeInstanceOf(APIError);
  });

  it('imports a theme file and honours the conflict strategy', async () => {
    const imported = await api.importTheme(themeFile());
    expect(imported.name).toBe('dark');
    expect(imported.is_builtin).toBe(false);

    // The imported custom theme now shadows the builtin one in the list.
    expect((await api.getThemes()).filter((theme) => theme.name === 'dark')).toHaveLength(2);

    await expect(api.importTheme(themeFile())).rejects.toBeInstanceOf(APIError);

    const renamed = await api.importTheme(themeFile(), {
      conflict_strategy: 'rename',
      target_name: 'dark-alt',
    });
    expect(renamed.name).toBe('dark-alt');

    const overwritten = await api.importTheme(themeFile(), { conflict_strategy: 'overwrite' });
    expect(overwritten.name).toBe('dark');

    const customs = (await api.getThemes()).filter((theme) => !theme.is_builtin);
    expect(customs.map((theme) => theme.name).sort()).toEqual(['dark', 'dark-alt']);
  });
});
