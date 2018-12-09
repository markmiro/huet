import React, { useState, useEffect } from "react";
import huet from "./huet";
import Range from "./Range";
import Contrast from "./Contrast";
import Select from "./Select";
import Icon from "./Icon";
import Button, { ButtonGroup } from "./Button";
import Checkbox from "./Checkbox";
import ColorRamp, {
  InnerRamp,
  Star,
  ContrastRange,
  Screen,
  Bracket
} from "./ColorRamp";

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
    setIsPicking(false);
    setPickedObject(null);
  }

  const [isPicking, setIsPicking] = useState(false);
  const [pickedObject, setPickedObject] = useState();

  const finalBgLightness = Math.min(
    Math.max(bgLightness, ramps.gray.darkL),
    ramps.gray.lightL
  );

  const ctx = {
    ...theme,
    ramps,
    bgLightness: finalBgLightness,
    bgLightnessAbove: finalBgLightness,
    contrastMultiplier,
    saturationContrastMultiplier,
    contrastDirection,
    minColorLightness,
    maxColorLightness,
    isPicking,
    onPickerPick: picked => {
      console.log(picked);
      setPickedObject(picked);
      setIsPicking(false);
    },
    pickedObject
  };

  useEffect(
    () => {
      document.body.style.backgroundColor = huet
        .contrastFunctions(ctx)
        .contrast(0);
    },
    [bgLightness, ramps, saturationContrastMultiplier]
  );

  // Themer stuff
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldThemeSelf, setShouldThemeSelf] = useState(false);

  const themerContext = shouldThemeSelf
    ? { ...ctx, isPicking: false }
    : {
        ...themes.basic,
        bgLightness: themes.basic.ramps.gray.lightL,
        bgLightnessAbove: themes.basic.ramps.gray.lightL
      };

  return (
    <>
      <ThemeContext.Provider value={ctx}>
        <Contrast
          bg={0}
          style={{
            ...(ctx.globalStyles && ctx.globalStyles)
          }}
        >
          {children}
        </Contrast>
      </ThemeContext.Provider>
      <ThemeContext.Provider value={themerContext}>
        <Contrast
          className="Themer f7 flex flex-column"
          outline={20}
          bg={0}
          style={{
            outlineWidth: 1,
            outlineStyle: "solid",
            boxShadow: `0 5px 30px ${themerContext.ramps.gray.scale(0)}`,
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
            <div className="pv2 ph2 b flex-auto">Huet Themer (alpha)</div>
            <Contrast
              bg={20}
              className="flex justify-center items-center ph3 b"
            >
              {isExpanded ? "↓" : "↑"}
            </Contrast>
          </Contrast>
          <div className="overflow-y-scroll overflow-x-hidden">
            <ColorInspector
              isPicking={isPicking}
              setIsPicking={setIsPicking}
              pickedObject={pickedObject}
              onClear={() => setPickedObject(null)}
            />
            <Contrast bg={20} className="pa2">
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
              <div className="flex justify-end items-end flex-wrap">
                <Select
                  label="Theme"
                  value={themeKey}
                  onChange={setTheme}
                  className="flex-auto"
                >
                  {Object.keys(themes).map(key => (
                    <option key={key} value={key}>
                      {themes[key].name}
                    </option>
                  ))}
                </Select>
                <ButtonGroup className="mt1 ml1">
                  <Button>Save</Button>
                  <Button>Save As</Button>
                  <Button>Export</Button>
                  <Button>Import</Button>
                </ButtonGroup>
              </div>
            </Contrast>
            <div className="pa2">
              <Contrast>Color ramps</Contrast>
              <div className="flex flex-wrap mt1">
                <div className="w-100 mh2">
                  <Contrast
                    border={20}
                    className="w-100"
                    style={{
                      height: "2px",
                      marginBottom: 1,
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
                </div>
                {/* <Button className="w-100">+ Ramp</Button> */}
                <Contrast className="w-100" border={20}>
                  <Range
                    label="Dark color min lightness"
                    min={0}
                    max={100}
                    value={minColorLightness}
                    onChange={setMinColorLightness}
                    hideInput
                    className="mt2"
                  />
                  <Range
                    label="Light color max lightness"
                    min={0}
                    max={100}
                    value={maxColorLightness}
                    onChange={setMaxColorLightness}
                    hideInput
                    className="mt2"
                  />
                </Contrast>
              </div>
              <Select
                label="Contrast pattern"
                value={contrastDirection}
                onChange={setContrastDirection}
                className="mt2"
              >
                <option value="zigzag">Zigzag</option>
                <option value="flipflop">Flipflop</option>
                <option value="lighter">Lighter</option>
                <option value="darker">Darker</option>
              </Select>
            </div>
            <Contrast className="bt pa2" border={10}>
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

function InspectRamp({ label, traceColor, nextColor, ctx }) {
  if (!traceColor) return null;
  if (nextColor && nextColor._contrast === 0) debugger;
  return (
    <>
      <div className="mv1">
        {label}{" "}
        <Contrast text={50}>
          lightness=
          {traceColor._lightness ? traceColor._lightness.toString() : "?"}
          {nextColor && nextColor._contrast
            ? ` contrast=${nextColor._contrast.toString()}`
            : null}
        </Contrast>
      </div>
      <div className="w-30 h1 center relative">
        <InnerRamp ramp={traceColor._ramp}>
          {traceColor._ramp !== ctx.ramps.gray && (
            <>
              <Screen from={0} to={ctx.minColorLightness} />
              <Screen from={ctx.maxColorLightness} to={100} />
            </>
          )}
          {traceColor._ramp !== ctx.ramps.gray && (
            <>
              <Bracket lightness={ctx.minColorLightness} direction="left" />
              <Bracket lightness={ctx.maxColorLightness} direction="right" />
            </>
          )}
          <Star lightness={traceColor._lightness} />
          {nextColor && (
            <ContrastRange
              lightness={traceColor._lightness}
              contrast={nextColor._contrast}
            />
          )}
        </InnerRamp>
      </div>
    </>
  );
}

function ColorInspector({ isPicking, setIsPicking, pickedObject, onClear }) {
  const { traceColors } = pickedObject || {};
  return (
    <Contrast bg={40} className="pa2">
      <div className="flex">
        <Button isActive={isPicking} onClick={() => setIsPicking(is => !is)}>
          <Icon name="gps_fixed" className="mr1" />{" "}
          <Contrast>Inspect color</Contrast>
        </Button>
        {pickedObject && (
          <Button className="ml2" onClick={onClear} bgRamp="red">
            Clear
          </Button>
        )}
      </div>
      {pickedObject && (
        <>
          <div
            className="pa2 mv2 relative"
            style={{
              background: pickedObject.contextValue.color
            }}
          >
            <ThemeContext.Provider
              value={{
                ...pickedObject.contextValue,
                pickedObject: null,
                isPicking: false
              }}
            >
              <Contrast {...pickedObject.props} className="pa1" style={null}>
                <b>Text</b>
              </Contrast>
            </ThemeContext.Provider>
          </div>
          <Contrast bg={5} className="pa2">
            <InspectRamp
              label="Context"
              traceColor={traceColors.context}
              nextColor={traceColors.bg ? traceColors.bg : traceColors.text}
              ctx={pickedObject.contextValue}
            />
            <InspectRamp
              label="Background"
              traceColor={traceColors.bg}
              nextColor={traceColors.text}
              ctx={pickedObject.contextValue}
            />
            <InspectRamp
              label="Text"
              traceColor={traceColors.text}
              ctx={pickedObject.contextValue}
            />
          </Contrast>
        </>
      )}
    </Contrast>
  );
}
