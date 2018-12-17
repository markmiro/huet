import React, { useContext, useEffect } from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import Themer from "./Themer";
import themes from "./themes";
import huet from "./huet";
import useBrowserState from "./useBrowserState";

import Contrast from "./Contrast";
import Select from "./Select";
import YouTube from "./ExampleYouTube";
import ContrastPattern from "./ExampleContrastPattern";
import ColorContrast from "./ExampleColorContrast";
import Github from "./ExampleGithub";

);

function Basic() {
  const { contrast } = huet.useTheme();
  const ctx = useContext(huet.ThemeContext);
  const red = contrast(10, { ramp: "red" });
  const hundredContrast = contrast(100);
  return (
    <div className="pa4">
      Basic
      <div style={{ color: red }}>Red</div>
      <div style={{ color: hundredContrast }}>100 contrast</div>
      <Contrast text={100}>50 Contrast</Contrast>
      <pre>minColorLightness: {ctx.minColorLightness}</pre>
      <pre>maxColorLightness: {ctx.maxColorLightness}</pre>
      <pre>bgLightness: {ctx.bgLightness}</pre>
    </div>
  );
}

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
          />
        </Contrast>
      </huet.ThemeContext.Provider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
