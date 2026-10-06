import { describe, expect, it } from 'vitest';
import {
  A1111_EXPECTED_LINE_COUNT,
  applyA1111TagFixes,
  lintA1111Tags,
  splitTagTokens,
  stripTagWeightSyntax,
  type A1111LintIssue,
} from './tag-linter';
import { buildDanbooruTagIndex } from './tag-index';

const FIXTURE_TAGS_CSV = `name,category,post_count,deprecated
1girl,0,6947596,0
blue_eyes,0,2046270,0
long_hair,0,5090058,0
red_hair,0,616651,0
solo,0,3000000,0
twintails,0,440000,0
school_uniform,0,300000,0
boots,0,250000,0
indoors,0,400000,0
night,0,900000,0
standing,0,800000,0
smile,0,900000,0
looking_at_viewer,0,2000000,0
upper_body,0,1000000,0
retired_tag,0,120,1`;

const FIXTURE_ALIASES_CSV = 'alias,canonical\ntwintail,twintails';
const index = buildDanbooruTagIndex(FIXTURE_TAGS_CSV, FIXTURE_ALIASES_CSV);

const CLEAN_ASSET = [
  '1girl, solo, long_hair, blue_eyes',
  'school_uniform, boots',
  'indoors, night',
  'standing, looking_at_viewer, smile',
  'masterpiece, best_quality, upper_body',
].join('\n');

const codesOf = (issues: A1111LintIssue[]) => issues.map((issue) => issue.code);

describe('lintA1111Tags — line contract', () => {
  it('accepts a clean five-line asset without findings', () => {
    expect(lintA1111Tags(CLEAN_ASSET, index)).toEqual([]);
  });

  it('flags the wrong number of lines as an error', () => {
    const issues = lintA1111Tags('1girl, solo\nschool_uniform\nindoors, night', index);
    expect(issues).toContainEqual(expect.objectContaining({ code: 'line-count', severity: 'error' }));
  });

  it('flags code fences, bracket control lines and placeholders as errors', () => {
    const fenced = lintA1111Tags('```\n1girl\n```', index);
    expect(codesOf(fenced)).toContain('fence');
    const control = lintA1111Tags('[Subject: ((subject...)), solo]\nschool_uniform\nindoors', index);
    expect(codesOf(control)).toContain('control-line');
    expect(codesOf(control)).toContain('placeholder');
  });

  it('reports an empty asset', () => {
    expect(lintA1111Tags('   \n', index)).toEqual([
      expect.objectContaining({ code: 'empty-asset', severity: 'error' }),
    ]);
  });
});

describe('lintA1111Tags — tag vocabulary', () => {
  it('flags invented pseudo-tags with the curated correction', () => {
    const issues = lintA1111Tags('1girl, solo, fiery_redhead\n\n\n\n', index);
    const pseudo = issues.find((issue) => issue.code === 'pseudo-tag');
    expect(pseudo).toMatchObject({
      tag: 'fiery_redhead',
      suggestion: 'red_hair',
      severity: 'warning',
    });
  });

  it('flags aliases with the canonical suggestion', () => {
    const issues = lintA1111Tags('1girl, twintail\n\n\n\n', index);
    expect(issues).toContainEqual(expect.objectContaining({ code: 'alias', tag: 'twintail', suggestion: 'twintails' }));
  });

  it('flags unknown tags with near-miss suggestions', () => {
    const issues = lintA1111Tags('1girl, red_har\n\n\n\n', index);
    expect(issues).toContainEqual(
      expect.objectContaining({ code: 'unknown-tag', tag: 'red_har', suggestions: ['red_hair'] }),
    );
  });

  it('flags deprecated tags', () => {
    const issues = lintA1111Tags('1girl, retired_tag\n\n\n\n', index);
    expect(codesOf(issues)).toContain('deprecated');
  });

  it('flags duplicate tags across lines', () => {
    const issues = lintA1111Tags('1girl, long_hair\nlong_hair\n\n\n', index);
    expect(codesOf(issues)).toContain('duplicate-tag');
  });

  it('warns when a quality token sits on a non-anchor line', () => {
    const issues = lintA1111Tags(
      ['1girl, masterpiece', 'school_uniform', 'indoors', 'standing', 'upper_body'].join('\n'),
      index,
    );
    expect(issues).toContainEqual(expect.objectContaining({ code: 'line-order', tag: 'masterpiece', line: 1 }));
  });
});

describe('lintA1111Tags — line roles', () => {
  it('warns when the person line has no subject tag', () => {
    const issues = lintA1111Tags(
      ['elf, long_hair', 'school_uniform', 'indoors', 'standing', 'upper_body'].join('\n'),
      index,
    );
    expect(issues).toContainEqual(expect.objectContaining({ code: 'line-order', line: 1 }));
  });

  it('warns when clothing or framing tags sit on the wrong line', () => {
    const clothing = lintA1111Tags(
      ['1girl, boots', 'school_uniform', 'indoors', 'standing', 'upper_body'].join('\n'),
      index,
    );
    expect(clothing).toContainEqual(expect.objectContaining({ code: 'line-order', tag: 'boots', line: 1 }));

    const framing = lintA1111Tags(
      ['1girl, upper_body', 'school_uniform', 'indoors', 'standing', 'masterpiece'].join('\n'),
      index,
    );
    expect(framing).toContainEqual(expect.objectContaining({ code: 'line-order', tag: 'upper_body', line: 1 }));
  });

  it('warns when a framing tag is not last on the anchor line', () => {
    const issues = lintA1111Tags(
      ['1girl', 'school_uniform', 'indoors', 'standing', 'upper_body, masterpiece'].join('\n'),
      index,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'line-order',
        line: A1111_EXPECTED_LINE_COUNT,
        message: expect.stringContaining('very end'),
      }),
    );
  });
});

describe('stripTagWeightSyntax / splitTagTokens', () => {
  it('strips A1111 emphasis and weights', () => {
    expect(stripTagWeightSyntax('((smile))')).toBe('smile');
    expect(stripTagWeightSyntax('(red_hair:1.1)')).toBe('red_hair');
    expect(stripTagWeightSyntax('[tag:0.9]')).toBe('tag');
    expect(stripTagWeightSyntax('Red Hair')).toBe('red_hair');
  });

  it('records token offsets', () => {
    const tokens = splitTagTokens('1girl, solo, smile');
    expect(tokens.map((token) => token.start)).toEqual([1, 8, 14]);
  });
});

describe('applyA1111TagFixes', () => {
  it('applies pseudo-tag, alias and duplicate fixes in place', () => {
    const content = '1girl, fiery_redhead, twintail, long_hair, long_hair\n\n\n\n';
    const issues = lintA1111Tags(content, index);
    const result = applyA1111TagFixes(content, issues);
    expect(result.content.split('\n')[0]).toBe('1girl, red_hair, twintails, long_hair');
    expect(codesOf(result.applied).sort()).toEqual(['alias', 'duplicate-tag', 'pseudo-tag']);

    const relint = lintA1111Tags(result.content, index);
    expect(codesOf(relint)).not.toContain('pseudo-tag');
    expect(codesOf(relint)).not.toContain('alias');
    expect(codesOf(relint)).not.toContain('duplicate-tag');
  });

  it('returns the content untouched when nothing is fixable', () => {
    const content = '1girl, red_har\n\n\n\n';
    const issues = lintA1111Tags(content, index);
    expect(applyA1111TagFixes(content, issues).content).toBe(content);
  });
});
