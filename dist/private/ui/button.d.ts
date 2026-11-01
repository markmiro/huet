import { default as React } from 'react';
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "icon" | "icon-sm";
/** The classes for a button, for Base UI triggers that render their own `<button>`. */
export declare function buttonClass({ variant, size, className, }?: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
}): string;
/** Asks first when `verify` is set: `true` for "Are you sure?", or a question. */
export declare function confirmed(verify: boolean | string | undefined): boolean;
export type ButtonProps = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    verify?: boolean | string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
export declare const Button: React.ForwardRefExoticComponent<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    verify?: boolean | string;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
/** A small count or label, such as how many advanced settings changed. */
export declare function Badge({ children, className }: {
    children?: React.ReactNode;
    className?: string;
}): React.JSX.Element;
