import React from "react";
import isNumber from "lodash/isNumber";
import useBrowserState, { reset } from "./useBrowserState";
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
import Pallet from "./Pallet";

const { ThemeContext } = huet;

export default function Themer({ themes, theme, onChangeTheme }) {
  const [isExpanded, setIsExpanded] = useBrowserState(false);
  const [shouldThemeSelf, setShouldThemeSelf] = useBrowserState(false);
  let isPicking, pickedObject, setIsPicking, setPickedObject;

  const ctx = huet.createTheme(theme).contextValue;
  const canAdjustToGray = ctx.ramps.gray.endL - ctx.ramps.gray.startL < 90;

  function modify(key) {
    const setFunc = newValue => {
      onChangeTheme({
        ...theme,
        rescaleContrastToGrayRange: canAdjustToGray
          ? theme.rescaleContrastToGrayRange
          : false,
        rescaleColorContrastToGrayRange: canAdjustToGray
          ? theme.rescaleColorContrastToGrayRange
          : false,
        onPickerPick: picked => {
          console.log(picked);
          setPickedObject(picked);
          setIsPicking(false);
        },
        [key]: newValue
      });
    };
    const value = theme[key];
    return [value, setFunc];
  }

  const [bgScaleValue, setBgScaleValue] = modify("bgScaleValue");
  const [contrastMultiplier, setContrastMultiplier] = modify(
    "contrastMultiplier"
  );
  const [
    saturationContrastMultiplier,
    setSaturationContrastMultiplier
  ] = modify("saturationContrastMultiplier");
  const [pallet, setPallet] = modify("pallet");
  const [minColorLightness, setMinColorLightness] = modify("minColorLightness");
  const [maxColorLightness, setMaxColorLightness] = modify("maxColorLightness");
  const [rescaleContrastToGrayRange, setRescaleContrastToGrayRange] = modify(
    "rescaleContrastToGrayRange"
  );
  const [
    rescaleColorContrastToGrayRange,
    setRescaleColorContrastToGrayRange
  ] = modify("rescaleColorContrastToGrayRange");
  const [normalizeContrastToContext, setNormalizeContrastToContext] = modify(
    "normalizeContrastToContext"
  );
  [isPicking, setIsPicking] = modify("isPicking");
  [pickedObject, setPickedObject] = modify("pickedObject");

  // TODO: find a better way?
  const themeKey = Object.keys(themes).find(
    themeKey => themes[themeKey].name === theme.name
  );

  function setThemeKey(themeKey) {
    onChangeTheme(themes[themeKey]);
    // setRamps(theme.ramps);
    // // setBgScaleValue(theme.bgScaleValue);
    // // setContrastMultiplier(theme.contrastMultiplier);
    // // setSaturationContrastMultiplier(theme.saturationContrastMultiplier);
    // setMinColorLightness(theme.minColorLightness);
    // setMaxColorLightness(theme.maxColorLightness);
    // setIsPicking(false);
    // setPickedObject(null);
  }

  const themerCtx = huet.createTheme(
    shouldThemeSelf
      ? { ...theme, isPicking: false }
      : {
          ...themes.basic,
          bgScaleValue: 1
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
          <div className="pv2 ph2 b flex-auto">Huet Themer (alpha)</div>
          <Contrast bg={20} className="flex justify-center items-center ph3 b">
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
          <Contrast bg={5} className="pa2">
            <Range
              label="Page background lightness"
              min={0}
              max={1}
              decimals={2}
              value={bgScaleValue}
              onChange={setBgScaleValue}
            />
            <Range
              label="Lightness contrast multiplier"
              min={0}
              max={2}
              decimals={2}
              value={contrastMultiplier}
              onChange={setContrastMultiplier}
              className="mt2"
            />
            <Range
              label="Saturation multiplier"
              min={0}
              max={2}
              decimals={2}
              value={saturationContrastMultiplier}
              onChange={setSaturationContrastMultiplier}
              className="mt2"
            />
            <Checkbox
              label="Rescale contrast to context"
              isChecked={normalizeContrastToContext}
              onChange={setNormalizeContrastToContext}
              className="mt2"
            />
            {canAdjustToGray && (
              <>
                <Checkbox
                  label="Rescale contrast to gray range"
                  isChecked={rescaleContrastToGrayRange}
                  onChange={setRescaleContrastToGrayRange}
                  className="mt2"
                />
                <Checkbox
                  label="Rescale color contrast to gray range"
                  isChecked={rescaleColorContrastToGrayRange}
                  onChange={setRescaleColorContrastToGrayRange}
                  className="mt2"
                />
              </>
            )}
          </Contrast>
          <Contrast border={10} className="pa2 bb">
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
                <Button>Save</Button>
                <Button>Save As</Button>
                <Button>Export</Button>
                <Button>Import</Button>
              </ButtonGroup>
            </div>
          </Contrast>
          <div className="pa2">
            <div className="mb1">Pallet</div>
            <Pallet colors={pallet} onColorsChange={setPallet} />
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

function InspectRamp({ label, traceColor, nextColor, ctx }) {
  if (!traceColor) return null;
  return (
    <>
      <div className="mv1">
        {label}{" "}
        <Contrast text={50}>
          lightness=
          {isNumber(traceColor._lightness)
            ? traceColor._lightness.toFixed(2)
            : "?"}
          {isNumber(nextColor) && nextColor._contrast
            ? ` contrast=${nextColor._contrast.toFixed(2)}`
            : null}
        </Contrast>
      </div>
      <div className="w-30 h1 center relative">
        <InnerRamp ramp={traceColor._ramp}>
          {!traceColor._ramp.isNeutral && (
            <>
              <Screen from={0} to={ctx.minColorLightness} />
              <Screen from={ctx.maxColorLightness} to={100} />
            </>
          )}
          {!traceColor._ramp.isNeutral && (
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
    <Contrast bg={10} className="pa2">
      <div className="flex">
        <Button isActive={isPicking} onClick={() => setIsPicking(is => !is)}>
          <Icon name="gps_fixed" ramp="white" className="mr1" />{" "}
          <Contrast textRamp="white">Inspect Color</Contrast>
        </Button>
        {pickedObject && (
          <Button
            className="ml2"
            onClick={onClear}
            bgRamp="red"
            textRamp="white"
          >
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
