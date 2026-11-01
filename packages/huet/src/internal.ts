/*
  Not public API: shared with huet-react, and free to change in any release.
  `resolveTheme` gives the solver behind a theme on one background: `root` is
  the background, and `step(surface, amount, ramp)` is the color a class such
  as `huet-bg-blue-25` gets on that surface. The configurator's previews draw
  with it, since previews of themes that aren't mounted can't use classes.
  `rampThrough` and `contrast` (the solver's APCA Lc) are for pages that
  place their own colors on a theme, such as the shadcn demo's accent and
  chart palette.
*/
export { resolveTheme, themeVariables } from "./core/theme";
export { rampThrough } from "./core/ramp";
export type { RampThrough } from "./core/ramp";
export { contrast } from "./core/color";
export type { ResolvedTheme } from "./core/theme";
export type { StepRamp, Surface } from "./core/steps";
