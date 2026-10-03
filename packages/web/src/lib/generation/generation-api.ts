/**
 * Generation, chat, and analysis operations for the browser API facade.
 *
 * Extracted from `EidolonBrowserAPI` (4.7.0). Every streaming method wraps
 * `GenerationService` progress into `BrowserStream` events; `finalizeGeneration`
 * and the seed/batch/offspring/lorebook helpers persist their results through
 * `DraftStorage`; chat/refine/optimizeText stream through the current config's
 * engine via `generateWithCurrentConfig`. Behavior is pinned by the generation
 * component tests (`Generation`, `GenerationProgress`, `DraftRefiner`,
 * `AssetRegenerator`, `Compare`) and the `services/generation` suites, all
 * exercised through the facade.
 */

import {
  buildOptimizeTextMessages,
  buildSimilarityResult,
  type ChatMessage,
  type ChatRequest,
  type Draft,
  type FinalizeGenerationRequest,
  type GenerateAssetRequest,
  type GenerateAssetResponse,
  type GenerateBatchRequest,
  type GenerateRequest,
  type GenerationComplete,
  type LorebookGenerationRequest,
  type OffspringRequest,
  type OptimizeTextRequest,
  type RefineRequest,
  type SeedGenerationRequest,
  type SeedGenerationResponse,
  type SimilarityRequest,
  type SimilarityResult,
} from '@char-gen/shared';
import { APIError } from '../api-error.js';
import { getFallbackApiKey, resolveConfiguredProvider } from '../config/config-api.js';
import { configManager } from '../config/manager.js';
import { getDraft } from '../drafts/draft-api.js';
import { createEngine } from '../llm/factory.js';
import { GenerationService } from '../services/generation.js';
import { DraftStorage } from '../storage/draft-db.js';
import { inferCharacterDisplayNameForTemplate } from '../templates/browser.js';
import { BrowserStream, type BlueprintPreviewRequest, type BlueprintPreviewResponse } from './browser-stream.js';

async function generateWithCurrentConfig(
  messages: ChatMessage[],
): Promise<AsyncIterable<{ content?: string; done?: boolean }>> {
  const config = configManager.getConfig();
  const apiKeys = configManager.getApiKeys();
  const provider = resolveConfiguredProvider(config);
  const engine = createEngine({
    model: config.model,
    apiKey: provider ? apiKeys[provider] : getFallbackApiKey(apiKeys),
    apiKeys,
    provider,
    baseUrl: config.base_url,
    temperature: config.temperature,
    maxTokens: config.max_tokens,
  });
  return engine.generateStream(messages);
}

export async function generateSeeds(request: SeedGenerationRequest): Promise<SeedGenerationResponse> {
  const seeds: string[] = [];

  for await (const progress of GenerationService.generateSeeds(request)) {
    if (progress.type === 'complete' && progress.content) {
      seeds.push(
        ...progress.content
          .split('\n')
          .map((seed) => seed.trim())
          .filter(Boolean),
      );
    }
  }

  return { seeds: [...new Set(seeds)] };
}

export function generate(_request: GenerateRequest): BrowserStream {
  return new BrowserStream(async ({ emit, signal }) => {
    for await (const progress of GenerationService.generate(_request, { signal })) {
      if (signal.aborted) {
        return;
      }
      if (progress.type === 'chunk') {
        emit('chunk', { content: progress.content || '' });
      }
      if (progress.type === 'complete') {
        const draftId = progress.asset || '';
        const draft = draftId ? await DraftStorage.getDraft(draftId) : null;
        emit('complete', {
          draft_path: draftId,
          draft_id: draftId,
          character_name: draft?.metadata.character_name,
          duration_ms: 0,
        } satisfies GenerationComplete);
      }
      if (progress.type === 'error') {
        emit('error', { error: progress.error || 'Generation failed' });
      }
    }
  });
}

export function generateAsset(request: GenerateAssetRequest): BrowserStream {
  return new BrowserStream(async ({ emit, signal }) => {
    for await (const progress of GenerationService.generateAsset(request, true, { signal })) {
      if (signal.aborted) {
        return;
      }
      if (progress.type === 'chunk') {
        emit('chunk', { content: progress.content || '' });
      }
      if (progress.type === 'asset') {
        emit('complete', {
          asset_name: request.asset_name,
          content: progress.content || '',
        } satisfies GenerateAssetResponse);
      }
      if (progress.type === 'error') {
        emit('error', { error: progress.error || 'Asset generation failed' });
      }
    }
  });
}

