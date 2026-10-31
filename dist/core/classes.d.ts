import { Hue } from './theme';
export declare const steps: readonly [0, 5, 10, 25, 50, 75, 100];
export type Surface = (typeof steps)[number] | Hue;
type LegacyClass = `huet-surface-${Surface}` | "huet-text" | "huet-muted" | "huet-border" | "huet-focus" | `huet-text-${Hue}`;
/** The amounts classes take: Tailwind's 11 shades on Huet's 0–100 scale, plus both ends. */
export declare const amounts: readonly [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100];
export type Amount = (typeof amounts)[number];
export declare const rampNames: readonly ["gray", "red", "yellow", "green", "blue", "purple", "white"];
export type RampName = (typeof rampNames)[number];
export type ColorProperty = "bg" | "text" | "border" | "outline";
type ReferenceProperty = ColorProperty | `bg/${Exclude<ColorProperty, "bg">}`;
export type RelativeClass = `huet-${ReferenceProperty}-${Amount | `${RampName}-${Amount}`}`;
/** Explicit-amount classes also take Tailwind variants: `hover:huet-bg-20`, `md:focus:huet-text-80`. */
export type HuetClass = LegacyClass | RelativeClass | `${string}:${RelativeClass}`;
export interface ColorClass {
    property: ColorProperty;
    ownBackground: boolean;
    amount: number;
    ramp?: RampName;
}
export declare function parseColorClass(value: string): ColorClass | undefined;
/**
 * The number a background class's Tailwind utility writes to `--huet-state`.
 * scripts/tailwind-utilities.mjs uses the same formula.
 */
export declare function stateKey({ ramp, amount }: ColorClass): number;
/** The custom property mountTheme writes for a text, border or outline class. */
export declare function classVariable(base: string): string;
export declare const classes: readonly HuetClass[];
export interface ClassToken {
    /** Tailwind variants including the final colon, e.g. `md:hover:`. Empty without variants. */
    variants: string;
    base: string;
    important: boolean;
}
/** Split Tailwind variants (`hover:`, `[&>svg]:`, `data-[x=y]:`) and `!` from a class. */
export declare function parseClassToken(name: string): ClassToken;
export declare function isHuetClass(value: string): value is HuetClass;
/** Check a literal class list; unrelated layout classes are allowed. */
export declare function validateClasses(value: string): string[];
export {};
