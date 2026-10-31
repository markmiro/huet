export declare const tabEnum: {
    readonly THEMES: "THEMES";
    readonly EDIT_THEME: "EDIT_THEME";
};
export type Tab = (typeof tabEnum)[keyof typeof tabEnum];
export declare const asTab: import('./persistentState').Parse<"THEMES" | "EDIT_THEME">;
/** The Themes / Edit Theme switch, shared by the panel and the popover. */
export default function Tabs({ currentTab, onTabChange, className, buttonClassName, }: {
    currentTab: Tab;
    onTabChange: (tab: Tab) => void;
    className?: string;
    buttonClassName?: string;
}): import('react').JSX.Element;
