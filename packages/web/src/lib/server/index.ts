/**
 * Server sync module
 * Export server client and types
 */

export { serverClient, AUTH_STATE_CHANGED_EVENT, type ServerConfig, type User, type AuthResponse, type SyncStatus } from './client.js';
export { triggerAutoSyncFlush } from './auto-sync.js';
