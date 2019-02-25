import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom";

// General setup
import "tachyons/css/tachyons.css";
import "./demo/globals";
import ErrorBoundary from "./private/ErrorBoundary";
import useBrowserState from "./private/useBrowserState";
import { resetClass } from "./private/styles";

// Theme stuff
import { Body, Block, ThemeConfigurator } from "./huet";

// Components
import __ from "./private/atoms";
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
  youtube: {
    name: "YouTube",
    component: lazy(() => import("./demo/pages/YouTube"))
  },
  colorContrast: {
    name: "Color Contrast",
    component: lazy(() => import("./demo/pages/ColorContrast"))
  }
};

function App() {
  const [pageKey, setPageKey] = useBrowserState("basic");

  return (
    <Body setDocumentBodyColors className={resetClass} style={__.flex}>
      <div style={{ ...__.w100, overflow: "hidden" }}>
        <Block
          contrast="bg=10 b=100"
          style={{ ...__.bb, position: "relative", zIndex: 2 }}
        >
          <Select
            label="Example Demos"
            style={__.pa2.pb3}
            value={pageKey}
            onChange={setPageKey}
          >
            {Object.keys(pages).map(pageKey => (
              <option key={pageKey} value={pageKey}>
                {pages[pageKey].name}
              </option>
            ))}
          </Select>
        </Block>
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(pages[pageKey].component)}
          </Suspense>
        </div>
      </div>
      <ThemeConfigurator shouldOverlay={false} />
    </Body>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  rootElement
);
