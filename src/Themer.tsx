import saveAs from "file-saver";
import React, { useCallback } from "react";

import Block from "./Block";
import { useThemeConfigurator } from "./Body";
import type { ThemeConfig } from "./colorModel";
import Theme from "./Theme";
import { HSpace, VSpace } from "./private/AllExceptFirst";
import BgColors from "./private/BgColors";
import Button from "./private/Button";
import Checkbox from "./private/Checkbox";
import ColorRamps from "./private/ColorRamps";
import Input from "./private/Input";
import Labeled from "./private/Labeled";
import Pallet from "./private/Pallet";
import Range from "./private/Range";
import ThemerShell from "./private/ThemerShell";
import Themes from "./private/Themes";
import __ from "./private/atoms";
import baseThemeConfig from "./private/baseThemeConfig";
import usePersistentState, {
  asBoolean,
  asOneOf,
  reset,
} from "./private/persistentState";

const baseTheme = new Theme(baseThemeConfig);

function ScrollPanel({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        overflowY: "scroll",
        overflowX: "hidden",
        width: "30em",
        overscrollBehavior: "contain",
        ...__.flex_auto
      }}
    >
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
  onThemeConfigChange,
}: {
  theme: Theme;
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
      <VSpace size="2" style={__.pa3}>
        <div>
          <Input
            label="Theme Name"
            style={__.flex_auto.mb2}
            value={themeConfig.name}
            onChange={name => onThemeConfigChange({ ...themeConfig, name })}
          />
          <Button onClick={exportTheme} style={__.w100}>
            Export Theme
          </Button>
        </div>
        <Labeled label="Background Color">
          <Block theme={theme}>
            <BgColors
              bgRampValue={themeConfig.bgRampValue}
              onRampValueChange={setBgRampValue}
            />
          </Block>
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
          <ColorRamps />
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
    <Block theme={themerTheme}>
      <ThemerShell>
        <div style={{ ...__.flex.flex_column.flex_auto, overflow: "hidden" }}>
          <div style={__.ph2.pt2.bb}>
            <HSpace growEach>
              <Button
                bg={currentTab === tabEnum.THEMES ? 100 : null}
                onClick={() => setCurrentTab(tabEnum.THEMES)}
              >
                Themes
              </Button>
              <Button
                bg={currentTab === tabEnum.EDIT_THEME ? 100 : null}
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
                onThemeConfigChange={setThemeConfig}
              />
            ) : (
              <Themes />
            )}
          </ScrollPanel>
          <Block contrast="bg=12">
            <VSpace style={__.pa3}>
              <Checkbox
                label="Theme the themer"
                value={shouldThemeSelf}
                onChange={setShouldThemeSelf}
              />
              <Button
                bg={100}
                bgRamp="red"
                textRamp="white"
                onClick={reset}
                verify
              >
                Clear Local Storage
              </Button>
            </VSpace>
          </Block>
        </div>
      </ThemerShell>
    </Block>
  );
}
