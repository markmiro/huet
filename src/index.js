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
import Github from "./ExampleGithub";

function Basic() {
  const { contrast } = huet.useTheme();
  const ctx = useContext(huet.ThemeContext);
  const red = contrast(10, { ramp: "red" });
  const hundredContrast = contrast(100);
  return (
    <div>
      Basic
      <div style={{ color: red }}>Red</div>
      <div style={{ color: hundredContrast }}>100 contrast</div>
      <Contrast text={100}>50 Contrast</Contrast>
      <pre>minColorLightness: {ctx.minColorLightness}</pre>
      <pre>maxColorLightness: {ctx.maxColorLightness}</pre>
      <pre>bgLightness: {ctx.bgLightness}</pre>
      <pre>
        relativeLightness: {huet.relativeLightness(ctx, ctx.ramps.red, 10)}
      </pre>
    </div>
  );
}

function Switch({ on, ...cases }) {
  return cases[on];
}

function App() {
  const [tab, setTab] = useState("youtube");
  return (
    <Themer themes={themes} initialThemeKey="basic">
      <div className="flex-auto">
        <Contrast bg={50} style={{ position: "relative", zIndex: 2 }}>
          <Select
            label="Example Demos"
            className="pa2 pb3"
            value={tab}
            onChange={setTab}
          >
            <option value="basic">Basic</option>
            <option value="github">Github</option>
            <option value="contrastPattern">Contrast Pattern</option>
            <option value="youtube">YouTube</option>
          </Select>
        </Contrast>
        <Switch
          on={tab}
          basic={<Basic />}
          github={<Github />}
          contrastPattern={<ContrastPattern />}
          youtube={<YouTube />}
        />
      </div>
    </Themer>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
