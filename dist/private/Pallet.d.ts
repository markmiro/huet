/** A color input. Its swatch is the picked color itself, not a theme color. */
export declare function ColorPicker({ label, color, onChange, }: {
    label: string;
    color: string;
    onChange: (color: string) => void;
}): import('react').JSX.Element;
