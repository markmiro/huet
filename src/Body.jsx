import React, { useEffect } from "react";
import Theme from "./Theme";
import Color from "./Color";
import Text from "./Text.jsx";
import Themer from "./Themer.jsx";
import ErrorBoundary from "./private/ErrorBoundary";
import useBrowserState from "./private/useBrowserState";

export default function Body({
  themeConfig: initialThemeConfig,
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
      <Text theme={theme} {...rest} />
    </>
  );
}
