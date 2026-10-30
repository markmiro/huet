import { default as React } from 'react';
import { default as Color } from './Color';
import { default as Theme } from './Theme';
type ColorStyleValue = React.CSSProperties["color"] | Color | null;
export type HuetStyle = Omit<React.CSSProperties, "backgroundColor" | "color" | "borderColor" | "outlineColor"> & {
    backgroundColor?: ColorStyleValue;
    color?: ColorStyleValue;
    borderColor?: ColorStyleValue;
    outlineColor?: ColorStyleValue;
};
type BlockOwnProps = {
    as?: React.ElementType;
    theme?: Theme;
    debug?: boolean;
    style?: HuetStyle | ((color: Color) => HuetStyle) | null;
    contrast?: string;
    base?: string | null;
    children?: React.ReactNode;
};
export type BlockProps = BlockOwnProps & Omit<React.AllHTMLAttributes<HTMLElement>, keyof BlockOwnProps>;
export default function Block({ as, theme, debug, style, contrast, base, children, ...rest }: BlockProps): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
export {};
