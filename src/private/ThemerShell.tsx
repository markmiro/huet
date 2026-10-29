import React, { useEffect, useState } from "react";

import Block from "../Block";
import type Color from "../Color";
import __ from "./atoms";
import { PANEL_INSET, themerClass } from "./styles";
import usePersistentState, { asBoolean, useIsSaving } from "./persistentState";

function BrowserStateActivity() {
  const isSaving = useIsSaving();
  return (
    <Block
      base="green"
      contrast="bg=25"
      style={{
        ...__.di.br3.ph2,
        fontWeight: "normal",
        transitionProperty: "opacity",
        transitionDuration: "400ms",
        opacity: isSaving ? 0 : 1,
      }}
    >
      Saved
    </Block>
  );
}

function TitleBar({
  isExpanded,
  onClick,
}: {
  isExpanded?: boolean;
  onClick: () => void;
}) {
  return (
    <Block
      as="button"
      onClick={onClick}
      aria-expanded={isExpanded}
      title={isExpanded ? "Collapse" : "Expand"}
      contrast="bg=100"
      style={{
        ...__.w100.db.flex.justify_between,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      <div style={__.pv2.ph2.b}>
        Huet Theme Configurator {isExpanded && <BrowserStateActivity />}
      </div>
      {/* Docked at the bottom: collapse down into the corner, expand up out of it */}
      <Block contrast="bg=25" style={__.flex.justify_center.items_center.ph3.b}>
        {isExpanded ? "↓" : "↑"}
      </Block>
    </Block>
  );
}

// Fits the Edit Theme tab without scrolling on most screens
const PANEL_HEIGHT = "64em";

const shadowBorderStyle = (parentBg: Color) => ({
  boxShadow: `0 5px 30px ${parentBg.contrast(100).alpha(0.125)}`,
  outlineWidth: 1,
  outlineStyle: "solid" as const,
  outlineColor: parentBg.contrast(25),
});

export default function ThemerShell({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = usePersistentState(
    "themer:isExpanded",
    true,
    asBoolean
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isExpanded) {
    return (
      <Block className={themerClass} style={shadowBorderStyle}>
        <TitleBar onClick={() => setIsExpanded((value) => !value)} />
      </Block>
    );
  }

  return (
    <Block
      contrast="bg=0"
      className={themerClass}
      style={(parentBg) => ({
        ...__.flex.flex_column,
        // Fixed so the panel doesn't jump when switching tabs; tab content scrolls
        height: `min(${PANEL_HEIGHT}, 100vh - 2 * ${PANEL_INSET})`,
        ...shadowBorderStyle(parentBg),
        transform: isMounted ? "translateY(0)" : "translateY(2em)",
        opacity: isMounted ? 1 : 0,
      })}
    >
      <TitleBar isExpanded onClick={() => setIsExpanded((value) => !value)} />
      {children}
    </Block>
  );
}
