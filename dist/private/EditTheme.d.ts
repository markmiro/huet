import { default as React } from 'react';
import { Theme, ThemeConfig } from 'huet/config';
/** Edits the theme's name, background, contrast, palette and signal lightness. */
export default function EditTheme({ theme, themerTheme, onThemeConfigChange, }: {
    theme: Theme;
    /** The panel's own theme. The color ramps preview it. */
    themerTheme: Theme;
    onThemeConfigChange: (config: ThemeConfig) => void;
}): React.JSX.Element;
