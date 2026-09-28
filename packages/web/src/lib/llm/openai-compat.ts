/**
 * Re-export shim.
 *
 * The LLM engine layer is owned by `@char-gen/shared`. This file is kept so that
 * existing relative imports (and test mocks keyed on this path) keep working.
 */
export { OpenAICompatEngine } from '@char-gen/shared';
export type { OpenAICompatConfig } from '@char-gen/shared';
