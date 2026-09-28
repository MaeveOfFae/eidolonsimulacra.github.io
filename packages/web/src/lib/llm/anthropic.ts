/**
 * Re-export shim.
 *
 * The LLM engine layer is owned by `@char-gen/shared`. This file is kept so that
 * existing relative imports (and test mocks keyed on this path) keep working.
 */
export { AnthropicEngine } from '@char-gen/shared';
