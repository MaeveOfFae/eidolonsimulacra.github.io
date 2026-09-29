import type { InfoRuntimeScope } from '@char-gen/shared';
import { isDesktopRuntime } from './runtime.js';

/**
 * Which storage surface the shared info copy should describe. The browser and
 * desktop builds share this renderer, so the scope is resolved at render time
 * rather than baked into the shared strings.
 */
export function resolveInfoRuntimeScope(): InfoRuntimeScope {
  return isDesktopRuntime() ? 'desktop' : 'browser';
}
