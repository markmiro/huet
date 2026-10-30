import { default as React } from 'react';
type ContrastOwnProps = {
    as?: React.ElementType;
    bg?: number | null;
    bgRamp?: string;
    text?: number | null;
    textRamp?: string | null;
    border?: number | null;
    borderRamp?: string;
    outline?: number | null;
    outlineRamp?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    debug?: boolean;
};
export type ContrastProps = ContrastOwnProps & Omit<React.AllHTMLAttributes<HTMLElement>, keyof ContrastOwnProps>;
declare const Contrast: (props: ContrastProps) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
export default Contrast;
