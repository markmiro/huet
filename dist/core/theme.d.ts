import { Surface } from './steps';
export declare const hues: readonly ["red", "yellow", "green", "blue", "purple"];
export type Hue = (typeof hues)[number];
/** Interpolation spaces for the neutral ramp. Hue-based models (hcl/lch/oklch/hsl) travel around the hue wheel. */
export declare const colorModels: readonly ["oklab", "oklch", "lab", "lch", "hcl", "lrgb", "rgb", "hsl", "hsv", "hsi"];
export type ColorModel = (typeof colorModels)[number];
/** A neutral ramp in the shape of the legacy `ramps.gray` config. */
export interface NeutralRamp {
    /** Two or more stops, darkest first. The first and last are the endpoints. */
    colors: readonly string[];
    /** How the ramp interpolates between its stops. Defaults to OKLab. */
    colorModel?: ColorModel;
}
/**
 * A Huet theme: its colors, and how strongly explicit contrast amounts apply.
 * It's plain JSON, so presets, saved themes and the configurator all use this
 * one shape. Where the page background sits (light, dark, or in between) isn't
 * part of a theme: pass `background` when you render it.
 */
export interface Theme {
    /** The neutral ramp: two or more colors, darkest first. */
    neutral: readonly string[];
    /** How the neutral ramp blends between its colors. Defaults to `"oklab"`. */
    colorModel?: ColorModel;
    /** Anchors for the signal hues. Missing hues use Huet's defaults. */
    colors?: Partial<Record<Hue, string>>;
    /**
     * From 0 to 2, defaulting to 1. Below 1, every color fades toward the page
     * background, role colors (`huet-text`, `huet-muted`, …) included, for
     * dimmed or disabled UI. Above 1, explicit amounts such as `huet-text-60`
     * reach full contrast sooner: at 2, at half the amount.
     */
    contrast?: number;
    /**
     * Where explicit hue classes such as `huet-text-red-100` aim at full
     * strength, as a position on each hue's dark → hue → light ramp, from 0 to
     * 1: `onLight` on light backgrounds and `onDark` on dark ones. Both default
     * to 0.49. Role colors such as `huet-text-red` are chosen for readability
     * instead.
     */
    signalLightness?: {
        onLight: number;
        onDark: number;
    };
    /**
     * How images and SVGs take on the theme. `strength` 0 keeps the originals
     * and 1 (the default) fully adopts the theme. `tint` (0–1, default 1) is how
     * much a tinted neutral ramp also tints saturated colors.
     */
    images?: {
        strength?: number;
        tint?: number;
    };
}
/** Throws a descriptive error unless `value` is a valid Huet theme. */
export declare function checkTheme(value: unknown): asserts value is Theme;
/** The ramp options for the engine. Two-stop OKLab ramps use the exact plain mix. */
export declare function rampOptionsOf({ neutral, colorModel }: Theme): {
    dark: string;
    light: string;
    neutral?: undefined;
} | {
    neutral: {
        colors: readonly string[];
        colorModel: "hcl" | "hsi" | "hsl" | "hsv" | "lab" | "lch" | "lrgb" | "oklab" | "oklch" | "rgb";
    };
    dark?: undefined;
    light?: undefined;
};
/** Where the page background sits on a theme's neutral ramp. */
export interface BackgroundOptions {
    /** 0 is the dark end of the neutral ramp and 1 the light end. Defaults to 1. */
    background?: number;
}
/** A theme resolved against a background: the solver Huet renders with. */
export declare function resolveTheme(theme: Theme, { background }?: BackgroundOptions): Readonly<{
    background: string;
    dark: string;
    light: string;
    neutral: Readonly<Required<NeutralRamp>>;
    colors: Readonly<{
        red: string;
        yellow: string;
        green: string;
        blue: string;
        purple: string;
    }>;
    ramp: (t: number) => string;
    tokens: (bg?: string, adjacent?: string) => Readonly<Tokens>;
    tokensOn: (bg: Surface, parent?: Surface) => Readonly<Tokens>;
    surface: (parent: string, amount: number | Hue) => string;
    root: Surface;
    step: (parent: Surface, amount: number, ramp?: import('./steps').StepRamp) => Surface;
    surfaceOf: (hex: string) => Surface;
    derive: (parent: Surface, full: string) => Surface;
}>;
export interface ThemeOptions {
    /** Global contrast multiplier for explicit relative-color classes: 0–2. */
    contrast?: number;
    /** Where explicit hue classes aim. See `Theme`. */
    signalLightness?: {
        onLight: number;
        onDark: number;
    };
    /** Ramp endpoints. These also bound neutral foreground colors. */
    dark?: string;
    light?: string;
    /** Full neutral ramp: stops and color model. Use instead of `dark`/`light`. */
    neutral?: NeutralRamp;
    /** Position on the neutral ramp: 0 is dark, 1 is light. */
    background?: number;
    /** Replace anchors, retaining their hue while adapting lightness/chroma. */
    colors?: Partial<Record<Hue, string>>;
}
export interface Tokens {
    background: string;
    foreground: string;
    muted: string;
    border: string;
    red: string;
    yellow: string;
    green: string;
    blue: string;
    purple: string;
}
export declare const defaultColors: Readonly<Record<Hue, string>>;
/** Validate a theme's neutral ramp and return a sampler for it. */
export declare function neutralRampOf(options: Pick<ThemeOptions, "dark" | "light" | "neutral">): {
    custom: boolean;
    stops: readonly string[];
    dark: string;
    light: string;
    colorModel: "hcl" | "hsi" | "hsl" | "hsv" | "lab" | "lch" | "lrgb" | "oklab" | "oklch" | "rgb";
    ramp: (t: number) => string;
};
/** The solver behind `resolveTheme`. Internal: tests exercise it directly. */
export declare function createTheme(options?: ThemeOptions): Readonly<{
    background: string;
    dark: string;
    light: string;
    neutral: Readonly<Required<NeutralRamp>>;
    colors: Readonly<{
        red: string;
        yellow: string;
        green: string;
        blue: string;
        purple: string;
    }>;
    ramp: (t: number) => string;
    tokens: (bg?: string, adjacent?: string) => Readonly<Tokens>;
    tokensOn: (bg: Surface, parent?: Surface) => Readonly<Tokens>;
    surface: (parent: string, amount: number | Hue) => string;
    root: Surface;
    step: (parent: Surface, amount: number, ramp?: import('./steps').StepRamp) => Surface;
    surfaceOf: (hex: string) => Surface;
    derive: (parent: Surface, full: string) => Surface;
}>;
export type ResolvedTheme = ReturnType<typeof createTheme>;
/** Role tokens as `--huet-*` custom properties. */
export declare function themeVariables(tokens: Readonly<Tokens>): Record<string, string>;
