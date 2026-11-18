import { default as React } from 'react';
import { Hue, Theme } from 'huet';
export declare const defaultColors: Record<Hue, string>;
/**
 * The theme's signal hues as a row of swatches. Clicking one opens its hue
 * and saturation sliders under the row.
 */
declare const _default: React.MemoExoticComponent<({ colors, onChange, }: {
    colors: Theme["colors"];
    onChange: (colors: Theme["colors"]) => void;
}) => React.JSX.Element>;
export default _default;
