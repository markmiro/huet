import React, { useContext } from "react";
import isPlainObject from "lodash/isPlainObject";
import isFunction from "lodash/isFunction";
import Color from "../Color";
import { ThemeContext, BackgroundContext } from "./private/reactContexts";
// TODO: consider separating out the `theme` setting part because it makes things extra complicated
// when also dealing with the option of setting the BackgroundContext via the style or `colors` props

export default function Block({
  as = "div",
  theme,
  debug,
  style,
  // TODO: default `colors` to "bg:100 bg/fg:100"
  colors,
  base = "gray",
  children,
  ...rest
}) {
  if (debug) {
    debugger;
  }

  // Figure out props, especially the style prop
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
  if (base) {
    relativeToColor = relativeToColor.base(finalTheme.ramps[base]);
  }

  if (!finalTheme) {
    throw new Error("Need to set a theme before using a Block");
  }

  let returnStyle;
  if (isPlainObject(style)) {
    returnStyle = style;
  } else if (isFunction(style)) {
    returnStyle = style(relativeToColor);
  } else {
    returnStyle = null;
  }

  if (colors) {
    // TODO: consider making "colors" prop values depend on the value of stuff set in style?
    returnStyle = {
      ...returnStyle,
      ...parseColorsToStyle(relativeToColor, colors, base)
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

function parseColorsToStyle(relativeToColor, str, base) {
  const theme = relativeToColor.theme;

  const things = str.split(" ");
  let returnStyle = {};
  let colors = {
    parent: relativeToColor
  };
  things.forEach(thing => {
    // thing: 'bg/fg:10-red'

    // key: 'bg' value: '10-red'
    const [key, value] = thing.split(":");

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
        return [, first];
      }
    })();

    // keys: ['bg', 'fg']
    const keys = key.split("/");

    // parentKey: 'bg' childKey: 'fg'
    const [parentKey, childKey] = keys.length > 1 ? keys : ["parent", keys[0]];

    //
    const parentColor = colors[parentKey];

    const ramp = theme.ramps[rampKey];

    let color;
    if (ramp.config.mode === "direct") {
      color = parentColor.direct(ramp);
    } else {
      color = parentColor.contrast(contrast, ramp);
    }
    colors[childKey] = color;

    returnStyle[keyToCss[childKey]] = color;
  });

  return returnStyle;
}
