import React, { useState, useContext } from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import Themer from "./Themer";
import themes from "./themes";
import huet from "./huet";

import Contrast from "./Contrast";
import Select from "./Select";
import YouTube from "./ExampleYouTube";
import ContrastPattern from "./ExampleContrastPattern";
import ColorContrast from "./ExampleColorContrast";
import Github from "./ExampleGithub";

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
  const [tab, setTab] = useState("colorContrast");
  return (
    <Themer themes={themes} initialThemeKey="basic">
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
      <Switch
        on={tab}
        basic={Basic}
        github={Github}
        contrastPattern={ContrastPattern}
        colorContrast={ColorContrast}
        youtube={YouTube}
      />
    </Themer>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
