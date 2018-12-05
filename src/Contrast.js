import React from "react";
import huet from "./huet";

/*
Ideas:

className="text-red-100 bg-gray-10 b-blue-5 o-"

<Contrast style={ctx => ({
  borderColor: ctx.contrast(10)
})}>

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
    ...rest
  } = {
    as: "div",
    bg: null,
    ...props
  };
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
    finalChildren = backgroundColor.forwardContext(children);
  } else {
    textColor = context.contrast(text, {
      ramp: textRamp,
      alpha: textAlpha
    });
  }

  let isPickingStyle = null;
  let isPickingProps = null;

  if (
    context.value.isPicking ||
    (context.value.pickedObject &&
      context.value.pickedObject.currentRef === ref.current)
  ) {
    isPickingStyle = {
      outlineColor: (backgroundColor || context).contrast(50, {
        ramp: "blue"
      }),
      outlineWidth: 1,
      outlineStyle: "solid",
      outlineOffset: -5
    };
    isPickingProps = {
      onClick: e => {
        context.value.onPickerPick({
          currentRef: ref.current,
          contextValue: context.value,
          props
        });
        e.stopPropagation();
      }
    };
  }

  const finalStyle = {
    backgroundColor,
    color: textColor,
    borderColor: border
      ? context.contrast(border, { ramp: borderRamp, alpha: borderAlpha })
      : null,
    outlineColor: outline
      ? context.contrast(outline, { ramp: outlineRamp, alpha: outlineAlpha })
      : null,
    ...style,
    ...isPickingStyle
  };

  return React.createElement(
    as,
    {
      style: finalStyle,
      ref,
      ...isPickingProps,
      ...rest
    },
    finalChildren
  );
};

const Contrast2 = props => {
  const {
    as,
    children,
    style,
    ...rest
  } = {
    as: "div",
    ...props
  };

  const {
    bgContrast,
    bgRamp,
    bgAlpha,
    textContrast,
    textRamp,
    textAlpha,
    border,
    borderRamp,
    borderAlpha,
    outline,
    outlineRamp,
    outlineAlpha,
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
    finalChildren = backgroundColor.forwardContext(children);
  } else {
    textColor = context.contrast(text, {
      ramp: textRamp,
      alpha: textAlpha
    });
  }

  let isPickingStyle = null;
  let isPickingProps = null;

  if (
    context.value.isPicking ||
    (context.value.pickedObject &&
      context.value.pickedObject.currentRef === ref.current)
  ) {
    isPickingStyle = {
      outlineColor: (backgroundColor || context).contrast(50, {
        ramp: "blue"
      }),
      outlineWidth: 1,
      outlineStyle: "solid",
      outlineOffset: -5
    };
    isPickingProps = {
      onClick: e => {
        context.value.onPickerPick({
          currentRef: ref.current,
          contextValue: context.value,
          props
        });
        e.stopPropagation();
      }
    };
  }

  const finalStyle = {
    backgroundColor,
    color: textColor,
    borderColor: border
      ? context.contrast(border, { ramp: borderRamp, alpha: borderAlpha })
      : null,
    outlineColor: outline
      ? context.contrast(outline, { ramp: outlineRamp, alpha: outlineAlpha })
      : null,
    ...style,
    ...isPickingStyle
  };

  return React.createElement(
    as,
    {
      style: finalStyle,
      ref,
      ...isPickingProps,
      ...rest
    },
    finalChildren
  );
};

export default Contrast;
