/**
 * Defaults for Chub publishing. Kept here (not in `types`) so the web config
 * manager, the settings section, and any future mobile surface share one source
 * of truth — the same split `comfyui/defaults.ts` uses.
 */
import type { ChubConfig } from '../types';

export const DEFAULT_CHUB_BASE_URL = 'https://gateway.chub.ai';

export function createDefaultChubConfig(): ChubConfig {
  return {
    base_url: DEFAULT_CHUB_BASE_URL,
    api_token: '',
    publish_token: '',
    username: '',
    subscription: '',
    verified_at: '',
  };
}

/** The token publish calls should use: the scoped projects token, else the pasted token. */
export function chubActiveToken(config: ChubConfig | undefined): string {
  if (!config) {
    return '';
  }
  const publishToken = config.publish_token?.trim();
  if (publishToken && publishToken.length > 0) {
    return publishToken;
  }
  return (config.api_token ?? '').trim();
}
