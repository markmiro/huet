import React, { useContext } from "react";

import type Color from "./Color";
import type Theme from "./Theme";

export const ThemeContext = React.createContext<Theme | null>(null);
export const BackgroundContext = React.createContext<Color | null>(null);

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("Need to set a theme before using Huet");
  }
  return theme;
}

export function useBackground() {
  const background = useContext(BackgroundContext);
  if (!background) {
    throw new Error("Need a background color before using Huet");
  }
  return background;
}
