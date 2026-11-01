import { default as React } from 'react';
/** shadcn's DropdownMenu on Base UI, behind a "⋯" button. */
export declare function DropdownMenu({ label, children, align, }: {
    /** The trigger's accessible name */
    label: string;
    children?: React.ReactNode;
    align?: "start" | "center" | "end";
}): React.JSX.Element;
export declare function DropdownMenuItem({ icon, children, onClick, verify, disabled, }: {
    icon?: React.ReactNode;
    children?: React.ReactNode;
    onClick?: () => void;
    /** Asks before running `onClick` */
    verify?: boolean | string;
    disabled?: boolean;
}): React.JSX.Element;
export declare function DropdownMenuSeparator(): React.JSX.Element;
