import React, { useContext, useEffect } from "react";

import Block from "./Block";
import type { ThemeConfig } from "./colorModel";
import Color from "./Color";
import Theme from "./Theme";
import baseThemeConfig from "./private/baseThemeConfig";
import useBrowserState from "./private/useBrowserState";

export const ThemeConfiguratorContext = React.createContext<
  | [
      Theme,
      React.Dispatch<React.SetStateAction<ThemeConfig>>,
    ]
  | null
>(null);

export function useThemeConfigurator() {
  const value = useContext(ThemeConfiguratorContext);
  if (!value) {
    throw new Error("Theme configurator is only available inside Body");
  }
  return value;
}

type BodyProps = {
  initialThemeConfig?: ThemeConfig;
  setDocumentBodyColors?: boolean;
} & Omit<React.ComponentProps<typeof Block>, "theme">;

export default function Body({
  initialThemeConfig = baseThemeConfig,
  setDocumentBodyColors,
  ...rest
}: BodyProps) {
  const [themeConfig, setThemeConfig] = useBrowserState(initialThemeConfig);
  const theme = new Theme(themeConfig);
  const parentBg = Color.fromTheme(theme);

  useEffect(() => {
    if (setDocumentBodyColors) {
      document.body.style.backgroundColor = parentBg.toString();
      document.body.style.color = parentBg.contrast(100).toString();
    }
  }, [parentBg, setDocumentBodyColors]);

  return (
    <ThemeConfiguratorContext.Provider value={[theme, setThemeConfig]}>
      <Block theme={theme} {...rest} />
    </ThemeConfiguratorContext.Provider>
  );
}
