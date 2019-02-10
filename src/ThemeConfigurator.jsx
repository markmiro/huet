import React, { useContext } from "react";
import { ThemeConfiguratorContext } from "./Body.jsx";
import ErrorBoundary from "./private/ErrorBoundary";
import Themer from "./Themer.jsx";

export default function ThemeConfigurator() {
  const [themeConfig, setThemeConfig] = useContext(ThemeConfiguratorContext);
  return (
    <ErrorBoundary componentName="Theme Configurator">
      <Themer themeConfig={themeConfig} onChangeThemeConfig={setThemeConfig} />
    </ErrorBoundary>
  );
}
