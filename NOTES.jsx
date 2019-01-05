/*
theme
  pallet
  ramps
    ramp
      colors
      mode
        direct || colored
      isNeutral
      classes
      colorModel
      correctLightness
      _startL // added
      _endL // added
  bgRamp
  bgRampValue
  minColorLightness
  maxColorLightness
  contrastMultiplier
  saturationContrastMultiplier
  rescaleContrastToGrayRange

Color
  contrast
    contrastValue
    ramp
    alpha
    bgColor
  fromContext

huet
  createTheme
  ThemeContext
  BackgroundContext
  getLightness
    Note: Consider removing?
  Block
      as
      theme
      colors
        bg/fg:10-red
        [<parent>/]fg|bg|b|o:<contrast>[-<ramp>]
      style
      debug

    Note:
      - Body sets background color of body tag too (maybe rename to root?)
      - Block defaults to setting bg to 100% contrast
      - Text doesn't allow bg (sometimes you'll want to hightlight text, so just use Block)
        Defaults to text being 100% contrast

---

Basic setup

import huet, { Block, Text } from 'huet';
import theme from './theme.js';
const themeContext = huet.createThemeContext(theme);

// also need to set bg of window

<ThemeContext value={themeContext}>
  <Body>
    <Text style={parent => ({ color: parent.contrast(50) })}>
      Hello
    </Text>
    <Block>
      There
    </Block>
  </Body>
</ThemeContext>

const parentBg = useContext(BackgroundContext);
return (
  <Block style={{ backgroundColor: parentBg.contrast(50) }}>
    <Text style={parent => ({ color: parent.contrast(50) })}>
      Hello
    </Text>
    <Block>
      There
    </Block>
  </Block>
);

*/

// import React from "react";
// import huet from "huet";

// function MyComponent() {
//   const { contrast } = huet.useTheme();
//   return <div style={{ color: contrast(50) }}>Hello</div>;
// }

// --

// import React from "react";
// import { Contrast } from "huet";

// function MyComponent() {
//   return <Contrast text={50}>Hello</Contrast>;
// }

// --

// import React, { useContext } from "react";
// import { ThemeContext } from "huet";

// function MyComponent() {
//   const ctx = useContext(ThemeContext);
//   return <div style={{ color: ctx.contrast(50) }}>Hello</div>;
// }

// --

// import React from "react";
// import { Block } from "huet";

// function MyComponent({ children }) {
//   return (
//     <Block bg={100}>
//       Hello
//       {children}
//     </Block>
//   );
// }

// --

// import React, { useContext } from "react";
// import { ThemeContext } from "huet";

// function MyComponent({ children }) {
//   const ctx = useContext(ThemeContext);
//   const bgCtx = ctx.contrast(100);
//   return (
//     <div style={{ backgroundColor: bgCtx.hex() }}>
//       Hello
//       <ThemeContext.Provider value={bgCtx}>{children}</ThemeContext.Provider>
//     </div>
//   );
// }

// --

// import React, { useContext } from "react";
// import { ThemeContext } from "huet";

// function MyComponent({ children }) {
//   const ctx = useContext(ThemeContext);
//   const bgCtx = ctx.contrast(100);
//   const textCtx = bgCtx.contrast(10);
//   return (
//     <div style={{ backgroundColor: bgCtx.hex() }}>
//       Hello
//       <ThemeContext.Provider value={bgCtx}>{children}</ThemeContext.Provider>
//       <div style={{ color: textCtx.hex() }}>There</div>
//     </div>
//   );
// }

// --

import React, { useContext } from "react";
import { BackgroundContext } from "huet";

function MyComponent({ children }) {
  const parentBg = useContext(BackgroundContext);
  const bg = parentBg.contrast(100);
  const fg = bg.contrast(10);
  return (
    <div style={{ backgroundColor: bg.hex, color: fg.hex }}>
      Hello:
      <BackgroundContext.Provider value={bg}>
        {children}
      </BackgroundContext.Provider>
    </div>
  );
}

// --

import React from "react";
import { Block } from "huet";

function MyComponent({ children }) {
  return (
    <Block
      style={parentBg => {
        const bg = parentBg.contrast(100);
        const fg = bg.contrast(10);
        return { backgroundColor: bg, color: fg };
      }}
    >
      Hello:
      {children}
    </Block>
  );
}

/* <div
  style={parentBg
    .style({
      backgroundColor: parent => parent.contrast(10)
    })
    .style({
      color: parent => parent.contrast(100)
    })}
>
  Thing
</div>; */

// --

// import React, { useContext } from "react";
// import { Block } from "huet";

// function MyComponent({ children }) {
//   const parentBg = useContext(BackgroundContext);
//   return (
//     <Block
//       style={parentBg.contrastStyle([
//         { backgroundColor: { contrast: 10, ramp: "red", alpha: 0.5 } },
//         { color: { contrast: 10 } }
//       ])}
//     >
//       Hello:
//       {children}
//     </Block>
//   );
// }

// parentBg.contrastStyle([
//   { backgroundColor: { contrast: 10, ramp: "red", alpha: 0.5 } },
//   { color: { contrast: 10 } }
// ]);

// --

import React from "react";
import { BackgroundContext } from "huet";

function MyComponent({ children }) {
  return (
    <BackgroundContext.Consumer>
      {parentBg => {
        const bg = parentBg.contrast(100);
        const fg = bg.contrast(10);
        return (
          <div style={{ backgroundColor: bg.hex, color: fg.hex }}>
            Hello:
            <BackgroundContext.Provider value={bg}>
              {children}
            </BackgroundContext.Provider>
          </div>
        );
      }}
    </BackgroundContext.Consumer>
  );
}
