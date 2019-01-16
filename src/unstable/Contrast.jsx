import React, { useContext } from "react";
import { ThemeContext, BackgroundContext } from "./private/reactContexts";
import Color from "../Color";

const Contrast = props => {
  const {
    as,
    bg,
    bgRamp,
    text,
    textRamp,
    border,
    borderRamp,
    outline,
    outlineRamp,
    children,
    style,
    debug,
    ...rest
  } = {
    as: "div",
    bg: null,
    border: null,
    outline: null,
    ...props
  };

  if (debug) {
    debugger;
  }

  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("Need to set a theme before using a Contrast component");
  }

  const parentBg = useContext(BackgroundContext) || Color.fromTheme(theme);

  function contrast(parentColor, contrastAmount, rampKey) {
    const ramp = rampKey ? theme.ramps[rampKey] : theme.ramps.gray;
    if (ramp.config.mode === "direct") {
      return parentColor.direct(ramp);
    } else {
      return parentColor.contrast(contrastAmount, ramp);
    }
  }

  // ---

  let finalChildren = children;
  let backgroundColor = null;
  let textColor = null;

  if (bg !== null) {
    backgroundColor = contrast(parentBg, bg, bgRamp);
    textColor = contrast(backgroundColor, text, textRamp);
    finalChildren = children ? (
      <BackgroundContext.Provider value={backgroundColor}>
        {children}
      </BackgroundContext.Provider>
    ) : null;
  } else {
    textColor = contrast(parentBg, text, textRamp);
  }

  const coloredStyle = {
    backgroundColor,
    color: textColor,
    borderColor:
      border !== null ? contrast(parentBg, border, borderRamp) : null,
    outlineColor:
      outline !== null ? contrast(parentBg, outline, outlineRamp) : null
  };

  const returnProps = {
    style: {
      ...coloredStyle,
      ...style
    },
    ...rest
  };

  return React.createElement(as, returnProps, finalChildren);
};

export default Contrast;