export function previewBlueprint(request: BlueprintPreviewRequest): BrowserStream {
  return new BrowserStream(async ({ emit, signal }) => {
    for await (const progress of GenerationService.previewBlueprint(request, true, { signal })) {
      if (signal.aborted) {
        return;
      }
      if (progress.type === 'chunk') {
        emit('chunk', { content: progress.content || '' });
      }
      if (progress.type === 'asset') {
        emit('complete', {
          asset_name: request.asset_name,
          content: progress.content || '',
          system_prompt: progress.systemPrompt || '',
          user_prompt: progress.userPrompt || '',
        } satisfies BlueprintPreviewResponse);
      }
      if (progress.type === 'error') {
        emit('error', { error: progress.error || 'Blueprint preview failed' });
      }
    }
  });
}

export async function finalizeGeneration(request: FinalizeGenerationRequest): Promise<GenerationComplete> {
  const reviewId = crypto.randomUUID();
  const characterName = inferCharacterDisplayNameForTemplate(request.assets, request.template);
  const draft: Draft = {
    path: reviewId,
    metadata: {
      review_id: reviewId,
      seed: request.seed,
      mode: request.mode,
      model: configManager.getConfig().model,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      favorite: false,
      template_name: request.template,
      character_name: characterName,
    },
    assets: request.assets,
  };
  await DraftStorage.saveDraft(draft);
  return {
    draft_path: reviewId,
    draft_id: reviewId,
    character_name: characterName,
    duration_ms: 0,
  };
}

export function generateBatch(seeds: string[], request: Omit<GenerateBatchRequest, 'seeds'>): BrowserStream {
  return new BrowserStream(async ({ emit, signal }) => {
    const runSeed = async (seed: string, index: number) => {
      emit('batch_start', { index, seed });
      try {
        let draftId = '';
        for await (const progress of GenerationService.generate(
          {
            seed,
            mode: request.mode,
            template: request.template,
            selected_assets: request.selected_assets,
            connected_draft_ids: request.connected_draft_ids,
          },
          { signal },
        )) {
          if (signal.aborted) {
            return;
          }
          if (progress.type === 'complete') {
            draftId = progress.asset || '';
          }
        }
        emit('batch_complete', { index, seed, draft_path: draftId });
      } catch (error) {
        emit('batch_error', {
          index,
          seed,
          error: error instanceof Error ? error.message : 'Batch generation failed',
        });
      }
    };

    if (request.parallel) {
      let nextIndex = 0;
      const workerCount = Math.min(Math.max(request.max_concurrent ?? 3, 1), seeds.length || 1);
      await Promise.all(
        Array.from({ length: workerCount }, async () => {
          while (!signal.aborted) {
            const index = nextIndex;
            nextIndex += 1;
            if (index >= seeds.length) {
              return;
            }
            await runSeed(seeds[index], index);
          }
        }),
      );
    } else {
      for (let index = 0; index < seeds.length; index += 1) {
        if (signal.aborted) {
          return;
        }
        await runSeed(seeds[index], index);
      }
    }

    if (signal.aborted) {
      return;
    }

    emit('complete', { status: 'done' });
  });
}

export async function analyzeSimilarity(request: SimilarityRequest): Promise<SimilarityResult> {
  const left = await getDraft(request.draft1_id);
  const right = await getDraft(request.draft2_id);
  const baseResult = buildSimilarityResult(left, right);

  if (!request.include_llm_analysis) {
    return baseResult;
  }

  try {
    const analysis = (await GenerationService.analyzeSimilarity(request.draft1_id, request.draft2_id)) as {
      narrative_dynamics?: unknown;
      relationship_arc?: unknown;
      story_opportunities?: unknown;
      scene_suggestions?: unknown;
      raw?: unknown;
    };

    const storyHooks = Array.isArray(analysis.story_opportunities)
      ? analysis.story_opportunities.map((item) => String(item)).slice(0, 4)
      : baseResult.relationship_suggestions;
    const sceneSuggestions = Array.isArray(analysis.scene_suggestions)
      ? analysis.scene_suggestions.map((item) => String(item)).slice(0, 3)
      : baseResult.relationship_suggestions;
    const relationshipPotential =
      [analysis.narrative_dynamics, analysis.relationship_arc]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .join('\n\n') || (typeof analysis.raw === 'string' ? analysis.raw : 'LLM analysis unavailable.');

    return {
      ...baseResult,
      relationship_suggestions: sceneSuggestions,
      llm_analysis: {
        relationship_potential: relationshipPotential,
        conflict_areas: baseResult.differences.slice(0, 4),
        synergy_areas: baseResult.commonalities.slice(0, 4),
        story_hooks: storyHooks,
      },
    };
  } catch {
    return baseResult;
  }
}

