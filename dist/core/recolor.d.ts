import { Triple } from './color';
import { Hue, NeutralRamp } from './theme';
/** The parts of a theme that define its color coordinates. */
export interface Palette {
    dark?: string;
    light?: string;
    /** A multi-stop or hue-shifting neutral ramp, as in `createTheme`. Use instead of dark/light. */
    neutral?: NeutralRamp;
    colors?: Partial<Record<Hue, string>>;
}
export interface Coordinates {
    /** Position on the dark → light ramp: 0 is dark, 1 is light. */
    t: number;
    /** Neighboring hue ramps and their weights (1 = anchor chroma). */
    weights: Partial<Record<Hue, number>>;
}
export interface RecolorOptions {
    /** The theme the image is assumed to be in. Defaults to Huet's default theme. */
    source?: Palette;
    /** 0 keeps the original color, 1 fully adopts the target theme. */
    strength?: number;
    /**
     * Flip the lightness coordinate. Off by default so light stays light and
     * dark stays dark; meant for UI screenshots shown in an opposite-polarity
     * theme, since inverted photos read as negatives.
     */
    invert?: boolean;
    /**
     * How much a tinted neutral ramp also tints saturated colors. At 1 (the
     * default), chroma is added on top of the neutral ramp, so a yellow-tinted
     * ramp turns blue skies teal. At 0, the tint fades out as colors approach
     * anchor saturation, keeping hues closer to the theme's anchors.
     */
    tint?: number;
}
/** Coordinates of a color in a palette's ramps (useful for inspecting a pixel). */
export declare function coordinatesOf([r, g, b]: Triple, source?: Palette): Coordinates;
/** Map gamma-encoded sRGB channels (0–1) from the source theme into the target theme. */
export declare function recolorer(target: Palette, options?: RecolorOptions): (r: number, g: number, b: number) => Triple;
/** A color on a palette's neutral ramp, or on a hue ramp at anchor chroma. */
export declare function rampColor(palette: Palette, t: number, hue?: Hue): Triple;
export type Transform = (r: number, g: number, b: number) => Triple;
/**
 * Sample a transform on a size³ RGB lattice. Red varies fastest, matching
 * both the `.cube` format and WebGL's 3D texture layout.
 */
export declare function buildLut(transform: Transform, size?: number): Float32Array;
/** Apply a LUT in place to RGBA pixels with trilinear interpolation. Alpha is kept. */
export declare function applyLut(pixels: Uint8ClampedArray, lut: Float32Array, size: number): void;
/** Apply a transform to every pixel directly (reference implementation). */
export declare function applyTransform(pixels: Uint8ClampedArray, transform: Transform): void;
/** Serialize as an Adobe/Resolve `.cube` LUT, usable by ffmpeg's `lut3d` filter. */
export declare function toCube(lut: Float32Array, size: number, title?: string): string;
