import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
// Dexie-backed stores (`lib/storage/draft-db.ts`) instantiate at module scope and
// need IndexedDB, which happy-dom does not provide.
import 'fake-indexeddb/auto';

// The suite runs its files in parallel, so an async assertion that settles in ~1ms in
// isolation can take over a second under load. That made `GenerationProgress.test.tsx`
// flake ("saves a partial draft when the final asset fails empty" failed at ~1030ms,
// just past the 1s default). Three seconds keeps the assertions meaningful while
// removing the scheduling flake.
configure({ asyncUtilTimeout: 3000 });
