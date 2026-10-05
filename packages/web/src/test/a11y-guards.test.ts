/**
 * Cross-cutting accessibility guards.
 *
 * These read the component sources as text rather than rendering them, because
 * what they protect is a *convention*: the audit that opened this work found that
 * focus visibility is satisfied by three different patterns (`focus-visible:ring-*`
 * in 129 places, `focus:ring-*`, and the compact-input `focus:border-primary`),
 * with nothing enforcing that a fourth pattern does not arrive and break the
 * guarantee. A rendered test cannot see a rule nobody wrote yet.
 *
 * `import.meta.glob` with `?raw` is already the codebase's idiom for reading
 * sources (`lib/prompting/blueprint.ts` bundles the blueprint markdown this way).
 */
const componentSources = import.meta.glob(['../components/**/*.tsx', '../lib/**/*.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Blank out comments so prose that mentions `<select>` cannot be read as markup. */
function blankOutNonCode(text: string): string {
  const blank = (value: string) => value.replace(/[^\n]/g, ' ');

  return text
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:])\/\/[^\n]*/g, (match, prefix: string) => prefix + blank(match.slice(prefix.length)));
}

/** The opening tag starting at `start`, tolerating `{...}` and multi-line attributes. */
function openingTag(text: string, start: number): string | null {
  let depth = 0;

  for (let index = start; index < Math.min(start + 2000, text.length); index += 1) {
    const char = text[index];

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
    } else if (char === '>' && depth === 0) {
      return text.slice(start, index + 1);
    }
  }

  return null;
}

/**
 * Form controls that turn the outline off without providing a visible replacement.
 * Parsed from the whole opening tag, not line by line: JSX puts `className` on its
 * own line often enough that a line-based rule silently misses violations — the
 * quick-actions palette's own input hid from one.
 */
export function findOutlineViolations(sources: Record<string, string>): string[] {
  const violations: string[] = [];

  for (const [key, raw] of Object.entries(sources)) {
    if (key.includes('.test.')) {
      continue;
    }

    const text = blankOutNonCode(raw);

    for (const match of text.matchAll(/<(input|select|textarea)\b/g)) {
      const tag = openingTag(text, match.index);
      if (!tag || !/outline-none/.test(tag)) {
        continue;
      }
      if (/focus(-visible)?:(ring|outline|border)/.test(tag)) {
        continue;
      }

      const line = text.slice(0, match.index).split('\n').length;
      violations.push(`${key.replace('../', '')}:${line}`);
    }
  }

  return violations;
}

/** A positive tabIndex reorders the whole page's tab sequence; nothing here needs it. */
export function findPositiveTabIndex(sources: Record<string, string>): string[] {
  const violations: string[] = [];

  for (const [key, raw] of Object.entries(sources)) {
    if (key.includes('.test.')) {
      continue;
    }

    const text = blankOutNonCode(raw);

    for (const match of text.matchAll(/tabIndex=\{(\d+)\}/g)) {
      if (Number(match[1]) <= 0) {
        continue;
      }

      const line = text.slice(0, match.index).split('\n').length;
      violations.push(`${key.replace('../', '')}:${line} tabIndex={${match[1]}}`);
    }
  }

  return violations;
}

/**
 * Overlays must go through `ModalOverlay`.
 *
 * Before it existed, 13 dialogs each rendered their own full-screen backdrop and
 * only one handled Escape, so a keyboard user could open a dialog and Tab into
 * the page behind it. A new dialog copy-pasting the old markup would reintroduce
 * exactly that, and no rendered test would notice — so the shape is banned in
 * source instead. `ModalOverlay` itself is the one allowed owner.
 */
export function findHandRolledModalBackdrops(sources: Record<string, string>): string[] {
  const violations: string[] = [];

  for (const [key, raw] of Object.entries(sources)) {
    if (key.includes('.test.') || key.includes('ModalOverlay.tsx')) {
      continue;
    }

    const text = blankOutNonCode(raw);

    for (const match of text.matchAll(/absolute inset-0 bg-black/g)) {
      const line = text.slice(0, match.index).split('\n').length;
      violations.push(`${key.replace('../', '')}:${line}`);
    }
  }

  return violations;
}

/**
 * Buttons whose only content is an icon and which carry no name.
 *
 * The rule is deliberately narrow, and it has a **known blind spot** worth stating:
 * a body that is a conditional icon with no string literal — `{shown ? <EyeOff /> :
 * <Eye />}` — is certainly nameless, but telling it apart from `{copied ? <>Copied</>
 * : <>Copy</>}`, which *does* render a name, needs a real JSX parser. Every
 * regex-only attempt at it produced more false positives than hits (one version
 * flagged 5 sites and 4 rendered text), and a guard that cries wolf gets ignored.
 *
 * So this flags only a body with no text and no expression at all, which is
 * unambiguous; the conditional-icon shape is caught instead by
 * `findUnnamedTabStops` in the per-screen tab-order sweep, which renders the screen
 * and reads the real sequence. That is how the three settings key toggles and the
 * chat send button were found.
 */
