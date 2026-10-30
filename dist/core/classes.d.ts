import { Hue } from './theme';
export declare const steps: readonly [0, 5, 10, 25, 50, 75, 100];
export type Surface = (typeof steps)[number] | Hue;
type LegacyClass = `huet-surface-${Surface}` | "huet-text" | "huet-muted" | "huet-border" | "huet-focus" | `huet-text-${Hue}`;
export type Amount = Enumerate<101>;
type Enumerate<N extends number, A extends number[] = []> = A["length"] extends N ? A[number] : Enumerate<N, [...A, A["length"]]>;
export declare const rampNames: readonly ["gray", "red", "yellow", "green", "blue", "purple", "white"];
export type RampName = (typeof rampNames)[number];
export type ColorProperty = "bg" | "text" | "border" | "outline";
type ReferenceProperty = ColorProperty | `bg/${Exclude<ColorProperty, "bg">}`;
export type RelativeClass = `huet-${ReferenceProperty}-${Amount | `${RampName}-${Amount}`}`;
export type HuetClass = LegacyClass | RelativeClass;
export interface ColorClass {
    property: ColorProperty;
    ownBackground: boolean;
    amount: number;
    ramp?: RampName;
}
export declare function parseColorClass(value: string): ColorClass | undefined;
export declare const classes: readonly HuetClass[];
export declare function isHuetClass(value: string): value is HuetClass;
/** Check a literal class list; unrelated layout classes are allowed. */
export declare function validateClasses(value: string): string[];
export {};
