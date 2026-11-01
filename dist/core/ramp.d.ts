/**
 * A ramp from `dark` through `colors` to `light`, in OKLab. Its lightness runs
 * evenly from one end to the other. Its hue and chroma come from the nearest
 * colors, in lightness order, so a palette that shifts hue as it darkens, such
 * as amber's yellow to brown, keeps that shift. Past the darkest and lightest
 * colors, the chroma lasts until close to the ends, then meets them, like
 * Huet's steps on a colored surface. Colors that don't fit in sRGB lose chroma
 * and keep their hue and lightness.
 *
 * Pages place their own colors on a theme with it: an accent, or a chart
 * palette, keeping their hues while Huet picks the lightness.
 */
export declare function rampThrough(dark: string, light: string, colors?: readonly string[]): ((t: number) => string) & {
    at: (L: number) => string;
    /** The colors the ramp passes through, ends included, darkest first. */
    stops: readonly string[];
};
export type RampThrough = ReturnType<typeof rampThrough>;
