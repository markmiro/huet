import React, { useEffect, lazy, Suspense } from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import "./globals";
import Themer from "./Themer";
import themes from "./themes";
import huet from "./huet";
import useBrowserState from "./useBrowserState";

import ErrorBoundary from "./ErrorBoundary";
import Contrast from "./Contrast";
import Select from "./Select";

const pages = {
  basic: {
    name: "Basic",
    component: lazy(() => import("./pages/Basic"))
  },
  github: {
    name: "Github",
    component: lazy(() => import("./pages/Github"))
  },
  contrastPattern: {
    name: "Contrast Pattern",
    component: lazy(() => import("./pages/ContrastPattern"))
  },
  colorContrast: {
    name: "Color Contrast",
    component: lazy(() => import("./pages/ColorContrast"))
  },
  youtube: {
    name: "YouTube",
    component: lazy(() => import("./pages/YouTube"))
  },
  explanation: {
    name: "Explanation",
    component: lazy(() => import("./pages/Explanation"))
  }
};

function App() {
  const [pageKey, setPageKey] = useBrowserState("colorContrast");

  // TODO: make themes not need objects
  const [theme, setTheme] = useBrowserState(themes.basic);

  const ctxWrapper = huet.createTheme(theme);

  useEffect(
    () => {
      document.body.style.backgroundColor = ctxWrapper.contrast(0);
    },
    [theme.pallet, theme.ramps.gray, theme.bgScaleValue]
  );

  return (
    <ErrorBoundary>
      <div>
        <Themer themes={themes} theme={theme} onChangeTheme={setTheme} />
        <huet.ThemeContext.Provider value={ctxWrapper.contextValue}>
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
          <Contrast
            bg={0}
            style={{
              // So page refresh is visible
              animationDuration: "0.5s",
              animationName: "fade-in"
            }}
          >
            <Suspense fallback={<div>Loading...</div>}>
              {React.createElement(pages[pageKey].component)}
            </Suspense>
          </Contrast>
        </huet.ThemeContext.Provider>
      </div>
    </ErrorBoundary>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
