import React, { useState, useEffect } from "react";
import Block from "../Block";
import useBrowserState, { useIsBrowserStateSaving } from "./useBrowserState";
import __ from "./atoms";
import { themerClass } from "./styles";

function BrowserStateActivity() {
  const count = useIsBrowserStateSaving();
  return (
    <Block
      base="green"
      contrast="bg=25"
      style={{
        ...__.di.br3.ph2,
        fontWeight: "normal",
        transitionProperty: "opacity",
        transitionDuration: "400ms",
        opacity: count ? 0 : 1
      }}
    >
      Saved
    </Block>
  );
}

function TitleBar({ isExpanded, onClick }) {
  return (
    <Block
      as="button"
      onClick={onClick}
      contrast="bg=100"
      style={{
        ...__.w100.db.flex.justify_between,
        flexShrink: 0,
        userSelect: "none"
      }}
    >
      <div style={__.pv2.ph2.b}>
        Huet Theme Configurator {isExpanded && <BrowserStateActivity />}
      </div>
      <Block contrast="bg=25" style={__.flex.justify_center.items_center.ph3.b}>
        {isExpanded ? "↓" : "↑"}
      </Block>
    </Block>
  );
}

const shadowBorderStyle = parentBg => ({
  boxShadow: `0 5px 30px ${parentBg.contrast(100).alpha(0.125)}`,
  outlineWidth: 1,
  outlineStyle: "solid",
  outlineColor: parentBg.contrast(25)
});

export default function ThemerShell({ children }) {
  const [isExpanded, setIsExpanded] = useBrowserState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isExpanded) {
    return (
      <Block className={themerClass} style={shadowBorderStyle}>
        <TitleBar onClick={() => setIsExpanded(v => !v)} />
      </Block>
    );
  }

  return (
    <Block
      className={themerClass}
      style={parentBg => ({
        ...__.flex.flex_column,
        top: 0,
        right: null,
        position: "sticky",
        width: "30em",
        height: "100vh",
        maxHeight: "100%",
        ...shadowBorderStyle(parentBg),
        transform: isMounted ? "translateY(0)" : "translateY(2em)",
        opacity: isMounted ? 1 : 0
      })}
    >
      <TitleBar isExpanded onClick={() => setIsExpanded(v => !v)} />
      <div
        style={{
          overflowY: "scroll",
          overflowX: "hidden"
        }}
      >
        {children}
      </div>
    </Block>
  );
}
