import React, { useContext } from "react";

import Theme from "./Theme";
import Block from "./Block";
import { ThemeConfiguratorContext } from "./Body.js";

import useBrowserState, { reset } from "./private/useBrowserState";
import Range from "./private/Range";
import Button from "./private/Button";
import Checkbox from "./private/Checkbox";
import ColorRamps from "./private/ColorRamps";
import Pallet from "./private/Pallet";
import Themes from "./private/Themes";
import __ from "./private/atoms";
import baseThemeConfig from "./private/baseThemeConfig";
import Labeled from "./private/Labeled";
import ThemerShell from "./private/ThemerShell";
import { VSpace } from "./private/AllExceptFirst";
import BgColors from "./private/BgColors";

const baseTheme = new Theme(baseThemeConfig);

function ScrollPanel({ children }) {
  return (
    <div
      style={{
        overflowY: "scroll",
        overflowX: "hidden",
        maxWidth: "30em",
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

export default function Themer() {
  const [theme, setThemeConfig] = useContext(ThemeConfiguratorContext);
  const [shouldThemeSelf, setShouldThemeSelf] = useBrowserState(true);

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

  return (
    <Block theme={themerTheme} contrast="bg=0" style={{ flexShrink: 0 }}>
      <ThemerShell>
        <div style={__.flex}>
          {showHelp && <Help theme={theme} />}
          <ScrollPanel>
            <Block base="blue" contrast="bg=50" style={__.pa1}>
              <Checkbox
                label="Show Help?"
                value={showHelp}
                onChange={setShowHelp}
              />
            </Block>
            <Block contrast="bg=12">
              <Themes label={definitions["name"].label} />
            </Block>
            <VSpace size="2" style={__.pa3}>
              <Labeled label={definitions["bgRampValue"].label}>
                <Block theme={theme}>
                  <BgColors
                    bgRampValue={themeConfig.bgRampValue}
                    onRampValueChange={setBgRampValue}
                  />
                </Block>
              </Labeled>
              <Range
                label={definitions["contrastMultiplier"].label}
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
                label={definitions["endSignalLightness"].label}
                value={themeConfig.endSignalLightness}
                onChange={setEndSignalLightness}
                min={0}
                max={1}
                decimals={2}
              />
              <Range
                label={definitions["startSignalLightness"].label}
                value={themeConfig.startSignalLightness}
                onChange={setStartSignalLightness}
                min={0}
                max={1}
                decimals={2}
              />
              <Checkbox
                label={definitions["rescaleSaturationToGrayRange"].label}
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
          </ScrollPanel>
        </div>
      </ThemerShell>
    </Block>
  );
}
