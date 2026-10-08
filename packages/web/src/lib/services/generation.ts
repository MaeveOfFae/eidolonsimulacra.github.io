/**
 * Generation Service
 * Client-side character generation using LLM engines
 */

import type {
  Draft,
  GenerateRequest,
  GenerateAssetRequest,
  LorebookGenerationRequest,
  OffspringRequest,
  SeedGenerationRequest,
  ChatMessage,
  TokenUsage,
} from '@char-gen/shared';
import {
  LOREBOOK_REFERENCE_ASSET_ORDER,
  LOREBOOK_REFERENCE_ASSET_PREFIXES,
  parseBlueprintOutput as parseGeneratedBlueprintOutput,
} from '@char-gen/shared';
import { createEngine } from '../llm/factory.js';
import { unwrapSingleCodeFence } from '../content-format.js';
import { configManager } from '../config/manager.js';
import { DraftStorage } from '../storage/draft-db.js';
import { beginUsageCapture, errorMessageOf } from './usage-capture.js';
import {
  appendVisibleChunk,
  createConfiguredEngine,
  createStreamDisplayState,
  getFallbackApiKey,
  resolveConfiguredProvider,
  resolveGenerationMaxTokens,
  sanitizeGeneratedSeed,
  sanitizeModelContent,
} from './generation/engine.js';
import { generateReviewId, parseBlueprintOutput, parseCharacterProfile } from './generation/parsing.js';
import {
  buildOrchestratorPrompt,
  buildAssetPrompt,
  buildLorebookPrompt,
  buildSeedGenPrompt,
  buildSimilarityPrompt,
  buildOffspringPrompt,
  formatMessages,
} from '../prompting/builder.js';
import type { ImportedSourceContext, ReferenceSuiteContext } from '../prompting/builder.js';
import {
  inferCharacterDisplayNameForTemplate,
  resolveTemplateBlueprintContent,
  resolveTemplateDefinition,
} from '../templates/browser.js';
import { parseSeedGenerationResponse, resolveSeedGenerationInput } from '../seed-generator.js';
import { loadReferenceSuites, normalizeConnectedReferenceIds } from '../prompting/reference-context.js';

/**
 * Progress callback for generation
 */
export interface GenerationProgress {
  type: 'status' | 'asset' | 'chunk' | 'complete' | 'error';
  stage?: string;
  asset?: string;
  content?: string;
  progress?: number;
  error?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

/**
 * Extended generate request with blueprint override
 */
export interface ExtendedGenerateRequest extends GenerateRequest {
  blueprint_override?: string;
  additional_instructions?: string[];
  imported_source?: ImportedSourceContext;
  /** Comparison runs override the configured model per candidate. */
  model_override?: string;
  /** Links candidate drafts from one comparison run. */
  comparison_group?: string;
}

/**
 * Extended offspring request with blueprint override
 */
export interface ExtendedOffspringRequest extends OffspringRequest {
  blueprint_override?: string;
}

type AssetGenerationRequest = GenerateAssetRequest & {
  reference_suites?: ReferenceSuiteContext[];
  imported_source?: ImportedSourceContext;
};

interface GenerationRunOptions {
  signal?: AbortSignal;
}

/**
 * Generation Service
 */
export class GenerationService {
  private static getOffspringCarryRules(): string[] {
    return [
      'Treat this seed as an offspring outcome shaped by two parent suites, not a disconnected standalone premise.',
      'Preserve the inherited, inverted, or transmuted relational vector toward {{user}} implied by the offspring seed.',
      'Do not flatten lineage tension: the generated assets should still feel like a descendant response to parental influence even when the seed expresses rebellion or mutation.',
    ];
  }

