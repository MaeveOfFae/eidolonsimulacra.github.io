/**
 * The semantic state migration is finished, and this is what keeps it finished.
 *
 * 381 amber/yellow/orange, emerald/green, red/rose and blue/sky utilities were
 * hand-written per call site, each with its own `dark:` shade beside it. They now
 * come from the `--success`, `--warning`, `--info` and `--destructive` tokens, so
 * one edit moves every surface and both modes stay readable. Nothing else would
 * notice a new `text-amber-700` arriving: it compiles, renders, passes every other
 * test, and looks right in whichever mode the author happened to be in.
 *
 * Two things are deliberately out of scope: gradients (`from-`/`to-`/`via-`) and
 * the purple accent in `ThemeBrowserPlaceholder`, which are decoration rather than
 * state. The one exception *in* scope is the gold on the favourite star, which is
 * gold on purpose, so it is allowed only on a `<Star>`.
 */
const webSources = import.meta.glob(['../**/*.{ts,tsx}', '../../*.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const STATE_PALETTE =
  /(?<![\w-])(?:text|bg|border|ring|fill|stroke|shadow)-(?:amber|yellow|orange|emerald|green|red|rose|blue|sky)-\d{2,3}(?:\/\d+)?/g;
const GOLD_ON_A_STAR = /^(?:fill-yellow-500|text-yellow-500)$/;

describe('semantic palette migration', () => {
  it('is actually reading the sources', () => {
    // Without this, a broken glob would make the guard below pass on nothing.
    expect(Object.keys(webSources).length).toBeGreaterThan(100);
  });

  it('leaves no state palette utilities in the components', () => {
    const offenders: string[] = [];

    for (const [path, source] of Object.entries(webSources)) {
      if (/\.test\./.test(path)) {
        continue;
      }

      for (const [index, line] of source.split('\n').entries()) {
        for (const match of line.matchAll(STATE_PALETTE)) {
          if (GOLD_ON_A_STAR.test(match[0]) && line.includes('<Star')) {
            continue;
          }

          offenders.push(`${path}:${index + 1} uses ${match[0]}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('uses each state token where the palette colours used to be', () => {
    const all = Object.entries(webSources)
      .filter(([path]) => !/\.test\./.test(path))
      .map(([, source]) => source)
      .join('\n');

    for (const token of ['text-success', 'text-warning', 'text-info', 'text-destructive']) {
      expect(all, `${token} is never used`).toContain(token);
    }
  });
});
