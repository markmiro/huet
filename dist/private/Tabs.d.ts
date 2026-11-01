import { default as React } from 'react';
export declare const tabEnum: {
    readonly THEMES: "THEMES";
    readonly EDIT_THEME: "EDIT_THEME";
};
export type Tab = (typeof tabEnum)[keyof typeof tabEnum];
export declare const asTab: import('./persistentState').Parse<"THEMES" | "EDIT_THEME">;
/**
 * The Themes / Edit Theme switch, shared by the panel and the popover. Put
 * each tab's content in a `TabPanel` inside it.
 */
export default function Tabs({ currentTab, onTabChange, className, children, }: {
    currentTab: Tab;
    onTabChange: (tab: Tab) => void;
    className?: string;
    children?: React.ReactNode;
}): React.JSX.Element;
/** One tab's content. Hidden tabs aren't rendered. */
export declare function TabPanel({ tab, className, children, }: {
    tab: Tab;
    className?: string;
    children?: React.ReactNode;
}): React.JSX.Element;
