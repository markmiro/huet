import React from "react";
import saveAs from "file-saver";

import Theme from "../Theme";
import { ThemeContext } from "../unstable/private/reactContexts";
import Contrast from "./Contrast.jsx";

import useBrowserState, { reset } from "./private/useBrowserState";
import Range from "./private/Range";
import Select from "./private/Select";
import Button, { ButtonGroup } from "./private/Button";
import Checkbox from "./private/Checkbox";
import ColorRamp from "./private/ColorRamp";
import Pallet from "./private/Pallet";

import "./Themer.css";
import "../demo/styles.css";
import __ from "./atoms";

export default function Themer({
  themeConfigs,
  themeConfig,
  onChangeThemeConfig
}) {
  const [isExpanded, setIsExpanded] = useBrowserState(false);
  const [shouldThemeSelf, setShouldThemeSelf] = useBrowserState(false);

  const theme = new Theme(themeConfig);

  function modify(key) {
    return newValue => {
      onChangeThemeConfig({
        ...themeConfig,
        rescaleContrastToGrayRange: themeConfig.rescaleContrastToGrayRange,
        [key]: newValue
      });
    };
  }

  const setBgRampValue = modify("bgRampValue");
  const setContrastMultiplier = modify("contrastMultiplier");
  const setSaturationContrastMultiplier = modify(
    "saturationContrastMultiplier"
  );
  const setPallet = modify("pallet");
  const setMinColorLightness = modify("minColorLightness");
  const setMaxColorLightness = modify("maxColorLightness");
  const setRescaleContrastToGrayRange = modify("rescaleContrastToGrayRange");

  // TODO: find a better way?
  const themeKey = Object.keys(themeConfigs).find(
    themeKey => themeConfigs[themeKey].name === themeConfig.name
  );

  const isThemeModified = themeConfig !== themeConfigs[themeKey];

  function setThemeKey(themeKey) {
    onChangeThemeConfig(themeConfigs[themeKey]);
    // setRamps(theme.ramps);
    // // setBgRampValue(theme.bgRampValue);
    // // setContrastMultiplier(theme.contrastMultiplier);
    // // setSaturationContrastMultiplier(theme.saturationContrastMultiplier);
    // setMinColorLightness(theme.minColorLightness);
    // setMaxColorLightness(theme.maxColorLightness);
  }

  function exportTheme() {
    const str = JSON.stringify(themeConfig, null, "  ");
    const blob = new Blob([str], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, themeConfigs[themeKey].name + "Huet Theme.json");
  }
  function importTheme() {}
  function resetTheme() {
    onChangeThemeConfig(themeConfigs[themeKey]);
  }

  const themerTheme = new Theme(
    shouldThemeSelf
      ? { ...themeConfig, isPicking: false }
      : {
          ...themeConfigs.basic,
          bgRampValue: 1
        }
  );

  return (
    <ThemeContext.Provider value={themerTheme}>
      <div className="hh-root hh-Themer">
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
            <Contrast bg={10} style={__.pa2}>
              <div style={__.flex.justify_end.items_end.flex_wrap}>
                <Select
                  label="Theme"
                  value={themeKey}
                  onChange={setThemeKey}
                  style={__.flex_auto}
                >
                  {Object.keys(themeConfigs).map(key => (
                    <option key={key} value={key}>
                      {themeConfigs[key].name}
                    </option>
                  ))}
                </Select>
                <ButtonGroup style={__.mt1.ml1}>
                  {isThemeModified && (
                    <Button onClick={resetTheme}>Reset</Button>
                  )}
                  <Button onClick={exportTheme}>Export</Button>
                  <Button onClick={importTheme}>Import</Button>
                </ButtonGroup>
              </div>
              <Contrast border={20} style={__.bb.mv2} />
              <Range
                label="Page background lightness"
                min={0}
                max={1}
                decimals={2}
                value={themeConfig.bgRampValue}
                onChange={setBgRampValue}
              />
            </Contrast>
            <div style={__.pa2}>
              <div style={__.mb1}>Pallet</div>
              <Pallet colors={themeConfig.pallet} onColorsChange={setPallet} />
              <div style={__.mt2.mb1}>Color ramps</div>
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
                    label="Dark color min lightness"
                    min={0}
                    max={100}
                    value={themeConfig.minColorLightness}
                    onChange={setMinColorLightness}
                    style={__.mt2}
                  />
                  <Range
                    label="Light color max lightness"
                    min={0}
                    max={100}
                    value={themeConfig.maxColorLightness}
                    onChange={setMaxColorLightness}
                    style={__.mt2}
                  />
                  <Range
                    label="Lightness contrast multiplier"
                    min={0}
                    max={2}
                    decimals={2}
                    value={themeConfig.contrastMultiplier}
                    onChange={setContrastMultiplier}
                    style={__.mt2}
                  />
                  <Range
                    label="Saturation multiplier"
                    min={0}
                    max={2}
                    decimals={2}
                    value={themeConfig.saturationContrastMultiplier}
                    onChange={setSaturationContrastMultiplier}
                    style={__.mt2}
                  />
                  <Checkbox
                    label="Rescale gray contrast to gray range"
                    isChecked={themeConfig.rescaleContrastToGrayRange}
                    onChange={setRescaleContrastToGrayRange}
                    style={__.mt2}
                  />
                </Contrast>
              </div>
            </div>
            <Contrast style={__.bt.pa2.flex.justify_between} border={10}>
              <Checkbox
                label="Theme the themer"
                isChecked={shouldThemeSelf}
                onChange={setShouldThemeSelf}
              />
              <Button
                bg={50}
                bgRamp="red"
                textRamp="white"
                onClick={reset}
                verify
              >
                Reset Settings
              </Button>
            </Contrast>
          </div>
        </Contrast>
      </div>
    </ThemeContext.Provider>
  );
}
