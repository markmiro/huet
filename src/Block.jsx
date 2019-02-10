import React, { useContext } from "react";
import _ from "lodash";
import Color from "./Color";
import { ThemeContext, BackgroundContext } from "./reactContexts";

/*
  By default we want to have 100% contrast text.
  If we have a bg, we want the text color to be based on it.
  Otherwise, text color should be based on the parent bg.

  However, we don't need to create a style for text if the bg
  hasn't changed  through multiple iterations of bg.Then again,
  maybe the user should use a <div> in those cases (where neither bg or fg needs to be changed).

  Finally, if the user changes the base, we'll want to recalculate the fg color anyways (even
  if the bg color is the same).

  So, in conclusion:
  - Set `contrast` to "fg=100" by default
  - If user sets bg in `contrast`, then calculate contrast based on that by default.
    In other words, "bg=100" means the same as "bg=100 fg/bg=100"
*/

export default function Block({
  as = "div",
  theme,
  debug,
  style,
  contrast = "fg=100",
  base,
  children,
  ...rest
}) {
  if (debug) {
    debugger;
  }

  const parentTheme = useContext(ThemeContext);
  const parentBg = useContext(BackgroundContext);

  let finalTheme;
  let relativeToColor;

  if (theme) {
    finalTheme = theme;
    relativeToColor = Color.fromTheme(theme);
  } else {
    finalTheme = parentTheme;
    relativeToColor = parentBg;
  }

  if (!finalTheme) {
    throw new Error("Need to set a theme before using a Block");
  }

  if (base) {
    relativeToColor = relativeToColor.base(finalTheme.ramps[base]);
  }

  let returnStyle;
  if (_.isFunction(style)) {
    returnStyle = style(relativeToColor);
  } else if (_.isObject(style)) {
    returnStyle = style;
  } else if (!style) {
    returnStyle = null;
  } else {
    throw new Error("Unsupported style prop value");
  }

  if (contrast) {
    // TODO: consider making "contrast" prop values depend on the value of stuff set in style?
    returnStyle = {
      ...returnStyle,
      ...parseColorsToStyle(relativeToColor, contrast, base)
    };
  }

  const props = {
    style: returnStyle,
    ...rest
  };

  // Wrap children with context

  let returnChildren = children;
  if (theme) {
    returnChildren = children ? (
      <ThemeContext.Provider value={finalTheme}>
        {children}
      </ThemeContext.Provider>
    ) : null;
  }
  if (returnStyle && returnStyle.backgroundColor) {
    if (!returnStyle.backgroundColor instanceof Color) {
      throw new Error("Use a Huet Color instance here.");
    }
    returnChildren = children ? (
      <BackgroundContext.Provider value={returnStyle.backgroundColor}>
        {returnChildren}
      </BackgroundContext.Provider>
    ) : null;
  } else if (theme) {
    if (!children) {
      throw new Error(
        "Add children to the <Block> in order to see something on screen."
      );
    }
    returnChildren = (
      <BackgroundContext.Provider value={relativeToColor}>
        {returnChildren}
      </BackgroundContext.Provider>
    );
  }

  // Return element with props and children from above

  return React.createElement(as, props, returnChildren);
}

// ---

const keyToCss = {
  bg: "backgroundColor",
  fg: "color",
  b: "borderColor",
  o: "outlineColor"
};

function parseColorsToStyle(relativeToColor, str, base = null) {
  const theme = relativeToColor.theme;

  const things = str.split(" ");
  let returnStyle = {};
  let colors = {
    parent: relativeToColor
  };
  things.forEach(thing => {
    // thing: 'bg/fg=10-red'

    // key: 'bg' value: '10-red'
    const [key, value] = thing.split("=");

    // contrast: '10' rampKey: 'red'
    const [contrast, rampKey = base] = (() => {
      // 10-red || 10 || red
      const [first, second] = value.split("-");
      if (first && second) {
        return [parseInt(first, 10), second];
      }

      // TODO: verify that a zero (0) should get ignored here
      const firstAsInt = parseInt(first, 10);
      if (Number.isInteger(firstAsInt)) {
        return [firstAsInt];
      } else {
        // eslint-disable-next-line no-sparse-arrays
        return [, first];
      }
    })();

    // keys: ['bg', 'fg']
    const keys = key.split("/");

    // parentKey: 'bg' childKey: 'fg'
    const [parentKey, childKey] = keys.length > 1 ? keys : ["parent", keys[0]];

    if (parentKey === "fg") {
      throw new Error(
        `Can't use "fg" as the parent as in "fg/bg=100". This limitation exists to prevent accidental mistakes assuming you meant "bg/fg=100". However, if you think you have a legitimate use case, please create an issue on Github.`
      );
    }

    const parentColor = colors[parentKey];

    const color = parentColor.contrast(
      contrast,
      rampKey ? theme.ramps[rampKey] : undefined
    );
    colors[childKey] = color;

    returnStyle[keyToCss[childKey]] = color;

    if (childKey === "bg") {
      returnStyle.color = color.contrast(100);
    }
  });

  return returnStyle;
}
