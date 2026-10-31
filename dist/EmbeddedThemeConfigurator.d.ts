import { default as React } from 'react';
import { ThemeConfiguratorProps } from './ThemeConfigurator';
import * as Popover from "@radix-ui/react-popover";
/**
 * How the button sits on the page:
 * - `contrast`: inverted, so it's dark on light themes and light on dark ones
 * - `outlined`: a full-contrast border on the page background
 * - `blended`: no border until it's open, so it blends into the background
 */
export type EmbeddedThemeConfiguratorMode = "contrast" | "outlined" | "blended";
export interface EmbeddedThemeConfiguratorProps extends ThemeConfiguratorProps {
    mode?: EmbeddedThemeConfiguratorMode;
    side?: Popover.PopoverContentProps["side"];
    align?: Popover.PopoverContentProps["align"];
    /** Inline styles for the wrapper, such as margins */
    style?: React.CSSProperties;
}
/**
 * A compact theme picker to place anywhere on the page. It shows a mini map of
 * the current theme: its colors from highest to lowest contrast, over its gray
 * ramp. Clicking it opens the configurator in a popover: a Themes tab with the
 * saved themes, and an Edit Theme tab. It shares saved themes with
 * ThemeConfigurator, so the two stay in sync on one page.
 */
export default function EmbeddedThemeConfigurator({ mode, side, align, style, ...props }: EmbeddedThemeConfiguratorProps): React.JSX.Element;
