/** Opaque sRGB inputs keep the initial API deterministic in browsers and on servers. */
export type Triple = readonly [number, number, number];
export declare function rgb(hex: string): Triple;
export declare function luminance(hex: string): number;
export declare const lightnessToe: number;
export declare const lightnessOf: (L: number) => number;
export declare const fromLightness: (v: number) => number;
/** CIE lightness L* of a color, from 0 (black) to 1 (white). */
export declare function lightness(hex: string): number;
/**
 * APCA lightness contrast (Lc) of `text` on `background`, using the APCA-W3
 * 0.0.98G-4g constants. Positive for dark text on a lighter background,
 * negative for light text on a darker one. Black on white is about 106.
 *
 * Above Lc 7.3 this matches the reference. Below it, the reference reports 0;
 * here it falls continuously to 0, so small targets on narrow ramps are still
 * reachable.
 */
export declare function apca(text: string, background: string): number;
/** How readable `color` is on `background`, as an unsigned Lc. */
export declare const contrast: (background: string, color: string) => number;
/**
 * The endpoint that text on `background` steps toward: whichever of `dark`
 * and `light` reads better on it by APCA. Ties go to `dark`. Every color on a
 * background (text, roles, signal hues and nested surfaces) shares this side.
 */
export declare function textEnd(background: string, dark: string, light: string): string;
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
