import { default as React } from 'react';
import { ThemeConfig } from 'huet/config';
type Target = string | HTMLElement;
export interface ThemeConfiguratorProps {
    /**
     * An element or selector to theme through Huet classes such as
     * `huet-bg-10`. Leave it out to apply the theme yourself, for example with
     * `mountTheme(root, themeFromConfig(config))` in `onChange`.
     */
    target?: Target;
    /** The theme, for a controlled configurator. Edits call `onChange`. */
    value?: ThemeConfig;
    /**
     * The starting theme when uncontrolled. The configurator saves edits in
     * localStorage and restores them on reload.
     */
    defaultValue?: ThemeConfig;
    /**
     * Called with the edited theme. When uncontrolled, it is also called once on
     * mount with the restored theme.
     */
    onChange?: (config: ThemeConfig) => void;
}
/**
 * A floating theme editor, fixed to the bottom-right corner of the viewport.
 * It renders into its own container on `document.body` with its own scoped
 * styles, so it needs no CSS import.
 */
export default function ThemeConfigurator(props: ThemeConfiguratorProps): React.JSX.Element;
export {};
