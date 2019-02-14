import React from "react";
import { detect } from "detect-browser";
import ErrorBoundary from "./private/ErrorBoundary";
import Themer from "./Themer";

const browser = detect();
if (browser && !["chrome", "firefox"].includes(browser.name)) {
  alert("Warning: Only Chrome and Firefox are suppported for now.");
}

export default function ThemeConfigurator() {
  return (
    <ErrorBoundary componentName="Theme Configurator">
      <Themer />
    </ErrorBoundary>
  );
}
