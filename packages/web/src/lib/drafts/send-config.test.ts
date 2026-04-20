import { describe, expect, it } from 'vitest';
import type { Draft, Template } from '@char-gen/shared';
import {
  buildDraftPriorAssets,
  getDraftSendOrderWarnings,
  getEffectiveDraftComponentSendOrder,
  mergeDraftAdditionalInstructions,
  normalizeDraftComponentSendOrderForSave,
} from './send-config';

const template: Template = {
  name: 'V2/V3 Card',
  version: '1.0',
  description: 'Test template',
  is_official: false,
  assets: [
    { name: 'system_prompt', required: true, depends_on: [], description: 'System prompt' },
    { name: 'post_history', required: true, depends_on: ['system_prompt'], description: 'History' },
    { name: 'character_sheet', required: true, depends_on: ['post_history'], description: 'Character sheet' },
  ],
};

function createDraft(metadataOverrides: Partial<Draft['metadata']> = {}, assets: Record<string, string> = {}): Draft {
  return {
    path: 'review-1',
    metadata: {
      review_id: 'review-1',
      seed: 'seed',
      favorite: false,
      template_name: template.name,
      ...metadataOverrides,
    },
    assets,
  };
}

describe('draft send config helpers', () => {
  it('drops stale custom-order entries and appends missing template or draft assets', () => {
    const draft = createDraft(
      {
        component_send_order: ['post_history', 'stale_asset'],
      },
      {
        system_prompt: 'system prompt',
        post_history: 'post history',
        imported_extra: 'extra asset',
      }
    );

    expect(getEffectiveDraftComponentSendOrder(draft, template)).toEqual([
      'post_history',
      'system_prompt',
      'character_sheet',
      'imported_extra',
    ]);
  });

  it('reports dependency-breaking order without blocking it', () => {
    expect(getDraftSendOrderWarnings(['post_history', 'system_prompt', 'character_sheet'], template)).toEqual([
      {
        assetName: 'post_history',
        dependencyNames: ['system_prompt'],
      },
    ]);
  });

  it('builds prior assets from the saved send order instead of template order', () => {
    const draft = createDraft(
      {
        component_send_order: ['post_history', 'system_prompt', 'character_sheet'],
      },
      {
        system_prompt: 'system prompt',
        post_history: 'post history',
        character_sheet: 'character sheet',
      }
    );

    expect(buildDraftPriorAssets(draft, 'system_prompt', template)).toEqual({
      post_history: 'post history',
    });
  });

  it('normalizes saved order and merges instruction blocks for outbound generation', () => {
    const draft = createDraft({}, {
      system_prompt: 'system prompt',
      post_history: 'post history',
    });

    expect(normalizeDraftComponentSendOrderForSave(['post_history'], draft, template)).toEqual([
      'post_history',
      'system_prompt',
      'character_sheet',
    ]);
    expect(mergeDraftAdditionalInstructions('Keep the tone severe.', 'Sharpen the opening.')).toEqual([
      'Keep the tone severe.',
      'Sharpen the opening.',
    ]);
  });
});