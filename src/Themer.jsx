import React from "react";
import saveAs from "file-saver";

import Theme from "./Theme";
import Block from "./Block.jsx";

import useBrowserState, { reset } from "./private/useBrowserState";
import Input from "./private/Input";
import Range from "./private/Range";
import Button, { ButtonGroup, JsonUploadButton } from "./private/Button";
import Checkbox from "./private/Checkbox";
import ColorRamp from "./private/ColorRamp";
import Pallet from "./private/Pallet";
import Themes from "./private/Themes";
import __ from "./private/atoms";
import { themerClass } from "./private/styles";
import baseThemeConfig from "./private/baseThemeConfig";

export default function Themer({ themeConfig, onChangeThemeConfig }) {
  const [isExpanded, setIsExpanded] = useBrowserState(true);
  const [shouldThemeSelf, setShouldThemeSelf] = useBrowserState(true);

  const theme = new Theme(themeConfig);

  function modify(key) {
    return newValue => {
      onChangeThemeConfig({
        ...themeConfig,
        [key]: newValue
      });
    };
  }

  const setName = modify("name");
  const setBgRampValue = modify("bgRampValue");
  const setContrastMultiplier = modify("contrastMultiplier");
  const setSaturationMultiplier = modify("saturationMultiplier");
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
    const str = JSON.stringify(themeConfig, null, "  ");
    const blob = new Blob([str], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, themeConfig.name + " Huet Theme.json");
  }

  const themerTheme = new Theme(
    shouldThemeSelf ? themeConfig : baseThemeConfig
  );

  return (
    <div
      className={themerClass}
      style={{
        position: "absolute",
        right: 0,
        ...(isExpanded && {
          height: "100vh",
          position: "sticky",
          right: null
        }),
        top: 0,
        zIndex: 999
      }}
    >
      <Block
        contrast="bg=0"
        theme={themerTheme}
        style={parentBg => ({
          ...__.f7.flex.flex_column,
          boxShadow: `0 5px 30px ${parentBg.contrast(100).alpha(0.125)}`,
          outlineWidth: 1,
          outlineStyle: "solid",
          outlineColor: parentBg.contrast(25),
          maxHeight: "100%",
          width: "30em"
        })}
      >
        <Block
          as="button"
          contrast="bg=100"
          style={{
            flexShrink: 0,
            userSelect: "none",
            ...__.db.flex.justify_between
          }}
          onClick={() => setIsExpanded(v => !v)}
        >
          <div style={__.pv2.ph2.b}>Huet Theme Configurator</div>
          <Block
            contrast="bg=20"
            style={__.flex.justify_center.items_center.ph3.b}
          >
            {isExpanded ? "↑" : "↓"}
          </Block>
        </Block>
        <div
          style={{
            overflowY: "scroll",
            overflowX: "hidden",
            display: isExpanded ? null : "none"
          }}
        >
          <Themes onConfigSelect={onChangeThemeConfig} />
          <Block contrast="bg=10" style={__.pa2}>
            <Checkbox
              label="Theme the themer"
              value={shouldThemeSelf}
              onChange={setShouldThemeSelf}
              style={__.mb2}
            />
            <div style={__.flex.justify_between}>
              <ButtonGroup>
                <Button
                  bg={50}
                  bgRamp="red"
                  textRamp="white"
                  onClick={reset}
                  verify
                >
                  Reset Colors
                </Button>
                <Button onClick={exportTheme}>Export Theme</Button>
                <JsonUploadButton
                  onUpload={themeConfig => onChangeThemeConfig(themeConfig)}
                >
                  Import Theme
                </JsonUploadButton>
              </ButtonGroup>
            </div>
          </Block>
          <div style={__.pa2}>
            <Input
              label="Name"
              style={__.flex_auto}
              value={themeConfig.name}
              onChange={setName}
            />
            <Range
              label="Page background lightness"
              min={0}
              max={1}
              decimals={2}
              value={themeConfig.bgRampValue}
              onChange={setBgRampValue}
              style={__.mt2}
            />
            <Range
              label="Contrast"
              min={0}
              max={1}
              decimals={2}
              value={themeConfig.contrastMultiplier}
              onChange={setContrastMultiplier}
              style={__.mt2}
            />
            <div style={__.i.mt2.mb1}>Pallet</div>
            <Pallet colors={themeConfig.pallet} onColorsChange={setPallet} />
            <div style={__.i.mt2.mb1}>Color ramps</div>
            <div style={__.flex.flex_wrap.mt1}>
              <div style={__.w100}>
                <Block
                  contrast="b=10"
                  style={{
                    height: "4px",
                    marginBottom: 6,
                    background: "linear-gradient(to right, black, white)",
                    ...__.w100
                  }}
                />
                {Object.keys(theme.ramps).map(key => (
                  <ColorRamp key={key} ramp={theme.ramps[key]} theme={theme} />
                ))}
              </div>
              <Block contrast="b=20" style={__.w100}>
                <Range
                  label="Signal lightness on 'black'"
                  min={0}
                  max={1}
                  decimals={2}
                  value={themeConfig.endSignalLightness}
                  onChange={setendSignalLightness}
                  style={__.mt2}
                />
                <Range
                  label="Signal lightness on 'white'"
                  min={0}
                  max={1}
                  decimals={2}
                  value={themeConfig.startSignalLightness}
                  onChange={setstartSignalLightness}
                  style={__.mt2}
                />
                <Range
                  label="Signal saturation"
                  min={0}
                  max={1}
                  decimals={2}
                  value={themeConfig.saturationMultiplier}
                  onChange={setSaturationMultiplier}
                  style={__.mt2}
                />
                <Checkbox
                  label="Rescale signal contrast to background"
                  value={themeConfig.rescaleContrastToSignalRange}
                  onChange={setRescaleContrastToSignalRange}
                  style={__.mt2}
                />
                <Checkbox
                  label="Rescale signal saturation to background"
                  value={themeConfig.rescaleSaturationToGrayRange}
                  onChange={setRescaleSaturationToGrayRange}
                  style={__.mt2}
                  note="Experimental: makes colors too desaturated"
                />
                <Checkbox
                  label="Rescale base contrast to background"
                  value={themeConfig.rescaleContrastToGrayRange}
                  onChange={setRescaleContrastToGrayRange}
                  style={__.mt2}
                />
              </Block>
            </div>
          </div>
        </div>
      </Block>
    </div>
  );
}
