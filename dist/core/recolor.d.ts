import { Triple } from './color';
import { Hue, Theme } from './theme';
export interface Coordinates {
    /** Position on the dark → light ramp: 0 is dark, 1 is light. */
    t: number;
    /** Neighboring hue ramps and their weights (1 = anchor chroma). */
    weights: Partial<Record<Hue, number>>;
}
export interface RecolorOptions {
    /** The theme the image is assumed to be in. Defaults to black to white with Huet's default hues. */
    source?: Theme;
    /**
     * Flip the lightness coordinate. Off by default so light stays light and
     * dark stays dark; meant for UI screenshots shown in an opposite-polarity
     * theme, since inverted photos read as negatives.
     */
    invert?: boolean;
}
/** Coordinates of a color in a theme's ramps (useful for inspecting a pixel). */
export declare function coordinatesOf([r, g, b]: Triple, source?: Theme): Coordinates;
/** Map gamma-encoded sRGB channels (0–1) from the source theme into the target theme. */
export declare function recolorer(target: Theme, options?: RecolorOptions): (r: number, g: number, b: number) => Triple;
/** A color on a theme's neutral ramp, or on a hue ramp at anchor chroma. */
export declare function rampColor(theme: Theme, t: number, hue?: Hue): Triple;
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
