import React from "react";

import { useThemeConfigurator } from "./context";
import { Theme } from "huet/config";
import { VSpace } from "./private/AllExceptFirst";
import Checkbox from "./private/Checkbox";
import ConfiguratorPortal from "./private/ConfiguratorPortal";
import EditTheme from "./private/EditTheme";
import Tabs, { asTab, tabEnum, type Tab } from "./private/Tabs";
import ThemerShell from "./private/ThemerShell";
import Themes from "./private/Themes";
import { baseThemeConfig } from "huet/config";
import usePersistentState, { asBoolean } from "./private/persistentState";

const baseTheme = new Theme(baseThemeConfig);

function ScrollPanel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="hc:overflow-y-scroll hc:overflow-x-hidden hc:w-[30em] hc:overscroll-contain hc:flex-auto hc:min-w-0 hc:min-h-0">
      {children}
    </div>
  );
}

export default function Themer() {
  const [theme, setThemeConfig] = useThemeConfigurator();
  const [shouldThemeSelf, setShouldThemeSelf] = usePersistentState(
    "themer:shouldThemeSelf",
    true,
    asBoolean
  );
  const [currentTab, setCurrentTab] = usePersistentState<Tab>(
    "themer:currentTab",
    tabEnum.THEMES,
    asTab
  );

  const themerTheme = shouldThemeSelf ? theme : baseTheme;

  return (
    <ConfiguratorPortal themeConfig={themerTheme.config}>
      <ThemerShell>
        <div className="hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:overflow-hidden">
          <Tabs currentTab={currentTab} onTabChange={setCurrentTab} />
          <ScrollPanel>
            {currentTab === tabEnum.EDIT_THEME ? (
              <EditTheme
                theme={theme}
                themerTheme={themerTheme}
                onThemeConfigChange={setThemeConfig}
              />
            ) : (
              <Themes />
            )}
          </ScrollPanel>
          <div className="huet-bg-10">
            <VSpace className="hc:p-4">
              <Checkbox
                label="Theme the themer"
                value={shouldThemeSelf}
                onChange={setShouldThemeSelf}
              />
            </VSpace>
          </div>
        </div>
      </ThemerShell>
    </ConfiguratorPortal>
  );
}
