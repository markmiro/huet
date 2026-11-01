import { default as React } from 'react';
import { Theme } from 'huet';
export interface ThemeConfiguratorProps {
    /** The theme being edited. */
    value: Theme;
    /**
     * Called with every edit, and when a theme is picked from `themes`. Apply
     * the theme yourself, with `mountTheme`, `themeCss` or `recolorImage`.
     */
    onChange: (theme: Theme) => void;
    /** The themes to pick from, by name. Defaults to Huet's presets. */
    themes?: Readonly<Record<string, Theme>>;
    /**
     * Called with a new list when someone saves, renames, removes or imports a
     * theme. Leave it out for a fixed list.
     */
    onThemesChange?: (themes: Record<string, Theme>) => void;
    /**
     * Where your page's background sits on the theme's neutral ramp, from 0
     * (dark) to 1 (light). The configurator previews themes on it. It isn't
     * part of the theme, so a light/dark switch on your page sets it. Defaults to 1.
     */
    background?: number;
    /** Called when someone picks a background in the configurator. Leave it out to hide the picker. */
    onBackgroundChange?: (background: number) => void;
    /**
     * Your page's own colors by name, such as a brand accent or a chart
     * palette. Edit Theme shows them in a row of swatches under the hues. Place
     * them on the theme yourself, for example on `rampThrough` from
     * `huet/internal`.
     */
    pageColors?: Readonly<Record<string, PageColor>>;
    /**
     * Called when someone edits one of `pageColors`, with its new colors, or
     * with `undefined` to go back to the page's own. Leave it out to show them
     * without editing.
     */
    onPageColorChange?: (name: string, colors: string[] | undefined) => void;
}
/** One of a page's own colors: a single color, or a palette such as a chart's. */
export interface PageColor {
    /** The colors in use. */
    colors: readonly string[];
    /** The page's own colors, when `colors` is an edit of them. Default goes back to these. */
    own?: readonly string[];
}
/** Shares the edited theme with `children` through ThemeConfiguratorContext. */
export declare function ConfiguratorRoot({ value, onChange, themes, onThemesChange, background, onBackgroundChange, pageColors, onPageColorChange, children, }: ThemeConfiguratorProps & {
    children?: React.ReactNode;
}): React.JSX.Element;
/**
 * A floating theme editor, fixed to the bottom-right corner of the viewport.
 * It renders into its own container on `document.body` with its own scoped
 * styles, so it needs no CSS import.
 */
export default function ThemeConfigurator(props: ThemeConfiguratorProps): React.JSX.Element;
