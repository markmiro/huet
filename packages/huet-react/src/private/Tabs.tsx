import { HSpace } from "./AllExceptFirst";
import Button from "./Button";
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

/** The Themes / Edit Theme switch, shared by the panel and the popover. */
export default function Tabs({
  currentTab,
  onTabChange,
  className,
  buttonClassName,
}: {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  className?: string;
  buttonClassName?: string;
}) {
  return (
    <div className={cx("hc:px-2 hc:pt-2 hc:border-b", className)}>
      <HSpace growEach>
        {tabs.map(({ tab, label }) => (
          <Button
            key={tab}
            aria-pressed={currentTab === tab}
            colors={currentTab === tab ? "huet-bg-100" : "huet-text-100"}
            className={buttonClassName}
            onClick={() => onTabChange(tab)}
          >
            {label}
          </Button>
        ))}
      </HSpace>
    </div>
  );
}
