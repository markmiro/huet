import { default as React } from 'react';
import { Color } from 'huet/config';
/** Colored ramps at full contrast on `bg`, sorted from highest to lowest contrast. */
export declare function swatchesByContrast(bg: Color): {
    rampKey: string;
    color: string;
    ratio: number;
}[];
/** The neutral colors reachable from `bg`, highest contrast first. */
export declare function neutralGradient(bg: Color): string;
/**
 * A small summary of a theme as it appears on `bg`: its colors as dots,
 * highest contrast on the left, over a pill showing the gray ramp in the
 * same direction.
 */
export default function ThemeMiniMap({ bg }: {
    bg: Color;
}): React.JSX.Element;