  /**
   * Generate a full character from a seed
   */
  static async *generate(
    request: ExtendedGenerateRequest,
    options: GenerationRunOptions = {},
  ): AsyncIterable<GenerationProgress> {
    const {
      seed,
      template,
      mode = 'Auto',
      stream = true,
      blueprint_override,
      additional_instructions = [],
      connected_draft_ids = [],
      imported_source,
      model_override,
      comparison_group,
    } = request;

    yield { type: 'status', stage: 'initializing' };

    const engine = createConfiguredEngine(model_override ? { model: model_override } : undefined);

    // Get template assets
    const templateDefinition = template ? resolveTemplateDefinition(template) : undefined;
    const connectedDraftIds = normalizeConnectedReferenceIds(connected_draft_ids);
    const referenceSuites = await loadReferenceSuites(connectedDraftIds, {
      resolveTemplate: (templateName) => (templateName ? resolveTemplateDefinition(templateName) : undefined),
    });

    yield { type: 'status', stage: 'building_prompt' };

    // Build orchestrator prompt - respects settings and override
    const [systemPrompt, userPrompt] = await buildOrchestratorPrompt(
      seed,
      mode,
      templateDefinition,
      undefined,
      blueprint_override,
      additional_instructions,
      referenceSuites,
      imported_source,
    );

    yield { type: 'status', stage: 'generating' };

    // Generate response
    const messages = formatMessages(systemPrompt, userPrompt);
    let fullContent = '';
    const usageCapture = beginUsageCapture(engine, {
      kind: comparison_group ? 'comparison' : 'orchestrator',
      templateName: template,
    });
    let engineUsage: TokenUsage | undefined;

    try {
      if (stream) {
        const streamState = createStreamDisplayState();
        for await (const chunk of engine.generateStream(messages, { signal: options.signal })) {
          if (chunk.content) {
            const visibleChunk = appendVisibleChunk(streamState, chunk.content);
            fullContent = streamState.visibleContent;
            if (visibleChunk) {
              yield {
                type: 'chunk',
                content: visibleChunk,
              };
            }
          }
          if (chunk.done) {
            engineUsage = chunk.usage;
            break;
          }
        }

        if (!fullContent.trim() && !options.signal?.aborted) {
          const fallbackResult = await engine.generate(messages, { signal: options.signal });
          fullContent = sanitizeModelContent(fallbackResult.content);
          engineUsage = fallbackResult.usage ?? engineUsage;
          if (fullContent) {
            yield {
              type: 'chunk',
              content: fullContent,
            };
          }
        }
      } else {
        const result = await engine.generate(messages, { signal: options.signal });
        fullContent = sanitizeModelContent(result.content);
        engineUsage = result.usage;
      }
    } catch (error) {
      const salvagedReviewId = await this.salvagePartialGeneration({
        seed,
        template,
        mode,
        content: fullContent,
        connectedDraftIds,
        comparisonGroup: comparison_group,
      });
      if (salvagedReviewId) {
        // Surface the salvaged checkpoint to callers (batch errors append it
        // to their message) without changing the thrown error type.
        (error as { salvagedDraftId?: string }).salvagedDraftId = salvagedReviewId;
      }
      usageCapture.finish({
        status: options.signal?.aborted ? 'aborted' : 'error',
        usage: engineUsage,
        draftId: salvagedReviewId,
        errorMessage: errorMessageOf(error),
      });
      throw error;
    }

    yield { type: 'status', stage: 'parsing' };

    // Parse the response into assets
    let assets: Record<string, string>;
    try {
      assets = templateDefinition
        ? parseGeneratedBlueprintOutput(fullContent, templateDefinition).assets
        : parseBlueprintOutput(fullContent);
    } catch {
      assets = parseBlueprintOutput(fullContent);
    }

    yield { type: 'status', stage: 'saving' };

    // Save draft
    const reviewId = generateReviewId();
    const characterName = inferCharacterDisplayNameForTemplate(assets, template);
    const draft: Draft = {
      path: reviewId,
      metadata: {
        review_id: reviewId,
        seed,
        mode,
        model: engine.getModel(),
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        favorite: false,
        template_name: template,
        character_name: characterName,
        connected_drafts: connectedDraftIds.length > 0 ? connectedDraftIds : undefined,
        ...(comparison_group ? { comparison_group } : {}),
      },
      assets,
    };

    await DraftStorage.saveDraft(draft);

    usageCapture.finish({
      status: options.signal?.aborted ? 'aborted' : 'ok',
      usage: engineUsage,
      draftId: reviewId,
    });

    yield {
      type: 'complete',
      asset: reviewId,
    };
  }

