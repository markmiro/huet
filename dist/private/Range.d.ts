import { default as React } from 'react';
export default function Range({ label, min, max, decimals, value, onChange, className, hideInput, }: {
    label?: React.ReactNode;
    min?: number;
    max?: number;
    decimals?: number;
    value: number;
    onChange?: (value: number) => void;
    className?: string;
    hideInput?: boolean;
}): React.JSX.Element;
