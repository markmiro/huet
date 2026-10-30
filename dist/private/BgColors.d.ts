import { default as Theme } from '../Theme';
export default function BgColors({ theme, bgRampValue, onRampValueChange, }: {
    theme: Theme;
    bgRampValue: number;
    onRampValueChange: (value: number) => void;
}): import('react').JSX.Element;
