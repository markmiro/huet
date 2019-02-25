import React, { useEffect } from "react";

import Block from "./Block";
import Color from "./Color";
import Theme from "./Theme";
import baseThemeConfig from "./private/baseThemeConfig";
import useBrowserState from "./private/useBrowserState";

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
