import tokensCss from '../index.css?raw';
import { compositeOver, contrastRatio, hslTripletToRgb, parseTokenBlock, type Rgb } from '@/test/contrast';

/**
 * The token system's contrast bar, in both themes.
 *
 * This is the objective half of the visual refresh: a token edit is one line, and
 * it can push every piece of body text below AA at once with nothing else to catch
 * it. Every pair below is one the app actually renders, and the riskiest is
 * `muted-foreground` on `background`, because that token carries most of the
 * secondary text in the product.
 */
const AA_TEXT = 4.5;
/** The tint used by `.app-pill-*` and the state callouts. */
const TINT_ALPHA = 0.14;

const THEMES: Array<[string, string]> = [
  ['light', ':root'],
  ['dark', '.dark'],
];

function requireRgb(value: string | undefined, label: string): Rgb {
  const rgb = value ? hslTripletToRgb(value) : null;
  if (!rgb) {
    throw new Error(`Token ${label} is missing or is not an "H S% L%" triplet (got ${String(value)})`);
  }

  return rgb;
}

describe('theme tokens', () => {
  it('declares every semantic token in both themes', () => {
    for (const [mode, selector] of THEMES) {
      const tokens = parseTokenBlock(tokensCss, selector);

      for (const name of [
        'background',
        'foreground',
        'card',
        'card-foreground',
        'primary',
        'primary-foreground',
        'secondary',
        'secondary-foreground',
        'muted',
        'muted-foreground',
        'accent',
        'accent-foreground',
        'destructive',
        'destructive-foreground',
        'success',
        'success-foreground',
        'warning',
        'warning-foreground',
      ]) {
        expect(tokens[name], `${mode} (${selector}) is missing --${name}`).toBeDefined();
      }
    }
  });

  it('keeps the palette readable in each theme', () => {
    for (const [mode, selector] of THEMES) {
      const tokens = parseTokenBlock(tokensCss, selector);
      const rgb = (name: string) => requireRgb(tokens[name], name);
      const labels = (name: string) => `${mode}: ${name}`;

      const pairs: Array<[string, Rgb, Rgb]> = [
        ['foreground on background', rgb('foreground'), rgb('background')],
        ['foreground on card', rgb('foreground'), rgb('card')],
        ['muted-foreground on background', rgb('muted-foreground'), rgb('background')],
        ['muted-foreground on muted', rgb('muted-foreground'), rgb('muted')],
        ['primary-foreground on primary', rgb('primary-foreground'), rgb('primary')],
        ['secondary-foreground on secondary', rgb('secondary-foreground'), rgb('secondary')],
        ['accent-foreground on accent', rgb('accent-foreground'), rgb('accent')],
        ['destructive-foreground on destructive', rgb('destructive-foreground'), rgb('destructive')],
        // The pill/callout shape: text token over a 14% tint of its base colour.
        [
          'success-foreground on a success tint',
          rgb('success-foreground'),
          compositeOver(rgb('background'), rgb('success'), TINT_ALPHA),
        ],
        [
          'warning-foreground on a warning tint',
          rgb('warning-foreground'),
          compositeOver(rgb('background'), rgb('warning'), TINT_ALPHA),
        ],
      ];

      for (const [label, foreground, background] of pairs) {
        const ratio = contrastRatio(foreground, background);
        expect(ratio, `${labels(label)} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXT);
      }
    }
  });
});
