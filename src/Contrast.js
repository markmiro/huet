import React from "react";
import huet from "./huet";

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
    bgAlpha,
    text,
    textRamp,
    textAlpha,
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
    ...props
  };
  if (debug) {
    debugger;
  }
  const { contrast } = huet.useTheme();
  const ref = React.useRef();

  let finalChildren = children;
  let backgroundColor = null;
  let textColor = null;

  if (bg !== null) {
    backgroundColor = contrast(bg, {
      ramp: bgRamp,
      alpha: bgAlpha
    });
    textColor = backgroundColor.contrast(text, {
      ramp: textRamp,
      alpha: textAlpha
    });
    finalChildren = children ? (
      <huet.ThemeContext.Provider value={backgroundColor.context}>
        {children}
      </huet.ThemeContext.Provider>
    ) : null;
  } else {
    textColor = contrast(text, {
      ramp: textRamp,
      alpha: textAlpha
    });
  }

  const coloredStyle = {
    backgroundColor,
    color: textColor,
    borderColor:
      border !== null
        ? contrast(border, { ramp: borderRamp, alpha: borderAlpha })
        : null,
    outlineColor:
      outline !== null
        ? contrast(outline, {
            ramp: outlineRamp,
            alpha: outlineAlpha
          })
        : null
  };

  return React.createElement(
    as,
    {
      style: {
        ...coloredStyle,
        ...style
      },
      ref,
      ...rest
    },
    finalChildren
  );
};

export default Contrast;
