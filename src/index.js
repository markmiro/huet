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
import Select from "./private/Select";

const pages = {
  minimal: {
    name: "Minimal",
    component: () => <Block contrast="bg=100">Hello</Block>
  },
  basic: {
    name: "Basic",
    component: lazy(() => import("./demo/pages/Basic"))
  },
  github: {
    name: "Github",
    component: lazy(() => import("./demo/pages/Github"))
  },
  colorContrast: {
    name: "Color Contrast",
    component: lazy(() => import("./demo/pages/ColorContrast"))
  },
  youtube: {
    name: "YouTube",
    component: lazy(() => import("./demo/pages/YouTube"))
  },
  explanation: {
    name: "Explanation",
    component: lazy(() => import("./demo/pages/Explanation"))
  }
};

function App() {
  const [pageKey, setPageKey] = useBrowserState("basic");

  return (
    <Body setDocumentBodyColors className={`${resetClass} flex`}>
      <div className="w-100" style={{ overflow: "hidden" }}>
        <Block
          contrast="bg=10 b=100"
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
        </Block>
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(pages[pageKey].component)}
          </Suspense>
        </div>
      </div>
      <ThemeConfigurator />
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
