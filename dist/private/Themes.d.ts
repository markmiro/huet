import { default as React } from 'react';
import { ThemeConfig } from 'huet/config';
import { Parse } from './persistentState';
export declare const parseConfigs: Parse<ThemeConfig[]>;
export type SavedThemes = ReturnType<typeof useSavedThemes>;
/**
 * The saved themes and the theme being edited, with the actions both theme
 * lists offer. The edited theme is "modified" when it differs from its saved
 * copy.
 */
export declare function useSavedThemes(): {
    configs: ThemeConfig[];
    selected: ThemeConfig;
    saved: ThemeConfig | undefined;
    isModified: boolean;
    select: React.Dispatch<React.SetStateAction<ThemeConfig>>;
    /** Discards edits to the selected theme */
    reset: () => void | undefined;
    remove(config: ThemeConfig): void;
    /** Saves the edited theme as a new theme, leaving its original as it was */
    saveAsNew(): void;
    importTheme(uploaded: ThemeConfig): void;
};
export default function Themes(): React.JSX.Element;
