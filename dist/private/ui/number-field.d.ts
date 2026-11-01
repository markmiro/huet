/**
 * shadcn-style number input on Base UI, with its own minus and plus buttons
 * so the steppers take the theme's colors (a native number input's arrows
 * don't).
 */
export declare function NumberField({ label, value, onValueChange, min, max, step, suffix, invalid, allowOutOfRange, className, }: {
    label: string;
    value: number;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    invalid?: boolean;
    /** Typed values can go past `min`/`max`, so the field can show they're out of range */
    allowOutOfRange?: boolean;
    className?: string;
}): import('react').JSX.Element;
