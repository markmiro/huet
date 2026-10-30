/** Opaque sRGB inputs keep the initial API deterministic in browsers and on servers. */
export type Triple = readonly [number, number, number];
export declare function rgb(hex: string): Triple;
export declare function luminance(hex: string): number;
export declare function contrastRatio(a: string, b: string): number;
/** Gamma-encoded sRGB channels (0–1) to OKLab. */
export declare function oklabFromRgb(r: number, g: number, b: number): Triple;
export declare function toOklab(hex: string): Triple;
/**
 * Map into gamma-encoded sRGB channels (0–1) by reducing chroma, preserving
 * OKLCH hue and lightness.
 */
export declare function rgbFromOklab([L, a, b]: Triple): Triple;
export declare function fromOklab(lab: Triple): string;
export declare function mix(a: string, b: string, amount: number): string;
