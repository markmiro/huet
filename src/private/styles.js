import { rule } from "./nano";
import __ from "./atoms";

// Don't want inputs streching to unreasonable sizes
const MAX_INPUT_WIDTH = "30em";
export const fontStackStyle = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
};

export const maxInputWidthStyle = {
  maxWidth: MAX_INPUT_WIDTH
};

export const inputStyle = {
  WebkitAppearance: "none",
  fontSize: "inherit",
  fontFamily: "inherit",
  padding: "0.3em 0.5em",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "transparent",
  maxWidth: MAX_INPUT_WIDTH,
  cursor: "default"
};

export const rangeClass = rule({
  // Reset
  WebkitAppearance:
    "none" /* Hides the slider so that custom slider can be made */,
  width: "100% !important" /* Specific width is required for Firefox. */,
  background: "transparent", // Otherwise white in Chrome
  // Style
  display: "block",

  "::-webkit-slider-thumb": {
    // Reset
    WebkitAppearance: "none !important",
    // Style
    background: "currentColor !important",
    width: "1px !important",
    height: "1em !important"
  }
});

const focusStyle = {
  outline: "1px solid #00000033",
  outlineOffset: -1,
  border: "1px solid #ffffff66 !important",
  boxShadow: "0px 1px 10px #00000066 !important",
  zIndex: 1
};

export const focusWithinClass = rule({
  ":focus-within": focusStyle
});

export const colorClass = rule({
  "::-webkit-color-swatch-wrapper": {
    WebkitAppearance: "none !important",
    padding: 0
  },
  "::-webkit-color-swatch": {
    border: "none",
    padding: 0
  }
});

export const resetStyle = {
  ...fontStackStyle,
  "*": {
    boxSizing: "border-box"
  }
};

export const resetClass = rule(resetStyle);

export const themerClass = rule({
  all: "initial",
  ...resetStyle,
  ...__.f7,
  right: 0,
  bottom: 0,
  position: "fixed",
  zIndex: 999,
  transitionProperty: "opacity, transform, height",
  transitionDuration: "200ms",
  transitionTimingFunction: "ease-out",

  "*": {
    all: "unset",
    display: "block",
    ...resetStyle["*"]
  },
  "*:focus": focusStyle
});

export const invisibleScreenClass = rule({
  ...__.absolute.w100.h100.left0.top0.opacity0
});
