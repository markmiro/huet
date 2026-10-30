import { CSSProperties } from 'react';
declare const sizes: {
    readonly ".5em": "hc:border-x-[.5em] hc:border-b-[.5em]";
    readonly ".75em": "hc:border-x-[.75em] hc:border-b-[.75em]";
};
export default function Arrow({ size, className, style, }: {
    size: keyof typeof sizes;
    className?: string;
    style?: CSSProperties;
}): import('react').JSX.Element;
export {};
