import React, { useContext, useReducer } from "react";
import saveAs from "file-saver";

import Theme from "./Theme";
import Block from "./Block.jsx";
import { ThemeConfiguratorContext } from "./Body.jsx";

import useBrowserState, { reset } from "./private/useBrowserState";
import Input from "./private/Input";
import Range from "./private/Range";
import Button, { JsonUploadButton } from "./private/Button";
import Checkbox from "./private/Checkbox";
import ColorRamps from "./private/ColorRamps";
import Pallet from "./private/Pallet";
import Themes from "./private/Themes";
import __ from "./private/atoms";
import baseThemeConfig from "./private/baseThemeConfig";
import Labeled from "./private/Labeled";
import ThemerShell from "./private/ThemerShell";
import { VSpace, HSpace } from "./private/AllExceptFirst";
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

  const setName = modify("name");
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

  function exportTheme() {
    // TODO: generate id with timestamp
    const str = JSON.stringify(themeConfig, null, "  ");
    const blob = new Blob([str], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, themeConfig.name + " Huet Theme.json");
  }

  const themerTheme = shouldThemeSelf ? theme : baseTheme;

  return (
    <Block theme={themerTheme} contrast="bg=0">
      <ThemerShell>
        <Block contrast="bg=12">
          <Themes />
          <div style={__.ph2.pb2}>
            <Input
              label="Theme Name"
              style={__.flex_auto.mb1}
              value={themeConfig.name}
              onChange={setName}
            />
            <HSpace>
              <Button onClick={exportTheme}>Export Theme</Button>
              <JsonUploadButton onUpload={setThemeConfig}>
                Import Theme
              </JsonUploadButton>
            </HSpace>
          </div>
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
