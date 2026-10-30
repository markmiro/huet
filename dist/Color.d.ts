import { default as chroma } from 'chroma-js';
import { Lab, Ramp } from './colorModel';
import { default as Theme } from './Theme';
export declare class BaseColor {
    lab: Lab;
    hex: string;
    constructor(lab: Lab);
    alpha(a: number): string;
    toString(): string;
}
export interface ColorOptions {
    theme: Theme;
    bgColor?: Color | null;
    lab: Lab;
    ramp?: Ramp | null;
    baseRamp?: Ramp | null;
}
export default class Color extends BaseColor {
    theme: Theme;
    bgColor: Color | null;
    ramp: Ramp | null;
    baseRamp: Ramp;
    lightness: number;
    constructor({ theme, bgColor, lab, ramp, baseRamp, }: ColorOptions);
    static fromTheme(theme: Theme): Color;
    contrast(contrastAmount?: number, ramp?: Ramp): Color;
    direct(ramp: Ramp): Color;
    private fadeEnabled;
    base(ramp: Ramp): Color;
    alpha(amount: number): string;
    shadowColor(alpha?: number): chroma.Color;
    _getMinMax(ramp: Ramp | null): [number, number];
}
export declare function getLightness(color: chroma.Color | string): number;
