import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { createTheme, hues, themeVariables, colorModels } from "./theme";
import { contrastRatio, toOklab, fromOklab, mix, luminance } from "./color";
import { classes, validateClasses, isHuetClass } from "./classes";
import { readFileSync } from "node:fs";
import { compile } from "@tailwindcss/node";

describe("color math", () => {
  it("matches reference sRGB contrast and round trips saturated colors", () => {
    expect(contrastRatio("#000", "#fff")).toBe(21);
    expect(contrastRatio("#777", "#fff")).toBeCloseTo(4.478, 2);
    for (const color of [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffffff",
      "#808080",
      "#123456",
    ])
      expect(fromOklab(toOklab(color))).toBe(color);
    expect(mix("#000", "#fff", 0.5)).toBe("#636363");
  });
  it("rejects alpha, invalid hex and invalid positions", () => {
    for (const dark of ["red", "#ffffff80", "#xyz", "#12", "var(--x)"])
      expect(() => createTheme({ dark })).toThrow();
    for (const background of [-1, 2, NaN, Infinity])
      expect(() => createTheme({ background })).toThrow();
    expect(() => createTheme({ dark: "#fff", light: "#000" })).toThrow();
  });
});
describe("readability", () => {
  it("switches every semantic text and fill together throughout the background slider", () => {
    for (const options of [
      {}, { dark: "#233b91" }, { dark: "#302723", light: "#f1e4cd" },
      { dark: "#888888", light: "#999999" },
      { colors: { red: "#ff0000", yellow: "#ffff00", green: "#00ff00", blue: "#0000ff", purple: "#ff00ff" } },
    ]) {
      const theme = createTheme(options);
      let previous = true, switches = 0;
      for (let i = 0; i <= 1000; i++) {
        const bg = mix(theme.dark, theme.light, i / 1000);
        const lighter = contrastRatio(bg, theme.light) > contrastRatio(bg, theme.dark);
        if (lighter !== previous) switches++;
        previous = lighter;
        const tokens = theme.tokens(bg);
        for (const hue of hues) {
          for (const color of [tokens[hue], theme.surface(bg, hue)]) {
            const delta = luminance(color) - luminance(bg);
            expect(lighter ? delta >= 0 : delta <= 0, bg + " " + hue + " " + color).toBe(true);
          }
        }
      }
      expect(switches).toBe(1);
    }
  });

  it("meets text, secondary and border targets across every sRGB gray", () => {
    const theme = createTheme();
    for (let i = 0; i < 256; i++) {
      const bg = "#" + i.toString(16).padStart(2, "0").repeat(3);
      const t = theme.tokens(bg);
      expect(contrastRatio(bg, t.foreground), bg).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(bg, t.muted), bg).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(bg, t.border), bg).toBeGreaterThanOrEqual(3);
      for (const hue of hues)
        expect(
          contrastRatio(bg, t[hue]),
          bg + " " + hue,
        ).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("fixes legacy 49/51%, OKLab 49/51%, and sRGB 49/51%", () => {
    const theme = createTheme();
    for (const bg of [
      "#747474",
      "#797979",
      "#7d7d7d",
      "#828282",
      mix("#000", "#fff", 0.49),
      mix("#000", "#fff", 0.51),
    ]) {
      const t = theme.tokens(bg);
      expect(contrastRatio(bg, t.muted)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(bg, t.border)).toBeGreaterThanOrEqual(3);
    }
  });
  it("keeps signal hues recognizable on a blue/white theme", () => {
    const theme = createTheme({ dark: "#233b91" });
    for (const bg of [theme.background, theme.dark])
      for (const hue of hues) {
        const [, a, b] = toOklab(theme.colors[hue]);
        const [, x, y] = toOklab(theme.tokens(bg)[hue]);
        const angle =
          (Math.atan2(a * y - b * x, a * x + b * y) * 180) / Math.PI;
        expect(Math.abs(angle), hue).toBeLessThan(5);
        expect(Math.hypot(x, y), hue).toBeGreaterThan(0.025);
        expect(
          contrastRatio(bg, theme.tokens(bg)[hue]),
          hue,
        ).toBeGreaterThanOrEqual(4.5);
      }
  });
  it("keeps branded surface fills readable, including the middle of the ramp", () => {
    for (const options of [
      { dark: "#233b91" },
      { dark: "#302723", light: "#f1e4cd" },
    ]) {
      const theme = createTheme(options);
      for (const parent of [theme.background, theme.dark]) {
        for (const amount of [5, 10, 25, 50, 75, 100, ...hues]) {
          const bg = theme.surface(
            parent,
            amount as number | (typeof hues)[number],
          );
          expect(
            contrastRatio(bg, theme.tokens(bg).muted),
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
  it("honors deliberately narrow or identical endpoints without NaN", () => {
    for (const options of [
      { dark: "#888888", light: "#999999" },
      { dark: "#888888", light: "#888888" },
    ]) {
      const theme = createTheme(options);
      const t = theme.tokens();
      expect(contrastRatio(t.background, t.foreground)).toBeLessThan(1.5);
      for (const value of Object.values(t))
        expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
  it("keeps nested surfaces readable and caches immutable results", () => {
    const theme = createTheme();
    let bg = theme.background;
    for (let depth = 0; depth < 20; depth++) {
      bg = theme.surface(bg, 25);
      const t = theme.tokens(bg);
      expect(contrastRatio(bg, t.foreground)).toBeGreaterThanOrEqual(4.5);
      expect(theme.tokens(bg)).toBe(t);
      expect(Object.isFrozen(t)).toBe(true);
    }
    expect(themeVariables(theme.tokens())["--huet-background"]).toBe("#ffffff");
  });
});
describe("static classes and Tailwind", () => {
  it("recognizes only the fixed vocabulary and rejects conflicting surfaces", () => {
    expect(isHuetClass("huet-surface-25")).toBe(true);
    expect(
      validateClasses("flex p-4 h-full h-10 huet-surface-25 huet-text-blue"),
    ).toEqual([]);
    expect(
      validateClasses("huet-surface-49 huet-text-blu hover:huet-surface-10"),
    ).toHaveLength(3);
    expect(validateClasses("huet-surface-10 huet-surface-blue")).toHaveLength(
      1,
    );
    const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
    for (const name of classes.filter(x => x.startsWith("huet-surface-")))
      expect(css).toContain("." + name);
    expect(isHuetClass("huet-bg-blue-25")).toBe(true);
    expect(isHuetClass("huet-text-100")).toBe(true);
    expect(isHuetClass("huet-bg/border-red-60")).toBe(true);
    for (const name of ["huet-bg-blue-101", "huet-text-01", "huet-text-0.5", "huet-bg/bg-10", "huet-bg-cyan-20"])
      expect(isHuetClass(name)).toBe(false);
    expect(validateClasses("huet-text-20 huet-bg/text-80")).toHaveLength(1);
    expect(validateClasses("huet-bg-25 huet-surface-25")).toHaveLength(1);
  });
  it("rejects Tailwind variants on Huet classes with what to write instead", () => {
    const [outline] = validateClasses("focus-visible:huet-outline-blue-80");
    expect(outline).toContain("don't support Tailwind variants yet: focus-visible:huet-outline-blue-80");
    expect(outline).toContain('"huet-outline-blue-80 focus-visible:outline-2"');
    expect(validateClasses("hover:huet-text-60")[0]).toContain('"hover:text-huet-blue"');
    expect(validateClasses("group-hover/card:huet-border-50")[0]).toContain('"group-hover/card:border-huet-blue"');
    expect(validateClasses("md:hover:huet-bg-25")[0]).toContain('Keep "huet-bg-25" without the variant');
    expect(validateClasses("[&>svg]:huet-bg/outline-80")[0]).toContain('"huet-bg/outline-80 [&>svg]:outline-2"');
    expect(validateClasses("focus-visible:huet-focus")[0]).toContain('Use "huet-focus" alone');
    // An unknown class stays unknown, with or without a variant.
    expect(validateClasses("hover:huet-text-blu")).toEqual(["Unknown Huet class: hover:huet-text-blu"]);
    // Unprefixed Huet classes still combine with variant-prefixed Tailwind utilities.
    expect(validateClasses("huet-outline-blue-80 focus-visible:outline-2 hover:text-huet-blue")).toEqual([]);
  });
  it("compiles real Tailwind v4 variants, removes built-in colors and preserves layout", async () => {
    const compiler = await compile(
      '@import "tailwindcss"; @import "./tailwind.css";',
      { base: fileURLToPath(new URL(".", import.meta.url)), onDependency: () => {} },
    );
    const css = compiler.build([
      "p-4",
      "flex",
      "text-huet-fg",
      "hover:text-huet-blue",
      "border-huet-border",
      "bg-red-500",
    ]);
    expect(css).toContain(".p-4");
    expect(css).toContain(".flex");
    expect(css).toContain("color: var(--huet-foreground)");
    expect(css).toContain("hover\\:text-huet-blue");
    expect(css).not.toContain(".bg-red-500");
  });
});
describe("multi-hue neutral ramps", () => {
  // Ported from the legacy React themes' `ramps.gray`.
  const sunset = { neutral: { colors: ["#242744", "#ffe173"], colorModel: "hcl" }, background: 0 } as const;
  const astro = { neutral: { colors: ["#040816", "#ffb980", "#ffffff"], colorModel: "hcl" }, background: 0 } as const;
  const chroma = (hex: string) => Math.hypot(toOklab(hex)[1], toOklab(hex)[2]);

  it("keeps the original two-point OKLab path for dark/light themes", () => {
    const theme = createTheme({ dark: "#233b91", background: 0.4 });
    expect(theme.background).toBe(mix("#233b91", "#ffffff", 0.4));
    for (let i = 0; i <= 10; i++) expect(theme.ramp(i / 10)).toBe(mix("#233b91", "#ffffff", i / 10));
    expect(theme.neutral).toEqual({ colors: ["#233b91", "#ffffff"], colorModel: "oklab" });
  });
  it("travels through hues in HCL instead of passing through muddy midtones", () => {
    const before = createTheme({ dark: "#242744", light: "#ffe173", background: 0 });
    const after = createTheme(sunset);
    expect(after.dark).toBe("#242744");
    expect(after.light).toBe("#ffe173");
    expect(chroma(after.ramp(0.5))).toBeGreaterThan(2 * chroma(before.ramp(0.5)));
    // Explicit classes (huet-bg-50, huet-text-60, ...) use the same ramp.
    const mid = after.relative.contrast(50).hex;
    expect(chroma(mid)).toBeGreaterThan(2 * chroma(before.relative.contrast(50).hex));
    expect(after.relative.contrast(0).hex).toBe("#242744");
    expect(after.relative.contrast(100).hex).toBe("#ffe173");
  });
  it("passes through middle stops on backgrounds, relative classes and surfaces", () => {
    const theme = createTheme(astro);
    expect(theme.ramp(0.5)).toBe("#ffb980");
    expect(createTheme({ ...astro, background: 0.5 }).background).toBe("#ffb980");
    expect(theme.surface(theme.background, 50)).toBe("#ffb980");
    const samples = Array.from({ length: 101 }, (_, i) => theme.relative.contrast(i).hex);
    expect(samples.some((hex) => chroma(hex) > 0.1)).toBe(true);
  });
  it("progresses monotonically from either end of a multi-hue ramp", () => {
    for (const options of [sunset, astro])
      for (const background of [0, 0.3, 0.7, 1]) {
        const theme = createTheme({ ...options, background });
        let previous = 1;
        for (let amount = 0; amount <= 100; amount++) {
          const ratio = contrastRatio(theme.background, theme.relative.contrast(amount).hex);
          expect(ratio, `${background} ${amount}`).toBeGreaterThanOrEqual(previous - 1e-9);
          previous = ratio;
        }
      }
  });
  it("supports every listed model and rejects invalid ramps", () => {
    for (const colorModel of colorModels)
      expect(createTheme({ neutral: { ...sunset.neutral, colorModel } }).ramp(1)).toBe("#ffe173");
    expect(createTheme({ neutral: { colors: ["#000", "#fff"] } }).neutral.colorModel).toBe("oklab");
    expect(() => createTheme({ neutral: { colors: ["#000", "#fff"], colorModel: "cmyk" as never } })).toThrow(TypeError);
    expect(() => createTheme({ neutral: { colors: ["#000", "orange", "#fff"] } })).toThrow(TypeError);
    expect(() => createTheme({ neutral: { colors: ["#000"] } })).toThrow(RangeError);
    expect(() => createTheme({ neutral: { colors: ["#fff", "#000"] } })).toThrow(RangeError);
    expect(() => createTheme({ dark: "#111", neutral: sunset.neutral })).toThrow(TypeError);
  });
});
