import React, { useContext } from "react";

import Color from "./Color";
import { BackgroundContext, ThemeContext } from "./reactContexts";
import type Theme from "./Theme";

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

type ColorStyleValue = React.CSSProperties["color"] | Color | null;

export type HuetStyle = Omit<
  React.CSSProperties,
  "backgroundColor" | "color" | "borderColor" | "outlineColor"
> & {
  backgroundColor?: ColorStyleValue;
  color?: ColorStyleValue;
  borderColor?: ColorStyleValue;
  outlineColor?: ColorStyleValue;
};

type BlockOwnProps = {
  as?: React.ElementType;
  theme?: Theme;
  debug?: boolean;
  style?: HuetStyle | ((color: Color) => HuetStyle) | null;
  contrast?: string;
  base?: string | null;
  children?: React.ReactNode;
};

export type BlockProps = BlockOwnProps &
  Omit<React.AllHTMLAttributes<HTMLElement>, keyof BlockOwnProps>;

export default function Block({
  as = "div",
  theme,
  debug,
  style,
  contrast = "fg=100",
  base,
  children,
  ...rest
}: BlockProps) {
  if (debug) {
    debugger;
  }

  const parentTheme = useContext(ThemeContext);
  const parentBg = useContext(BackgroundContext);

  let finalTheme: Theme | null;
  let relativeToColor: Color | null;

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

  if (!relativeToColor) {
    throw new Error("Need a background color before using a Block");
  }

  if (base) {
    relativeToColor = relativeToColor.base(finalTheme.ramps[base]);
  }

  let returnStyle: HuetStyle | null;
  if (typeof style === "function") {
    returnStyle = style(relativeToColor);
  } else if (style && typeof style === "object") {
    returnStyle = style;
  } else if (!style) {
    returnStyle = null;
  } else {
    throw new Error("Unsupported style prop value");
  }

  if (contrast) {
    returnStyle = {
      ...returnStyle,
      ...parseColorsToStyle(relativeToColor, contrast),
    };
  }

  const props = {
    style: returnStyle,
    ...rest,
  };

  let returnChildren = children;
  if (theme && children) {
    returnChildren = (
      <ThemeContext.Provider value={finalTheme}>{children}</ThemeContext.Provider>
    );
  }
  if (
    returnStyle &&
    returnStyle.backgroundColor &&
    returnStyle.backgroundColor !== "transparent" &&
    children
  ) {
    const backgroundColor = returnStyle.backgroundColor;
    if (typeof backgroundColor !== "object" || !(backgroundColor instanceof Color)) {
      throw new TypeError("Use a Huet Color instance here.");
    }
    returnChildren = (
      <BackgroundContext.Provider value={backgroundColor}>
        {returnChildren}
      </BackgroundContext.Provider>
    );
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

  return React.createElement(as, props, returnChildren);
}

const keyToCss = {
  bg: "backgroundColor",
  fg: "color",
  b: "borderColor",
  o: "outlineColor",
} as const;

function parseColorsToStyle(relativeToColor: Color, str: string): HuetStyle {
  const theme = relativeToColor.theme;

  const things = str.split(" ");
  const returnStyle: HuetStyle = {};
  const colors: Record<string, Color> = {
    parent: relativeToColor,
  };
  for (const thing of things) {
    const [key, value = ""] = thing.split("=");

    const [contrast, rampKey] = ((): [number | undefined, string | undefined] => {
      const [first, second] = value.split("-");
      if (first && second) {
        return [Number.parseInt(first, 10), second];
      }

      // A contrast of zero is preserved, not ignored: `first` is still the
      // string "0" (truthy) in the branch above, and `Number.isInteger(0)` is
      // true here, so "bg=0" and "bg=0-red" both pass 0 through to `contrast()`.
      const firstAsInt = Number.parseInt(first ?? "", 10);
      if (Number.isInteger(firstAsInt)) {
        return [firstAsInt, undefined];
      }
      return [undefined, first];
    })();

    const keys = (key ?? "").split("/");
    const [parentKey, childKey] = (
      keys.length > 1 ? keys : ["parent", keys[0]]
    ) as [string, string];

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

    const cssKey = keyToCss[childKey as keyof typeof keyToCss];
    if (cssKey === "backgroundColor") returnStyle.backgroundColor = color;
    else if (cssKey === "color") returnStyle.color = color;
    else if (cssKey === "borderColor") returnStyle.borderColor = color;
    else if (cssKey === "outlineColor") returnStyle.outlineColor = color;

    if (childKey === "bg") {
      returnStyle.color = color.contrast(100);
    }
  }

  return returnStyle;
}
