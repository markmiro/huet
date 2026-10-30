import { default as React } from 'react';
import { default as Color } from './Color';
import { default as Theme } from './Theme';
export declare const ThemeContext: React.Context<Theme | null>;
export declare const BackgroundContext: React.Context<Color | null>;
export declare function useTheme(): Theme;
export declare function useBackground(): Color;
