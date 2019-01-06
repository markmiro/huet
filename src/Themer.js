import React from "react";
import useBrowserState, { reset } from "./useBrowserState";
import { createTheme, ThemeContext, Contrast } from "./huet";
import Range from "./Range";
import Select from "./Select";
import Button, { ButtonGroup } from "./Button";
import Checkbox from "./Checkbox";
import ColorRamp from "./ColorRamp";
import Pallet from "./Pallet";
import saveAs from "file-saver";

export default function Themer({
  themeConfigs,
  themeConfig,
  onChangeThemeConfig
}) {
  const [isExpanded, setIsExpanded] = useBrowserState(false);
  const [shouldThemeSelf, setShouldThemeSelf] = useBrowserState(false);

  const theme = createTheme(themeConfig);

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
  function exportThemes(e) {
    e.stopPropagation();
  }
  function importThemes(e) {
    e.stopPropagation();
  }
  function resetTheme() {
    onChangeThemeConfig(themeConfigs[themeKey]);
  }

  const themerTheme = createTheme(
    shouldThemeSelf
      ? { ...themeConfig, isPicking: false }
      : {
          ...themeConfigs.basic,
          bgRampValue: 1
        }
  );

  return (
    <ThemeContext.Provider value={themerTheme}>
      <Contrast
        className="Themer f7 flex flex-column"
        outline={20}
        bg={0}
        style={{
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
          className="db flex justify-between"
          style={{
            flexShrink: 0,
            userSelect: "none"
          }}
          onClick={() => setIsExpanded(v => !v)}
        >
          <div className="pv2 ph2 b flex-auto flex justify-between items-center">
            Huet Themer (alpha)
            <div className="flex">
              <Button onClick={exportThemes}>Export All</Button>
              <Button className="ml1" onClick={importThemes}>
                Import All
              </Button>
            </div>
          </div>
          <Contrast bg={20} className="flex justify-center items-center ph3 b">
            {isExpanded ? "↓" : "↑"}
          </Contrast>
        </Contrast>
        <div className="overflow-y-scroll overflow-x-hidden">
          <Contrast bg={10} className="pa2">
            <div className="flex justify-end items-end flex-wrap">
              <Select
                label="Theme"
                value={themeKey}
                onChange={setThemeKey}
                className="flex-auto"
              >
                {Object.keys(themeConfigs).map(key => (
                  <option key={key} value={key}>
                    {themeConfigs[key].name}
                  </option>
                ))}
              </Select>
              <ButtonGroup className="mt1 ml1">
                {isThemeModified && <Button onClick={resetTheme}>Reset</Button>}
                <Button onClick={exportTheme}>Export</Button>
                <Button onClick={importTheme}>Import</Button>
              </ButtonGroup>
            </div>
            <Contrast border={20} className="bb mv2" />
            <Range
              label="Page background lightness"
              min={0}
              max={1}
              decimals={2}
              value={themeConfig.bgRampValue}
              onChange={setBgRampValue}
            />
          </Contrast>
          <div className="pa2">
            <div className="mb1">Pallet</div>
            <Pallet colors={themeConfig.pallet} onColorsChange={setPallet} />
            <div className="mt2 mb1">Color ramps</div>
            <div className="flex flex-wrap mt1">
              <div className="w-100">
                <Contrast
                  border={10}
                  className="w-100"
                  style={{
                    height: "4px",
                    marginBottom: 6,
                    background: "linear-gradient(to right, black, white)"
                  }}
                />
                {Object.keys(theme.ramps).map(key => (
                  <ColorRamp key={key} ramp={theme.ramps[key]} theme={theme} />
                ))}
              </div>
              <Contrast className="w-100" border={20}>
                <Range
                  label="Dark color min lightness"
                  min={0}
                  max={100}
                  value={themeConfig.minColorLightness}
                  onChange={setMinColorLightness}
                  className="mt2"
                />
                <Range
                  label="Light color max lightness"
                  min={0}
                  max={100}
                  value={themeConfig.maxColorLightness}
                  onChange={setMaxColorLightness}
                  className="mt2"
                />
                <Range
                  label="Lightness contrast multiplier"
                  min={0}
                  max={2}
                  decimals={2}
                  value={themeConfig.contrastMultiplier}
                  onChange={setContrastMultiplier}
                  className="mt2"
                />
                <Range
                  label="Saturation multiplier"
                  min={0}
                  max={2}
                  decimals={2}
                  value={themeConfig.saturationContrastMultiplier}
                  onChange={setSaturationContrastMultiplier}
                  className="mt2"
                />
                <Checkbox
                  label="Rescale gray contrast to gray range"
                  isChecked={themeConfig.rescaleContrastToGrayRange}
                  onChange={setRescaleContrastToGrayRange}
                  className="mt2"
                />
              </Contrast>
            </div>
          </div>
          <Contrast className="bt pa2 flex justify-between" border={10}>
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
    </ThemeContext.Provider>
  );
}
