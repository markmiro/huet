export default function Pallet({ colors, onColorsChange, }: {
    colors: Record<string, string>;
    onColorsChange: (colors: Record<string, string>) => void;
}): import('react').JSX.Element;
