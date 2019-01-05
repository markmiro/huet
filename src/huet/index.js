import React from "react";

// TODO: see if we really need to export this
export { default as Color, getLightness } from "./color";
export { createTheme } from "./theme";
export { default as Block } from "./Block";

// Often just set at parent level
export const ThemeContext = React.createContext();
export const BackgroundContext = React.createContext();
