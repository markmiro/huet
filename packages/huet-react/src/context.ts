import React, { useContext } from "react";
import type { Theme, ThemeConfig } from "huet/config";

/** The theme the configurator's panels edit, and its setter. */
export const ThemeConfiguratorContext = React.createContext<
  [Theme, React.Dispatch<React.SetStateAction<ThemeConfig>>] | null
>(null);

export function useThemeConfigurator() {
  const value = useContext(ThemeConfiguratorContext);
  if (!value) throw new Error("Only available inside ThemeConfigurator");
  return value;
}
