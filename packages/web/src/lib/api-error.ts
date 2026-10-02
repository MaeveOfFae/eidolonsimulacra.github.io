/**
 * The error type every `EidolonBrowserAPI` method rejects with.
 *
 * Extracted from `api.ts` (4.6) so extracted domain modules can throw the same
 * class without importing the whole facade. `api.ts` re-exports it unchanged,
 * so existing `import { APIError } from './api'` sites keep working.
 */
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'APIError';
  }
}
