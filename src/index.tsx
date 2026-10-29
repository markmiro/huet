import "tachyons/css/tachyons.css";
import "./demo/globals";

import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";

import { Block, Body, ThemeConfigurator } from "./huet";
import ErrorBoundary from "./private/ErrorBoundary";
import Select from "./private/Select";
import __ from "./private/atoms";
import { resetClass } from "./private/styles";
import usePersistentState, { asOneOf } from "./private/persistentState";

const pages = {
  basic: {
    name: "Basic",
    component: lazy(() => import("./demo/pages/Basic")),
  },
  github: {
    name: "Github",
    component: lazy(() => import("./demo/pages/Github")),
  },
  youtube: {
    name: "YouTube",
    component: lazy(() => import("./demo/pages/YouTube")),
  },
  colorContrast: {
    name: "Color Contrast",
    component: lazy(() => import("./demo/pages/ColorContrast")),
  },
};

type PageKey = keyof typeof pages;
const asPageKey = asOneOf(Object.keys(pages) as PageKey[]);

function App() {
  const [pageKey, setPageKey] = usePersistentState<PageKey>(
    "demo:page",
    "basic",
    asPageKey
  );
  const page = pages[pageKey];

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
            onChange={(key) => setPageKey(key as PageKey)}
          >
            {Object.keys(pages).map((key) => (
              <option key={key} value={key}>
                {pages[key as keyof typeof pages].name}
              </option>
            ))}
          </Select>
        </Block>
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(page.component)}
          </Suspense>
        </div>
      </div>
      <ThemeConfigurator shouldOverlay={false} />
    </Body>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Missing #root");
}
createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