  /**
   * Checkpoint salvage for the single-shot orchestrator path (batch runs,
   * comparison runs, direct API callers): when the full-run stream dies after
   * content started arriving, parse the assets that completed inside the
   * partial document and save them as a draft so the run can be finished from
   * review instead of being lost. Only closed asset blocks parse, so a block
   * cut off mid-stream is excluded. The draft carries a notes marker and its
   * usage record is attributed to the salvaged draft id.
   */
  private static async salvagePartialGeneration(input: {
    seed: string;
    template?: string;
    mode?: string;
    content: string;
    connectedDraftIds: string[];
    comparisonGroup?: string;
  }): Promise<string | undefined> {
    if (!input.content.trim()) {
      return undefined;
    }

    try {
      const templateDefinition = input.template ? resolveTemplateDefinition(input.template) : undefined;
      let assets: Record<string, string>;
      try {
        assets = templateDefinition
          ? parseGeneratedBlueprintOutput(input.content, templateDefinition).assets
          : parseBlueprintOutput(input.content);
      } catch {
        assets = parseBlueprintOutput(input.content);
      }

      if (Object.keys(assets).length === 0) {
        return undefined;
      }

      const reviewId = generateReviewId();
      const draft: Draft = {
        path: reviewId,
        metadata: {
          review_id: reviewId,
          seed: input.seed,
          mode: input.mode as Draft['metadata']['mode'],
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          favorite: false,
          template_name: input.template,
          character_name: inferCharacterDisplayNameForTemplate(assets, input.template),
          connected_drafts: input.connectedDraftIds.length > 0 ? input.connectedDraftIds : undefined,
          notes: 'Partial generation salvaged from an interrupted run; regenerate the missing assets from review.',
          ...(input.comparisonGroup ? { comparison_group: input.comparisonGroup } : {}),
        },
        assets,
      };

      await DraftStorage.saveDraft(draft);
      return reviewId;
    } catch {
      // Salvage is best-effort: never mask the original generation error.
      return undefined;
    }
  }

  /**
   * Generate a single asset
   */
  static async *generateAsset(
    request: AssetGenerationRequest,
    stream: boolean = true,
    options: GenerationRunOptions = {},
  ): AsyncIterable<GenerationProgress> {
    const blueprintContent = resolveTemplateBlueprintContent(request.template, request.asset_name);
    yield* this.generateAssetWithBlueprint(request, blueprintContent, stream, options);
  }

  static async *previewBlueprint(
    request: AssetGenerationRequest & { blueprint_content: string },
    stream: boolean = true,
    options: GenerationRunOptions = {},
  ): AsyncIterable<GenerationProgress> {
    yield* this.generateAssetWithBlueprint(request, request.blueprint_content, stream, options);
  }

