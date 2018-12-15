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
  const ctxWrapper = huet.useTheme();
  const ctx = ctxWrapper.contextValue;
  const ref = React.useRef();

  let finalChildren = children;
  let backgroundColor = null;
  let textColor = null;

  if (bg !== null) {
    backgroundColor = ctxWrapper.contrast(bg, {
      ramp: bgRamp,
      alpha: bgAlpha
    });
    textColor = backgroundColor.contrast(text, {
      ramp: textRamp,
      alpha: textAlpha
    });
    finalChildren = backgroundColor.forwardContext(children);
  } else {
    textColor = ctxWrapper.contrast(text, {
      ramp: textRamp,
      alpha: textAlpha
    });
  }

  let isPickingStyle = null;
  let isPickingProps = null;

  const coloredStyle = {
    backgroundColor,
    color: textColor,
    borderColor:
      border !== null
        ? ctxWrapper.contrast(border, { ramp: borderRamp, alpha: borderAlpha })
        : null,
    outlineColor:
      outline !== null
        ? ctxWrapper.contrast(outline, {
            ramp: outlineRamp,
            alpha: outlineAlpha
          })
        : null
  };

  if (
    ctx.isPicking ||
    (ctx.pickedObject && ctx.pickedObject.currentRef === ref.current)
  ) {
    isPickingStyle = {
      outlineColor: (backgroundColor || ctxWrapper).contrast(100, {
        ramp: "blue"
      }),
      outlineWidth: 1,
      outlineStyle: "dotted",
      outlineOffset: -1
    };
    isPickingProps = {
      onClick: e => {
        ctx.onPickerPick({
          currentRef: ref.current,
          contextValue: ctx,
          props,
          traceColors: {
            context: ctx.color,
            bg: coloredStyle.backgroundColor,
            text: coloredStyle.color
          }
        });
        e.stopPropagation();
      }
    };
  }

  return React.createElement(
    as,
    {
      style: {
        ...style,
        ...coloredStyle,
        ...isPickingStyle
      },
      ref,
      ...isPickingProps,
      ...rest
    },
    finalChildren
  );
};

export default Contrast;
