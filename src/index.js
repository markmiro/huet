import React, { useEffect, lazy, Suspense } from "react";
import ReactDOM from "react-dom";

// General setup
import "tachyons/css/tachyons.css";
import "./demo/globals";
import ErrorBoundary from "./private/ErrorBoundary";
import useBrowserState from "./private/useBrowserState";
import { resetClass } from "./private/styles";

// Theme stuff
import { Color, Theme, Block, Contrast } from "./huet";
import Themer from "./Themer";
import themeConfigs from "./demo/themeConfigs";

// Components
import Select from "./private/Select";

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
  const [themeConfig, setThemeConfig] = useBrowserState(themeConfigs[0]);
  const [pageKey, setPageKey] = useBrowserState("colorContrast");

  const theme = new Theme(themeConfig);
  const parentBg = Color.fromTheme(theme);

  useEffect(() => {
    document.body.style.backgroundColor = parentBg;
    document.body.style.color = parentBg.contrast(100);
  }, [parentBg]);

  return (
    <>
      <Themer themeConfig={themeConfig} onChangeThemeConfig={setThemeConfig} />
      <Block theme={theme} className={resetClass}>
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
        <div>
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
