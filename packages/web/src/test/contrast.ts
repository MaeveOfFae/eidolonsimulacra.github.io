/**
 * Colour maths for the token contrast guard.
 *
 * A visual refresh riding the token system has exactly one objective quality
 * measure that can be checked without eyes: the contrast between each foreground
 * token and the surface it sits on. That is worth a test rather than a review,
 * because a token edit is a one-line change that can silently push body text below
 * AA everywhere at once.
 *
 * Test-only infrastructure (no `.test` in the name, so the vitest glob ignores it).
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parse an `H S% L%` custom-property value into RGB. */
export function hslTripletToRgb(value: string): Rgb | null {
  const match = value.trim().match(/^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!match) {
    return null;
  }

  const hue = Number(match[1]);
  const saturation = Number(match[2]) / 100;
  const lightness = Number(match[3]) / 100;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = (((hue % 360) + 360) % 360) / 60;
  const second = chroma * (1 - Math.abs((sector % 2) - 1));
  const offset = lightness - chroma / 2;

  const [red, green, blue] =
    sector < 1
      ? [chroma, second, 0]
      : sector < 2
        ? [second, chroma, 0]
        : sector < 3
          ? [0, chroma, second]
          : sector < 4
            ? [0, second, chroma]
            : sector < 5
              ? [second, 0, chroma]
              : [chroma, 0, second];

  return {
    r: Math.round((red + offset) * 255),
    g: Math.round((green + offset) * 255),
    b: Math.round((blue + offset) * 255),
  };
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (value: number) => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio, 1 (identical) to 21 (black on white). */
export function contrastRatio(foreground: Rgb, background: Rgb): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (left, right) => right - left,
  );

  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

/** A translucent layer over an opaque base, which is what `color-mix(…, transparent)` does. */
export function compositeOver(base: Rgb, layer: Rgb, alpha: number): Rgb {
  return {
    r: Math.round(layer.r * alpha + base.r * (1 - alpha)),
    g: Math.round(layer.g * alpha + base.g * (1 - alpha)),
    b: Math.round(layer.b * alpha + base.b * (1 - alpha)),
  };
}

/** Every `--token: value;` pair declared inside one CSS block, comments ignored. */
export function parseTokenBlock(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) {
    return {};
  }

  const end = css.indexOf('}', start);
  const body = css.slice(start + selector.length + 1, end);
  const tokens: Record<string, string> = {};

  for (const match of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    tokens[match[1] ?? ''] = (match[2] ?? '').trim();
  }

  return tokens;
}
