import { default as React } from 'react';
import { Theme } from 'huet';
import { ResolvedTheme } from 'huet/internal';
export interface ConfiguratorState {
    /** The theme being edited. */
    theme: Theme;
    /** `theme` on the page's background, for previews. */
    resolved: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    /** The themes to pick from, by name. */
    themes: Readonly<Record<string, Theme>>;
    /** Where the page's background sits on the neutral ramp. */
    background: number;
    /** Moves the page's background, when the page lets the configurator. */
    setBackground?: (background: number) => void;
    /** The listed theme `theme` matches, if any. */
    name?: string;
    /** For an edited theme: the listed theme it was edited from, to reset to. */
    editedFrom?: string;
    /** Picks `editedFrom` again, discarding the edits. */
    reset: () => void;
    /** List changes, when the page lets the configurator edit its list. */
    list?: {
        /** Adds the edited theme to the list under a new name, and picks it. */
        saveAsNew: () => void;
        /** Adds a copy of the current theme as "New Theme", first in the list, and picks it. */
        create: () => void;
        /** Replaces a listed theme, as when saving edits back to the theme they came from. */
        update: (name: string, theme: Theme) => void;
        remove: (name: string) => void;
        rename: (name: string, next: string) => void;
        /** Adds an imported theme to the list, and picks it. */
        add: (name: string, theme: Theme) => void;
    };
}
export declare const ThemeConfiguratorContext: React.Context<ConfiguratorState | null>;
export declare function useThemeConfigurator(): ConfiguratorState;
