/*
  Not public API: shared with huet-react, and free to change in any release.
  `resolveTheme` gives the solver behind a theme on one background: `root` is
  the background, and `step(surface, amount, ramp)` is the color a class such
  as `huet-bg-blue-25` gets on that surface. The configurator's previews draw
  with it, since previews of themes that aren't mounted can't use classes.
*/
export { resolveTheme, themeVariables } from "./core/theme";
export type { ResolvedTheme } from "./core/theme";
export type { StepRamp, Surface } from "./core/steps";
