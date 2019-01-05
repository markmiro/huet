import React, { useEffect, lazy, Suspense } from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import "./globals";
import themeConfigs from "./themes";
import { Block, createTheme, Color } from "./huet2";
import useBrowserState from "./useBrowserState";

function App() {
  const theme = createTheme(themeConfigs.basic);
  const parentBg = Color.fromTheme(theme);

  useEffect(
    () => {
      document.body.style.backgroundColor = parentBg;
      document.body.style.color = parentBg.contrast(100);
    },
    [parentBg]
  );
  return (
    <div className="flex">
      This is a&nbsp;
      <Block
        theme={theme}
        className="ba bw2 pa2"
        colors="bg:10 bg/fg:50-red bg/b:50-blue"
      >
        Hello
        <Block colors="fg:20-red">There</Block>
      </Block>
      !
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
