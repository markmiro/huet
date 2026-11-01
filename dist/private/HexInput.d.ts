import { default as React } from 'react';
/** A color typed as text. It applies as soon as it's a valid color, and shows the current color otherwise. */
export default function HexInput({ label, color, onChange, className, }: {
    label: string;
    color: string;
    onChange: (color: string) => void;
    className?: string;
}): React.JSX.Element;
