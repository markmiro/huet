import { default as React } from 'react';
import { default as Block } from './Block';
import { ThemeConfig } from './colorModel';
import { default as Theme } from './Theme';
export declare const ThemeConfiguratorContext: React.Context<[Theme, React.Dispatch<React.SetStateAction<ThemeConfig>>] | null>;
export declare function useThemeConfigurator(): [Theme, React.Dispatch<React.SetStateAction<ThemeConfig>>];
type BodyProps = {
    initialThemeConfig?: ThemeConfig;
    setDocumentBodyColors?: boolean;
} & Omit<React.ComponentProps<typeof Block>, "theme">;
export default function Body({ initialThemeConfig, setDocumentBodyColors, ...rest }: BodyProps): React.JSX.Element;
export {};
