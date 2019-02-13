import React, { useContext } from "react";
import saveAs from "file-saver";
import chroma from "chroma-js";
import { detect } from "detect-browser";

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
import { ThemeConfiguratorContext } from "./Body.jsx";

const browser = detect();
if (browser && !["chrome", "firefox"].includes(browser.name)) {
  alert("Warning: Only Chrome and Firefox are suppported for now.");
}

const baseTheme = new Theme(baseThemeConfig);

export default function Themer() {
  const [theme, setThemeConfig] = useContext(ThemeConfiguratorContext);
  const [isExpanded, setIsExpanded] = useBrowserState(true);
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

  // TODO: consider reusing parent theme instead of just creating a new one
  const themerTheme = shouldThemeSelf ? theme : baseTheme;

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
          <Themes />
          <Block contrast="bg=10" style={__.pa2}>
            {/* <Button
              bg={50}
              bgRamp="red"
              textRamp="white"
              onClick={reset}
              verify
            >
              Reset Colors
            </Button> */}
            <Input
              label="Theme Name"
              style={__.flex_auto.mb2}
              value={themeConfig.name}
              onChange={setName}
            />
            <ButtonGroup>
              <Button onClick={exportTheme}>Export Theme</Button>
              <JsonUploadButton onUpload={setThemeConfig}>
                Import Theme
              </JsonUploadButton>
            </ButtonGroup>
          </Block>
          <div style={__.pa2}>
            <div style={__.i.mt2.mb1}>Background color</div>
            <ButtonGroup>
              {[0, 0.25, 0.75, 1].map(scaleValue => (
                <Button
                  key={scaleValue}
                  style={{
                    ...__.ba,
                    backgroundColor: chroma.lab(
                      ...theme.ramps.gray(scaleValue)
                    ),
                    color:
                      theme.ramps.gray(scaleValue)[0] > 50
                        ? theme.pallet.black
                        : theme.pallet.white
                  }}
                >
                  {scaleValue * 100}%
                </Button>
              ))}
            </ButtonGroup>
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
                  value={themeConfig.signalSaturationMultiplier}
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
                <Checkbox
                  label="Theme the themer"
                  value={shouldThemeSelf}
                  onChange={setShouldThemeSelf}
                  style={__.mb2}
                />
              </Block>
            </div>
          </div>
        </div>
      </Block>
    </div>
  );
}