  private static async *generateAssetWithBlueprint(
    request: AssetGenerationRequest,
    blueprintContent: string | undefined,
    stream: boolean,
    options: GenerationRunOptions = {},
  ): AsyncIterable<GenerationProgress> {
    const {
      seed,
      mode = 'Auto',
      asset_name,
      prior_assets,
      additional_instructions = [],
      reference_suites = [],
      imported_source,
    } = request;

    yield { type: 'status', stage: 'initializing' };

    const engine = createConfiguredEngine();

    yield { type: 'status', stage: 'building_prompt' };

    // Build asset prompt
    const [systemPrompt, userPrompt] = await buildAssetPrompt(
      asset_name,
      seed,
      mode,
      prior_assets,
      blueprintContent,
      undefined,
      additional_instructions,
      reference_suites,
      request.template,
      imported_source,
    );

    yield {
      type: 'status',
      stage: 'prompt_ready',
      asset: asset_name,
      systemPrompt,
      userPrompt,
    };

    yield { type: 'status', stage: 'generating', asset: asset_name };

    // Generate response
    const messages = formatMessages(systemPrompt, userPrompt);
    let fullContent = '';
    const usageCapture = beginUsageCapture(engine, {
      kind: 'asset',
      templateName: request.template,
      assetName: asset_name,
    });
    let engineUsage: TokenUsage | undefined;

    try {
      if (stream) {
        const streamState = createStreamDisplayState();
        for await (const chunk of engine.generateStream(messages, { signal: options.signal })) {
          if (chunk.content) {
            const visibleChunk = appendVisibleChunk(streamState, chunk.content);
            fullContent = streamState.visibleContent;
            if (visibleChunk) {
              yield {
                type: 'chunk',
                content: visibleChunk,
                asset: asset_name,
              };
            }
          }
          if (chunk.done) {
            engineUsage = chunk.usage;
            break;
          }
        }

        if (!fullContent.trim() && !options.signal?.aborted) {
          const fallbackResult = await engine.generate(messages, { signal: options.signal });
          fullContent = sanitizeModelContent(fallbackResult.content);
          engineUsage = fallbackResult.usage ?? engineUsage;
        }
      } else {
        const result = await engine.generate(messages, { signal: options.signal });
        fullContent = sanitizeModelContent(result.content);
        engineUsage = result.usage;
      }
    } catch (error) {
      usageCapture.finish({
        status: options.signal?.aborted ? 'aborted' : 'error',
        usage: engineUsage,
        errorMessage: errorMessageOf(error),
      });
      throw error;
    }

    usageCapture.finish({
      status: options.signal?.aborted ? 'aborted' : 'ok',
      usage: engineUsage,
    });

    yield {
      type: 'asset',
      asset: asset_name,
      content: unwrapSingleCodeFence(fullContent),
      systemPrompt,
      userPrompt,
    };
  }

  /**
   * Generate an offspring seed from two parents
   */
  static async *generateOffspringSeed(
    request: ExtendedOffspringRequest,
    options: GenerationRunOptions = {},
  ): AsyncIterable<GenerationProgress> {
    const { parent1_id, parent2_id, mode = 'Auto', blueprint_override } = request;

    yield { type: 'status', stage: 'loading_parents' };

    // Load parent drafts
    const parent1 = await DraftStorage.getDraft(parent1_id);
    const parent2 = await DraftStorage.getDraft(parent2_id);

    if (!parent1 || !parent2) {
      yield {
        type: 'error',
        error: 'Parent drafts not found',
      };
      return;
    }

    yield { type: 'status', stage: 'building_prompt' };

    const engine = createConfiguredEngine();

    // Build offspring prompt - respects settings and override
    const [systemPrompt, userPrompt] = await buildOffspringPrompt(
      parent1.assets,
      parent2.assets,
      parent1.metadata.character_name || 'Parent 1',
      parent2.metadata.character_name || 'Parent 2',
      mode,
      parent1.metadata.template_name ? resolveTemplateDefinition(parent1.metadata.template_name) : undefined,
      parent2.metadata.template_name ? resolveTemplateDefinition(parent2.metadata.template_name) : undefined,
      undefined,
      blueprint_override,
    );

    yield { type: 'status', stage: 'generating' };

    // Generate seed
    const messages = formatMessages(systemPrompt, userPrompt);
    let fullContent = '';
    const streamState = createStreamDisplayState();
    const usageCapture = beginUsageCapture(engine, { kind: 'offspring-seed', templateName: request.template });
    let engineUsage: TokenUsage | undefined;

    try {
      for await (const chunk of engine.generateStream(messages, { signal: options.signal })) {
        if (chunk.content) {
          const visibleChunk = appendVisibleChunk(streamState, chunk.content);
          fullContent = streamState.visibleContent;
          if (visibleChunk) {
            yield {
              type: 'chunk',
              content: visibleChunk,
            };
          }
        }
        if (chunk.done) {
          engineUsage = chunk.usage;
          break;
        }
      }

      if (!fullContent.trim() && !options.signal?.aborted) {
        const fallbackResult = await engine.generate(messages, { signal: options.signal });
        fullContent = sanitizeModelContent(fallbackResult.content);
        engineUsage = fallbackResult.usage ?? engineUsage;
        if (fullContent) {
          yield {
            type: 'chunk',
            content: fullContent,
          };
        }
      }
    } catch (error) {
      usageCapture.finish({
        status: options.signal?.aborted ? 'aborted' : 'error',
        usage: engineUsage,
        errorMessage: errorMessageOf(error),
      });
      throw error;
    }

    usageCapture.finish({
      status: options.signal?.aborted ? 'aborted' : 'ok',
      usage: engineUsage,
    });

    const offspringSeed = sanitizeGeneratedSeed(fullContent);

    yield {
      type: 'complete',
      content: offspringSeed,
    };
  }

