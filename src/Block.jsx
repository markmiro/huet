import React, { useContext } from "react";
import _ from "lodash";
import Color from "./Color";
import { ThemeContext, BackgroundContext } from "./reactContexts";
// TODO: consider separating out the `theme` setting part because it makes things extra complicated
// when also dealing with the option of setting the BackgroundContext via the style or `colors` props

export default function Block({
  as = "div",
  theme,
  debug,
  style,
  // TODO: default `colors` to "bg=100 bg/fg=100"
  contrast,
  base = "gray",
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

function parseColorsToStyle(relativeToColor, str, base) {
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
