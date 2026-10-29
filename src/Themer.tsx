import saveAs from "file-saver";
import React, { useCallback } from "react";

import { useThemeConfigurator } from "./Body";
import type { ThemeConfig } from "./colorModel";
import Theme from "./Theme";
import { HSpace, VSpace } from "./private/AllExceptFirst";
import BgColors from "./private/BgColors";
import Button from "./private/Button";
import Checkbox from "./private/Checkbox";
import ColorRamps from "./private/ColorRamps";
import ConfiguratorPortal from "./private/ConfiguratorPortal";
import Input from "./private/Input";
import Labeled from "./private/Labeled";
import Pallet from "./private/Pallet";
import Range from "./private/Range";
import ThemerShell from "./private/ThemerShell";
import Themes from "./private/Themes";
import baseThemeConfig from "./private/baseThemeConfig";
import usePersistentState, {
  asBoolean,
  asOneOf,
} from "./private/persistentState";

const baseTheme = new Theme(baseThemeConfig);

function ScrollPanel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="hc:overflow-y-scroll hc:overflow-x-hidden hc:w-[30em] hc:overscroll-contain hc:flex-auto hc:min-w-0 hc:min-h-0">
      {children}
    </div>
  );
}

const tabEnum = {
  THEMES: "THEMES",
  EDIT_THEME: "EDIT_THEME"
} as const;

const asTab = asOneOf(Object.values(tabEnum));

function EditTheme({
  theme,
  themerTheme,
  onThemeConfigChange,
}: {
  theme: Theme;
  /** The panel's own theme. The color ramps preview it. */
  themerTheme: Theme;
  onThemeConfigChange: (config: ThemeConfig) => void;
}) {
  const themeConfig = theme.config;

  function modify<K extends keyof ThemeConfig>(key: K) {
    return (newValue: ThemeConfig[K]) => {
      onThemeConfigChange({
        ...themeConfig,
        [key]: newValue
      });
    };
  }

  // Consider useReducer?
  const setBgRampValue = modify("bgRampValue");
  const setContrastMultiplier = modify("contrastMultiplier");
  const setPallet = modify("pallet");
  const setStartSignalLightness = modify("startSignalLightness");
  const setEndSignalLightness = modify("endSignalLightness");

  const exportTheme = useCallback(() => {
    // Generating a random id
    const configWithNewId = { ...themeConfig, id: Math.random() };
    const str = JSON.stringify(configWithNewId, null, "  ");
    const blob = new Blob([str], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, `${themeConfig.name} Huet Theme.json`);
  }, [themeConfig]);

  return (
    <>
      <VSpace size={2} className="hc:p-4">
        <div>
          <Input
            label="Theme Name"
            className="hc:flex-auto hc:min-w-0 hc:min-h-0 hc:mb-2"
            value={themeConfig.name}
            onChange={name => onThemeConfigChange({ ...themeConfig, name })}
          />
          <Button onClick={exportTheme}>Export Theme</Button>
        </div>
        <Labeled label="Background Color">
          <BgColors
            theme={theme}
            bgRampValue={themeConfig.bgRampValue}
            onRampValueChange={setBgRampValue}
          />
        </Labeled>
        <Range
          label="Contrast"
          min={0}
          max={1}
          decimals={2}
          value={themeConfig.contrastMultiplier}
          onChange={setContrastMultiplier}
        />
        <Labeled label="Pallet">
          <Pallet colors={themeConfig.pallet} onColorsChange={setPallet} />
        </Labeled>
        <Labeled label="Color ramps">
          <ColorRamps theme={themerTheme} />
        </Labeled>
        <Range
          label="Signal Lightness on 'Black'"
          value={themeConfig.endSignalLightness}
          onChange={setEndSignalLightness}
          min={0}
          max={1}
          decimals={2}
        />
        <Range
          label="Signal Lightness on 'White'"
          value={themeConfig.startSignalLightness}
          onChange={setStartSignalLightness}
          min={0}
          max={1}
          decimals={2}
        />
      </VSpace>
    </>
  );
}

export default function Themer() {
  const [theme, setThemeConfig] = useThemeConfigurator();
  const [shouldThemeSelf, setShouldThemeSelf] = usePersistentState(
    "themer:shouldThemeSelf",
    true,
    asBoolean
  );
  const [currentTab, setCurrentTab] = usePersistentState<
    (typeof tabEnum)[keyof typeof tabEnum]
  >("themer:currentTab", tabEnum.THEMES, asTab);

  const themerTheme = shouldThemeSelf ? theme : baseTheme;

  return (
    <ConfiguratorPortal themeConfig={themerTheme.config}>
      <ThemerShell>
        <div className="hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:overflow-hidden">
          <div className="hc:px-2 hc:pt-2 hc:border-b">
            <HSpace growEach>
              <Button
                colors={currentTab === tabEnum.THEMES ? "huet-bg-100" : "huet-text-100"}
                onClick={() => setCurrentTab(tabEnum.THEMES)}
              >
                Themes
              </Button>
              <Button
                colors={currentTab === tabEnum.EDIT_THEME ? "huet-bg-100" : "huet-text-100"}
                onClick={() => setCurrentTab(tabEnum.EDIT_THEME)}
              >
                Edit Theme
              </Button>
            </HSpace>
          </div>
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
          <div className="huet-bg-12">
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
