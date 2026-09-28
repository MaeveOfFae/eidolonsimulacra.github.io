import type { ConnectionTestResult, LLMConnectionTestResult } from '@char-gen/shared';

/**
 * `@char-gen/shared` reports connection results with camelCase fields, while the
 * app-level contract used by the UI and the API layer is snake_case.
 */
export function toAppConnectionTestResult(result: LLMConnectionTestResult): ConnectionTestResult {
  return {
    success: result.success,
    latency_ms: result.latencyMs,
    error: result.error,
    model_info: result.modelInfo
      ? { name: result.modelInfo.name, context_length: result.modelInfo.contextLength }
      : undefined,
  };
}
