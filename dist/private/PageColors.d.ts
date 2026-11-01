import { default as React } from 'react';
/**
 * `palette` with its middle color moved to `to`: every color turns by the
 * same hue and scales by the same chroma, keeping its own lightness, so a
 * palette such as amber's yellow to brown keeps its shape. A gray palette
 * takes `to`'s hue and chroma outright. A single color just becomes `to`.
 */
export declare function reshape(palette: readonly string[], to: string): string[];
/**
 * The page's own colors, such as an accent and a chart palette, as a row of
 * swatches like the hues. Editing one moves its middle color and reshapes the
 * rest around it. Default goes back to the page's own colors.
 */
export default function PageColors(): React.JSX.Element;
