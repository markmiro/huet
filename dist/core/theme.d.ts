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
export interface ThemeOptions {
    /** Global contrast multiplier for explicit relative-color classes: 0–1. */
    contrast?: number;
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
export declare function createTheme(options?: ThemeOptions): Readonly<{
    background: string;
    dark: string;
    light: string;
    neutral: Readonly<Required<NeutralRamp>>;
    colors: Readonly<{
        blue: string;
        green: string;
        purple: string;
        red: string;
        yellow: string;
    }>;
    ramp: (t: number) => string;
    tokens: (bg?: string, adjacent?: string) => Readonly<Tokens>;
    surface: (parent: string, amount: number | Hue) => string;
    relative: import('../Color').default;
}>;
export type HuetTheme = ReturnType<typeof createTheme>;
/** The same properties can be serialized into SSR markup or used by any framework. */
export declare function themeVariables(tokens: Readonly<Tokens>): Record<string, string>;
