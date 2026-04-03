import { beforeEach, describe, expect, it } from 'vitest';
import { getAllTemplateRecords, getStoredTemplates } from './browser';

describe('browser template storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('ignores malformed stored template payloads without breaking built-in templates', () => {
    window.localStorage.setItem('eidolon.web.templates.custom', JSON.stringify({ broken: true }));

    expect(() => getAllTemplateRecords()).not.toThrow();
    expect(getStoredTemplates()).toEqual([]);
    expect(getAllTemplateRecords().some((record) => record.template.name === 'V2/V3 Card')).toBe(true);
  });

  it('hydrates legacy object-map template records from storage', () => {
    window.localStorage.setItem(
      'eidolon.web.templates.custom',
      JSON.stringify({
        legacy_template: {
          template: {
            name: 'Legacy Template',
            version: '1.0.0',
            description: 'Migrated from legacy storage',
            assets: [
              {
                name: 'intro_scene',
                required: true,
                depends_on: [],
                description: 'Intro scene asset',
                blueprint_file: 'intro_scene.md',
              },
            ],
            is_official: false,
          },
          blueprint_contents: {
            'intro_scene.md': 'legacy blueprint content',
          },
        },
      })
    );

    const storedTemplates = getStoredTemplates();

    expect(storedTemplates).toHaveLength(1);
    expect(storedTemplates[0]).toMatchObject({
      template: {
        name: 'Legacy Template',
      },
      blueprint_contents: {
        'intro_scene.md': 'legacy blueprint content',
      },
    });
  });
});