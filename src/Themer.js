import React, { useState } from "react";
import huet from "./huet";
import Range from "./Range";
import Contrast from "./Contrast";
import Select from "./Select";
import Icon from "./Icon";
import Button, { ButtonGroup } from "./Button";
import Checkbox from "./Checkbox";
import ColorRamp from "./ColorRamp";

const { ThemeContext } = huet;

export default function Themer({ children, themes, initialThemeKey }) {
  const [themeKey, setThemeKey] = useState(initialThemeKey);
  const theme = themes[themeKey];

  const [bgLightness, setBgLightness] = useState(theme.bgLightness);
  const [contrastMultiplier, setContrastMultiplier] = useState(
    theme.contrastMultiplier
  );
  const [ramps, setRamps] = useState(theme.ramps);
  const [
    saturationContrastMultiplier,
    setSaturationContrastMultiplier
  ] = useState(theme.saturationContrastMultiplier);

  const [contrastDirection, setContrastDirection] = useState(
    theme.contrastDirection
  );

  function setRamp(key, i, value) {
    const colors = ramps[key].colors;
    const newColors = [...colors.slice(0, i), value, ...colors.slice(i + 1)];
    setRamps({
      ...ramps,
      [key]: huet.createRamp(newColors)
    });
  }

  const [minColorLightness, setMinColorLightness] = useState(
    theme.minColorLightness
  );
  const [maxColorLightness, setMaxColorLightness] = useState(
    theme.maxColorLightness
  );

  function setTheme(themeKey) {
    const theme = themes[themeKey];
    setThemeKey(themeKey);
    setRamps(theme.ramps);
    // setBgLightness(theme.bgLightness);
    // setContrastMultiplier(theme.contrastMultiplier);
    // setSaturationContrastMultiplier(theme.saturationContrastMultiplier);
    setMinColorLightness(theme.minColorLightness);
    setMaxColorLightness(theme.maxColorLightness);
    setContrastDirection(theme.contrastDirection);
  }

  const [isPicking, setIsPicking] = useState(false);
  const [pickedObject, setPickedObject] = useState();

  const ctx = {
    ...theme,
    ramps,
    bgLightness: Math.min(
      Math.max(bgLightness, ramps.gray.darkL),
      ramps.gray.lightL
    ),
    bgLightnessAbove: Math.min(
      Math.max(bgLightness, ramps.gray.darkL),
      ramps.gray.lightL
    ),
    contrastMultiplier,
    saturationContrastMultiplier,
    contrastDirection,
    isPicking,
    minColorLightness,
    maxColorLightness,
    onPickerPick: picked => {
      console.log(picked);
      setPickedObject(picked);
      setIsPicking(false);
    },
    pickedObject
  };

  // Themer stuff
  const [isExpanded, setIsExpanded] = useState(true);
  const [shouldThemeSelf, setShouldThemeSelf] = useState(false);

  const themerContext = shouldThemeSelf
    ? ctx
    : {
        ...themes.tintedBlue,
        contrastMultiplier: 1.5,
        bgLightness: themes.tintedBlue.ramps.gray.lightL,
        bgLightnessAbove: themes.tintedBlue.ramps.gray.lightL
      };

  return (
    <>
      <ThemeContext.Provider value={ctx}>
        <Contrast
          bg={0}
          style={{
            height: "100%"
          }}
        >
          {children}
        </Contrast>
      </ThemeContext.Provider>
      <ThemeContext.Provider value={themerContext}>
        <Contrast
          className="Themer f7 measure flex flex-column"
          outline={20}
          bg={0}
          style={{
            outlineWidth: 1,
            outlineStyle: "solid",
            boxShadow: `0 5px 30px ${themerContext.ramps.gray.normalScale(0)}`,
            position: "fixed",
            bottom: 0,
            right: 0,
            maxHeight: isExpanded ? "100vh" : "30vh",
            zIndex: 9999999
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
            <div className="pv2 ph3 b flex-auto">Huet Themer</div>
            <Contrast
              bg={10}
              className="flex justify-center items-center ph3 b"
            >
              {isExpanded ? "↓" : "↑"}
            </Contrast>
          </Contrast>
          <div className="overflow-y-scroll overflow-x-hidden">
            <Contrast bg={5} className="pa2">
              <Button
                className="mb2 db"
                isActive={isPicking}
                onClick={() => setIsPicking(is => !is)}
              >
                <Icon name="colorize" />
              </Button>
              {pickedObject && (
                <div className="mb3">
                  <ColorRamp
                    ramp={pickedObject.props.bgRamp || "gray"}
                    onChangeRamp={(value, i) =>
                      setRamp(pickedObject.props.bgRamp, i, value)
                    }
                    themeContext={ctx}
                    pickedObject={pickedObject}
                  />
                  <div
                    style={{
                      background: pickedObject.contextValue.color
                    }}
                  >
                    Hello
                  </div>
                  <pre>
                    {/* JSON.stringify(pickedObject.contextValue, null, 2) */}
                  </pre>
                </div>
              )}
              <Range
                label="Page background lightness"
                min={ctx.ramps.gray.darkL}
                max={ctx.ramps.gray.lightL}
                value={bgLightness}
                onChange={lightness => setBgLightness(lightness)}
              />
              <Range
                label="Lightness contrast multiplier"
                min={0}
                max={4}
                decimals={2}
                value={contrastMultiplier}
                onChange={multiplier => setContrastMultiplier(multiplier)}
                className="mt2"
              />
              <Range
                label="Saturation multiplier"
                min={0}
                max={3}
                decimals={2}
                value={saturationContrastMultiplier}
                onChange={multiplier =>
                  setSaturationContrastMultiplier(multiplier)
                }
                className="mt2"
              />
            </Contrast>
            <Contrast border={10} className="pa2 bb">
              <div className="flex justify-between items-end flex-wrap">
                <Select label="Theme" value={themeKey} onChange={setTheme}>
                  {Object.keys(themes).map(key => (
                    <option key={key} value={key}>
                      {themes[key].name}
                    </option>
                  ))}
                </Select>
                {/* <ButtonGroup className="mt1">
                  <Button>Save</Button>
                  <Button>Save As</Button>
                  <Button>Export</Button>
                  <Button>Import</Button>
                </ButtonGroup> */}
              </div>
            </Contrast>
            <div className="pa2">
              <Select
                label="Contrast pattern"
                value={contrastDirection}
                onChange={setContrastDirection}
              >
                <option value="zigzag">Zigzag</option>
                <option value="flipflop">Flipflop</option>
                <option value="lighter">Lighter</option>
                <option value="darker">Darker</option>
              </Select>
              <Contrast text={50} className="db mt2">
                Color ramps
              </Contrast>
              <div className="flex flex-wrap">
                <Contrast className="w-30 bb" border={20} />
                <Contrast
                  border={20}
                  className="w-70 br bl bb"
                  style={{
                    height: "0.5em",
                    background: "linear-gradient(to right, black, white)"
                  }}
                />
                {Object.keys(ramps).map(key => (
                  <ColorRamp
                    key={key}
                    ramp={key}
                    onChangeRamp={(value, i) => setRamp(key, i, value)}
                    themeContext={ctx}
                  />
                ))}
                <div className="w-30">
                  {/* <Button className="w-100 br--bottom">+ Ramp</Button> */}
                </div>
                <Contrast className="w-70 bt" border={20}>
                  <Range
                    label="Dark color minimum lightness"
                    min={0}
                    max={100}
                    value={minColorLightness}
                    onChange={setMinColorLightness}
                    hideInput
                    className="mt2"
                  />
                  <Range
                    label="Light color maximum lightness"
                    min={0}
                    max={100}
                    value={maxColorLightness}
                    onChange={setMaxColorLightness}
                    hideInput
                    className="mt2"
                  />
                </Contrast>
              </div>
            </div>
            <Contrast className="bt pa2" border={5}>
              <Checkbox
                label="Theme the themer"
                isChecked={shouldThemeSelf}
                onChange={setShouldThemeSelf}
              />
            </Contrast>
          </div>
        </Contrast>
      </ThemeContext.Provider>
    </>
  );
}
