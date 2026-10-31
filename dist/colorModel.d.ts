export type Lab = [number, number, number];
export type ColorModel = "hcl" | "hsi" | "hsl" | "hsv" | "lab" | "lch" | "lrgb" | "oklab" | "oklch" | "rgb";
export declare const rampModes: {
    readonly SIGNAL: "signal";
    readonly DIRECT: "direct";
    readonly FURTHEST: "furthest";
};
export type RampMode = (typeof rampModes)[keyof typeof rampModes];
/** User-supplied ramp settings. Missing fields fall back to the default ramp. */
export interface RampInput {
    colors?: string[];
    colorModel?: ColorModel;
    correctLightness?: boolean;
    mode?: RampMode;
    classes?: number | number[];
}
/** Ramp settings after defaults are applied. */
export interface RampConfig {
    colors: string[];
    colorModel: ColorModel;
    correctLightness: boolean;
    mode: RampMode;
    classes?: number | number[];
}
/**
 * A chroma scale wrapped so callers get LAB triples.
 * Direct ramps omit `startL` / `endL`.
 */
export interface Ramp {
    (amount: number): Lab;
    config: RampConfig;
    startL?: number;
    endL?: number;
}
export interface ThemeConfig {
    id?: number;
    name?: string;
    pallet: Record<string, string>;
    ramps: Record<string, RampInput>;
    bgRamp: string;
    bgRampValue: number;
    startSignalLightness: number;
    endSignalLightness: number;
    contrastMultiplier: number;
    rescaleContrastToGrayRange: boolean;
    /** Recolor opted-in images under the configurator target. */
    images?: {
        enabled: boolean;
        tint: number;
        strength: number;
    };
}