  /**
   * Generate offspring from two parents
   */
  static async *generateOffspring(
    request: ExtendedOffspringRequest,
    options: GenerationRunOptions = {},
  ): AsyncIterable<GenerationProgress> {
    const { parent1_id, parent2_id, mode = 'Auto', template, blueprint_override } = request;

    let offspringSeed = '';
    for await (const progress of this.generateOffspringSeed(request, options)) {
      if (progress.type === 'error') {
        yield progress;
        return;
      }

      if (progress.type === 'status' || progress.type === 'chunk') {
        yield progress;
      }

      if (progress.type === 'complete') {
        offspringSeed = progress.content || '';
      }
    }

    if (!offspringSeed) {
      yield {
        type: 'error',
        error: 'Offspring seed generation finished without seed content.',
      };
      return;
    }

    // Hand the offspring seed into the standard generator path.
    yield { type: 'status', stage: 'generating_character' };

    let draftId = '';
    for await (const progress of this.generate(
      {
        seed: offspringSeed,
        mode,
        template,
        stream: false,
        blueprint_override,
        additional_instructions: this.getOffspringCarryRules(),
      },
      options,
    )) {
      if (progress.type === 'error') {
        yield progress;
        return;
      }

      if (progress.type === 'status' && progress.stage === 'saving') {
        yield { type: 'status', stage: 'saving' };
      }

      if (progress.type === 'complete') {
        draftId = progress.asset || '';
      }
    }

    if (!draftId) {
      yield {
        type: 'error',
        error: 'Offspring generation finished without a saved draft id.',
      };
      return;
    }

    await DraftStorage.updateMetadata(draftId, {
      seed: offspringSeed,
      parent_drafts: [parent1_id, parent2_id],
      offspring_type: 'offspring',
    });

    yield {
      type: 'complete',
      asset: draftId,
    };
  }

