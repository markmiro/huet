import React, { useEffect, lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import { importMDX } from "mdx.macro";

import "./styles.css";
import "./globals";
import Themer from "./Themer";
import themes from "./themes";
import huet from "./huet";
import useBrowserState from "./useBrowserState";

import Contrast from "./Contrast";
import Select from "./Select";

// pages
import YouTube from "./ExampleYouTube";
import ContrastPattern from "./ExampleContrastPattern";
import ColorContrast from "./ExampleColorContrast";
import Github from "./ExampleGithub";
import Basic from "./ExampleBasic";

const Explanation = () => (
  <div>
    <Suspense fallback={<div>Loading...</div>}>
      {React.createElement(lazy(() => importMDX("./ExampleExplanation.mdx")))}
    </Suspense>
  </div>
);

const pages = {
  basic: {
    name: "Basic",
    component: Basic
  },
  github: {
    name: "Github",
    component: Github
  },
  contrastPattern: {
    name: "Contrast Pattern",
    component: ContrastPattern
  },
  colorContrast: {
    name: "Color Contrast",
    component: ColorContrast
  },
  youtube: {
    name: "YouTube",
    component: YouTube
  },
  explanation: {
    name: "Explanation",
    component: Explanation
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
          {React.createElement(pages[pageKey].component)}
        </Contrast>
      </huet.ThemeContext.Provider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
