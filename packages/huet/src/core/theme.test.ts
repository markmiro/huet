import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { createTheme, hues, themeVariables, colorModels } from "./theme";
import { apca, contrast, lightness, textEnd, toOklab, fromOklab, mix, luminance } from "./color";
import { classes, validateClasses, isHuetClass, parseColorClass, stateKey, classVariable } from "./classes";
import { readFileSync } from "node:fs";
import { compile } from "@tailwindcss/node";
import { themeFromConfig } from "./fromConfig";
import themes from "../themeConfigs";

describe("color math", () => {
  it("matches the APCA-W3 reference, measures L* and round trips saturated colors", () => {
    // Published test values for APCA-W3 0.0.98G-4g.
    expect(apca("#888888", "#ffffff")).toBeCloseTo(63.056, 3);
    expect(apca("#ffffff", "#888888")).toBeCloseTo(-68.541, 3);
    expect(apca("#000000", "#aaaaaa")).toBeCloseTo(58.146, 3);
    expect(apca("#aaaaaa", "#000000")).toBeCloseTo(-56.241, 3);
    expect(apca("#112233", "#ddeeff")).toBeCloseTo(91.668, 3);
    expect(apca("#ddeeff", "#112233")).toBeCloseTo(-93.068, 3);
    // Below the reference's Lc 7.3 cutoff, values fall continuously to 0.
    expect(apca("#7a7a7a", "#777777")).toBeLessThan(0);
    expect(contrast("#777777", "#7a7a7a")).toBeGreaterThan(0);
    expect(contrast("#777777", "#7a7a7a")).toBeLessThan(7.3);
    expect(apca("#777777", "#777777")).toBe(0);
    expect(lightness("#000000")).toBe(0);
    expect(lightness("#ffffff")).toBeCloseTo(1, 4);
    expect(lightness("#777777")).toBeCloseTo(0.5, 2);
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
      for (let i = 0; i <= 100; i++) {
        const bg = mix(theme.dark, theme.light, i / 100);
        const lighter = textEnd(bg, theme.dark, theme.light) === theme.light;
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

  it("reaches Lc 90, 60 and 30 for text, muted and border across every sRGB gray", () => {
    const theme = createTheme();
    let hueTargetMet = 0;
    for (let i = 0; i < 256; i++) {
      const bg = "#" + i.toString(16).padStart(2, "0").repeat(3);
      const t = theme.tokens(bg);
      // Where the background can't reach Lc 90, the roles keep their proportions.
      const fg = Math.min(contrast(bg, textEnd(bg, theme.dark, theme.light)), 90);
      expect(contrast(bg, t.foreground), bg).toBeGreaterThanOrEqual(fg - 1e-9);
      expect(contrast(bg, t.muted), bg).toBeGreaterThanOrEqual((fg * 2) / 3 - 1e-9);
      expect(contrast(bg, t.border), bg).toBeGreaterThanOrEqual(fg / 3 - 1e-9);
      expect(contrast(bg, t.muted), bg).toBeLessThan(contrast(bg, t.foreground));
      expect(contrast(bg, t.border), bg).toBeLessThan(contrast(bg, t.muted));
      // Signal hues aim for the muted level. Next to the switch point a hue's
      // ramp can fall a little short; there it uses its strongest color.
      for (const hue of hues) {
        expect(contrast(bg, t[hue]), bg + " " + hue).toBeGreaterThanOrEqual(50);
        if (contrast(bg, t[hue]) >= 60) hueTargetMet++;
      }
    }
    expect(hueTargetMet / (256 * hues.length)).toBeGreaterThan(0.9);
  });
  it("puts light text on middle grays, where APCA reads it better", () => {
    const theme = createTheme();
    for (const bg of ["#747474", "#797979", "#7d7d7d", "#828282", "#8b8b8b", "#9b9b9b"]) {
      const t = theme.tokens(bg);
      expect(t.foreground, bg).toBe("#ffffff");
      expect(contrast(bg, "#ffffff"), bg).toBeGreaterThan(contrast(bg, "#000000"));
      for (const color of [t.muted, t.border]) expect(luminance(color), bg).toBeGreaterThan(luminance(bg));
    }
    expect(theme.tokens("#a8a8a8").foreground).toBe("#000000");
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
        expect(contrast(bg, theme.tokens(bg)[hue]), hue).toBeGreaterThanOrEqual(60);
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
          // Text reaches at least Lc 60 on every fill.
          expect(contrast(bg, theme.tokens(bg).foreground), bg).toBeGreaterThanOrEqual(60);
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
      expect(contrast(t.background, t.foreground)).toBeLessThan(10);
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
      expect(contrast(bg, t.foreground)).toBeGreaterThanOrEqual(60);
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
    expect(isHuetClass("huet-bg-blue-20")).toBe(true);
    expect(isHuetClass("huet-text-100")).toBe(true);
    expect(isHuetClass("huet-bg/border-red-60")).toBe(true);
    for (const name of ["huet-bg-blue-101", "huet-text-01", "huet-text-0.5", "huet-bg/bg-10", "huet-bg-cyan-20"])
      expect(isHuetClass(name)).toBe(false);
    expect(validateClasses("huet-text-20 huet-bg/text-80")).toHaveLength(1);
    expect(validateClasses("huet-bg-20 huet-surface-25")).toHaveLength(1);
  });
  it("accepts Tailwind variants on explicit-amount classes, one class per property and variant", () => {
    for (const name of ["hover:huet-bg-20", "focus-visible:huet-outline-blue-80", "md:huet-text-60", "group-hover/card:huet-border-50",
      "aria-pressed:huet-bg/text-90", "[&>svg]:huet-text-red-100", "md:hover:huet-bg-gray-70", "data-[state=open]:huet-bg-10"])
      expect(isHuetClass(name), name).toBe(true);
    expect(isHuetClass("hover:huet-muted")).toBe(false);
    expect(isHuetClass("huet-bg-20!")).toBe(false);
    expect(validateClasses("huet-bg-10 hover:huet-bg-20 md:hover:huet-bg-50 huet-text-60 hover:huet-bg/text-100")).toEqual([]);
    expect(validateClasses("huet-bg-10 huet-bg-20!")).toEqual(["Use one Huet background class per element: huet-bg-10 and huet-bg-20! conflict"]);
    expect(validateClasses("hover:huet-text-60 hover:huet-bg/text-80 focus:huet-text-10")).toEqual([
      'Use one Huet text class per variant: hover:huet-text-60 and hover:huet-bg/text-80 both apply on "hover:"']);
    // Important works like Tailwind's, in either position.
    expect(validateClasses("!huet-bg-20 hover:huet-text-60!")).toEqual([]);
    // Unprefixed Huet classes still combine with variant-prefixed Tailwind utilities.
    expect(validateClasses("huet-outline-blue-80 focus-visible:outline-2 hover:text-huet-blue")).toEqual([]);
  });
  it("rejects variants it can't support, with what to write instead", () => {
    const [opacity] = validateClasses("hover:huet-bg-20/50");
    expect(opacity).toContain("don't take opacity modifiers: hover:huet-bg-20/50");
    expect(opacity).toContain('"hover:huet-bg-10"');
    expect(validateClasses("huet-bg/text-80/[.5]")[0]).toContain("opacity modifiers");
    expect(validateClasses("[&>li]:huet-bg-20")[0]).toContain('"[&>li]:" styles a child or pseudo-element');
    expect(validateClasses("*:huet-bg-20")[0]).toContain("Background variants must style the element with the class");
    expect(validateClasses("before:huet-bg-20")).toHaveLength(1);
    expect(validateClasses("[&:hover]:huet-bg-20 [.dark_&]:huet-bg-10 *:huet-text-60 placeholder:huet-bg/text-50")).toEqual([]);
    expect(validateClasses("hover:huet-surface-25")[0]).toContain('"hover:huet-bg-20"');
    expect(validateClasses("hover:huet-surface-blue")[0]).toContain('"hover:huet-bg-blue-20"');
    expect(validateClasses("hover:huet-muted")[0]).toContain('"hover:text-huet-muted"');
    expect(validateClasses("focus-visible:huet-focus")[0]).toContain('Use "huet-focus" alone');
    expect(validateClasses("hover::huet-bg-20")).toEqual(["Empty Tailwind variant in hover::huet-bg-20"]);
    expect(validateClasses("hover:huet-bg-25")).toEqual([
      'Huet amounts are 0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100: hover:huet-bg-25. Use "hover:huet-bg-20" or "hover:huet-bg-30".']);
    expect(validateClasses("huet-bg/text-red-3")[0]).toContain('Use "huet-bg/text-red-0" or "huet-bg/text-red-5"');
    // An unknown class stays unknown, with or without a variant.
    expect(validateClasses("hover:huet-text-blu")).toEqual(["Unknown Huet class: hover:huet-text-blu"]);
  });
  it("rejects Tailwind backgrounds that paint Huet colors, which nested colors can't follow", () => {
    expect(validateClasses("bg-huet-blue")).toEqual([
      'Tailwind background utilities paint colors Huet can\'t track, so colors inside would be solved against the wrong background: bg-huet-blue. Use a Huet background class, e.g. "huet-bg-blue-20".']);
    expect(validateClasses("hover:bg-huet-fg/50")[0]).toContain('"hover:huet-bg-100"');
    for (const name of ["bg-huet-muted", "bg-(--huet-background)", "bg-(color:--huet-red)", "bg-[var(--huet-border)]", "md:bg-huet-red!"])
      expect(validateClasses(name), name).toHaveLength(1);
    // Other color utilities may use Huet tokens, with opacity too.
    expect(validateClasses("text-huet-blue/50 border-huet-border fill-huet-red bg-red-500 bg-[#fff]")).toEqual([]);
  });
  it("ships a Tailwind utility for every explicit-amount class", () => {
    const css = readFileSync(new URL("./tailwind-utilities.css", import.meta.url), "utf8");
    const utilities = new Map([...css.matchAll(/^@utility (\S+) \{ (.+) \}$/gm)].map((x) => [x[1].replace("\\/", "/"), x[2]]));
    const relative = classes.filter((x) => parseColorClass(x));
    expect(utilities.size).toBe(relative.length);
    const properties = { text: "color", border: "border-color", outline: "outline-color" } as const;
    const keys = new Set<number>();
    for (const name of relative) {
      const spec = parseColorClass(name)!;
      if (spec.property === "bg") keys.add(stateKey(spec));
      expect(utilities.get(name), `${name}: run pnpm --filter huet generate`).toBe(spec.property === "bg"
        ? `--huet-state: ${stateKey(spec)};`
        : `${properties[spec.property]}: var(${classVariable(name)});`);
    }
    // Every background class selects a different state.
    expect(keys.size).toBe(relative.filter((x) => parseColorClass(x)!.property === "bg").length);
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
      "hover:huet-bg-blue-20",
      "huet-text-60",
      "focus-visible:huet-bg/outline-80",
      "huet-bg-20/50",
    ]);
    expect(css).toContain(".p-4");
    expect(css).toMatch(/\.hover\\:huet-bg-blue-20:hover \{\s*--huet-state: 525;/);
    expect(css).toMatch(/\.huet-text-60 \{\s*color: var\(--huet-text-60\);/);
    expect(css).toMatch(/\.focus-visible\\:huet-bg\\\/outline-80:focus-visible \{\s*outline-color: var\(--huet-bg-outline-80\);/);
    // Opacity modifiers produce nothing; validateClasses reports them.
    expect(css).not.toContain("huet-bg-20\\/50");
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
        let previous = 0;
        for (let amount = 0; amount <= 100; amount++) {
          const distance = Math.abs(lightness(theme.relative.contrast(amount).hex) - lightness(theme.background));
          expect(distance, `${background} ${amount}`).toBeGreaterThanOrEqual(previous - 1e-9);
          previous = distance;
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
describe("preset roles", () => {
  const orangeBoost = themeFromConfig(themes.find((x) => x.name === "Orange Boost")!);
  const base = themeFromConfig(themes.find((x) => x.name === "Base")!);
  const chroma = (hex: string) => Math.hypot(toOklab(hex)[1], toOklab(hex)[2]);
  const hue = (hex: string) => Math.atan2(toOklab(hex)[2], toOklab(hex)[1]);
  const side = (bg: string, color: string) => Math.sign(luminance(color) - luminance(bg));

  it("keeps foreground, muted and border apart when a ramp can't reach Lc 90", () => {
    const { relative } = orangeBoost;
    const blue = relative.contrast(25, relative.theme.ramps.blue).hex;
    for (const bg of [orangeBoost.background, blue, ...[10, 25, 50, 75, 100].map((n) => relative.contrast(n).hex)]) {
      const t = orangeBoost.tokens(bg);
      const [fg, muted, border] = [t.foreground, t.muted, t.border].map((x) => contrast(bg, x));
      if (fg < 15) continue;
      // Each role keeps its share of what the background can reach.
      expect(muted / fg, bg).toBeCloseTo(2 / 3, 1);
      expect(border / fg, bg).toBeCloseTo(1 / 3, 1);
      // A slider's track (border) must stand out from its filled part (text).
      expect(contrast(t.border, t.foreground), bg).toBeGreaterThanOrEqual(10);
      expect(contrast(t.muted, t.foreground), bg).toBeGreaterThanOrEqual(5);
    }
    // At the root, the reported collapse: all three were the light endpoint.
    expect(new Set(Object.values(orangeBoost.tokens()).slice(1, 4)).size).toBe(3);
  });
  it("keeps every neutral role on the text's side of each background", () => {
    for (const theme of [base, orangeBoost, createTheme({ dark: "#3c3d43", light: "#b2bdff" })])
      for (let i = 0; i <= 100; i++) {
        const bg = theme.ramp(i / 100);
        const t = theme.tokens(bg);
        expect(side(bg, t.muted), bg).toBe(side(bg, t.foreground));
        expect(side(bg, t.border), bg).toBe(side(bg, t.foreground));
      }
  });
  it("puts the solver's colors and the preset roles on the same side of every background", () => {
    const sunset = themeFromConfig(themes.find((x) => x.name === "Sunset")!);
    for (const theme of [base, orangeBoost, sunset, createTheme({ dark: "#233b91" })]) {
      const { relative } = theme;
      const { ramps } = relative.theme;
      for (let n = 0; n <= 100; n += 5)
        for (const bg of [relative.contrast(n), relative.contrast(n, ramps.blue)]) {
          // Text on a huet-bg-* surface is the solver's strength 100.
          const text = side(bg.hex, bg.contrast(100).hex);
          if (text === 0) continue;
          const t = theme.tokens(bg.hex, theme.background);
          for (const color of [t.foreground, t.muted, bg.contrast(30).hex, bg.contrast(100, ramps.red).hex])
            expect([0, text], `${n} ${bg.hex} ${color}`).toContain(side(bg.hex, color));
        }
    }
  });
  it("lets a border outline a surface against its parent from the other side", () => {
    const theme = createTheme();
    // Light text on #707070; toward white, a border can't also stand out from #d6d6d6.
    const t = theme.tokens("#707070", "#d6d6d6");
    const target = contrast("#707070", t.foreground) / 3;
    expect(luminance(t.foreground)).toBeGreaterThan(luminance("#707070"));
    expect(luminance(t.border)).toBeLessThan(luminance("#707070"));
    expect(contrast("#707070", t.border)).toBeGreaterThanOrEqual(target);
    expect(contrast("#d6d6d6", t.border)).toBeGreaterThanOrEqual(target);
  });
  it("changes smoothly as the available contrast drops below Lc 90", () => {
    for (const options of [{ dark: "#474b56", light: "#ff7c49" }, { dark: "#3c3d43", light: "#b2bdff" }, {}]) {
      const theme = createTheme(options);
      let previous: number[] | undefined;
      for (let i = 0; i <= 400; i++) {
        const bg = theme.ramp(i / 400);
        const t = theme.tokens(bg);
        const values = [t.muted, t.border].map((x) => contrast(bg, x));
        if (previous) values.forEach((x, j) => expect(Math.abs(x - previous![j]), bg).toBeLessThan(1.5));
        previous = values;
      }
    }
  });
  it("follows a multi-hue ramp's shape on colored surfaces", () => {
    // Sunset's HCL ramp passes through mauve and salmon; a straight mix from a
    // blue surface to the yellow text would pass through olive instead.
    const lightness = (hex: string) => toOklab(hex)[0];
    const nearest = (colors: string[], hex: string) => colors.reduce((a, b) =>
      Math.abs(lightness(b) - lightness(hex)) < Math.abs(lightness(a) - lightness(hex)) ? b : a);
    const gap = (a: string, b: string) => {
      const d = Math.abs(hue(a) - hue(b));
      return Math.min(d, 2 * Math.PI - d);
    };
    for (const name of ["Sunset", "A Box of Macaroni"]) {
      const theme = themeFromConfig(themes.find((x) => x.name === name)!);
      const samples = Array.from({ length: 257 }, (_, i) => theme.ramp(i / 256));
      for (const ramp of ["blue", "red", "green"]) {
        const bg = theme.relative.contrast(25, theme.relative.theme.ramps[ramp]).hex;
        const end = textEnd(bg, theme.dark, theme.light);
        const straight = Array.from({ length: 257 }, (_, i) => mix(bg, end, i / 256));
        const t = theme.tokens(bg, theme.background);
        // Muted text travels far enough for the ramp's hues to show. A border on a
        // light surface sits close to it (Lc 30), where it keeps the surface's hue.
        for (const color of [t.muted]) {
          const line = nearest(straight, color);
          expect(gap(color, nearest(samples, color)), `${name} ${ramp} ${color} vs ${line}`)
            .toBeLessThan(gap(line, nearest(samples, line)) - 0.2);
        }
      }
    }
  });
  it("tints muted and border with a colored surface's hue", () => {
    for (const theme of [base, themeFromConfig(themes.find((x) => x.name === "Base Inverted")!), orangeBoost]) {
      const { relative } = theme;
      const bg = relative.contrast(25, relative.theme.ramps.blue).hex;
      const t = theme.tokens(bg, theme.background);
      for (const color of [t.muted, t.border]) {
        expect(chroma(color), `${bg} ${color}`).toBeGreaterThan(0.02);
        // Lines and secondary text keep most of the surface's color rather than graying.
        // (On a dark surface, Lc 60 muted text is far lighter than the surface.)
        if (theme !== orangeBoost) expect(chroma(color), `${bg} ${color}`).toBeGreaterThan(0.6 * chroma(bg));
        if (theme !== orangeBoost) expect(Math.abs(hue(color) - hue(bg)), `${bg} ${color}`).toBeLessThan(0.2);
      }
    }
    // Neutral surfaces keep neutral roles.
    const t = base.tokens(base.relative.contrast(6).hex);
    for (const color of [t.foreground, t.muted, t.border]) expect(chroma(color)).toBeLessThan(0.005);
  });
});
