import { rule } from "./nano";

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
  border: 0,
  padding: "0.3em 0.5em",
  maxWidth: MAX_INPUT_WIDTH
};

export const rangeClass = rule({
  // Reset
  WebkitAppearance:
    "none" /* Hides the slider so that custom slider can be made */,
  width: "100% !important" /* Specific width is required for Firefox. */,
  background: "transparent", // Otherwise white in Chrome
  // Style
  display: "block",

  ":focus": {
    outline: "none !important"
  },
  "::-webkit-slider-thumb": {
    // Reset
    WebkitAppearance: "none !important",
    // Style
    background: "currentColor !important",
    width: "1px !important",
    height: "1em !important"
  }
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
  height: "100%",
  ...resetStyle,
  "*": {
    all: "unset",
    display: "block",
    ...resetStyle["*"]
  }
});
