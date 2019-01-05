import React, { useContext } from "react";
import _ from "lodash";
import { ThemeContext, BackgroundContext, Color } from ".";

export default function Block({
  as = "div",
  theme,
  debug,
  style,
  colors,
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

  if (!finalTheme) {
    throw new Error("Need to set a theme before using a Block");
  }

  let returnStyle;
  if (_.isPlainObject(style)) {
    returnStyle = style;
  } else if (_.isFunction(style)) {
    returnStyle = style(relativeToColor);
  } else {
    returnStyle = null;
  }

  if (colors) {
    returnStyle = {
      ...returnStyle,
      ...parseColorsToStyle(relativeToColor, colors)
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

function parseColorsToStyle(relativeToColor, str) {
  const ctx = relativeToColor.theme;

  const things = str.split(" ");
  let returnStyle = {};
  let colors = {
    parent: relativeToColor
  };
  things.forEach(thing => {
    // thing: 'bg/fg:10-red'

    // key: 'bg' value: '10-red'
    const [key, value] = thing.split(":");

    // TODO: allow user to only set ramp if it's a direct ramp
    // contrast: '10' rampKey: 'red'
    const [contrast, rampKey = "gray"] = value.split("-");

    // keys: ['bg', 'fg']
    const keys = key.split("/");

    // parentKey: 'bg' childKey: 'fg'
    const [parentKey, childKey] = keys.length > 1 ? keys : ["parent", keys[0]];

    //
    const parentColor = colors[parentKey];

    const ramp = ctx.ramps[rampKey];

    let color;
    if (ramp.config.mode === "direct") {
      color = parentColor.direct(ramp);
    } else {
      color = parentColor.contrast(parseInt(contrast), ramp);
    }
    colors[childKey] = color;

    returnStyle[keyToCss[childKey]] = color;
  });

  return returnStyle;
}
