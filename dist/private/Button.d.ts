import { default as React } from 'react';
import { Theme } from 'huet';
export declare function JsonUploadButton({ children, className, onUpload, }: {
    children?: React.ReactNode;
    className?: string;
    /** Called with the theme and a name from the file's name: `Sunset Huet Theme.json` is `Sunset`. */
    onUpload: (theme: Theme, name: string) => void;
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
