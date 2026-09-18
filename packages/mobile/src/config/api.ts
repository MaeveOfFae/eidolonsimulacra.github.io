import { mobileLocalApi } from '../local/api';

export const api = mobileLocalApi;

export function applyStoredApiConfig(): string {
  return api.getApiBaseUrl();
}
