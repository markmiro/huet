import { default as React } from 'react';
/**
 * A "⋯" button that opens advanced settings in a popover. A blue dot on the
 * button, and the count in its name, say how many of them differ from their
 * defaults.
 */
export declare function SettingsPopover({ label, title, changed, children, }: {
    /** The trigger's accessible name */
    label: string;
    /** The popover's heading */
    title: string;
    /** How many settings inside differ from their defaults */
    changed?: number;
    children?: React.ReactNode;
}): React.JSX.Element;
