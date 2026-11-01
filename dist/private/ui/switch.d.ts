import { default as React } from 'react';
/**
 * shadcn's Switch on Base UI, in a label. Huet classes have no `checked`
 * variant, so its colors follow the controlled `checked` value. The thumb is
 * full contrast from the track, so it shows both on and off.
 */
export declare function Switch({ label, checked, onCheckedChange, className, children, }: {
    label: React.ReactNode;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
    /** More controls on the label's row, after the switch */
    children?: React.ReactNode;
}): React.JSX.Element;
