import React, { useEffect, lazy, Suspense } from "react";
import ReactDOM from "react-dom";

// General setup
import "./styles.css";
import "./globals";
import useBrowserState from "./useBrowserState";
import ErrorBoundary from "./ErrorBoundary";

// Theme stuff
import themeConfigs from "./themes";
import { Block, createTheme, Color } from "./huet2";
import Themer from "./Themer";

// Components
import Select from "./Select";
import Icon from "./Icon";
import Button from "./Button";
import Checkbox from "./Checkbox";
import ColorRamp from "./ColorRamp";
import Pallet from "./Pallet";
import Range from "./Range";
import YouTubeLogo from "./YouTubeLogo";

// ---

function App() {
  const [themeConfig, setThemeConfig] = useBrowserState(themeConfigs.basic);

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
      This is a&nbsp;
      <Block
        theme={theme}
        className="ba bw2 pa2"
        colors="bg:10 bg/fg:50-red bg/b:50-blue"
      >
        Hello
        <Block colors="fg:20-red">There</Block>
        <Icon name="chat" />
        <Select label="Test" value="one">
          <option value="one">One</option>
          <option value="two">Two</option>
        </Select>
        <Button>Hello</Button>
        <Checkbox label="Something" />
        <Pallet colors={themeConfigs.basic.pallet} />
        <Range label="Test" min={0} max={100} value={10} />
        <YouTubeLogo />
        <ColorRamp ramp={theme.ramps.gray} theme={theme} />
        <ColorRamp ramp={theme.ramps.red} theme={theme} />
      </Block>
    </ErrorBoundary>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
