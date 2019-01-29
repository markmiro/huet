import React, { useEffect } from "react";
import Theme from "./Theme";
import Color from "./Color";
import Block from "./Block.jsx";
import Themer from "./Themer.jsx";
import ErrorBoundary from "./private/ErrorBoundary";
import useBrowserState from "./private/useBrowserState";
import baseThemeConfig from "./private/baseThemeConfig";

export default function Body({
  initialThemeConfig = baseThemeConfig,
  showThemeConfigEditor,
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
    <>
      {showThemeConfigEditor && (
        <ErrorBoundary>
          <Themer
            themeConfig={themeConfig}
            onChangeThemeConfig={setThemeConfig}
          />
        </ErrorBoundary>
      )}
      <Block theme={theme} {...rest} />
    </>
  );
}
