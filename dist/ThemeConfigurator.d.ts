import { default as React } from 'react';
import { ThemeConfig } from './colorModel';
type Target = string | HTMLElement;
type OnThemeChange = (config: ThemeConfig) => void;
/**
 * The theme editor panel. Inside `<Body>`, it edits Body's theme. Elsewhere it
 * keeps its own saved theme. Either way, `target` (an element or selector)
 * gets the theme through Huet classes such as `huet-bg-10`. `onThemeChange`
 * receives the config on mount and after every edit.
 */
export default function ThemeConfigurator({ target, initialThemeConfig, onThemeChange, }: {
    target?: Target;
    initialThemeConfig?: ThemeConfig;
    onThemeChange?: OnThemeChange;
}): React.JSX.Element;
export {};
