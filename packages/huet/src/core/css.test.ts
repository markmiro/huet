// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { themeCss } from "./css";
import { mountTheme } from "./dom";
import { checkTheme, resolveTheme, type Theme } from "./theme";
import { themes } from "./themes";
import { recolorer } from "./recolor";

const base: Theme = { neutral: ["#000000", "#ffffff"] };

describe("themeCss", () => {
  it("writes role colors and contrast steps for one background", () => {
    const css = themeCss(themes.Sunset, { background: 0, selector: ".dark" });
    const resolved = resolveTheme(themes.Sunset, { background: 0 });
    expect(css.startsWith(".dark {\n  color-scheme: dark;\n")).toBe(true);
    expect(css).toContain(`--huet-background: ${resolved.background};`);
    expect(css).toContain(`--huet-foreground: ${resolved.tokens().foreground};`);
    expect(css).toContain(`--huet-60: ${resolved.step(resolved.root, 60).hex};`);
    expect(themeCss(base)).toMatch(/^:root \{\n {2}color-scheme: light;\n {2}--huet-background: #ffffff;/);
  });

  // Every field of a theme, and the background, has to reach the output.
  // A site that dropped one (and so ignored a configurator control) fails here.
  it("changes when any theme field or the background changes", () => {
    const theme: Theme = { ...themes.Paperback, contrast: 1 };
    const variants: Theme[] = [
      { ...theme, neutral: ["#1d2a44", "#e2c1b1"] },
      { ...theme, neutral: [theme.neutral[0], "#b0a090", theme.neutral[1]] },
      { ...theme, colorModel: "hcl" },
      { ...theme, colors: { ...theme.colors, red: "#0055ff" } },
      { ...theme, contrast: 0.5 },
      { ...theme, contrast: 2 },
    ];
    const css = themeCss(theme);
    for (const variant of variants) expect(themeCss(variant)).not.toBe(css);
    for (const background of [0, 0.25, 0.75]) expect(themeCss(theme, { background })).not.toBe(css);
  });

  // The two fields that don't change page CSS change what they're for.
  it("signal lightness moves hue classes, and image settings move image colors", () => {
    const theme: Theme = { ...themes.Paperback };
    const red = (t: Theme, background: number) => {
      const r = resolveTheme(t, { background });
      return r.step(r.root, 100, "red").hex;
    };
    for (const background of [0, 1]) {
      const moved = { ...theme, signalLightness: { onLight: 0.2, onDark: 0.8 } };
      expect(red(moved, background)).not.toBe(red(theme, background));
    }
    const pixel = [0.2, 0.5, 0.8] as const;
    const full = recolorer(theme)(...pixel);
    expect(recolorer({ ...theme, images: { strength: 0.5 } })(...pixel)).not.toEqual(full);
    expect(recolorer({ ...theme, images: { tint: 0 } })(...pixel)).not.toEqual(full);
  });

  it("matches what mountTheme writes on the root", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const mount = mountTheme(root, themes.Astro, { background: 0.25 });
    const css = themeCss(themes.Astro, { background: 0.25 });
    for (const name of ["--huet-background", "--huet-muted", "--huet-red", "--huet-20", "--huet-100"]) {
      const value = root.style.getPropertyValue(name);
      expect(value).not.toBe("");
      expect(css).toContain(`${name}: ${value};`);
    }
    mount.destroy();
    root.remove();
  });
});

describe("themes", () => {
  it("are all valid and render on both ends of the ramp", () => {
    for (const theme of Object.values(themes)) {
      expect(() => checkTheme(theme)).not.toThrow();
      expect(themeCss(theme, { background: 0 })).not.toBe(themeCss(theme, { background: 1 }));
    }
  });

  it("explain what's wrong with an invalid theme", () => {
    const old = { pallet: { black: "#000" }, ramps: {}, bgRamp: "gray", bgRampValue: 1 };
    expect(() => themeCss(old as never)).toThrow(/old ThemeConfig format/);
    expect(() => themeCss({ ...base, mode: "dark" } as never)).toThrow(/unknown field mode/);
    expect(() => themeCss({ neutral: ["#000000"] })).toThrow(/two or more colors/);
    expect(() => themeCss({ neutral: ["#000000", "nope"] })).toThrow(/"nope", which isn't a color/);
    expect(() => checkTheme({ neutral: ["#69707f", "#808080", "#000000"] })).toThrow(
      /first color #69707f is lighter than its last color #000000/,
    );
    expect(() => themeCss({ ...base, colorModel: "cmyk" } as never)).toThrow(/colorModel must be one of/);
    expect(() => themeCss({ ...base, colors: { teal: "#00ffff" } } as never)).toThrow(/colors.teal isn't a hue/);
    expect(() => themeCss({ ...base, contrast: 3 })).toThrow(/contrast must be a number from 0 to 2/);
    expect(() => themeCss(base, { background: 2 })).toThrow(/background must be a number from 0 \(dark\) to 1/);
  });
});
