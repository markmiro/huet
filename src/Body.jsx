import React, { useState, useEffect } from "react";
import Theme from "./Theme";
import Color from "./Color";
import Block from "./Block.jsx";
import useBrowserState from "./private/useBrowserState";
import baseThemeConfig from "./private/baseThemeConfig";

export const ThemeConfiguratorContext = React.createContext();

export default function Body({
  initialThemeConfig = baseThemeConfig,
  setDocumentBodyColors,
  ...rest
}) {
  const [themeConfig, setThemeConfig] = useBrowserState(initialThemeConfig);
  const theme = new Theme(themeConfig);
  const parentBg = Color.fromTheme(theme);

  useEffect(() => {
    if (setDocumentBodyColors) {
      document.body.style.backgroundColor = parentBg;
      document.body.style.color = parentBg.contrast(100);
    }
  }, [parentBg, setDocumentBodyColors]);

  return (
    <ThemeConfiguratorContext.Provider value={[theme, setThemeConfig]}>
      <Block theme={theme} {...rest} />
    </ThemeConfiguratorContext.Provider>
  );
}
