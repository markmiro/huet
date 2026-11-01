import { default as React } from 'react';
/**
 * Hue and saturation sliders for one color, in OKLCH at the color's own
 * lightness. Saturation is a share of the most vivid color sRGB has at that
 * hue and lightness, so 100% is always as vivid as it gets. `onReset`, when
 * given, shows a Default button.
 */
export declare function ColorEditor({ name, color, onChange, onReset, onClose, }: {
    name: string;
    color: string;
    onChange: (color: string) => void;
    onReset?: () => void;
    onClose: () => void;
}): React.JSX.Element;
export interface Swatch {
    key: string;
    label: string;
    /** What the swatch shows: a color, or a gradient for a palette. */
    fill: string;
    /** Read out with the swatch's name, such as its hex. */
    description: string;
}
/**
 * A row of swatches. Clicking one selects it, and `editor` opens under the
 * row, joined to the swatch so it's clear which color it changes.
 */
export declare function SwatchRow({ swatches, selected, onSelect, editor, }: {
    swatches: readonly Swatch[];
    selected: string | null;
    onSelect: (key: string | null) => void;
    editor?: React.ReactNode;
}): React.JSX.Element;
