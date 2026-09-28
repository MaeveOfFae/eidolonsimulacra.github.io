import '@testing-library/jest-dom/vitest';
// Dexie-backed stores (`lib/storage/draft-db.ts`) instantiate at module scope and
// need IndexedDB, which happy-dom does not provide.
import 'fake-indexeddb/auto';