  static async *generateLorebook(
    request: LorebookGenerationRequest,
    options: GenerationRunOptions = {},
  ): AsyncIterable<GenerationProgress> {
    const draftIds = normalizeConnectedReferenceIds(request.draft_ids);
    if (draftIds.length === 0) {
      yield {
        type: 'error',
        error: 'Select at least one reference draft to generate a lorebook packet.',
      };
      return;
    }

    yield { type: 'status', stage: 'loading_references' };

    const referenceSuites = await loadReferenceSuites(draftIds, {
      preferredAssetOrder: [...LOREBOOK_REFERENCE_ASSET_ORDER],
      includeAssetPrefixes: LOREBOOK_REFERENCE_ASSET_PREFIXES,
      resolveTemplate: (templateName) => (templateName ? resolveTemplateDefinition(templateName) : undefined),
    });

    if (referenceSuites.length === 0) {
      yield {
        type: 'error',
        error: 'The selected drafts did not contain enough usable reference context for lorebook generation.',
      };
      return;
    }

    yield { type: 'status', stage: 'building_prompt' };

    const engine = createConfiguredEngine();
    const [systemPrompt, userPrompt] = await buildLorebookPrompt(referenceSuites, {
      focus: request.focus,
      blueprintContent: request.blueprint_content,
    });

    yield { type: 'status', stage: 'generating' };

    const messages = formatMessages(systemPrompt, userPrompt);
    let fullContent = '';
    const streamState = createStreamDisplayState();
    const usageCapture = beginUsageCapture(engine, { kind: 'lorebook' });
    let engineUsage: TokenUsage | undefined;

    try {
      for await (const chunk of engine.generateStream(messages, { signal: options.signal })) {
        if (chunk.content) {
          const visibleChunk = appendVisibleChunk(streamState, chunk.content);
          fullContent = streamState.visibleContent;
          if (visibleChunk) {
            yield {
              type: 'chunk',
              content: visibleChunk,
            };
          }
        }
        if (chunk.done) {
          engineUsage = chunk.usage;
          break;
        }
      }

      if (!fullContent.trim() && !options.signal?.aborted) {
        const fallbackResult = await engine.generate(messages, { signal: options.signal });
        fullContent = sanitizeModelContent(fallbackResult.content);
        engineUsage = fallbackResult.usage ?? engineUsage;
        if (fullContent) {
          yield {
            type: 'chunk',
            content: fullContent,
          };
        }
      }
    } catch (error) {
      usageCapture.finish({
        status: options.signal?.aborted ? 'aborted' : 'error',
        usage: engineUsage,
        errorMessage: errorMessageOf(error),
      });
      throw error;
    }

    usageCapture.finish({
      status: options.signal?.aborted ? 'aborted' : 'ok',
      usage: engineUsage,
    });

    yield {
      type: 'complete',
      content: unwrapSingleCodeFence(fullContent).trim(),
    };
  }

  /**
   * Generate seeds from genre lines
   */
  static async *generateSeeds(request: SeedGenerationRequest | string): AsyncIterable<GenerationProgress> {
    yield { type: 'status', stage: 'initializing' };

    const resolvedRequest: SeedGenerationRequest & { blueprint_content?: string } =
      typeof request === 'string' ? { genre_lines: request } : request;
    const { genreLines } = resolveSeedGenerationInput(resolvedRequest);

    // Get API keys and config
    const apiKeys = configManager.getApiKeys();
    const config = configManager.getConfig();

    // Create engine
    const provider = resolveConfiguredProvider(config);
    const engine = createEngine({
      model: config.model,
      apiKey: provider ? apiKeys[provider] : getFallbackApiKey(apiKeys),
      apiKeys,
      provider,
      // Custom owns the base-URL override.
      baseUrl: provider === 'custom' ? config.base_url : undefined,
      temperature: config.temperature,
      maxTokens: resolveGenerationMaxTokens(config),
    });

    yield { type: 'status', stage: 'building_prompt' };

    // Build seed generation prompt
    const [systemPrompt, userPrompt] = await buildSeedGenPrompt(genreLines, resolvedRequest.blueprint_content);

    yield { type: 'status', stage: 'generating' };

    // Generate seeds
    const messages = formatMessages(systemPrompt, userPrompt);
    const usageCapture = beginUsageCapture(engine, { kind: 'seed' });

    try {
      const result = await engine.generate(messages);
      usageCapture.finish({ status: 'ok', usage: result.usage });

      // Parse seeds (one per line)
      const seeds = parseSeedGenerationResponse(sanitizeModelContent(result.content));

      yield {
        type: 'complete',
        content: seeds.join('\n'),
      };
    } catch (error) {
      usageCapture.finish({ status: 'error', errorMessage: errorMessageOf(error) });
      throw error;
    }
  }

