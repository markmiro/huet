import { default as React } from 'react';
declare const marginLeft: {
    readonly 1: "hc:ml-1";
    readonly 2: "hc:ml-2";
    readonly 3: "hc:ml-4";
};
type Size = keyof typeof marginLeft;
/** Wraps each child, adding `exceptFirst` to every wrapper but the first. */
export default function AllExceptFirst({ exceptFirst, each, children, }: {
    exceptFirst?: string;
    each?: string;
    children?: React.ReactNode;
}): React.JSX.Element[] | null | undefined;
export declare function HSpace({ size, growEach, children, className, }: {
    size?: Size;
    growEach?: boolean;
    children?: React.ReactNode;
    className?: string;
}): React.JSX.Element;
export declare function VSpace({ size, children, className, }: {
    size?: Size;
    children?: React.ReactNode;
    className?: string;
}): React.JSX.Element;
export {};
