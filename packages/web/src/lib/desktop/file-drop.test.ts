import { describe, expect, it } from 'vitest';
import { classifyDroppedFile, fileNameFromPath, inspectDroppedFile } from './file-drop';

/** A stand-in for a `File`, so the reading rules can be tested without a blob. */
function fakeFile(name: string, text?: () => Promise<string>) {
  return text ? { name, text } : { name };
}

describe('classifyDroppedFile', () => {
  it('reads a PNG as a character card', () => {
    const result = classifyDroppedFile({ name: 'Vesna.png' });

    expect(result).toMatchObject({
      kind: 'character-card',
      destination: '/generate',
      reason: null,
    });
    expect(classifyDroppedFile({ name: 'Vesna.PNG' }).kind).toBe('character-card');
  });

  it('reads a markdown or text file as a template', () => {
    expect(classifyDroppedFile({ name: 'card.md' }).kind).toBe('template');
    expect(classifyDroppedFile({ name: 'card.txt' }).destination).toBe('/templates');
  });

  it('tells the four JSON shapes apart', () => {
    // Character cards: v2 carries `spec`, v1 carries the fields at the top level.
    expect(classifyDroppedFile({ name: 'a.json', json: { spec: 'chara_card_v2', data: {} } }).kind).toBe(
      'character-card',
    );
    expect(classifyDroppedFile({ name: 'b.json', json: { name: 'Vesna', data: {} } }).kind).toBe('character-card');

    // Draft exports carry `drafts`; workspace bundles carry `payload`.
    expect(classifyDroppedFile({ name: 'c.json', json: { drafts: [] } }).kind).toBe('draft-backup');
    expect(classifyDroppedFile({ name: 'd.json', json: { version: 1, payload: {} } }).kind).toBe('draft-backup');

    // Themes carry colours, nested or at the top level.
    expect(classifyDroppedFile({ name: 'e.json', json: { theme: {} } }).kind).toBe('theme');
    expect(classifyDroppedFile({ name: 'f.json', json: { name: 'mine', colors: {} } }).kind).toBe('theme');
  });

  it('refuses to guess when a JSON file has not been read yet', () => {
    const result = classifyDroppedFile({ name: 'mystery.json' });

    expect(result.kind).toBe('unknown');
    expect(result.destination).toBeNull();
    expect(result.reason).toBeTruthy();
  });

  it('says what it could not place, rather than importing the wrong thing', () => {
    expect(classifyDroppedFile({ name: 'weird.json', json: { hello: 'world' } }).kind).toBe('unknown');
    expect(classifyDroppedFile({ name: 'list.json', json: [] }).kind).toBe('unknown');
    expect(classifyDroppedFile({ name: 'plain.txt', json: 'not an object' }).kind).toBe('template');

    const archive = classifyDroppedFile({ name: 'backup.zip' });
    expect(archive.kind).toBe('unknown');
    expect(archive.reason).toContain('.zip');
  });

  it('treats a folder or an unnamed drop as unusable', () => {
    expect(classifyDroppedFile({ name: 'drafts' }).kind).toBe('unknown');
    expect(classifyDroppedFile({ name: '   ' }).kind).toBe('unknown');
  });

  it('gives every placeable kind a destination, and every unknown a reason', () => {
    const samples = [
      { name: 'a.png' },
      { name: 'a.md' },
      { name: 'a.json', json: { spec: 'chara_card_v2' } },
      { name: 'a.json', json: { drafts: [] } },
      { name: 'a.json', json: { theme: {} } },
      { name: 'a.zip' },
      { name: 'a.json' },
    ];

    samples.forEach((sample) => {
      const classification = classifyDroppedFile(sample);
      expect({ sample: sample.name, hasDestination: classification.destination !== null }).toEqual({
        sample: sample.name,
        hasDestination: classification.kind !== 'unknown',
      });
      expect({ sample: sample.name, hasReason: classification.reason !== null }).toEqual({
        sample: sample.name,
        hasReason: classification.kind === 'unknown',
      });
    });
  });
});

describe('fileNameFromPath', () => {
  it('takes the name off a Windows path, a POSIX path, or a bare name', () => {
    expect(fileNameFromPath('C:\\Users\\me\\Downloads\\Vesna.png')).toBe('Vesna.png');
    expect(fileNameFromPath('/home/me/vesna.json')).toBe('vesna.json');
    expect(fileNameFromPath('Vesna.png')).toBe('Vesna.png');
  });

  it('treats a trailing separator as a folder, not a name', () => {
    expect(fileNameFromPath('C:\\Users\\me\\drafts\\')).toBe('drafts');
    expect(fileNameFromPath('/home/me/drafts///')).toBe('drafts');
    // And a drive root leaves nothing to classify.
    expect(fileNameFromPath('C:\\')).toBe('C:');
  });
});

describe('inspectDroppedFile', () => {
  it('parses a readable JSON file', async () => {
    const inspected = await inspectDroppedFile(
      fakeFile('a.json', async () => JSON.stringify({ spec: 'chara_card_v2', data: {} })),
    );

    expect(inspected.name).toBe('a.json');
    expect(classifyDroppedFile(inspected).kind).toBe('character-card');
  });

  it('falls back to the name when the file is unreadable or not JSON', async () => {
    const throws = await inspectDroppedFile(
      fakeFile('a.json', async () => {
        throw new Error('read failed');
      }),
    );
    const notJson = await inspectDroppedFile(fakeFile('a.json', async () => 'not json at all'));
    const noReader = await inspectDroppedFile(fakeFile('a.png'));

    expect(throws.json).toBeUndefined();
    expect(notJson.json).toBeUndefined();
    expect(noReader.json).toBeUndefined();
    // The name still classifies what it can: a PNG needs no reading.
    expect(classifyDroppedFile(noReader).kind).toBe('character-card');
    expect(classifyDroppedFile(throws).kind).toBe('unknown');
  });
});
