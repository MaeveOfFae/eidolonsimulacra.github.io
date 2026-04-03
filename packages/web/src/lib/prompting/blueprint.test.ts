import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadBlueprint } from './blueprint';

describe('loadBlueprint', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads bundled built-in blueprints without fetching static files', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const content = await loadBlueprint('blueprints/system/generator.md');

    expect(content).toContain('name: Orchestrator');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('prefers locally overridden blueprints over bundled content', async () => {
    window.localStorage.setItem(
      'eidolon.web.blueprints.overrides',
      JSON.stringify({
        'blueprints/system/generator.md': 'custom generator blueprint',
      })
    );
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const content = await loadBlueprint('blueprints/system/generator.md');

    expect(content).toBe('custom generator blueprint');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});import { describe, expect, it } from 'vitest';
import { parseBlueprintFrontmatter } from './blueprint';
import { lintBlueprintContent } from '@/components/blueprints/blueprintLint';

describe('parseBlueprintFrontmatter', () => {
  it('reads feature metadata from CRLF frontmatter blocks', () => {
    const content = [
      '---',
      'name: Orchestrator',
      'description: Compile a full suite of character assets from a single seed.',
      'invokable: true',
      'always: false',
      'version: 3.2',
      'feature_category: orchestration',
      '---',
      '',
      '# Generator Orchestrator',
      '',
      'Compile the active template contract.',
    ].join('\r\n');

    expect(parseBlueprintFrontmatter(content)).toEqual({
      name: 'Orchestrator',
      description: 'Compile a full suite of character assets from a single seed.',
      invokable: true,
      version: '3.2',
      feature_category: 'orchestration',
    });
  });
});

describe('lintBlueprintContent', () => {
  it('does not report missing yaml for CRLF frontmatter blocks', () => {
    const content = [
      '---',
      'name: Seed Generator',
      'description: Generate batches of compressed, compiler-ready character seeds from genre and tag lines.',
      'invokable: true',
      'always: false',
      'version: 1.0',
      'feature_category: seed_generation',
      '---',
      '',
      '# Seed Generation Engine',
      '',
      '```text',
      'seed output',
      '```',
    ].join('\r\n');

    const issues = lintBlueprintContent(content, { category: 'system', path: 'blueprints/system/seed_generator.md' });

    expect(issues.find((issue) => issue.message.includes('Missing YAML frontmatter block'))).toBeUndefined();
  });
});