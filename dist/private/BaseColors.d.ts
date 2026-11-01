import { default as React } from 'react';
import { ColorModel } from 'huet';
/**
 * The neutral ramp's colors, darkest first. The bar above shows how they
 * blend. Click a color to edit it in the picker below; the + between two
 * colors adds a middle color halfway between them.
 */
export default function BaseColors({ colors, colorModel, onChange, }: {
    colors: readonly string[];
    colorModel?: ColorModel;
    onChange: (colors: string[]) => void;
}): React.JSX.Element;
