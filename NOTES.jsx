import React from "react";
import huet from "huet";

function MyComponent() {
  const { contrast } = huet.useTheme();
  return <div style={{ color: contrast(50) }}>Hello</div>;
}

// --

import React from "react";
import { Contrast } from "huet";

function MyComponent() {
  return <Contrast text={50}>Hello</Contrast>;
}

// --

import React, { useContext } from "react";
import { ThemeContext } from "huet";

function MyComponent() {
  const ctx = useContext(ThemeContext);
  return <div style={{ color: ctx.contrast(50) }}>Hello</div>;
}

// --

import React from "react";
import { Block } from "huet";

function MyComponent({ children }) {
  return (
    <Block bg={100}>
      Hello
      {children}
    </Block>
  );
}

// --

import React, { useContext } from "react";
import { ThemeContext } from "huet";

function MyComponent({ children }) {
  const ctx = useContext(ThemeContext);
  const bgCtx = ctx.contrast(100);
  return (
    <div style={{ backgroundColor: bgCtx.hex() }}>
      Hello
      <ThemeContext.Provider value={bgCtx}>{children}</ThemeContext.Provider>
    </div>
  );
}

// --

import React, { useContext } from "react";
import { ThemeContext } from "huet";

function MyComponent({ children }) {
  const ctx = useContext(ThemeContext);
  const bgCtx = ctx.contrast(100);
  const textCtx = bgCtx.contrast(10);
  return (
    <div style={{ backgroundColor: bgCtx.hex() }}>
      Hello
      <ThemeContext.Provider value={bgCtx}>{children}</ThemeContext.Provider>
      <div style={{ color: textCtx.hex() }}>There</div>
    </div>
  );
}

// --

import React, { useContext } from "react";
import { ThemeContext } from "huet";

function MyComponent({ children }) {
  const ctx = useContext(ThemeContext);
  const bgCtx = ctx.contrast(100);
  const textCtx = bgCtx.contrast(10);
  return (
    <div style={{ backgroundColor: bgCtx.hex() }}>
      Hello
      <ThemeContext.Provider value={bgCtx}>{children}</ThemeContext.Provider>
      <div style={{ color: textCtx.hex() }}>There</div>
    </div>
  );
}
