export declare const clamp01: (n: number) => number;
export type Hsv = {
    h: number;
    s: number;
    v: number;
};
/** HSV for a color. Grays have no hue, so they keep `previousHue`. */
export declare function toHsv(color: string, previousHue?: number): Hsv;
export declare const fromHsv: ({ h, s, v }: Hsv) => string;
/**
 * The most OKLCH chroma that stays in sRGB at lightness `l` and hue `h`.
 * Saturation sliders work as a fraction of it, so every hue reaches its own
 * most vivid color at 100%.
 */
export declare function maxChroma(l: number, h: number): number;
export type Lsh = {
    l: number;
    s: number;
    h: number;
};
/** OKLCH lightness, saturation (as a fraction of `maxChroma`) and hue. */
export declare function toLsh(color: string, previousHue?: number): Lsh;
export declare const fromLsh: ({ l, s, h }: Lsh) => string;
/** A CSS gradient through `count + 1` samples of `color(t)` for t from 0 to 1. */
export declare function gradient(color: (t: number) => string, count?: number): string;
/**
 * Calls `fn` with the latest value at most once per frame. Each change
 * rebuilds the theme, and pointer drags can fire faster than the screen
 * refreshes.
 */
export declare function useFrameThrottle<T>(fn: (value: T) => void): (value: T) => void;
/**
 * Local state for a color being dragged. It shows each pick right away, sends
 * the theme the latest one once per frame, and picks up outside changes (such
 * as Reset) without losing what a hex can't hold, like a gray's hue.
 */
export declare function useDraggedColor<S>(color: string, onChange: (color: string) => void, parse: (color: string, previous?: S) => S, format: (state: S) => string): readonly [S, (value: S) => void];
