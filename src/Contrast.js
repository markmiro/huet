import React, { useContext } from "react";
import { ThemeContext, BackgroundContext, Color } from "./huet2";

/*
Ideas:

className="text-red-100 bg-gray-10 b-blue-5 o-"

<Contrast style={({ctx}) => ({
  borderColor: ctx.contrast(10)
})}>
</Contrast>

*/

const Contrast = props => {
  const {
    as,
    bg,
    bgRamp,
    text,
    textRamp,
    border,
    borderRamp,
    borderAlpha,
    outline,
    outlineRamp,
    outlineAlpha,
    children,
    style,
    debug,
    ...rest
  } = {
    as: "div",
    bg: null,
    border: null,
    outline: null,
    borderAlpha: 1,
    outlineAlpha: 1,
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

  function contrast(parentColor, contrastAmount, rampKey = "gray", alpha) {
    const ramp = theme.ramps[rampKey];
    let color;
    if (ramp.config.mode === "direct") {
      color = parentColor.direct(ramp);
    } else {
      return parentColor.contrast(contrastAmount, ramp);
    }
    if (typeof alpha === "number") {
      color = color.alpha(alpha);
    }
    return color;
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
      border !== null
        ? contrast(parentBg, border, borderRamp, borderAlpha)
        : null,
    outlineColor:
      outline !== null
        ? contrast(parentBg, outline, outlineRamp, outlineAlpha)
        : null
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
