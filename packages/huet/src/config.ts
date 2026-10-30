/*
  The theme config format used by huet-react's ThemeConfigurator and by
  exported theme JSON files: a palette, named ramps, and a background position.
  `themeFromConfig` turns a config into a theme for `mountTheme`.
*/
export { themeFromConfig } from "./core/fromConfig";
export { default as isThemeConfig, parseThemeConfig } from "./private/isThemeConfig";
export { default as baseThemeConfig } from "./private/baseThemeConfig";
export { default as themeConfigs } from "./themeConfigs";
export { default as Theme } from "./Theme";
export { default as Color, BaseColor, getLightness } from "./Color";
export type { ColorOptions } from "./Color";
export { rampModes } from "./colorModel";
export type {
  ColorModel as RampColorModel,
  Lab,
  Ramp,
  RampConfig,
  RampInput,
  RampMode,
  ThemeConfig,
} from "./colorModel";