export function generateOffspring(request: OffspringRequest): BrowserStream {
  return new BrowserStream(async ({ emit, signal }) => {
    for await (const progress of GenerationService.generateOffspring(request, { signal })) {
      if (signal.aborted) {
        return;
      }
      if (progress.type === 'status') {
        emit('status', {
          stage: progress.stage,
          asset: progress.asset,
          progress: progress.progress,
        });
      }
      if (progress.type === 'chunk') {
        emit('chunk', { content: progress.content || '' });
      }
      if (progress.type === 'complete') {
        const draftId = progress.asset || '';
        const draft = draftId ? await DraftStorage.getDraft(draftId) : null;
        emit('complete', {
          draft_id: draftId,
          character_name: draft?.metadata.character_name,
        });
      }
      if (progress.type === 'error') {
        emit('error', { error: progress.error || 'Offspring generation failed' });
      }
    }
  });
}

export function generateOffspringSeed(request: OffspringRequest): BrowserStream {
  return new BrowserStream(async ({ emit, signal }) => {
    for await (const progress of GenerationService.generateOffspringSeed(request, { signal })) {
      if (signal.aborted) {
        return;
      }
      if (progress.type === 'status') {
        emit('status', {
          stage: progress.stage,
          asset: progress.asset,
          progress: progress.progress,
        });
      }
      if (progress.type === 'chunk') {
        emit('chunk', { content: progress.content || '' });
      }
      if (progress.type === 'complete') {
        emit('complete', { content: progress.content || '' });
      }
      if (progress.type === 'error') {
        emit('error', { error: progress.error || 'Offspring seed generation failed' });
      }
    }
  });
}

export function generateLorebook(request: LorebookGenerationRequest): BrowserStream {
  return new BrowserStream(async ({ emit, signal }) => {
    for await (const progress of GenerationService.generateLorebook(request, { signal })) {
      if (signal.aborted) {
        return;
      }
      if (progress.type === 'status') {
        emit('status', {
          stage: progress.stage,
          asset: progress.asset,
          progress: progress.progress,
        });
      }
      if (progress.type === 'chunk') {
        emit('chunk', { content: progress.content || '' });
      }
      if (progress.type === 'complete') {
        emit('complete', { content: progress.content || '' });
      }
      if (progress.type === 'error') {
        emit('error', { error: progress.error || 'Lorebook generation failed' });
      }
    }
  });
}

export function chat(request: ChatRequest): BrowserStream {
  return new BrowserStream(async ({ emit, signal }) => {
    const draft = request.draft_id ? await DraftStorage.getDraft(request.draft_id) : null;
    const contextParts = [
      draft ? `Current draft metadata: ${JSON.stringify(draft.metadata)}` : '',
      request.context_asset && draft?.assets[request.context_asset]
        ? `Focused asset (${request.context_asset}):\n${draft.assets[request.context_asset]}`
        : '',
      request.screen_context ? `Screen context: ${JSON.stringify(request.screen_context)}` : '',
    ].filter(Boolean);

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are the in-app assistant for Eidolon Simulacra, a browser-only blueprint compiler. Be concise and practical. Use provided draft or screen context when relevant.',
      },
      ...(contextParts.length > 0 ? [{ role: 'system' as const, content: contextParts.join('\n\n') }] : []),
      ...request.messages,
    ];

    const stream = await generateWithCurrentConfig(messages);
    let fullContent = '';
    for await (const chunk of stream) {
      if (signal.aborted) {
        return;
      }
      if (chunk.content) {
        fullContent += chunk.content;
        emit('chunk', { content: chunk.content });
      }
      if (chunk.done) {
        break;
      }
    }
    emit('complete', { content: fullContent });
  });
}

export function refine(request: RefineRequest): BrowserStream {
  return new BrowserStream(async ({ emit, signal }) => {
    const draft = await getDraft(request.draft_id);
    const assetContent = draft.assets[request.asset];
    if (!assetContent) {
      throw new APIError(404, `Asset ${request.asset} not found in draft`);
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'Rewrite the provided asset according to the user request. Return only the revised asset content with no extra commentary.',
      },
      {
        role: 'user',
        content: `Draft seed: ${draft.metadata.seed}\nAsset: ${request.asset}\n\nCurrent content:\n${assetContent}\n\nRevision request:\n${request.message}`,
      },
    ];

    const stream = await generateWithCurrentConfig(messages);
    let fullContent = '';
    for await (const chunk of stream) {
      if (signal.aborted) {
        return;
      }
      if (chunk.content) {
        fullContent += chunk.content;
        emit('chunk', { content: chunk.content });
      }
      if (chunk.done) {
        break;
      }
    }
    emit('complete', { content: fullContent });
  });
}

export function optimizeText(request: OptimizeTextRequest): BrowserStream {
  return new BrowserStream(async ({ emit, signal }) => {
    const messages = buildOptimizeTextMessages(request);
    const stream = await generateWithCurrentConfig(messages);
    let fullContent = '';
    for await (const chunk of stream) {
      if (signal.aborted) {
        return;
      }
      if (chunk.content) {
        fullContent += chunk.content;
        emit('chunk', { content: chunk.content });
      }
      if (chunk.done) {
        break;
      }
    }
    emit('complete', { content: fullContent });
  });
}
