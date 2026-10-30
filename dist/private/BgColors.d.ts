import { Theme } from 'huet/config';
export default function BgColors({ theme, bgRampValue, onRampValueChange, }: {
    theme: Theme;
    bgRampValue: number;
    onRampValueChange: (value: number) => void;
}): import('react').JSX.Element;