export function findUnnamedIconButtons(sources: Record<string, string>): string[] {
  const violations: string[] = [];

  for (const [key, raw] of Object.entries(sources)) {
    if (key.includes('.test.')) {
      continue;
    }

    const text = blankOutNonCode(raw);

    for (const match of text.matchAll(/<button\b([\s\S]*?)>([\s\S]*?)<\/button>/g)) {
      const attrs = match[1];
      const body = match[2];

      if (/aria-label=|aria-labelledby=|\btitle=/.test(attrs)) {
        continue;
      }

      const hasText = body.replace(/<[^>]*>/g, '').trim().length > 0;
      const hasExpression = body.includes('{');
      const hasElement = /<[A-Za-z]/.test(body);

      if (hasText || hasExpression || !hasElement) {
        continue;
      }

      const line = text.slice(0, match.index).split('\n').length;
      violations.push(`${key.replace('../', '')}:${line}`);
    }
  }

  return violations;
}

describe('a11y source guards', () => {
  it('loaded the component sources', () => {
    expect(Object.keys(componentSources).length).toBeGreaterThan(100);
  });

  it('finds no form control that removes its outline without showing focus', () => {
    expect(findOutlineViolations(componentSources)).toEqual([]);
  });

  it('finds no positive tabIndex', () => {
    expect(findPositiveTabIndex(componentSources)).toEqual([]);
  });

  it('finds no dialog backdrop outside ModalOverlay', () => {
    expect(findHandRolledModalBackdrops(componentSources)).toEqual([]);
  });

  it('finds no icon-only button without an accessible name', () => {
    expect(findUnnamedIconButtons(componentSources)).toEqual([]);
  });
});

describe('a11y guard self-checks', () => {
  it('catches an outline removed with no focus replacement', () => {
    expect(findOutlineViolations({ 'Fixture.tsx': '<input className="border outline-none" />' })).toEqual([
      'Fixture.tsx:1',
    ]);
  });

  it('accepts each of the three focus patterns the codebase uses', () => {
    const sources = {
      'Ring.tsx': '<input className="outline-none focus-visible:ring-2 focus-visible:ring-ring" />',
      'FocusRing.tsx': '<input className="focus:outline-none focus:ring-2" />',
      'Compact.tsx': '<select className="focus:outline-none focus:border-primary" />',
    };

    expect(findOutlineViolations(sources)).toEqual([]);
  });

  it('ignores controls that never remove the outline, and reads only the tag', () => {
    const sources = {
      'Plain.tsx': '<input className="border" />',
      // `className` on its own line: a line-based rule misses this.
      'Multiline.tsx': '<textarea\n  className="outline-none"\n/>',
    };

    expect(findOutlineViolations(sources)).toEqual(['Multiline.tsx:1']);
  });

  it('does not trip over prose that mentions form controls', () => {
    const sources = { 'Docs.tsx': '/** Use a <select> with className="outline-none" here. */\n<p />' };

    expect(findOutlineViolations(sources)).toEqual([]);
  });

  it('catches a positive tabIndex but allows 0 and -1', () => {
    const sources = {
      'Bad.tsx': '<div tabIndex={3} />',
      'Fine.tsx': '<div tabIndex={0} /><main tabIndex={-1} />',
    };

    expect(findPositiveTabIndex(sources)).toEqual(['Bad.tsx:1 tabIndex={3}']);
  });

  it('catches a hand-rolled backdrop but spares ModalOverlay', () => {
    const sources = {
      'OldDialog.tsx': '<div className="absolute inset-0 bg-black/50" onClick={close} />',
      'ModalOverlay.tsx': '<div className="absolute inset-0 bg-black/50" aria-hidden="true" />',
    };

    expect(findHandRolledModalBackdrops(sources)).toEqual(['OldDialog.tsx:1']);
  });

  it('catches an icon-only button and spares ones that can render a name', () => {
    const sources = {
      Nameless: '<button type="button"><Star className="h-4 w-4" /></button>',
      Labelled: '<button aria-label="Favourite"><Star className="h-4 w-4" /></button>',
      Titled: '<button title="Favourite"><Star className="h-4 w-4" /></button>',
      Text: '<button>Favourite</button>',
      // The JSX-expression case that made the first audit report 16 false positives.
      Expression: "<button>{isSaving ? 'Saving…' : 'Save'}</button>",
      // Known blind spot, by design: a conditional icon is nameless but
      // indistinguishable from a conditional *fragment of text* without a parser,
      // so the sweep's `findUnnamedTabStops` owns this shape instead.
      ConditionalIcon: '<button type="button">{shown ? <EyeOff className="h-4" /> : <Eye className="h-4" />}</button>',
      ConditionalText: '<button>{copied ? <>Copied</> : <>Copy</>}</button>',
    };

    expect(findUnnamedIconButtons(sources)).toEqual(['Nameless:1']);
  });
});
