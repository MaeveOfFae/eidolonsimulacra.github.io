import { isMobileGenerationSession, type MobileGenerationSession } from '../lib/generation-session';

const GENERATION_SESSION_STORAGE_KEY = 'eidolon.mobile.generation.session';

type StorageLike = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

function getStorage(): StorageLike | null {
  const maybeStorage = globalThis as { localStorage?: StorageLike };
  return maybeStorage.localStorage ?? null;
}

export function loadGenerationSession(): MobileGenerationSession | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const value = storage.getItem(GENERATION_SESSION_STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return isMobileGenerationSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveGenerationSession(session: MobileGenerationSession): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(GENERATION_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearGenerationSession(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(GENERATION_SESSION_STORAGE_KEY);
}
