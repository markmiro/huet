import React, { useContext } from "react";

import Color from "./Color";
import { BackgroundContext, ThemeContext } from "./reactContexts";

type ContrastOwnProps = {
  as?: React.ElementType;
  bg?: number | null;
  bgRamp?: string;
  text?: number | null;
  textRamp?: string | null;
  border?: number | null;
  borderRamp?: string;
  outline?: number | null;
  outlineRamp?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  debug?: boolean;
};

export type ContrastProps = ContrastOwnProps &
  Omit<React.AllHTMLAttributes<HTMLElement>, keyof ContrastOwnProps>;

const Contrast = (props: ContrastProps) => {
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
    ...props,
  };

  if (debug) {
    debugger;
  }

  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("Need to set a theme before using a Contrast component");
  }
  const activeTheme = theme;

  const parentBg = useContext(BackgroundContext) || Color.fromTheme(activeTheme);

  function contrast(
    parentColor: Color,
    contrastAmount: number | null | undefined,
    rampKey?: string | null
  ) {
    const ramp = rampKey ? activeTheme.ramps[rampKey] : undefined;
    return parentColor.contrast(contrastAmount ?? undefined, ramp);
  }

  let finalChildren = children;
  let backgroundColor: Color | null = null;
  let textColor: Color | null = null;

  if (bg !== null && bg !== undefined) {
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
      border !== null && border !== undefined
        ? contrast(parentBg, border, borderRamp)
        : null,
    outlineColor:
      outline !== null && outline !== undefined
        ? contrast(parentBg, outline, outlineRamp)
        : null,
  };

  const returnProps = {
    style: {
      ...coloredStyle,
      ...style,
    },
    ...rest,
  };

  return React.createElement(as, returnProps, finalChildren);
};

export default Contrast;
