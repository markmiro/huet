import React from "react";
import { themes as presets } from "huet";

import { useThemeConfigurator } from "./context";
import ConfiguratorPortal from "./private/ConfiguratorPortal";
import EditTheme from "./private/EditTheme";
import Tabs, { asTab, TabPanel, tabEnum, type Tab } from "./private/Tabs";
import ThemerShell from "./private/ThemerShell";
import Themes from "./private/Themes";
import usePersistentState, { asBoolean } from "./private/persistentState";
import { Switch } from "./private/ui/switch";

function ScrollPanel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="hc:overflow-y-scroll hc:overflow-x-hidden hc:w-[30em] hc:overscroll-contain hc:flex-auto hc:min-w-0 hc:min-h-0">
      {children}
    </div>
  );
}

export default function Themer() {
  const { theme, background } = useThemeConfigurator();
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

  return (
    <ConfiguratorPortal theme={shouldThemeSelf ? theme : presets.Base} background={background}>
      <ThemerShell>
        <div className="hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:overflow-hidden">
          <Tabs currentTab={currentTab} onTabChange={setCurrentTab}>
            <ScrollPanel>
              <TabPanel tab={tabEnum.THEMES}>
                <Themes onCreate={() => setCurrentTab(tabEnum.EDIT_THEME)} />
              </TabPanel>
              <TabPanel tab={tabEnum.EDIT_THEME}>
                <EditTheme />
              </TabPanel>
            </ScrollPanel>
          </Tabs>
          <div className="huet-bg-5 huet-border-10 hc:border-t hc:px-[1.25em] hc:py-[.5em]">
            <Switch label="Theme the themer" checked={shouldThemeSelf} onCheckedChange={setShouldThemeSelf} />
          </div>
        </div>
      </ThemerShell>
    </ConfiguratorPortal>
  );
}
