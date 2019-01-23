import React, { useEffect, lazy, Suspense } from "react";
import ReactDOM from "react-dom";

// General setup
import "tachyons/css/tachyons.css";
import "./demo/styles.css";
import "./demo/globals";
import ErrorBoundary from "./unstable/private/ErrorBoundary";
import useBrowserState from "./unstable/private/useBrowserState";

// Theme stuff
import themeConfigs from "./demo/themes.js";
import { Color, Theme, Block, Contrast, Themer } from "./huet";

// Components
import Select from "./unstable/private/Select";

const pages = {
  basic: {
    name: "Basic",
    component: lazy(() => import("./demo/pages/Basic"))
  },
  github: {
    name: "Github",
    component: lazy(() => import("./demo/pages/Github"))
  },
  colorContrast: {
    name: "Color Contrast",
    component: lazy(() => import("./demo/pages/ColorContrast"))
  },
  youtube: {
    name: "YouTube",
    component: lazy(() => import("./demo/pages/YouTube"))
  },
  explanation: {
    name: "Explanation",
    component: lazy(() => import("./demo/pages/Explanation"))
  }
};

function App() {
  const [themeConfig, setThemeConfig] = useBrowserState(themeConfigs.basic);
  const [pageKey, setPageKey] = useBrowserState("colorContrast");

  const theme = new Theme(themeConfig);
  const parentBg = Color.fromTheme(theme);

  useEffect(() => {
    document.body.style.backgroundColor = parentBg;
    document.body.style.color = parentBg.contrast(100);
  }, [parentBg]);

  return (
    <>
      <Themer
        themeConfigs={themeConfigs}
        themeConfig={themeConfig}
        onChangeThemeConfig={setThemeConfig}
      />
      <Block theme={theme}>
        <Contrast
          bg={10}
          border={100}
          className="bb"
          style={{ position: "relative", zIndex: 2 }}
        >
          <Select
            label="Example Demos"
            className="pa2 pb3"
            value={pageKey}
            onChange={setPageKey}
          >
            {Object.keys(pages).map(pageKey => (
              <option key={pageKey} value={pageKey}>
                {pages[pageKey].name}
              </option>
            ))}
          </Select>
        </Contrast>
        <div
          style={{
            // So page refresh is visible
            animationDuration: "0.5s",
            animationName: "fade-in"
          }}
        >
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(pages[pageKey].component)}
          </Suspense>
        </div>
      </Block>
    </>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  rootElement
);
