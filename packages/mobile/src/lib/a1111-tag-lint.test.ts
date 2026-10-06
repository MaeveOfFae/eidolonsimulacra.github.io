import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyA1111AssetFixes,
  lintA1111AssetForMobile,
  resetMobileCoreIndexCache,
  summarizeA1111LintIssues,
} from './a1111-tag-lint';
import type { A1111LintIssue } from '@char-gen/shared';

describe('summarizeA1111LintIssues', () => {
  it('counts severities, fixable issues and builds the headline', () => {
    const issues: A1111LintIssue[] = [
      { severity: 'error', code: 'line-count', message: 'Expected 5 lines', line: 1 },
      {
        severity: 'warning',
        code: 'pseudo-tag',
        message: '"fiery_redhead"',
        line: 1,
        tag: 'fiery_redhead',
        suggestion: 'red_hair',
      },
      { severity: 'warning', code: 'unknown-tag', message: 'not a tag', line: 2, tag: 'zzz' },
    ];
    const summary = summarizeA1111LintIssues(issues);
    expect(summary.errorCount).toBe(1);
    expect(summary.warningCount).toBe(2);
    expect(summary.fixCount).toBe(1);
    expect(summary.headline).toBe('1 error · 2 warnings');
  });

  it('reports the pass state', () => {
    expect(summarizeA1111LintIssues([]).headline).toContain('pass the Danbooru lint');
  });
});

describe('lintA1111AssetForMobile', () => {
  beforeEach(() => {
    resetMobileCoreIndexCache();
  });

  it('lints against the bundled core index', async () => {
    // `portrait, masterpiece` puts a framing tag mid-line, so the anchor rule fires too.
    const summary = await lintA1111AssetForMobile(
      '1girl, solo, fiery_redhead\nschool_uniform\nindoors\nstanding\nportrait, masterpiece',
    );
    const pseudo = summary.issues.find((issue) => issue.code === 'pseudo-tag');
    expect(pseudo).toMatchObject({ tag: 'fiery_redhead', suggestion: 'red_hair' });
    expect(summary.issues.some((issue) => issue.code === 'line-order')).toBe(true);
  });

  it('accepts a clean five-line asset', async () => {
    const summary = await lintA1111AssetForMobile(
      '1girl, solo, long_hair, blue_eyes\nschool_uniform, boots\nindoors, night\nstanding, smile\nmasterpiece, upper_body',
    );
    expect(summary.issues).toEqual([]);
  });
});

describe('applyA1111AssetFixes', () => {
  it('returns the corrected content', async () => {
    const content = '1girl, fiery_redhead, long_hair, long_hair\n\n\n\n';
    const summary = await lintA1111AssetForMobile(content);
    expect(applyA1111AssetFixes(content, summary.issues).split('\n')[0]).toBe('1girl, red_hair, long_hair');
  });
});
