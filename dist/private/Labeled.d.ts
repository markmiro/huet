import { default as React } from 'react';
export default function Labeled({ label, children, className, ...rest }: {
    label?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
} & React.HTMLAttributes<HTMLElement>): React.JSX.Element;
