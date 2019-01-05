import React from "react";
import useBrowserState, { reset } from "./useBrowserState";
import huet from "./huet";
import Range from "./Range";
import Contrast from "./Contrast";
import Select from "./Select";
import Button, { ButtonGroup } from "./Button";
import Checkbox from "./Checkbox";
import ColorRamp from "./ColorRamp";
import Pallet from "./Pallet";
import saveAs from "file-saver";

const { ThemeContext } = huet;

export default function Themer({ themes, theme, onChangeTheme }) {
  const [isExpanded, setIsExpanded] = useBrowserState(false);
  const [shouldThemeSelf, setShouldThemeSelf] = useBrowserState(false);

  const ctx = huet.createTheme(theme).contextValue;

  function modify(key) {
    return newValue => {
      onChangeTheme({
        ...theme,
        rescaleContrastToGrayRange: theme.rescaleContrastToGrayRange,
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
  const themeKey = Object.keys(themes).find(
    themeKey => themes[themeKey].name === theme.name
  );

  const isThemeModified = theme !== themes[themeKey];

  function setThemeKey(themeKey) {
    onChangeTheme(themes[themeKey]);
    // setRamps(theme.ramps);
    // // setBgRampValue(theme.bgRampValue);
    // // setContrastMultiplier(theme.contrastMultiplier);
    // // setSaturationContrastMultiplier(theme.saturationContrastMultiplier);
    // setMinColorLightness(theme.minColorLightness);
    // setMaxColorLightness(theme.maxColorLightness);
  }

  function exportTheme() {
    const str = JSON.stringify(theme, null, "  ");
    const blob = new Blob([str], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, themes[themeKey].name + "Huet Theme.json");
  }
  function importTheme() {}
  function exportThemes(e) {
    e.stopPropagation();
  }
  function importThemes(e) {
    e.stopPropagation();
  }
  function resetTheme() {
    onChangeTheme(themes[themeKey]);
  }

  const themerCtx = huet.createTheme(
    shouldThemeSelf
      ? { ...theme, isPicking: false }
      : {
          ...themes.basic,
          bgRampValue: 1
        }
  ).contextValue;

  return (
    <ThemeContext.Provider value={themerCtx}>
      <Contrast
        className="Themer f7 flex flex-column"
        outline={20}
        bg={0}
        style={{
          outlineWidth: 1,
          outlineStyle: "solid",
          boxShadow: `0 5px 30px ${themerCtx.ramps.gray.scale(0)}`,
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
                {Object.keys(themes).map(key => (
                  <option key={key} value={key}>
                    {themes[key].name}
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
              value={theme.bgRampValue}
              onChange={setBgRampValue}
            />
          </Contrast>
          <div className="pa2">
            <div className="mb1">Pallet</div>
            <Pallet colors={theme.pallet} onColorsChange={setPallet} />
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
                {Object.keys(ctx.ramps).map(key => (
                  <ColorRamp key={key} ramp={key} themeContext={ctx} />
                ))}
              </div>
              <Contrast className="w-100" border={20}>
                <Range
                  label="Dark color min lightness"
                  min={0}
                  max={100}
                  value={theme.minColorLightness}
                  onChange={setMinColorLightness}
                  className="mt2"
                />
                <Range
                  label="Light color max lightness"
                  min={0}
                  max={100}
                  value={theme.maxColorLightness}
                  onChange={setMaxColorLightness}
                  className="mt2"
                />
                <Range
                  label="Lightness contrast multiplier"
                  min={0}
                  max={2}
                  decimals={2}
                  value={theme.contrastMultiplier}
                  onChange={setContrastMultiplier}
                  className="mt2"
                />
                <Range
                  label="Saturation multiplier"
                  min={0}
                  max={2}
                  decimals={2}
                  value={theme.saturationContrastMultiplier}
                  onChange={setSaturationContrastMultiplier}
                  className="mt2"
                />
                <Checkbox
                  label="Rescale gray contrast to gray range"
                  isChecked={theme.rescaleContrastToGrayRange}
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
