/**
 * Running a completion on the device: the timeout, the streaming-unsupported fallback, content collection, the generation runner, and the LocalStream reader.
 *
 * Split out of `api.ts`, which is now a barrel over these modules.
 */
import {
  APIError,
  getOrderedAssets,
  inferCharacterDisplayNameFromAssets,
  stripReasoningArtifacts,
  unwrapSingleCodeFence,
  type ChatMessage,
  type GenerationComplete,
} from '@char-gen/shared';
import { Platform } from 'react-native';
import { getStoredDeviceConfig } from '../../storage/device-config';
import { clearGenerationSession, saveGenerationSession } from '../../storage/generation-session';
import { saveDraft } from '../draft-store';
import { resolveTemplateDefinition } from '../content-store';
import type { LocalStreamEvent, StreamEventMap, StreamEventType, StreamReader } from './stream-types';
import { createConfiguredEngine, createReviewId, normalizeModelOutput } from './config';
import { buildPerAssetMessages, buildReferenceContext } from './prompts';
import type { MobileGenerateRequest } from './prompts';

export const PREFERS_NON_STREAMING_COMPLETIONS = Platform.OS !== 'web';
export const MOBILE_PROVIDER_TIMEOUT_MS = 300000;

export function isStreamingUnsupportedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes('no response body') || message.includes('getreader') || message.includes('body stream');
}

export async function collectStreamedContent(
  messages: ChatMessage[],
  signal?: AbortSignal,
  onChunk?: (chunk: string) => void,
  onStatus?: (stage: string, progress?: number, asset?: string) => void,
  nativeProgress?: { start: number; end: number; asset?: string; maxTokens?: number },
): Promise<string> {
  const { engine } = createConfiguredEngine();

  if (PREFERS_NON_STREAMING_COMPLETIONS) {
    const progressStart = nativeProgress?.start ?? 0.28;
    const progressEnd = nativeProgress?.end ?? 0.68;
    let waitTicks = 0;
    const intervalId = setInterval(() => {
      waitTicks += 1;
      onStatus?.('provider_generating', Math.min(progressStart + waitTicks * 0.03, progressEnd), nativeProgress?.asset);
    }, 4000);

    try {
      onStatus?.('provider_generating', progressStart, nativeProgress?.asset);
      const result = await engine.generate(messages, { signal, maxTokens: nativeProgress?.maxTokens });
      const content = normalizeModelOutput(result.content);
      if (content) {
        onChunk?.(content);
      }
      return content;
    } finally {
      clearInterval(intervalId);
    }
  }

  let rawContent = '';
  let visibleContent = '';
  let streamUnsupported = false;

  try {
    for await (const chunk of engine.generateStream(messages, { signal, maxTokens: nativeProgress?.maxTokens })) {
      if (chunk.content) {
        rawContent += chunk.content;
        const nextVisibleContent = stripReasoningArtifacts(rawContent);
        const visibleDelta = nextVisibleContent.startsWith(visibleContent)
          ? nextVisibleContent.slice(visibleContent.length)
          : '';
        visibleContent = nextVisibleContent;
        if (visibleDelta) {
          onChunk?.(visibleDelta);
        }
      }

      if (chunk.done) {
        break;
      }
    }
  } catch (error) {
    if (!signal?.aborted && isStreamingUnsupportedError(error)) {
      streamUnsupported = true;
    } else {
      throw error;
    }
  }

  if ((!visibleContent.trim() || streamUnsupported) && !signal?.aborted) {
    const fallbackResult = await engine.generate(messages, { signal, maxTokens: nativeProgress?.maxTokens });
    visibleContent = stripReasoningArtifacts(fallbackResult.content);
    if (visibleContent) {
      onChunk?.(visibleContent);
    }
  }

  return normalizeModelOutput(visibleContent);
}

