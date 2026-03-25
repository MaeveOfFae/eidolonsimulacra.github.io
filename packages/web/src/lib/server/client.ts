/**
 * Server Sync Client
 * Handles authentication and data synchronization with the backend server
 */

// Types
export interface ServerConfig {
  url: string;
  enabled: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  isEmailVerified?: boolean;
  preferences?: Record<string, unknown>;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface SyncStatus {
  connected: boolean;
  authenticated: boolean;
  user?: User;
  lastSync?: string;
  error?: string;
}

// Storage keys
const SERVER_CONFIG_KEY = 'server-config';
const ACCESS_TOKEN_KEY = 'server-access-token';

// Custom event for auth state changes
export const AUTH_STATE_CHANGED_EVENT = 'auth-state-changed';

/**
 * Server client singleton
 */
class ServerClient {
  private config: ServerConfig;
  private accessToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private statusPromise: Promise<SyncStatus> | null = null;
  private cachedStatus: SyncStatus | null = null;
  private statusCacheExpiresAt = 0;
  private rateLimitedUntil = 0;

  constructor() {
    this.config = this.loadConfig();
    this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // ===========================================================================
  // Configuration
  // ===========================================================================

  private loadConfig(): ServerConfig {
    try {
      const stored = localStorage.getItem(SERVER_CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load server config:', e);
    }
    return { url: 'https://api.eidolonsimulacra.com', enabled: false };
  }

  private saveConfig(): void {
    localStorage.setItem(SERVER_CONFIG_KEY, JSON.stringify(this.config));
    this.invalidateStatusCache();
  }

  getConfig(): ServerConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<ServerConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  private invalidateStatusCache(): void {
    this.cachedStatus = null;
    this.statusCacheExpiresAt = 0;
  }

  isEnabled(): boolean {
    return this.config.enabled && !!this.config.url;
  }

  // ===========================================================================
  // Token Management
  // ===========================================================================

  private setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    this.invalidateStatusCache();
  }

  private clearAccessToken(): void {
    this.accessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.invalidateStatusCache();
  }

  private notifyAuthStateChanged(): void {
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED_EVENT));
  }

  private getAccessToken(): string | null {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefreshToken();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(): Promise<string> {
    // Make direct request without using this.request() to avoid adding expired auth header
    // The refresh token is sent via cookies (credentials: 'include')
    const url = `${this.config.url}/api/auth/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for refresh token
    });

    if (!response.ok) {
      this.clearAccessToken();
      this.notifyAuthStateChanged();
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.setAccessToken(data.accessToken);
    return data.accessToken;
  }

  // ===========================================================================
  // HTTP Helper
  // ===========================================================================

  private async request(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<Response> {
    const url = `${this.config.url}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for refresh token
    });

    if (response.status === 429) {
      const retryAfterHeader = response.headers.get('retry-after');
      const resetHeader = response.headers.get('ratelimit-reset');
      const retryAfterSeconds = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : Number.NaN;
      const resetSeconds = resetHeader ? Number.parseInt(resetHeader, 10) : Number.NaN;
      const waitSeconds = Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds
        : Number.isFinite(resetSeconds)
          ? resetSeconds
          : 60;

      this.rateLimitedUntil = Date.now() + (Math.max(waitSeconds, 1) * 1000);
    }

    // Handle token expiration for authenticated endpoints only.
    // Login/register can legitimately return 401 and should not trigger refresh.
    const shouldAttemptRefresh =
      response.status === 401
      && retry
      && endpoint !== '/api/auth/refresh'
      && endpoint !== '/api/auth/login'
      && endpoint !== '/api/auth/register';

    if (shouldAttemptRefresh) {
      try {
        await this.refreshAccessToken();
        // Retry the original request with new token
        return this.request(endpoint, options, false);
      } catch {
        // Refresh failed, clear auth state
        this.clearAccessToken();
        throw new Error('Authentication expired. Please login again.');
      }
    }

