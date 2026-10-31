import chroma from "chroma-js";
import saveAs from "file-saver";
import React, { useCallback } from "react";
import { colorModels, hues, themes as presets, type ColorModel, type RecolorSettings, type Theme } from "huet";

import { useThemeConfigurator } from "../context";
import { HSpace, VSpace } from "./AllExceptFirst";
import BgColors from "./BgColors";
import Button, { JsonUploadButton, TextButton } from "./Button";
import Checkbox from "./Checkbox";
import ColorRamps from "./ColorRamps";
import Input from "./Input";
import Labeled from "./Labeled";
import { ColorPicker } from "./Pallet";
import Range from "./Range";
import Select from "./Select";

// Huet's default hues, for themes that leave some out
const defaultColors = presets.Base.colors;
const defaultSignalLightness = { onLight: 0.49, onDark: 0.49 };

/** The neutral ramp's colors, darkest first, with middle colors that can be added and removed. */
function NeutralColors({
  colors,
  onChange,
}: {
  colors: readonly string[];
  onChange: (colors: string[]) => void;
}) {
  // A new middle color goes halfway between the two in the middle of the ramp.
  const addMiddle = () => {
    const i = Math.ceil(colors.length / 2);
    const middle = chroma.mix(colors[i - 1], colors[i], 0.5, "lab").hex();
    onChange([...colors.slice(0, i), middle, ...colors.slice(i)]);
  };
  return (
    <VSpace size={1}>
      <HSpace growEach>
        {colors.map((color, i) => (
          <ColorPicker
            key={i}
            label={i === 0 ? "Darkest" : i === colors.length - 1 ? "Lightest" : `Middle ${i}`}
            color={color}
            onChange={(next) => onChange(colors.map((c, j) => (j === i ? next : c)))}
          />
        ))}
      </HSpace>
      <HSpace>
        <TextButton onClick={addMiddle}>Add a middle color</TextButton>
        {colors.length > 2 && (
          <TextButton onClick={() => onChange([...colors.slice(0, -2), colors[colors.length - 1]])}>
            Remove the last middle color
          </TextButton>
        )}
      </HSpace>
    </VSpace>
  );
}

/** A 0–1 setting shown as a percentage. */
function Percent({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <Range
      label={label}
      value={Math.round(value * 100)}
      onChange={(percent) => onChange(Math.max(0, Math.min(100, percent)) / 100)}
    />
  );
}

/**
 * A switch for theming images or SVGs, with their tint and strength. Off is
 * strength 0, so they keep their own colors.
 */
function Recoloring({
  label,
  noun,
  value,
  onChange,
}: {
  label: string;
  noun: string;
  value: RecolorSettings | undefined;
  onChange: (settings: RecolorSettings) => void;
}) {
  const settings = { strength: 1, tint: 1, ...value };
  return (
    <>
      <Checkbox
        label={label}
        value={settings.strength > 0}
        onChange={(on) => onChange({ ...settings, strength: on ? 1 : 0 })}
      />
      {settings.strength > 0 && (
        <>
          <Percent label={`${noun} tint`} value={settings.tint} onChange={(tint) => onChange({ ...settings, tint })} />
          <Percent
            label={`${noun} strength`}
            value={settings.strength}
            onChange={(strength) => onChange({ ...settings, strength })}
          />
        </>
      )}
    </>
  );
}

/** Edits every part of the theme, and the page's background when the page allows it. */
export default function EditTheme() {
  const { theme, setTheme, name, editedFrom, reset, background, setBackground, list } = useThemeConfigurator();
  const edit = (changes: Partial<Theme>) => setTheme({ ...theme, ...changes });
  const signal = theme.signalLightness ?? defaultSignalLightness;

  const exportTheme = useCallback(() => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    saveAs(blob, `${name ?? "Custom"} Huet Theme.json`);
  }, [theme, name]);

  return (
    <VSpace size={2} className="hc:p-4">
      {list && name !== undefined && (
        <Input
          label="Theme Name"
          // Renames on blur and Enter, so typing doesn't rename on every key
          key={name}
          defaultValue={name}
          onBlur={(event) => list.rename(name, event.currentTarget.value.trim())}
          onKeyDown={(event) => {
            if (event.key === "Enter") list.rename(name, event.currentTarget.value.trim());
          }}
        />
      )}
      <HSpace growEach>
        <JsonUploadButton onUpload={(imported, fileName) => (list ? list.add(fileName, imported) : setTheme(imported))}>
          Import Theme
        </JsonUploadButton>
        <Button onClick={exportTheme}>Export Theme</Button>
      </HSpace>
      {editedFrom !== undefined && (
        <p className="hc:flex hc:gap-[.5em]">
          Edited from {editedFrom}.
          <TextButton verify={`Discard your edits and go back to ${editedFrom}?`} onClick={reset}>
            Reset
          </TextButton>
          {list && <TextButton onClick={list.saveAsNew}>Save as new</TextButton>}
        </p>
      )}
      {setBackground && (
        // A group, not a label: each button is named by its own text
        <div role="group" aria-labelledby="huet-configurator-background">
          <span id="huet-configurator-background" className="hc:block hc:mb-1">
            Background
          </span>
          <BgColors theme={theme} background={background} onChange={setBackground} />
        </div>
      )}
      <Labeled label="Neutral colors">
        <NeutralColors colors={theme.neutral} onChange={(neutral) => edit({ neutral })} />
      </Labeled>
      <Labeled label="Blend the neutral colors in">
        <Select
          value={theme.colorModel ?? "oklab"}
          onChange={(colorModel) => edit({ colorModel: colorModel as ColorModel })}
          options={colorModels}
        />
      </Labeled>
      <Labeled label="Hues">
        <HSpace growEach>
          {hues.map((hue) => (
            <ColorPicker
              key={hue}
              label={hue}
              color={theme.colors?.[hue] ?? defaultColors[hue]}
              onChange={(color) => edit({ colors: { ...theme.colors, [hue]: color } })}
            />
          ))}
        </HSpace>
      </Labeled>
      <Range
        label="Contrast"
        min={0}
        max={2}
        decimals={2}
        value={theme.contrast ?? 1}
        onChange={(contrast) => edit({ contrast })}
      />
      <Labeled label="Color ramps">
        <ColorRamps />
      </Labeled>
      <Range
        label="Signal lightness on light backgrounds"
        min={0}
        max={1}
        decimals={2}
        value={signal.onLight}
        onChange={(onLight) => edit({ signalLightness: { ...signal, onLight } })}
      />
      <Range
        label="Signal lightness on dark backgrounds"
        min={0}
        max={1}
        decimals={2}
        value={signal.onDark}
        onChange={(onDark) => edit({ signalLightness: { ...signal, onDark } })}
      />
      <Recoloring label="Theme images" noun="Image" value={theme.images} onChange={(images) => edit({ images })} />
      <Recoloring label="Theme SVGs" noun="SVG" value={theme.svgs} onChange={(svgs) => edit({ svgs })} />
    </VSpace>
  );
}