  /**
   * Chat with LLM (for refinement/assistance)
   */
  static async *chat(
    draftId: string,
    messages: ChatMessage[],
    contextAsset?: string,
  ): AsyncIterable<GenerationProgress> {
    yield { type: 'status', stage: 'initializing' };

    // Get API keys and config
    const apiKeys = configManager.getApiKeys();
    const config = configManager.getConfig();

    // Create engine
    const provider = resolveConfiguredProvider(config);
    const engine = createEngine({
      model: config.model,
      apiKey: provider ? apiKeys[provider] : getFallbackApiKey(apiKeys),
      apiKeys,
      provider,
      // Custom owns the base-URL override.
      baseUrl: provider === 'custom' ? config.base_url : undefined,
      temperature: config.temperature,
      maxTokens: resolveGenerationMaxTokens(config),
    });

    yield { type: 'status', stage: 'generating' };

    // Use first message as system if provided, otherwise use default
    const systemPrompt = messages[0]?.role === 'system' ? messages[0].content : undefined;
    const chatMessages = systemPrompt ? messages.slice(1) : messages;

    // Generate response
    let fullContent = '';
    const usageCapture = beginUsageCapture(engine, { kind: 'chat', draftId, assetName: contextAsset });
    let engineUsage: TokenUsage | undefined;

    try {
      const streamState = createStreamDisplayState();

      for await (const chunk of engine.generateStream(chatMessages)) {
        if (chunk.content) {
          const visibleChunk = appendVisibleChunk(streamState, chunk.content);
          fullContent = streamState.visibleContent;
          if (visibleChunk) {
            yield {
              type: 'chunk',
              content: visibleChunk,
            };
          }
        }
        if (chunk.done) {
          engineUsage = chunk.usage;
          break;
        }
      }

      if (!fullContent.trim()) {
        const fallbackResult = await engine.generate(chatMessages);
        fullContent = sanitizeModelContent(fallbackResult.content);
        engineUsage = fallbackResult.usage ?? engineUsage;
        if (fullContent) {
          yield {
            type: 'chunk',
            content: fullContent,
          };
        }
      }
    } catch (error) {
      usageCapture.finish({ status: 'error', usage: engineUsage, errorMessage: errorMessageOf(error) });
      throw error;
    }

    usageCapture.finish({ status: 'ok', usage: engineUsage });

    yield {
      type: 'complete',
      content: fullContent,
    };
  }

  /**
   * Analyze similarity between two characters
   */
  static async analyzeSimilarity(draft1Id: string, draft2Id: string): Promise<unknown> {
    // Load drafts
    const draft1 = await DraftStorage.getDraft(draft1Id);
    const draft2 = await DraftStorage.getDraft(draft2Id);

    if (!draft1 || !draft2) {
      throw new Error('One or both drafts not found');
    }

    // Extract character profiles from character sheets
    const profile1 = parseCharacterProfile(draft1.assets.character_sheet || '');
    const profile2 = parseCharacterProfile(draft2.assets.character_sheet || '');

    // Get API keys and config
    const apiKeys = configManager.getApiKeys();
    const config = configManager.getConfig();

    // Create engine
    const provider = resolveConfiguredProvider(config);
    const engine = createEngine({
      model: config.model,
      apiKey: provider ? apiKeys[provider] : getFallbackApiKey(apiKeys),
      apiKeys,
      provider,
      // Custom owns the base-URL override.
      baseUrl: provider === 'custom' ? config.base_url : undefined,
      temperature: config.temperature,
      maxTokens: resolveGenerationMaxTokens(config),
    });

    // Build similarity prompt
    const [systemPrompt, userPrompt] = buildSimilarityPrompt(profile1, profile2);
    const messages = formatMessages(systemPrompt, userPrompt);

    // Generate analysis
    const usageCapture = beginUsageCapture(engine, { kind: 'similarity' });

    try {
      const result = await engine.generate(messages);
      usageCapture.finish({ status: 'ok', usage: result.usage });

      const sanitizedContent = sanitizeModelContent(result.content);

      // Parse JSON response
      try {
        return JSON.parse(sanitizedContent);
      } catch {
        // Return text if JSON parsing fails
        return { raw: sanitizedContent };
      }
    } catch (error) {
      usageCapture.finish({ status: 'error', errorMessage: errorMessageOf(error) });
      throw error;
    }
  }
}

/**
 * Default export
 */
export default GenerationService;
