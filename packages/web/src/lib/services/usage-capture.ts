/**
 * Usage capture: bridges LLM engine calls to durable usage records.
 *
 * `beginUsageCapture` starts the clock for one engine call; `finish` writes
 * the record fire-and-forget so a telemetry failure can never break
 * generation. Sites that only learn the draft id after the call (the
 * orchestrator creates its review id late) may pass it on `finish`.
 */

import type { LLMEngine, TokenUsage, UsageCallKind, UsageCallStatus } from '@char-gen/shared';
import { UsageStorage } from '../storage/usage-db.js';

export interface UsageCaptureMeta {
  kind: UsageCallKind;
  draftId?: string;
  templateName?: string;
  assetName?: string;
}

export interface UsageCaptureOutcome {
  status: UsageCallStatus;
  usage?: TokenUsage;
  draftId?: string;
  errorMessage?: string;
}

export interface UsageCapture {
  finish: (outcome: UsageCaptureOutcome) => void;
}

export function errorMessageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function beginUsageCapture(engine: LLMEngine, meta: UsageCaptureMeta): UsageCapture {
  const startedAt = Date.now();

  return {
    finish(outcome) {
      UsageStorage.record({
        timestamp: startedAt,
        kind: meta.kind,
        status: outcome.status,
        provider: engine.getProvider(),
        model: engine.getModel(),
        durationMs: Date.now() - startedAt,
        usage: outcome.usage,
        draftId: outcome.draftId ?? meta.draftId,
        templateName: meta.templateName,
        assetName: meta.assetName,
        errorMessage: outcome.errorMessage,
      }).catch((error) => {
        console.warn('Failed to record LLM usage:', error);
      });
    },
  };
}
