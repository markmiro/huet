/** Opaque sRGB inputs keep the initial API deterministic in browsers and on servers. */
export type Triple = readonly [number, number, number];
export declare function rgb(hex: string): Triple;
export declare function luminance(hex: string): number;
export declare const lightnessToe: number;
export declare const lightnessOf: (L: number) => number;
export declare const fromLightness: (v: number) => number;
/** CIE lightness L* of a color, from 0 (black) to 1 (white). */
export declare function lightness(hex: string): number;
/** APCA's screen luminance, with its soft clamp near black. */
export declare function apcaY(hex: string): number;
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
/** `apca` from the `apcaY` of the text (`t`) and the background (`b`). */
export declare function apcaFromY(t: number, b: number): number;
/**
 * A background's APCA luminance with the powers `apcaFromY` raises it to.
 * Measuring many colors against one background then raises each to one power,
 * or to none when the text's powers are known too.
 */
export interface ApcaBackground {
    y: number;
    /** Under darker text, and under lighter text. */
    p56: number;
    p65: number;
}
export declare const apcaBackground: (y: number) => ApcaBackground;
/**
 * Unsigned Lc of text with APCA luminance `t` on `background`: the same number
 * as `Math.abs(apcaFromY(t, background.y))`. `t57` and `t62` are `t ** 0.57`
 * and `t ** 0.62`, for text that's measured on many backgrounds.
 */
export declare function lcOn(background: ApcaBackground, t: number, t57?: number, t62?: number): number;
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
 * CIE LCH of an sRGB hex, as CSS `lch()` reads it: D50 white, Bradford-adapted
 * from sRGB's D65. Returns [L* (0–100), C*, h (degrees)]. L* depends only on
 * luminance, so colors that share it share their APCA contrast.
 */
export declare function toLch(hex: string): Triple;
/** Linear sRGB channels of a CIE LCH color (D50), unclipped: out of gamut, some fall outside 0–1. */
export declare function linearRgbFromLch(L: number, C: number, H: number): Triple;
/** The most CIE chroma an sRGB color of lightness `L` and hue `H` can have. */
export declare function maxLchChroma(L: number, H: number): number;
/**
 * Map into gamma-encoded sRGB channels (0–1) by reducing chroma, preserving
 * OKLCH hue and lightness.
 */
export declare function rgbFromOklab([L, a, b]: Triple): Triple;
/** `rgbFromOklab`, written into `out` at `offset`. */
export declare function writeRgbFromOklab(out: Float32Array, offset: number, L: number, a: number, b: number): void;
/** `fromOklab` as the 24 bits of its hex, for colors that are measured rather than shown. */
export declare function bitsFromOklab(L: number, a: number, b: number): number;
export declare const hexOfBits: (bits: number) => string;
/** `apcaY` of a color as 24 bits. */
export declare function apcaYOfBits(bits: number): number;
/** `luminance` of a color as 24 bits. */
export declare function luminanceOfBits(bits: number): number;
export declare function fromOklab(lab: Triple): string;
export declare function mix(a: string, b: string, amount: number): string;
