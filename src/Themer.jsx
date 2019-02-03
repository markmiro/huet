import React from "react";
import saveAs from "file-saver";

import Theme from "./Theme";
import { ThemeContext } from "./reactContexts";
import Contrast from "./Contrast.jsx";
import Block from "./Block";

import useBrowserState, { reset } from "./private/useBrowserState";
import Input from "./private/Input";
import Range from "./private/Range";
import Button, { ButtonGroup, JsonUploadButton } from "./private/Button";
import Checkbox from "./private/Checkbox";
import ColorRamp from "./private/ColorRamp";
import Pallet from "./private/Pallet";
import __ from "./private/atoms";
import { themerClass, resetClass } from "./private/styles";
import baseThemeConfig from "./private/baseThemeConfig";

export default function Themer({ themeConfig, onChangeThemeConfig }) {
  const [isExpanded, setIsExpanded] = useBrowserState(false);
  const [shouldThemeSelf, setShouldThemeSelf] = useBrowserState(false);

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
  const setMinColorLightness = modify("minColorLightness");
  const setMaxColorLightness = modify("maxColorLightness");
  const setRescaleContrastToGrayRange = modify("rescaleContrastToGrayRange");
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
    shouldThemeSelf ? { ...themeConfig } : baseThemeConfig
  );

  return (
    <ThemeContext.Provider value={themerTheme}>
      <div className={themerClass + resetClass}>
        <Contrast
          outline={20}
          bg={0}
          style={{
            ...__.f7.flex.flex_column,
            outlineWidth: 1,
            outlineStyle: "solid",
            boxShadow: `0 5px 30px ${themerTheme.ramps.gray(0)}`,
            position: "fixed",
            bottom: 0,
            right: 0,
            maxHeight: isExpanded ? "100vh" : "20vh",
            zIndex: 9999999,
            width: "30em"
          }}
        >
          <Contrast
            bg={100}
            style={{
              flexShrink: 0,
              userSelect: "none",
              ...__.db.flex.justify_between
            }}
            onClick={() => setIsExpanded(v => !v)}
          >
            <div style={__.pv2.ph2.b}>Huet Themer (alpha)</div>
            <Contrast bg={20} style={__.flex.justify_center.items_center.ph3.b}>
              {isExpanded ? "↓" : "↑"}
            </Contrast>
          </Contrast>
          <div
            style={{
              overflowY: "scroll",
              overflowX: "hidden"
            }}
          >
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
              <div style={__.i.mt2.mb1}>Pallet</div>
              <Pallet colors={themeConfig.pallet} onColorsChange={setPallet} />
              <div style={__.i.mt2.mb1}>Color ramps</div>
              <div style={__.flex.flex_wrap.mt1}>
                <div style={__.w100}>
                  <Contrast
                    border={10}
                    style={{
                      height: "4px",
                      marginBottom: 6,
                      background: "linear-gradient(to right, black, white)",
                      ...__.w100
                    }}
                  />
                  {Object.keys(theme.ramps).map(key => (
                    <ColorRamp
                      key={key}
                      ramp={theme.ramps[key]}
                      theme={theme}
                    />
                  ))}
                </div>
                <Contrast style={__.w100} border={20}>
                  <Range
                    label="Signal lightness on 'black'"
                    min={0}
                    max={1}
                    decimals={2}
                    value={themeConfig.maxColorLightness}
                    onChange={setMaxColorLightness}
                    style={__.mt2}
                  />
                  <Range
                    label="Signal lightness on 'white'"
                    min={0}
                    max={1}
                    decimals={2}
                    value={themeConfig.minColorLightness}
                    onChange={setMinColorLightness}
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
                  <Range
                    label="Contrast"
                    min={0}
                    max={1}
                    decimals={2}
                    value={themeConfig.contrastMultiplier}
                    onChange={setContrastMultiplier}
                    style={__.mt2}
                  />
                  <Checkbox
                    label="Rescale gray contrast to background"
                    isChecked={themeConfig.rescaleContrastToGrayRange}
                    onChange={setRescaleContrastToGrayRange}
                    style={__.mt2}
                  />
                  <Checkbox
                    label="Rescale signal contrast to background"
                    isChecked={themeConfig.rescaleContrastToSignalRange}
                    onChange={setRescaleContrastToSignalRange}
                    style={__.mt2}
                  />
                </Contrast>
              </div>
            </div>
            <Block contrast="b=10" style={__.bt} />
            <Block contrast="bg=10" style={__.pa2}>
              <Checkbox
                label="Theme the themer"
                isChecked={shouldThemeSelf}
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
          </div>
        </Contrast>
      </div>
    </ThemeContext.Provider>
  );
}
