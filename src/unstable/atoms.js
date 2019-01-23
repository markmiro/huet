import { make, makeSides, chainable } from "./atom-helpers";
// Adapted from: https://tachyons.io/docs/table-of-styles/

// EX: `mt2` will use spaceScale[2]
const fontScale = [
  0,
  "3rem",
  "2.25rem",
  "1.5rem",
  "1.25rem",
  "1rem",
  ".875rem",
  ".75rem"
];
const spaceScale = [0, ".25rem", ".5rem", "1rem"];
const sizeScale = [0, "1rem", "2rem", "4rem"];

const atoms = {
  // Borders
  bt: {
    borderTopStyle: "solid",
    borderTopWidth: "1px"
  },
  br: {
    borderRightStyle: "solid",
    borderRightWidth: "1px"
  },
  bb: {
    borderBottomStyle: "solid",
    borderBottomWidth: "1px"
  },
  ba: {
    borderStyle: "solid",
    borderWidth: "1px"
  },

  // Display
  di: { display: "inline" },
  db: { display: "block" },
  dib: { display: "inline-block" },

  // Opacity
  o0: { opacity: 0 },

  // Size
  ...make("w", "width", sizeScale),
  ...make("h", "height", sizeScale),
  w100: { width: "100%" },
  h100: { height: "100%" },

  // Position
  relative: { position: "relative" },
  absolute: { position: "absolute" },
  top0: { top: 0 },
  left0: { left: 0 },

  // Spacing
  ...makeSides("m", "margin", spaceScale),
  ...makeSides("p", "padding", spaceScale),

  // Font
  ...make("f", "fontSize", fontScale),
  b: { fontWeight: "bold" },

  // Flex
  flex: { display: "flex" },
  inline_flex: { display: "inline-flex" },
  flex_row: { flexDirection: "row" },
  flex_column: { flexDirection: "column" },
  flex_wrap: { flexWrap: "wrap" },
  flex_auto: {
    // flex: "1 1 auto", doesn't work because we already have a 'flex` prop defined
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    minHeight: 0
  },
  items_center: {
    alignItems: "center"
  },
  items_end: {
    alignItems: "flex-end"
  },
  justify_center: {
    justifyContent: "center"
  },
  justify_end: {
    justifyContent: "flex-end"
  },
  justify_between: {
    justifyContent: "space-between"
  },
  self_stretch: {
    alignSelf: "stretch"
  }
};

export default chainable(atoms);
