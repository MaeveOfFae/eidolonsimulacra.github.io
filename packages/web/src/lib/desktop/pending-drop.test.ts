import { describe, expect, it, vi } from 'vitest';
import { PENDING_DROP_EVENT, clearPendingDrop, setPendingDrop, takePendingDrop } from './pending-drop';

function drop(kind: 'character-card' | 'draft-backup', name = 'Vesna.png') {
  return { kind, file: new File(['x'], name), fileName: name };
}

describe('pending drop', () => {
  it('is empty until a drop arrives', () => {
    clearPendingDrop();

    expect(takePendingDrop('character-card')).toBeNull();
  });

  it('hands the file to the screen that takes that kind, once', () => {
    clearPendingDrop();
    const pending = drop('draft-backup', 'backup.json');
    setPendingDrop(pending);

    const taken = takePendingDrop('draft-backup');
    expect(taken?.file).toBe(pending.file);
    expect(taken?.fileName).toBe('backup.json');

    // Taking is what stops the mount path and the event path importing the same file twice,
    // which is exactly what a navigation between them triggers.
    expect(takePendingDrop('draft-backup')).toBeNull();
  });

  it('keeps a drop away from a screen whose kind does not match', () => {
    clearPendingDrop();
    setPendingDrop(drop('draft-backup'));

    expect(takePendingDrop('character-card')).toBeNull();
    // And it is still there for the screen that does take it.
    expect(takePendingDrop('draft-backup')).not.toBeNull();
  });

  it('announces the drop so a screen that is already open can react', () => {
    clearPendingDrop();
    const listener = vi.fn();
    window.addEventListener(PENDING_DROP_EVENT, listener);

    try {
      setPendingDrop(drop('character-card'));
    } finally {
      window.removeEventListener(PENDING_DROP_EVENT, listener);
      clearPendingDrop();
    }

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
