import { default as React } from 'react';
import { Theme, ThemeConfig } from 'huet/config';
/** The theme the configurator's panels edit, and its setter. */
export declare const ThemeConfiguratorContext: React.Context<[Theme, React.Dispatch<React.SetStateAction<ThemeConfig>>] | null>;
export declare function useThemeConfigurator(): [Theme, React.Dispatch<React.SetStateAction<ThemeConfig>>];
