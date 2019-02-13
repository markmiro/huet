import React, { useContext } from "react";
import { ThemeConfiguratorContext } from "./Body.jsx";
import ErrorBoundary from "./private/ErrorBoundary";
import Themer from "./Themer.jsx";
import { ThemeContext, BackgroundContext } from "./reactContexts.js";

export default function ThemeConfigurator() {
  const [theme, setThemeConfig] = useContext(ThemeConfiguratorContext);
  return (
    <ErrorBoundary componentName="Theme Configurator">
      {/* Reset context to prevent wasted renders */}
      <ThemeContext.Provider value={null}>
        <BackgroundContext.Provider value={null}>
          <Themer theme={theme} onChangeThemeConfig={setThemeConfig} />
        </BackgroundContext.Provider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}
