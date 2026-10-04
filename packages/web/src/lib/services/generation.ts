/**
 * Generation Service
 * Client-side character generation using LLM engines
 */

import type {
  ApiKeys,
  Config,
  Draft,
  GenerateRequest,
  GenerateAssetRequest,
  LorebookGenerationRequest,
  OffspringRequest,
  SeedGenerationRequest,
  ChatMessage,
  LLMProvider,
  TokenUsage,
} from '@char-gen/shared';
import { detectProviderFromModel, parseBlueprintOutput as parseGeneratedBlueprintOutput } from '@char-gen/shared';
import { createEngine } from '../llm/factory.js';
import { stripReasoningArtifacts, unwrapSingleCodeFence } from '../content-format.js';
import { configManager } from '../config/manager.js';
import { DraftStorage } from '../storage/draft-db.js';
import { beginUsageCapture, errorMessageOf } from './usage-capture.js';
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

const DEFAULT_GENERATION_MAX_TOKENS = 4096;

interface StreamDisplayState {
  rawContent: string;
  visibleContent: string;
}

/**
 * Generation Service
 */
export class GenerationService {
  private static createStreamDisplayState(): StreamDisplayState {
    return {
      rawContent: '',
      visibleContent: '',
    };
  }

  private static sanitizeModelContent(content: string): string {
    return stripReasoningArtifacts(content);
  }

  private static appendVisibleChunk(state: StreamDisplayState, chunkContent: string): string {
    state.rawContent += chunkContent;
    const nextVisibleContent = this.sanitizeModelContent(state.rawContent);
    const visibleDelta = nextVisibleContent.startsWith(state.visibleContent)
      ? nextVisibleContent.slice(state.visibleContent.length)
      : '';

    state.visibleContent = nextVisibleContent;
    return visibleDelta;
  }

  private static resolveGenerationMaxTokens(config: Config): number {
    const configuredMaxTokens =
      typeof config.max_tokens === 'number' && Number.isFinite(config.max_tokens)
        ? Math.max(1, Math.round(config.max_tokens))
        : DEFAULT_GENERATION_MAX_TOKENS;

    return configuredMaxTokens;
  }

  private static resolveConfiguredProvider(config: Config): LLMProvider | undefined {
    if (config.engine_mode === 'explicit' && config.engine !== 'auto' && config.engine !== 'openai_compatible') {
      return config.engine as LLMProvider;
    }

    return config.model ? detectProviderFromModel(config.model) : undefined;
  }