    return response;
  }

  // ===========================================================================
  // Authentication
  // ===========================================================================

  async register(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    this.setAccessToken(data.accessToken);
    this.notifyAuthStateChanged();
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.setAccessToken(data.accessToken);
    this.notifyAuthStateChanged();
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout request failed:', e);
    } finally {
      this.clearAccessToken();
      this.notifyAuthStateChanged();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request('/api/auth/me');

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAccessToken();
        throw new Error('Not authenticated');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user');
    }

    const data = await response.json();
    return data.user;
  }

  async updateProfile(updates: { displayName?: string; avatarUrl?: string; preferences?: Record<string, unknown> }): Promise<User> {
    const response = await this.request('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    const data = await response.json();
    return data.user;
  }

  async deleteAccount(): Promise<void> {
    const response = await this.request('/api/auth/me', { method: 'DELETE' });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete account');
    }

    this.clearAccessToken();
  }

  // ===========================================================================
  // Status
  // ===========================================================================

  async checkStatus(): Promise<SyncStatus> {
    if (!this.isEnabled()) {
      return { connected: false, authenticated: false };
    }

    const now = Date.now();
    if (this.cachedStatus && now < this.statusCacheExpiresAt) {
      return this.cachedStatus;
    }

    if (this.statusPromise) {
      return this.statusPromise;
    }

    if (now < this.rateLimitedUntil) {
      const fallbackStatus = this.cachedStatus ?? {
        connected: true,
        authenticated: Boolean(this.getAccessToken()),
      };
      return {
        ...fallbackStatus,
        error: 'Rate limited. Retrying status check soon.',
      };
    }

    this.statusPromise = this.computeStatus();

    try {
      const status = await this.statusPromise;
      this.cachedStatus = status;
      this.statusCacheExpiresAt = Date.now() + 15_000;
      return status;
    } finally {
      this.statusPromise = null;
    }
  }

  private async computeStatus(): Promise<SyncStatus> {
    try {
      // Check health
      const healthResponse = await fetch(`${this.config.url}/api/health`, {
        method: 'GET',
      });

      if (!healthResponse.ok) {
        return { connected: false, authenticated: false, error: 'Server unreachable' };
      }

      // Check authentication
      if (!this.getAccessToken()) {
        return { connected: true, authenticated: false };
      }

      try {
        const user = await this.getCurrentUser();
        return { connected: true, authenticated: true, user };
      } catch (e) {
        return {
          connected: true,
          authenticated: false,
          error: e instanceof Error ? e.message : 'Authentication failed',
        };
      }
    } catch (e) {
      return {
        connected: false,
        authenticated: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }

  // ===========================================================================
  // Data Sync
  // ===========================================================================

  async syncDrafts(action: 'pull' | 'push' | 'list', data?: unknown): Promise<unknown> {
    const isPush = action === 'push';
    const endpoint = isPush ? '/api/sync/drafts/push' : '/api/sync/drafts/list';
    const response = await this.request(endpoint, {
      method: isPush ? 'POST' : 'GET',
      body: isPush ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      let errorMessage = `Failed to ${action} drafts`;
      let errorCode: string | null = null;

      try {
        const error = await response.json() as {
          error?: string;
          details?: Record<string, string[] | undefined>;
        };
        errorMessage = error.error || errorMessage;
        errorCode = error.error || null;

        if (error.details) {
          const detailText = Object.entries(error.details)
            .flatMap(([field, messages]) => (messages || []).map((message) => `${field}: ${message}`))
            .join('; ');
          if (detailText) {
            errorMessage = `${errorMessage} (${detailText})`;
          }
        }
      } catch {
        // Leave the fallback message in place when the server does not return JSON.
      }

      const shouldRetryWithList = action === 'pull'
        && endpoint !== '/api/sync/drafts/list'
        && (response.status === 404 || (response.status === 400 && errorCode === 'Validation failed'));

      if (shouldRetryWithList) {
        try {
          return await this.listRemoteDrafts();
        } catch {
          // Surface the original pull failure if the compatibility retry also fails.
        }
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async listRemoteDrafts(): Promise<{ drafts: Array<{ id: string; reviewId: string }> }> {
    const response = await this.request('/api/sync/drafts/list', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list remote drafts');
    }

    return response.json();
  }

  async deleteRemoteDraft(id: string): Promise<{ message: string }> {
    const response = await this.request(`/api/sync/drafts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete remote draft');
    }

    return response.json();
  }

  async syncThemes(action: 'pull' | 'push' | 'list', data?: unknown): Promise<unknown> {
    const response = await this.request(`/api/sync/themes/${action}`, {
      method: action === 'push' ? 'POST' : 'GET',
      body: action === 'push' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to ${action} themes`);
    }

    return response.json();
  }

  async listRemoteThemes(): Promise<{ themes: Array<{ name: string; isBuiltin?: boolean }> }> {
    const response = await this.request('/api/sync/themes/list', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list remote themes');
    }

    return response.json();
  }

  async deleteRemoteTheme(name: string): Promise<{ message: string }> {
    const response = await this.request(`/api/sync/themes/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete remote theme');
    }

    return response.json();
  }

  async syncTemplates(action: 'pull' | 'push' | 'list', data?: unknown): Promise<unknown> {
    const response = await this.request(`/api/sync/templates/${action}`, {
      method: action === 'push' ? 'POST' : 'GET',
      body: action === 'push' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to ${action} templates`);
    }

    return response.json();
  }

  async listRemoteTemplates(): Promise<{ templates: Array<{ name: string; isOfficial?: boolean }> }> {
    const response = await this.request('/api/sync/templates/list', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list remote templates');
    }

    return response.json();
  }

  async deleteRemoteTemplate(name: string): Promise<{ message: string }> {
    const response = await this.request(`/api/sync/templates/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete remote template');
    }

    return response.json();
  }

  // Config sync uses different endpoints (GET / PUT instead of /pull /push)
  async pullConfig(): Promise<{ config: Record<string, unknown> }> {
    const response = await this.request('/api/sync/config', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to pull config');
    }

    return response.json();
  }

  async pushConfig(config: Record<string, unknown>): Promise<{ config: Record<string, unknown> }> {
    const response = await this.request('/api/sync/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to push config');
    }

    return response.json();
  }

  async pullApiKeys(): Promise<{ apiKeys: Record<string, string> }> {
    const response = await this.request('/api/sync/config/api-keys', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to pull API keys');
    }

    return response.json();
  }

  async pushApiKeys(apiKeys: Record<string, string>): Promise<{ message: string }> {
    const response = await this.request('/api/sync/config/api-keys', {
      method: 'PUT',
      body: JSON.stringify(apiKeys),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to push API keys');
    }

    return response.json();
  }

  // Generic sync method that routes to the correct endpoints
  async sync(dataType: 'drafts' | 'themes' | 'templates' | 'blueprints' | 'worlds' | 'timelines', action: 'pull' | 'push' | 'list', data?: unknown): Promise<unknown> {
    switch (dataType) {
      case 'drafts':
        return this.syncDrafts(action, data);
      case 'themes':
        return this.syncThemes(action, data);
      case 'templates':
        return this.syncTemplates(action, data);
      case 'blueprints':
        return this.syncBlueprints(action, data);
      case 'worlds':
        if (action === 'list') {
          throw new Error('World sync does not support list');
        }
        return this.syncWorlds(action, data);
      case 'timelines':
        if (action === 'list') {
          throw new Error('Timeline sync does not support list');
        }
        return this.syncTimelines(action, data);
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  // ===========================================================================
  // Blueprints Sync
  // ===========================================================================

  async syncBlueprints(action: 'pull' | 'push' | 'list', data?: unknown): Promise<unknown> {
    const response = await this.request(`/api/sync/blueprints/${action}`, {
      method: action === 'push' ? 'POST' : 'GET',
      body: action === 'push' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to ${action} blueprints`);
    }

    return response.json();
  }

  async listRemoteBlueprints(): Promise<{ blueprints: Array<{ path: string; isBuiltin?: boolean; userId?: string | null }> }> {
    const response = await this.request('/api/sync/blueprints/list', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list remote blueprints');
    }

    return response.json();
  }

  async deleteRemoteBlueprint(path: string): Promise<{ message: string }> {
    const response = await this.request(`/api/sync/blueprints/${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete remote blueprint');
    }

    return response.json();
  }

  async getBlueprint(path: string): Promise<{ blueprint: unknown }> {
    const response = await this.request(`/api/sync/blueprints/${encodeURIComponent(path)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get blueprint');
    }

    return response.json();
  }

  async createBlueprint(data: { path: string; name: string; description?: string; content: string }): Promise<{ blueprint: unknown }> {
    const response = await this.request('/api/sync/blueprints', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create blueprint');
    }

    return response.json();
  }

  async updateBlueprint(path: string, data: { name: string; description?: string; content: string }): Promise<{ blueprint: unknown }> {
    const response = await this.request(`/api/sync/blueprints/${encodeURIComponent(path)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update blueprint');
    }

    return response.json();
  }

  async deleteBlueprint(path: string): Promise<{ message: string }> {
    const response = await this.request(`/api/sync/blueprints/${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete blueprint');
    }

    return response.json();
  }

  async duplicateBlueprint(path: string, newPath?: string, newName?: string): Promise<{ blueprint: unknown }> {
    const response = await this.request(`/api/sync/blueprints/${encodeURIComponent(path)}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newPath, newName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to duplicate blueprint');
    }

    return response.json();
  }

  async resetBlueprint(path: string): Promise<{ message: string }> {
    const response = await this.request(`/api/sync/blueprints/${encodeURIComponent(path)}/reset`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset blueprint');
    }

    return response.json();
  }

  // ===========================================================================
  // Worlds Sync
  // ===========================================================================

  async syncWorlds(action: 'pull' | 'push', data?: unknown): Promise<unknown> {
    const response = await this.request(`/api/sync/worlds/${action}`, {
      method: action === 'push' ? 'POST' : 'GET',
      body: action === 'push' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to ${action} worlds`);
    }

    return response.json();
  }

  async getWorlds(params?: { search?: string; genre?: string; includePublic?: boolean }): Promise<{ worlds: unknown[] }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.genre) searchParams.set('genre', params.genre);
    if (params?.includePublic !== undefined) searchParams.set('includePublic', String(params.includePublic));

    const response = await this.request(`/api/sync/worlds?${searchParams.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get worlds');
    }

    return response.json();
  }

  async getWorld(id: string): Promise<{ world: unknown }> {
    const response = await this.request(`/api/sync/worlds/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get world');
    }

    return response.json();
  }

  async createWorld(data: { name: string; description?: string; genre?: string; setting?: string; notes?: string }): Promise<{ world: unknown }> {
    const response = await this.request('/api/sync/worlds', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create world');
    }

    return response.json();
  }

  async updateWorld(id: string, data: Record<string, unknown>): Promise<{ world: unknown }> {
    const response = await this.request(`/api/sync/worlds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update world');
    }

    return response.json();
  }

  async deleteWorld(id: string): Promise<{ message: string }> {
    const response = await this.request(`/api/sync/worlds/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete world');
    }

    return response.json();
  }

  // ===========================================================================
  // Timelines Sync
  // ===========================================================================

  async syncTimelines(action: 'pull' | 'push', data?: unknown): Promise<unknown> {
    const response = await this.request(`/api/sync/timelines/${action}`, {
      method: action === 'push' ? 'POST' : 'GET',
      body: action === 'push' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to ${action} timelines`);
    }

    return response.json();
  }

  async getTimelines(params?: { worldId?: string; search?: string }): Promise<{ timelines: unknown[] }> {
    const searchParams = new URLSearchParams();
    if (params?.worldId) searchParams.set('worldId', params.worldId);
    if (params?.search) searchParams.set('search', params.search);

    const response = await this.request(`/api/sync/timelines?${searchParams.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get timelines');
    }

    return response.json();
  }

  async getTimeline(id: string): Promise<{ timeline: unknown }> {
    const response = await this.request(`/api/sync/timelines/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get timeline');
    }

    return response.json();
  }

  async createTimeline(data: { worldId: string; name: string; description?: string }): Promise<{ timeline: unknown }> {
    const response = await this.request('/api/sync/timelines', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create timeline');
    }

    return response.json();
  }

  async updateTimeline(id: string, data: Record<string, unknown>): Promise<{ timeline: unknown }> {
    const response = await this.request(`/api/sync/timelines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update timeline');
    }

    return response.json();
  }

  async deleteTimeline(id: string): Promise<{ message: string }> {
    const response = await this.request(`/api/sync/timelines/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete timeline');
    }

    return response.json();
  }

  async addTimelineEvent(timelineId: string, data: { title: string; description?: string; eventDate?: string }): Promise<{ event: unknown }> {
    const response = await this.request(`/api/sync/timelines/${timelineId}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add event');
    }

    return response.json();
  }

  async updateTimelineEvent(timelineId: string, eventId: string, data: Record<string, unknown>): Promise<{ event: unknown }> {
    const response = await this.request(`/api/sync/timelines/${timelineId}/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update event');
    }

    return response.json();
  }

  async deleteTimelineEvent(timelineId: string, eventId: string): Promise<{ message: string }> {
    const response = await this.request(`/api/sync/timelines/${timelineId}/events/${eventId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete event');
    }

    return response.json();
  }

  // ===========================================================================
  // Test Connection
  // ===========================================================================

  async testConnection(url: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return { success: true, message: 'Connection successful' };
      }
      return { success: false, message: `Server returned ${response.status}` };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : 'Connection failed',
      };
    }
  }
}

// Export singleton instance
export const serverClient = new ServerClient();
