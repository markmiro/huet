import { detect } from "detect-browser";
import React from "react";

import Themer from "./Themer";
import ErrorBoundary from "./private/ErrorBoundary";

const browser = detect();
if (browser && !["chrome", "firefox"].includes(browser.name)) {
  alert("Warning: Only Chrome and Firefox are suppported for now.");
}

/** A floating panel, fixed to the bottom-right corner of the viewport. */
export default function ThemeConfigurator() {
  return (
    <ErrorBoundary componentName="Theme Configurator">
      <Themer />
    </ErrorBoundary>
  );
}
