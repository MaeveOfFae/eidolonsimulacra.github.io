import type { Draft, Template } from '@char-gen/shared';
import { saveBlobDownload } from '@/utils/download';
import {
  buildIntrosJson,
  buildIntrosMarkdown,
  buildRecoveredTemplateContract,
  draftHasAsset,
  exportIntrosAsJson,
  exportIntrosAsMarkdown,
  introExportFilename,
  type AssetCandidate,
} from './asset-regenerator-helpers';

vi.mock('@/utils/download', () => ({
  saveBlobDownload: vi.fn(async () => ({ saved: true, method: 'download' })),
}));

function makeDraft(overrides: { assets?: Record<string, string>; templateName?: string } = {}): Draft {
  return {
    metadata: {
      review_id: 'd-1',
      seed: 'a lonely space pirate',
      favorite: false,
      model: 'gpt-4o',
      template_name: overrides.templateName ?? 'V2/V3 Card',
      created_at: '2026-09-01T00:00:00.000Z',
      updated_at: '2026-09-01T00:00:00.000Z',
    },
    assets: overrides.assets ?? {},
  } as unknown as Draft;
}

const TEMPLATE = {
  name: 'V2/V3 Card',
  version: 1,
  description: 'default',
  is_official: true,
  is_default: true,
  assets: [
    { name: 'speech', required: true, depends_on: [], description: 'Speech' },
    { name: 'personality', required: true, depends_on: ['speech'], description: 'Personality' },
  ],
} as unknown as Template;

const CANDIDATE: AssetCandidate = { id: 'c-1', content: 'An intro scene.', timestamp: 1_770_000_000_000 };

describe('draftHasAsset', () => {
  it('reports whether the draft carries the asset key', () => {
    expect(draftHasAsset(makeDraft({ assets: { speech: 'hello' } }), 'speech')).toBe(true);
    // An empty string still counts as a present asset.
    expect(draftHasAsset(makeDraft({ assets: { speech: '' } }), 'speech')).toBe(true);
    expect(draftHasAsset(makeDraft({ assets: { speech: 'hello' } }), 'personality')).toBe(false);
    expect(draftHasAsset(undefined, 'speech')).toBe(false);
  });
});

describe('buildRecoveredTemplateContract', () => {
  it('marks the contract unofficial and keeps the saved template name', () => {
    const contract = buildRecoveredTemplateContract(makeDraft({ templateName: 'Lost Template' }), [TEMPLATE]);

    expect(contract.name).toBe('Lost Template');
    expect(contract.is_official).toBe(false);
    expect(contract.description).toMatch(/Recovered from the saved draft asset order/);
    // Known template assets are carried over in template order.
    expect(contract.assets.map((asset) => asset.name)).toEqual(['speech', 'personality']);
  });

  it('falls back to the default template name and keeps known assets', () => {
    const draft = makeDraft({ templateName: '', assets: { speech: 'hello' } });
    const contract = buildRecoveredTemplateContract(draft, [TEMPLATE]);

    expect(contract.name).toBe('V2/V3 Card');
    // Both names come from the default template, so they keep its `required` flags.
    expect(contract.assets.map((asset) => asset.name)).toEqual(['speech', 'personality']);
  });

  it('recovers an asset that the default template does not define', () => {
    const draft = makeDraft({
      templateName: '',
      assets: { speech: 'hello', custom_asset: 'recovered text' },
    });
    const contract = buildRecoveredTemplateContract(draft, [TEMPLATE]);

    const custom = contract.assets.find((asset) => asset.name === 'custom_asset');
    expect(custom?.required).toBe(true);
    expect(custom?.description).toBe('Recovered from the saved draft asset order.');
  });
});

describe('intro exports', () => {
  beforeEach(() => {
    vi.mocked(saveBlobDownload).mockClear();
  });

  it('hands the markdown export to the shared download helper', async () => {
    await exportIntrosAsMarkdown('Iris Storm', [CANDIDATE], 'active intro');

    expect(saveBlobDownload).toHaveBeenCalledTimes(1);
    const [blob, filename, contentType] = vi.mocked(saveBlobDownload).mock.calls[0];
    expect(filename).toBe('Iris_Storm_intro_scenes.md');
    expect(contentType).toBe('text/markdown');
    expect(blob.type).toBe('text/markdown');
  });

  it('hands the json export to the shared download helper', async () => {
    await exportIntrosAsJson('Iris Storm', [CANDIDATE], undefined);

    expect(saveBlobDownload).toHaveBeenCalledTimes(1);
    const [blob, filename, contentType] = vi.mocked(saveBlobDownload).mock.calls[0];
    expect(filename).toBe('Iris_Storm_intro_scenes.json');
    expect(contentType).toBe('application/json');
    expect(blob.type).toBe('application/json');
  });

  it('derives the export filename from the character name', () => {
    expect(introExportFilename('Iris Storm', 'md')).toBe('Iris_Storm_intro_scenes.md');
    expect(introExportFilename('Iris Storm', 'json')).toBe('Iris_Storm_intro_scenes.json');
  });

  it('builds a markdown document with the active and saved intros', () => {
    const markdown = buildIntrosMarkdown('Iris Storm', [CANDIDATE], 'active intro');

    expect(markdown).toContain('# Intro Scenes for Iris Storm');
    expect(markdown).toContain('Total intros: 1');
    expect(markdown).toContain('## Currently Active Intro Scene');
    expect(markdown).toContain('active intro');
    expect(markdown).toContain('## Intro Scene #1');
    expect(markdown).toContain('An intro scene.');
  });

  it('builds a json payload with the saved intros and their timestamps', () => {
    const payload = JSON.parse(buildIntrosJson('Iris Storm', [CANDIDATE], undefined));

    expect(payload.character_name).toBe('Iris Storm');
    expect(payload.active_intro).toBeNull();
    expect(payload.saved_intros).toEqual([
      {
        id: 'c-1',
        content: 'An intro scene.',
        created_at: new Date(CANDIDATE.timestamp).toISOString(),
      },
    ]);
    expect(new Date(payload.exported_at).toString()).not.toBe('Invalid Date');
  });
});
