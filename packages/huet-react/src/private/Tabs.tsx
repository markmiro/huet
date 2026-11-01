import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import React from "react";

import cx from "./cx";
import { asOneOf } from "./persistentState";

export const tabEnum = {
  THEMES: "THEMES",
  EDIT_THEME: "EDIT_THEME",
} as const;

export type Tab = (typeof tabEnum)[keyof typeof tabEnum];

export const asTab = asOneOf(Object.values(tabEnum));

const tabs = [
  { tab: tabEnum.THEMES, label: "Themes" },
  { tab: tabEnum.EDIT_THEME, label: "Edit Theme" },
];

/*
  shadcn's Tabs on Base UI: a muted track with a raised pill under the active
  tab. Huet classes only step away from their parent's background, so the
  track's `huet-bg-10` can't step back to the page color for the pill. The root
  copies the page's colors into variables before the track changes them, and
  the pill and the active tab use those.
*/
const pageColors =
  "hc:[--tab-surface:var(--huet-background)] hc:[--tab-text:var(--huet-foreground)]";

/**
 * The Themes / Edit Theme switch, shared by the panel and the popover. Put
 * each tab's content in a `TabPanel` inside it.
 */
export default function Tabs({
  currentTab,
  onTabChange,
  className,
  children,
}: {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <BaseTabs.Root
      value={currentTab}
      onValueChange={(tab) => onTabChange(tab as Tab)}
      className={cx("hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0", pageColors, className)}
    >
      <div className="huet-border-10 hc:shrink-0 hc:px-[.75em] hc:py-[.625em] hc:border-b">
        <BaseTabs.List className="huet-bg-10 hc:relative hc:z-0 hc:flex hc:p-[.1875em] hc:rounded-lg">
          {tabs.map(({ tab, label }) => (
            <BaseTabs.Tab
              key={tab}
              value={tab}
              className={cx(
                "hc:flex hc:grow hc:basis-0 hc:items-center hc:justify-center hc:h-[2em] hc:px-[.75em] hc:rounded-md",
                "hc:font-medium hc:whitespace-nowrap hc:cursor-pointer hc:select-none",
                currentTab === tab ? "hc:text-(--tab-text)" : "huet-text-70 hc:hover:opacity-80",
              )}
            >
              {label}
            </BaseTabs.Tab>
          ))}
          <BaseTabs.Indicator
            className={cx(
              "hc:absolute hc:top-0 hc:left-0 hc:-z-1 hc:rounded-md hc:bg-(--tab-surface)",
              "hc:w-(--active-tab-width) hc:h-(--active-tab-height) hc:translate-x-(--active-tab-left) hc:translate-y-(--active-tab-top)",
              "hc:transition-[translate,width] hc:duration-200 hc:ease-out",
              "hc:shadow-[0_1px_3px_color-mix(in_srgb,var(--tab-text)_calc(18%*var(--huet-configurator-contrast,1)),transparent)]",
            )}
          />
        </BaseTabs.List>
      </div>
      {children}
    </BaseTabs.Root>
  );
}

/** One tab's content. Hidden tabs aren't rendered. */
export function TabPanel({
  tab,
  className,
  children,
}: {
  tab: Tab;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <BaseTabs.Panel value={tab} className={className}>
      {children}
    </BaseTabs.Panel>
  );
}
