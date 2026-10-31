import { default as React } from 'react';
import { ResolvedTheme, Surface } from 'huet/internal';
/** Each hue at full strength on `bg`, sorted from furthest to nearest in lightness. */
export declare function swatchesByContrast(theme: ResolvedTheme, bg: Surface): {
    hue: "red" | "yellow" | "green" | "blue" | "purple";
    color: string;
    distance: number;
}[];
/** The neutral colors reachable from `bg`, highest contrast first. */
export declare function neutralGradient(theme: ResolvedTheme, bg: Surface): string;
/**
 * A small summary of a theme as it appears on `bg`: its colors as dots,
 * highest contrast on the left, over a pill showing the gray ramp in the
 * same direction.
 */
export default function ThemeMiniMap({ theme, bg }: {
    theme: ResolvedTheme;
    bg: Surface;
}): React.JSX.Element;
