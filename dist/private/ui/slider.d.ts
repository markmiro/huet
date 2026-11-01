import { default as React } from 'react';
/** A white ring and a dark hairline, so a thumb shows on any color. */
export declare const thumbRing = "hc:shadow-[0_0_0_2px_white,0_0_0_3px_rgb(0_0_0/.35),0_1px_4px_rgb(0_0_0/.3)]";
/**
 * shadcn's Slider on Base UI. Without `track`, it's a plain neutral slider
 * with a filled indicator. With `track` (a CSS background, such as a
 * gradient of the colors it picks between), the track shows that instead and
 * the thumb shows `thumbColor`.
 */
export declare function Slider({ label, value, onValueChange, min, max, step, track, thumbColor, invalid, className, children, }: {
    label: string;
    value: number;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    track?: string;
    thumbColor?: string;
    /** Out of range: the indicator turns red */
    invalid?: boolean;
    className?: string;
    /** Extra marks inside the track, such as ticks */
    children?: React.ReactNode;
}): React.JSX.Element;