export async function runGeneration(
  request: MobileGenerateRequest,
  options: {
    signal?: AbortSignal;
    onChunk?: (chunk: string) => void;
    onStatus?: (stage: string, progress?: number, asset?: string) => void;
    parentDraftIds?: string[];
    offspringType?: string;
    extraInstruction?: string;
    /** Persist a resumable checkpoint as assets complete (main generate path only). */
    checkpointSession?: boolean;
  } = {},
): Promise<GenerationComplete> {
  const startedAt = Date.now();
  const template = resolveTemplateDefinition(request.template);
  if (!template) {
    throw new APIError(500, 'No local template is available for generation');
  }

  const orderedAssets = getOrderedAssets(template);
  if (orderedAssets.length === 0) {
    throw new APIError(500, `Template ${template.name} does not define any assets`);
  }

  const selectedAssetSet = new Set(
    (request.selected_assets ?? [])
      .map((assetName) => (typeof assetName === 'string' ? assetName.trim() : ''))
      .filter(Boolean),
  );
  const templateAssetsByName = new Map(template.assets.map((asset) => [asset.name, asset] as const));

  // Required assets are always generated.
  template.assets.filter((asset) => asset.required).forEach((asset) => selectedAssetSet.add(asset.name));

  // Ensure selected assets include their full dependency chain.
  const visitedAssetDependencies = new Set<string>();
  const includeDependencies = (assetName: string) => {
    if (visitedAssetDependencies.has(assetName)) {
      return;
    }

    visitedAssetDependencies.add(assetName);
    const asset = templateAssetsByName.get(assetName);
    if (!asset) {
      return;
    }

    asset.depends_on.forEach((dependencyName) => {
      selectedAssetSet.add(dependencyName);
      includeDependencies(dependencyName);
    });
  };
  Array.from(selectedAssetSet).forEach(includeDependencies);

  const generationAssets = orderedAssets.filter((asset) => selectedAssetSet.has(asset.name));
  if (generationAssets.length === 0) {
    throw new APIError(400, `No assets selected for generation in template ${template.name}`);
  }

  // A fresh (non-resume) run invalidates any checkpoint left by an earlier
  // interrupted run.
  if (options.checkpointSession && !request.resume_assets) {
    clearGenerationSession();
  }

  options.onStatus?.('loading_references', 0.08);
  const referenceContext = await buildReferenceContext(request.connected_draft_ids);
  const assets: Record<string, string> = { ...(request.resume_assets ?? {}) };
  const pendingAssets = generationAssets.filter((asset) => !Object.prototype.hasOwnProperty.call(assets, asset.name));
  const progressBase = 0.12;
  const progressSpan = 0.76;
  const configuredMaxTokens = Math.max(256, Math.round(getStoredDeviceConfig().max_tokens));

  for (let index = 0; index < pendingAssets.length; index += 1) {
    const asset = pendingAssets[index];
    const assetStart = progressBase + (index / pendingAssets.length) * progressSpan;
    const assetEnd = progressBase + ((index + 1) / pendingAssets.length) * progressSpan;
    const maxTokens = configuredMaxTokens;

    options.onStatus?.('building_asset_prompt', assetStart, asset.name);
    const messages = buildPerAssetMessages(
      request,
      template,
      asset.name,
      assets,
      referenceContext,
      options.extraInstruction,
    );
    options.onStatus?.('contacting_provider', Math.min(assetStart + 0.02, assetEnd), asset.name);
    const rawAssetContent = await collectStreamedContent(messages, options.signal, undefined, options.onStatus, {
      start: Math.min(assetStart + 0.04, assetEnd),
      end: Math.max(assetEnd - 0.01, assetStart + 0.04),
      asset: asset.name,
      maxTokens,
    });

    const assetContent =
      asset.name === 'a1111' ? rawAssetContent.trim() : unwrapSingleCodeFence(rawAssetContent).trim();

    if (!assetContent) {
      throw new APIError(502, `Generated asset ${asset.name} was empty`);
    }

    assets[asset.name] = assetContent;

    if (options.checkpointSession) {
      saveGenerationSession({
        version: 1,
        seed: request.seed,
        mode: request.mode,
        template: template.name,
        selectedAssets: request.selected_assets,
        importedSource: request.imported_source,
        completedAssets: { ...assets },
        updatedAt: Date.now(),
      });
    }

    options.onStatus?.('asset_complete', assetEnd, asset.name);
    options.onChunk?.(`${index === 0 ? '' : '\n\n'}=== ${asset.name.toUpperCase()} ===\n${assetContent}`);
  }

  const reviewId = createReviewId();
  const characterName = inferCharacterDisplayNameFromAssets(assets) || request.seed;
  const config = getStoredDeviceConfig();

  options.onStatus?.('saving', 0.9);
  await saveDraft({
    path: reviewId,
    metadata: {
      review_id: reviewId,
      seed: request.seed,
      mode: request.mode,
      model: config.model,
      created: new Date(startedAt).toISOString(),
      modified: new Date().toISOString(),
      favorite: false,
      template_name: template.name,
      character_name: characterName,
      connected_drafts: request.connected_draft_ids?.length ? [...request.connected_draft_ids] : undefined,
      parent_drafts: options.parentDraftIds?.length ? [...options.parentDraftIds] : undefined,
      offspring_type: options.offspringType,
    },
    assets,
  });

  if (options.checkpointSession) {
    clearGenerationSession();
  }

  options.onStatus?.('complete', 1);

  return {
    draft_path: reviewId,
    draft_id: reviewId,
    character_name: characterName,
    duration_ms: Date.now() - startedAt,
  };
}

export class LocalStream {
  private controller: AbortController | null = null;
  private readers: Set<StreamReader> = new Set();
  private onComplete: ((data: StreamEventMap['complete']) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor(
    private executor: (context: {
      emit: <EventType extends StreamEventType>(event: EventType, data: StreamEventMap[EventType]) => void;
      signal: AbortSignal;
    }) => Promise<void>,
  ) {}

  subscribe(callback: StreamReader): () => void {
    this.readers.add(callback);
    return () => this.readers.delete(callback);
  }

  onComplete_(callback: (data: StreamEventMap['complete']) => void): this {
    this.onComplete = callback;
    return this;
  }

  onError_(callback: (error: string) => void): this {
    this.onError = callback;
    return this;
  }

  async start(): Promise<void> {
    this.controller = new AbortController();
    try {
      await this.executor({
        emit: (event, data) => {
          const payload = { event, data } as LocalStreamEvent;
          this.readers.forEach((reader) => reader(payload));
          if (event === 'complete' && this.onComplete) {
            this.onComplete(data as StreamEventMap['complete']);
          }
          if (event === 'error' && this.onError) {
            this.onError((data as { error: string }).error);
          }
        },
        signal: this.controller.signal,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Local stream failed';
      this.readers.forEach((reader) => reader({ event: 'error', data: { error: message } }));
      this.onError?.(message);
    }
  }

  abort(): void {
    this.controller?.abort();
  }
}
