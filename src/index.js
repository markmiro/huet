import React, { useContext, useEffect, lazy, Suspense } from "react";
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

const pages = {
  basic: "./Basic",
  github: "./Github",
  contrastPattern: "./ContrastPattern",
  colorContrast: "./ColorContrast",
  youtube: "./YouTube",
  explanation: "./Explanation"
};

const Explanation = () => (
  <div>
    <Suspense fallback={<div>Loading...</div>}>
      {React.createElement(lazy(() => importMDX("./ExampleExplanation.mdx")))}
    </Suspense>
  </div>
);

function Switch({ on, ...cases }) {
  const Thing = cases[on];
  return <Thing />;
}

function App() {
  const [tab, setTab] = useBrowserState("colorContrast");

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
            value={tab}
            onChange={setTab}
          >
            <option value="github">Github</option>
            <option value="youtube">YouTube</option>
            <option value="contrastPattern">Contrast Pattern</option>
            <option value="colorContrast">Color Contrast</option>
            <option value="basic">Basic</option>
            <option value="explanation">Explanation</option>
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
          <Switch
            on={tab}
            basic={Basic}
            github={Github}
            contrastPattern={ContrastPattern}
            colorContrast={ColorContrast}
            youtube={YouTube}
            explanation={Explanation}
          />
        </Contrast>
      </huet.ThemeContext.Provider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
