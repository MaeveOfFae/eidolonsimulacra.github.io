import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DESKTOP_COMPANION_SYNC_SELECTION,
  filterDesktopCompanionSyncPayload,
  getSelectedDesktopCompanionSyncDomains,
  hasSelectedDesktopCompanionSyncDomains,
  normalizeDesktopCompanionSyncSelection,
} from './companion-sync';
import type { DesktopCompanionSyncPayload } from './companion-sync';

describe('desktop companion sync selection helpers', () => {
  it('normalizes partial domain selections against defaults', () => {
    expect(normalizeDesktopCompanionSyncSelection({ drafts: false, templates: false })).toEqual({
      drafts: false,
      config: true,
      templates: false,
      blueprints: true,
    });
    expect(normalizeDesktopCompanionSyncSelection()).toEqual(DEFAULT_DESKTOP_COMPANION_SYNC_SELECTION);
  });

  it('lists selected domains and detects empty selections', () => {
    expect(
      getSelectedDesktopCompanionSyncDomains({ drafts: true, config: false, templates: true, blueprints: false }),
    ).toEqual(['drafts', 'templates']);
    expect(
      hasSelectedDesktopCompanionSyncDomains({ drafts: false, config: false, templates: false, blueprints: false }),
    ).toBe(false);
  });

  it('filters sync payload by selected domains and optional api-key inclusion', () => {
    const payload: DesktopCompanionSyncPayload = {
      drafts: [
        {
          metadata: { review_id: 'draft-1', seed: 'alpha', favorite: false },
          assets: { description: 'alpha' },
          path: 'draft-1',
        },
      ],
      config: {
        config: {
          engine: 'openai_compatible',
          engine_mode: 'auto',
          model: 'openrouter/openai/gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 4096,
          batch: { max_concurrent: 3, rate_limit_delay: 1 },
        },
        api_keys: {
          openai: 'secret',
        },
      },
      templates: [
        {
          template: {
            name: 'Card',
            version: '1.0',
            description: '',
            assets: [],
          },
          blueprint_contents: {},
        },
      ],
      blueprints: {
        'blueprints/custom/sample.md': 'sample',
      },
    };

    expect(
      filterDesktopCompanionSyncPayload(payload, { drafts: true, config: false, templates: true, blueprints: false }),
    ).toEqual({
      drafts: payload.drafts,
      templates: payload.templates,
    });

    expect(filterDesktopCompanionSyncPayload(payload, { config: true }, { includeApiKeys: false })).toEqual({
      drafts: payload.drafts,
      config: {
        config: {
          engine: 'openai_compatible',
          engine_mode: 'auto',
          model: 'openrouter/openai/gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 4096,
          batch: { max_concurrent: 3, rate_limit_delay: 1 },
        },
      },
      templates: payload.templates,
      blueprints: payload.blueprints,
    });
  });
});
