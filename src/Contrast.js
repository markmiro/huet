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
  const context = huet.useTheme();
  const ref = React.useRef();

  let finalChildren = children;
  let backgroundColor = null;
  let textColor = null;

  if (bg !== null) {
    backgroundColor = context.contrast(bg, {
      ramp: bgRamp,
      alpha: bgAlpha
    });
    textColor = backgroundColor.contrast(text, {
      ramp: textRamp,
      alpha: textAlpha
    });
    if (textColor._contrast === 0) debugger;
    finalChildren = backgroundColor.forwardContext(children);
  } else {
    textColor = context.contrast(text, {
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
        ? context.contrast(border, { ramp: borderRamp, alpha: borderAlpha })
        : null,
    outlineColor:
      outline !== null
        ? context.contrast(outline, { ramp: outlineRamp, alpha: outlineAlpha })
        : null
  };

  if (
    context.value.isPicking ||
    (context.value.pickedObject &&
      context.value.pickedObject.currentRef === ref.current)
  ) {
    isPickingStyle = {
      outlineColor: (backgroundColor || context).contrast(100, {
        ramp: "blue"
      }),
      outlineWidth: 1,
      outlineStyle: "dotted",
      outlineOffset: -1
    };
    isPickingProps = {
      onClick: e => {
        context.value.onPickerPick({
          currentRef: ref.current,
          contextValue: context.value,
          props,
          traceColors: {
            context: context.value.color,
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
