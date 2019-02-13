import React from "react";
import ErrorBoundary from "./private/ErrorBoundary";
import Themer from "./Themer.jsx";
import { ThemeContext, BackgroundContext } from "./reactContexts.js";

export default function ThemeConfigurator() {
  return (
    <ErrorBoundary componentName="Theme Configurator">
      {/* Reset context to prevent wasted renders */}
      <ThemeContext.Provider value={null}>
        <BackgroundContext.Provider value={null}>
          <Themer />
        </BackgroundContext.Provider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}
