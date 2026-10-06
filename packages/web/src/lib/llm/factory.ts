/**
 * Re-export shim.
 *
 * The LLM engine layer is owned by `@char-gen/shared`. This file is kept so that
 * existing relative imports (and test mocks keyed on this path) keep working.
 *
 * The previous local copy also re-exported `getProviderForModel`, which had no
 * callers; `@char-gen/shared` exposes `getEngineType` instead.
 */
export {
  MODEL_SUGGESTIONS,
  buildProviderHeaders,
  createEngine,
  getDefaultBaseUrl,
  getProviderAuthType,
  getRuntimeLLMFetch,
} from '@char-gen/shared';
export type { CreateEngineOptions, LLMFetch, ProviderHeaderOptions } from '@char-gen/shared';
