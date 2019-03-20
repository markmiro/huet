import saveAs from "file-saver";
import React, { useCallback, useContext } from "react";

import Block from "./Block";
import { ThemeConfiguratorContext } from "./Body.js";
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
import useBrowserState, { reset } from "./private/useBrowserState";

const baseTheme = new Theme(baseThemeConfig);

function ScrollPanel({ children }) {
  return (
    <div
      style={{
        overflowY: "scroll",
        overflowX: "hidden",
        width: "30em",
        overscrollBehavior: "contain"
      }}
    >
      {children}
    </div>
  );
}

function SettingTitled({ name, settingKey, children }) {
  return (
    <div>
      <div style={{ ...__.b, textDecoration: "underline" }}>{name}</div>
      {settingKey && (
        <Block as="code" contrast="fg=25" style={__.b.mono}>
          {settingKey}
        </Block>
      )}
      <div style={__.mt2}>{children}</div>
    </div>
  );
}

const definitions = {
  name: {
    label: "Theme Name",
    description: "The name of the theme."
  },
  bgRamp: {
    label: "",
    description: (
      <div>
        This is the ramp you'll use for your background, and likely most other
        neutral backgrounds. It's best to keep this to the default of "gray".
      </div>
    )
  },
  bgRampValue: {
    label: "Background Color",
    description: "Adjust the background color based on the ramp.",
    example: (
      <Block style={__.pa2}>
        <Block contrast="bg=100" style={__.pa2}>
          Hello
        </Block>
      </Block>
    )
  },
  contrastMultiplier: {
    label: "Contrast",
    description: "Multiply every contrast setting by a specific number.",
    example: (
      <Block style={__.pa2.flex}>
        <Block contrast="bg=100" style={__.pa2.w100}>
          <b style={__.b.bb.mb1}>Before</b>
          <Block contrast="fg=50">One</Block>
          <Block contrast="fg=100">Two</Block>
        </Block>
        <Block contrast="bg=100" style={__.pa2.w100}>
          <b style={__.b.bb.mb1}>After</b>
          <Block contrast="fg=100">One</Block>
          <Block contrast="fg=100">Two</Block>
        </Block>
      </Block>
    )
  },
  pallet: {
    label: "Pallet",
    description:
      "You set specific hex values for these colors, but only access them indirectly via ramps."
  },
  ramps: {
    label: "Color ramps",
    description: (
      <div>
        Instead of specifying 5 different reds individually, a ramp lets you
        specify a beginning, end, and middle color. If a pallet color is a
        point, ramps draw lines between these points. For advanced scenarios
        you'll have more pallet colors than ramps.
        {/* <Hr /> */}
        <pre>Hello</pre>
      </div>
    )
  },
  startSignalLightness: {
    label: "Signal Lightness on 'White'",
    description: "Signal colors are usually red, yellow, and green"
  },
  endSignalLightness: {
    label: "Signal Lightness on 'Black'",
    description: (
      <div>
        See <span style={__.mono.di}>startSignalLightness</span>
      </div>
    )
  },
  rescaleSaturationToGrayRange: {
    label: "Rescale signal saturation to background",
    description:
      "This is an experimental setting for a reason. If we can guarantee that all signal ramps will always have only colors, then it's somewhat straightforward to implement. Use this setting if you have a lot of backgrounds at 50% contrast or so. This will help signal colors not pop too much."
  }
};

function Help({ theme }) {
  return (
    <ScrollPanel>
      <div style={{ ...__.pa3.f6.br }}>
        {Object.keys(definitions).map((key, i) => {
          const def = definitions[key];
          return (
            <Block
              key={key}
              contrast="b=12"
              style={i === 0 ? null : { ...__.mt3.bt.pt3 }}
            >
              <SettingTitled key={key} name={def.label} settingKey={key}>
                {def.description}
              </SettingTitled>
              {def.example && (
                <Block contrast="b=12" style={__.ba.mt2}>
                  <Block contrast="bg=0" theme={theme}>
                    {def.example}
                  </Block>
                </Block>
              )}
            </Block>
          );
        })}
        {/* <SettingTitled name="Theme the themer" /> */}
      </div>
    </ScrollPanel>
  );
}

