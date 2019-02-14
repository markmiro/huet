import React, { useContext } from "react";

import Theme from "./Theme";
import Block from "./Block.jsx";
import { ThemeConfiguratorContext } from "./Body.jsx";

import useBrowserState, { reset } from "./private/useBrowserState";
import Range from "./private/Range";
import Button from "./private/Button";
import Checkbox from "./private/Checkbox";
import ColorRamps from "./private/ColorRamps";
import Pallet from "./private/Pallet";
import Themes from "./private/Themes";
import __ from "./private/atoms";
import baseThemeConfig from "./private/baseThemeConfig";
import Labeled from "./private/Labeled.jsx";
import ThemerShell from "./private/ThemerShell";
import { VSpace } from "./private/AllExceptFirst";
import BgColors from "./private/BgColors";

const baseTheme = new Theme(baseThemeConfig);

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
  const setSaturationMultiplier = modify("signalSaturationMultiplier");
  const setPallet = modify("pallet");
  const setstartSignalLightness = modify("startSignalLightness");
  const setendSignalLightness = modify("endSignalLightness");
  const setRescaleContrastToGrayRange = modify("rescaleContrastToGrayRange");
  const setRescaleSaturationToGrayRange = modify(
    "rescaleSaturationToGrayRange"
  );
  const setRescaleContrastToSignalRange = modify(
    "rescaleContrastToSignalRange"
  );

  const themerTheme = shouldThemeSelf ? theme : baseTheme;

  return (
    <Block theme={themerTheme} contrast="bg=0">
      <ThemerShell>
        <Block contrast="bg=12">
          <Themes />
        </Block>
        <VSpace size="2" style={__.pa2}>
          <Labeled label="Background color">
            <BgColors
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
            <ColorRamps />
          </Labeled>
          <Range
            label="Signal lightness on 'black'"
            min={0}
            max={1}
            decimals={2}
            value={themeConfig.endSignalLightness}
            onChange={setendSignalLightness}
          />
          <Range
            label="Signal lightness on 'white'"
            min={0}
            max={1}
            decimals={2}
            value={themeConfig.startSignalLightness}
            onChange={setstartSignalLightness}
          />
          <Range
            label="Signal saturation"
            min={0}
            max={1}
            decimals={2}
            value={themeConfig.signalSaturationMultiplier}
            onChange={setSaturationMultiplier}
          />
          <Checkbox
            label="Rescale signal contrast to background"
            value={themeConfig.rescaleContrastToSignalRange}
            onChange={setRescaleContrastToSignalRange}
          />
          <Checkbox
            label="Rescale signal saturation to background"
            value={themeConfig.rescaleSaturationToGrayRange}
            onChange={setRescaleSaturationToGrayRange}
            note="Experimental: makes colors too desaturated"
          />
          <Checkbox
            label="Rescale base contrast to background"
            value={themeConfig.rescaleContrastToGrayRange}
            onChange={setRescaleContrastToGrayRange}
          />
          <Checkbox
            label="Theme the themer"
            value={shouldThemeSelf}
            onChange={setShouldThemeSelf}
          />
          <Button bg={50} bgRamp="red" textRamp="white" onClick={reset} verify>
            Clear Local Storage
          </Button>
        </VSpace>
      </ThemerShell>
    </Block>
  );
}
