import { detect } from "detect-browser";
import React from "react";

import Themer from "./Themer";
import ErrorBoundary from "./private/ErrorBoundary";

const browser = detect();
if (browser && !["chrome", "firefox"].includes(browser.name)) {
  alert("Warning: Only Chrome and Firefox are suppported for now.");
}

export default function ThemeConfigurator({ shouldOverlay }) {
  return (
    <ErrorBoundary componentName="Theme Configurator">
      <Themer shouldOverlay={shouldOverlay} />
    </ErrorBoundary>
  );
}
