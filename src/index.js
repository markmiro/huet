import React, { useEffect, lazy, Suspense } from "react";
import ReactDOM from "react-dom";

// General setup
import "./styles.css";
import "./globals";
import useBrowserState from "./useBrowserState";
import ErrorBoundary from "./ErrorBoundary";

// Theme stuff
import themeConfigs from "./themes";
import { Block, createTheme, Color } from "./huet";
import Themer from "./Themer";
import Contrast from "./Contrast";

// Components
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

// ---

function App() {
  const [themeConfig, setThemeConfig] = useBrowserState(themeConfigs.basic);
  const [pageKey, setPageKey] = useBrowserState("colorContrast");

  const theme = createTheme(themeConfig);
  const parentBg = Color.fromTheme(theme);

  useEffect(
    () => {
      document.body.style.backgroundColor = parentBg;
      document.body.style.color = parentBg.contrast(100);
    },
    [parentBg]
  );

  return (
    <ErrorBoundary>
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
      </Block>
    </ErrorBoundary>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
