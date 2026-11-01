import { default as React } from 'react';
import { Theme } from 'huet';
/**
 * Where the background can sit on the neutral ramp: fine steps near each end,
 * where most pages are, and 49% and 51% for the middle on either side.
 */
export declare const backgroundStops: number[];
/**
 * A slider that snaps the page background to `backgroundStops`. Its track is
 * the edited theme's background at each stop, so it previews where each one
 * lands. The stops are evenly spaced on the track, not by value.
 */
export default function BackgroundSlider({ theme, background, onChange, }: {
    theme: Theme;
    background: number;
    onChange: (background: number) => void;
}): React.JSX.Element;
