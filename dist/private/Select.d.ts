/**
 * A native select. The panel's reset removes the browser's arrow, so a
 * chevron is drawn over the right edge instead.
 */
export default function Select<T extends string>({ value, onChange, options, label, }: {
    value: T;
    onChange: (value: T) => void;
    options: readonly T[];
    label?: string;
}): import('react').JSX.Element;
