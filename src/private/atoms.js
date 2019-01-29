import { make, makeSides, chainable } from "./atomHelpers";
/*
  Adapted from: https://tachyons.io/docs/table-of-styles/
  Adding styles as they're used to limit bloat.

  Why this exists?
  ---
  I wanted to use Tachyon's atomic styles in this components because it's easier to
  quickly style individual elements with it and prototype. However, it's so nice to use
  atomic styles that when it came to bundling, the <Themer /> so it can be embedded in
  other projects, I decided to opt for keeping atomic styles rather than rewriting them
  into something else and figuring out how to name all the class names and so on.

  I would prefer to keep atomic styles in classes, but:
  - I don't want to pollute the global namespance of anyone who uses the <Themer /> component
  - I couldn't find any packages that might convert or namespace the CSS (to minimize collisions)
  - Doing the conversion myself via Babel would have been tricky
  - It seems easier to generate classes if the styles are already in JS. Then again, the current approach
    of adding atoms to the style prop may not be the best idea. Maybe add them to a custom prop
    like `atomStyle` or `atoms` and then transpile it into namespaced classes.

  Why not use nano-css?
  - It didnt' include all the Tachyon styles I wanted, and included ones that I didn't want
  - Fun to rebuild the `snake` addon functionality to understand how it works
  - Keep tabs of which atoms I tend to use in one place
  - I may end up switching to nano-css anyways

  Why underscores?
  ---
  It's easier to read, though not idiomatic JS.

  Limitations
  ---
  Putting styles on the style prop in React makes them difficult to override. However, for components
  meant to be embedded in other apps, it also prevents others from easily overriding styles.

  Future explorations
  ---
  It will be interesting to explore treating the style prop as the real primitive that we want to target
  and then think of conversion to classes as an optimization. Even so, we still want to style
  hover effects, pseudo form elements, etc.

  Ideas:
  - Add Huet color support
  - Add some layout styles
  - Put styles on custom React prop `atoms` and then extract CSS at build time
    (Huet colors may not be extractable)
*/

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
  bn: {
    borderStyle: "none",
    borderWidth: 0
  },

  br0: { borderRadius: 0 },
  br1: { borderRadius: ".125rem" },
  br2: { borderRadius: ".25rem" },
  br3: { borderRadius: ".5rem" },
  br4: { borderRadius: "1rem" },

  // Display
  di: { display: "inline" },
  db: { display: "block" },
  dib: { display: "inline-block" },

  // Opacity
  o0: { opacity: 0 },
  opacity0: { opacity: 0 },

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
  i: { fontStyle: "italic" },

  // Text align
  tc: { textAlign: "center" },

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
