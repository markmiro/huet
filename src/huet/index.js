import React from "react";

export { default as createTheme } from "./theme";
export { default as Color, getLightness } from "./color";
export { default as Block } from "./Block";
export { default as Contrast } from "./Contrast";

export const ThemeContext = React.createContext();
export const BackgroundContext = React.createContext();
