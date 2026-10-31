/** A color, with the CIELAB lightness the `white` ramp reads. */
interface Shade {
    hex: string;
    L: number;
}
/** A background that further steps are taken from. */
export interface Surface extends Shade {
    /** This surface at full contrast. Contrast below 1 fades it toward `origin`. */
    readonly full: Shade;
    /** The root background that contrast below 1 fades toward. */
    readonly origin: string;
}
/** `gray` (the neutral ramp, the default), a hue, or `white`. */
export type StepRamp = "gray" | "red" | "yellow" | "green" | "blue" | "purple" | "white";
export interface StepOptions {
    /** The neutral ramp's colors, darkest first. */
    neutral: readonly string[];
    colorModel: string;
    /** Hue anchors. */
    colors: Readonly<Record<string, string>>;
    /** Scales every amount, from 0 to 2. */
    contrast?: number;
    /** Where hue steps aim on light and dark backgrounds. */
    signalLightness?: {
        onLight: number;
        onDark: number;
    };
}
export declare function stepper({ neutral, colorModel, colors, contrast, signalLightness }: StepOptions): {
    /** A background to take steps from, such as the page. */
    surfaceOf: (hex: string) => Surface;
    shown: (parent: Surface, full: string) => string;
    /** A surface whose full-contrast color comes from elsewhere, such as `huet-surface-*`. */
    derive(parent: Surface, full: string): Surface;
    /** The color `amount` (0–100) away from `parent`, scaled by the theme's contrast. */
    step(parent: Surface, amount: number, ramp?: StepRamp): Surface;
};
export type Stepper = ReturnType<typeof stepper>;
export {};
