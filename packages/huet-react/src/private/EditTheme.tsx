import saveAs from "file-saver";
import React, { useCallback } from "react";
import type { Theme, ThemeConfig } from "huet/config";

import { VSpace } from "./AllExceptFirst";
import BgColors from "./BgColors";
import Button from "./Button";
import Checkbox from "./Checkbox";
import ColorRamps from "./ColorRamps";
import Input from "./Input";
import Labeled from "./Labeled";
import Pallet from "./Pallet";
import Range from "./Range";

/** Edits the theme's name, background, contrast, palette and signal lightness. */
export default function EditTheme({
  theme,
  themerTheme,
  onThemeConfigChange,
}: {
  theme: Theme;
  /** The panel's own theme. The color ramps preview it. */
  themerTheme: Theme;
  onThemeConfigChange: (config: ThemeConfig) => void;
}) {
  const themeConfig = theme.config;

  function modify<K extends keyof ThemeConfig>(key: K) {
    return (newValue: ThemeConfig[K]) => {
      onThemeConfigChange({
        ...themeConfig,
        [key]: newValue
      });
    };
  }

  // Consider useReducer?
  const setBgRampValue = modify("bgRampValue");
  const setContrastMultiplier = modify("contrastMultiplier");
  const setPallet = modify("pallet");
  const setStartSignalLightness = modify("startSignalLightness");
  const setEndSignalLightness = modify("endSignalLightness");

  const exportTheme = useCallback(() => {
    // Generating a random id
    const configWithNewId = { ...themeConfig, id: Math.random() };
    const str = JSON.stringify(configWithNewId, null, "  ");
    const blob = new Blob([str], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, `${themeConfig.name} Huet Theme.json`);
  }, [themeConfig]);

  return (
    <>
      <VSpace size={2} className="hc:p-4">
        <div>
          <Input
            label="Theme Name"
            className="hc:flex-auto hc:min-w-0 hc:min-h-0 hc:mb-2"
            value={themeConfig.name}
            onChange={name => onThemeConfigChange({ ...themeConfig, name })}
          />
          <Button onClick={exportTheme}>Export Theme</Button>
        </div>
        <Labeled label="Background Color">
          <BgColors
            theme={theme}
            bgRampValue={themeConfig.bgRampValue}
            onRampValueChange={setBgRampValue}
          />
        </Labeled>
        <Range
          label="Contrast"
          min={0}
          max={1}
          decimals={2}
          value={themeConfig.contrastMultiplier}
          onChange={setContrastMultiplier}
        />
        <Labeled label="Pallet">
          <Pallet colors={themeConfig.pallet} onColorsChange={setPallet} />
        </Labeled>
        <Labeled label="Color ramps">
          <ColorRamps theme={themerTheme} />
        </Labeled>
        <Range
          label="Signal Lightness on 'Black'"
          value={themeConfig.endSignalLightness}
          onChange={setEndSignalLightness}
          min={0}
          max={1}
          decimals={2}
        />
        <Range
          label="Signal Lightness on 'White'"
          value={themeConfig.startSignalLightness}
          onChange={setStartSignalLightness}
          min={0}
          max={1}
          decimals={2}
        />
        <Checkbox
          label="Theme images"
          value={themeConfig.images?.enabled ?? false}
          onChange={enabled => modify("images")({
            tint: 0, strength: 1, ...themeConfig.images, enabled,
          })}
        />
        {themeConfig.images?.enabled && <>
          <Range label="Image tint" value={themeConfig.images.tint * 100}
            onChange={tint => modify("images")({ ...themeConfig.images!, tint: Math.max(0, Math.min(100, tint)) / 100 })} />
          <Range label="Image strength" value={themeConfig.images.strength * 100}
            onChange={strength => modify("images")({ ...themeConfig.images!, strength: Math.max(0, Math.min(100, strength)) / 100 })} />
        </>}
      </VSpace>
    </>
  );
}