function TabView({ children }) {
  return <div>{children}</div>;
}

function Titled({ title = "Some Title", children, ...rest }) {
  const depth = 2;
  return (
    <div>
      {React.createElement("h" + depth, ...rest, title)}
      {children}
    </div>
  );
}

const tabEnum = {
  THEMES: "THEMES",
  EDIT_THEME: "EDIT_THEME"
};

export default function Themer({ shouldOverlay }) {
  const [theme, setThemeConfig] = useContext(ThemeConfiguratorContext);
  const [shouldThemeSelf, setShouldThemeSelf] = useBrowserState(true);
  const [currentTab, setCurrentTab] = useBrowserState(tabEnum.THEMES);

  const themeConfig = theme.config;

  function modify(key) {
    return newValue => {
      setThemeConfig({
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
  const setRescaleSaturationToGrayRange = modify(
    "rescaleSaturationToGrayRange"
  );

  const themerTheme = shouldThemeSelf ? theme : baseTheme;

  const [showHelp, setShowHelp] = useBrowserState(false);

  const exportTheme = useCallback(() => {
    // Generating a random id
    const configWithNewId = { ...themeConfig, id: Math.random() };
    const str = JSON.stringify(configWithNewId, null, "  ");
    const blob = new Blob([str], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, `${themeConfig.name} Huet Theme.json`);
  });

  return (
    <Block theme={themerTheme}>
      <ThemerShell
        shouldOverlay={shouldOverlay}
        fixedChildren={
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
        }
      >
        <div style={{ ...__.flex, overflow: "hidden" }}>
          {showHelp && <Help theme={theme} />}
          <ScrollPanel>
            {{
              [tabEnum.THEMES]: () => <Themes />,
              [tabEnum.EDIT_THEME]: () => (
                <>
                  <Block base="blue" contrast="bg=50" style={__.pa1}>
                    <Checkbox
                      label="Show Help?"
                      value={showHelp}
                      onChange={setShowHelp}
                    />
                  </Block>
                  <Block contrast="bg=12">
                    <div style={__.pa3}>
                      <Input
                        label={definitions.name.label}
                        style={__.flex_auto.mb2}
                        value={themeConfig.name}
                        onChange={name =>
                          setThemeConfig({ ...themeConfig, name })
                        }
                      />
                      <HSpace growEach>
                        <Button onClick={exportTheme} style={__.w100}>
                          Export Theme
                        </Button>
                      </HSpace>
                    </div>
                  </Block>
                  <VSpace size="2" style={__.pa3}>
                    <Labeled label={definitions.bgRampValue.label}>
                      <Block theme={theme}>
                        <BgColors
                          bgRampValue={themeConfig.bgRampValue}
                          onRampValueChange={setBgRampValue}
                        />
                      </Block>
                    </Labeled>
                    <Range
                      label={definitions.contrastMultiplier.label}
                      min={0}
                      max={1}
                      decimals={2}
                      value={themeConfig.contrastMultiplier}
                      onChange={setContrastMultiplier}
                    />
                    <Labeled label="Pallet">
                      <Pallet
                        colors={themeConfig.pallet}
                        onColorsChange={setPallet}
                      />
                    </Labeled>
                    <Labeled label="Color ramps">
                      <ColorRamps />
                    </Labeled>
                    <Range
                      label={definitions.endSignalLightness.label}
                      value={themeConfig.endSignalLightness}
                      onChange={setEndSignalLightness}
                      min={0}
                      max={1}
                      decimals={2}
                    />
                    <Range
                      label={definitions.startSignalLightness.label}
                      value={themeConfig.startSignalLightness}
                      onChange={setStartSignalLightness}
                      min={0}
                      max={1}
                      decimals={2}
                    />
                    <Checkbox
                      label={definitions.rescaleSaturationToGrayRange.label}
                      value={themeConfig.rescaleSaturationToGrayRange}
                      onChange={setRescaleSaturationToGrayRange}
                      note="Experimental: makes colors too desaturated"
                    />
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
                </>
              )
            }[currentTab]()}
          </ScrollPanel>
        </div>
      </ThemerShell>
    </Block>
  );
}
