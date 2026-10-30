import { default as React } from 'react';
import { ThemeConfig } from '../colorModel';
export declare function JsonUploadButton({ children, className, onUpload, }: {
    children?: React.ReactNode;
    className?: string;
    onUpload: (themeConfig: ThemeConfig) => void;
}): React.JSX.Element;
type ButtonProps = {
    as?: React.ElementType;
    /** Huet color classes, relative to the parent's background */
    colors?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    verify?: boolean | string;
    onClick?: (event: React.MouseEvent) => void;
} & Omit<React.AllHTMLAttributes<HTMLElement>, "as" | "className" | "style" | "children" | "onClick">;
export default function Button({ as: As, colors, className, children, verify, onClick, ...rest }: ButtonProps): React.JSX.Element;
export declare function TextButton({ onClick, className, verify, ...rest }: {
    onClick?: (event: React.MouseEvent) => void;
    className?: string;
    verify?: boolean | string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "className">): React.JSX.Element;
export {};