  private static getFallbackApiKey(apiKeys: ApiKeys): string | undefined {
    return Object.values(apiKeys).find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );
  }

  private static createConfiguredEngine(override?: { model: string }) {
    const apiKeys = configManager.getApiKeys();
    const config = configManager.getConfig();
    const model = override?.model ?? config.model;
    // Comparison candidates resolve their provider from the model string so a
    // single run can span providers without touching the global config.
    const provider = override ? detectProviderFromModel(model) : this.resolveConfiguredProvider(config);

    return createEngine({
      model,
      apiKey: provider ? apiKeys[provider] : this.getFallbackApiKey(apiKeys),
      apiKeys,
      provider,
      baseUrl: config.base_url,
      proxyKey: config.api_proxy_key,
      temperature: config.temperature,
      maxTokens: this.resolveGenerationMaxTokens(config),
    });
  }

  private static sanitizeGeneratedSeed(content: string): string {
    return unwrapSingleCodeFence(this.sanitizeModelContent(content)).replace(/^['"]|['"]$/g, '');
  }

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

    const engine = this.createConfiguredEngine(model_override ? { model: model_override } : undefined);

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
        const streamState = this.createStreamDisplayState();
        for await (const chunk of engine.generateStream(messages, { signal: options.signal })) {
          if (chunk.content) {
            const visibleChunk = this.appendVisibleChunk(streamState, chunk.content);
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
          fullContent = this.sanitizeModelContent(fallbackResult.content);
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
        fullContent = this.sanitizeModelContent(result.content);
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
        : this.parseBlueprintOutput(fullContent);
    } catch {
      assets = this.parseBlueprintOutput(fullContent);
    }

    yield { type: 'status', stage: 'saving' };

    // Save draft
    const reviewId = this.generateReviewId();
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
          : this.parseBlueprintOutput(input.content);
      } catch {
        assets = this.parseBlueprintOutput(input.content);
      }

      if (Object.keys(assets).length === 0) {
        return undefined;
      }

      const reviewId = this.generateReviewId();
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

    const engine = this.createConfiguredEngine();

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
        const streamState = this.createStreamDisplayState();
        for await (const chunk of engine.generateStream(messages, { signal: options.signal })) {
          if (chunk.content) {
            const visibleChunk = this.appendVisibleChunk(streamState, chunk.content);
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
          fullContent = this.sanitizeModelContent(fallbackResult.content);
          engineUsage = fallbackResult.usage ?? engineUsage;
        }
      } else {
        const result = await engine.generate(messages, { signal: options.signal });
        fullContent = this.sanitizeModelContent(result.content);
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

    const engine = this.createConfiguredEngine();

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
    const streamState = this.createStreamDisplayState();
    const usageCapture = beginUsageCapture(engine, { kind: 'offspring-seed', templateName: request.template });
    let engineUsage: TokenUsage | undefined;

    try {
      for await (const chunk of engine.generateStream(messages, { signal: options.signal })) {
        if (chunk.content) {
          const visibleChunk = this.appendVisibleChunk(streamState, chunk.content);
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
        fullContent = this.sanitizeModelContent(fallbackResult.content);
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

    const offspringSeed = this.sanitizeGeneratedSeed(fullContent);

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
      preferredAssetOrder: [
        'lorebook',
        'character_sheet',
        'post_history',
        'intro_scene',
        'creator_notes',
        'intro_page',
        'system_prompt',
      ],
      includeAssetPrefixes: ['lorebook_'],
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

    const engine = this.createConfiguredEngine();
    const [systemPrompt, userPrompt] = await buildLorebookPrompt(referenceSuites, {
      focus: request.focus,
      blueprintContent: request.blueprint_content,
    });

    yield { type: 'status', stage: 'generating' };

    const messages = formatMessages(systemPrompt, userPrompt);
    let fullContent = '';
    const streamState = this.createStreamDisplayState();
    const usageCapture = beginUsageCapture(engine, { kind: 'lorebook' });
    let engineUsage: TokenUsage | undefined;

    try {
      for await (const chunk of engine.generateStream(messages, { signal: options.signal })) {
        if (chunk.content) {
          const visibleChunk = this.appendVisibleChunk(streamState, chunk.content);
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
        fullContent = this.sanitizeModelContent(fallbackResult.content);
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
    const provider = this.resolveConfiguredProvider(config);
    const engine = createEngine({
      model: config.model,
      apiKey: provider ? apiKeys[provider] : this.getFallbackApiKey(apiKeys),
      apiKeys,
      provider,
      baseUrl: config.base_url,
      temperature: config.temperature,
      maxTokens: this.resolveGenerationMaxTokens(config),
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
      const seeds = parseSeedGenerationResponse(this.sanitizeModelContent(result.content));

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
    const provider = this.resolveConfiguredProvider(config);
    const engine = createEngine({
      model: config.model,
      apiKey: provider ? apiKeys[provider] : this.getFallbackApiKey(apiKeys),
      apiKeys,
      provider,
      baseUrl: config.base_url,
      temperature: config.temperature,
      maxTokens: this.resolveGenerationMaxTokens(config),
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
      const streamState = this.createStreamDisplayState();

      for await (const chunk of engine.generateStream(chatMessages)) {
        if (chunk.content) {
          const visibleChunk = this.appendVisibleChunk(streamState, chunk.content);
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
        fullContent = this.sanitizeModelContent(fallbackResult.content);
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
    const profile1 = this.parseCharacterProfile(draft1.assets.character_sheet || '');
    const profile2 = this.parseCharacterProfile(draft2.assets.character_sheet || '');

    // Get API keys and config
    const apiKeys = configManager.getApiKeys();
    const config = configManager.getConfig();

    // Create engine
    const provider = this.resolveConfiguredProvider(config);
    const engine = createEngine({
      model: config.model,
      apiKey: provider ? apiKeys[provider] : this.getFallbackApiKey(apiKeys),
      apiKeys,
      provider,
      baseUrl: config.base_url,
      temperature: config.temperature,
      maxTokens: this.resolveGenerationMaxTokens(config),
    });

    // Build similarity prompt
    const [systemPrompt, userPrompt] = buildSimilarityPrompt(profile1, profile2);
    const messages = formatMessages(systemPrompt, userPrompt);

    // Generate analysis
    const usageCapture = beginUsageCapture(engine, { kind: 'similarity' });

    try {
      const result = await engine.generate(messages);
      usageCapture.finish({ status: 'ok', usage: result.usage });

      const sanitizedContent = this.sanitizeModelContent(result.content);

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

  /**
   * Parse blueprint output into asset dictionary
   */
  private static parseBlueprintOutput(content: string): Record<string, string> {
    const assets: Record<string, string> = {};

    // Look for code blocks with asset names
    // Format: ```asset_name ... content ... ```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    // Known asset names in order
    const knownAssets = [
      'Adjustment Note',
      'system_prompt',
      'post_history',
      'character_sheet',
      'intro_scene',
      'creator_notes',
      'intro_page',
      'a1111',
      'suno',
    ];

    // Try to match code blocks with asset name
    let match: RegExpExecArray | null;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const assetName = match[1];
      const assetContent = match[2]?.trim();

      if (assetName && assetContent && knownAssets.includes(assetName)) {
        assets[assetName] = assetContent;
      }
    }

    // If no code blocks found, try to parse by known sections
    if (Object.keys(assets).length === 0) {
      for (let i = 0; i < knownAssets.length; i++) {
        const asset = knownAssets[i];
        const nextAsset = knownAssets[i + 1];

        const startRegex = new RegExp(`^##\\s*${asset}`, 'im');
        const startMatch = content.search(startRegex);

        if (startMatch === -1) continue;

        let endMatch: number;
        if (nextAsset) {
          const endRegex = new RegExp(`^##\\s*${nextAsset}`, 'im');
          const endSearch = content.slice(startMatch).search(endRegex);
          endMatch = endSearch === -1 ? content.length : startMatch + endSearch;
        } else {
          endMatch = content.length;
        }

        const assetContent = content.slice(startMatch, endMatch).trim();
        if (assetContent) {
          assets[asset] = assetContent;
        }
      }
    }

    return assets;
  }

  /**
   * Parse character sheet into profile object
   */
  private static parseCharacterProfile(characterSheet: string): Record<string, unknown> {
    const profile: Record<string, unknown> = {};

    // Simple key-value parsing from character sheet
    // Format: Key: Value
    const lines = characterSheet.split('\n');
    let currentKey: string | null = null;
    let currentValue: string[] = [];

    for (const line of lines) {
      const keyMatch = line.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);
      if (keyMatch) {
        // Save previous key-value pair
        if (currentKey && currentValue.length > 0) {
          profile[currentKey] = currentValue.join('\n').trim();
        }

        currentKey = keyMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
        currentValue = [keyMatch[2].trim()];
      } else if (currentKey && line.trim()) {
        currentValue.push(line.trim());
      }
    }

    // Save last key-value pair
    if (currentKey && currentValue.length > 0) {
      profile[currentKey] = currentValue.join('\n').trim();
    }

    // Extract arrays from comma-separated values
    for (const key of ['personality_traits', 'core_values', 'goals', 'fears', 'motivations']) {
      if (typeof profile[key] === 'string') {
        profile[key] = (profile[key] as string)
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    }

    return profile;
  }

  /**
   * Generate a unique review ID
   */
  private static generateReviewId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${timestamp}_${random}`;
  }
}

/**
 * Default export
 */
export default GenerationService;
