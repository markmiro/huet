import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";
import { bundledThemes, codeToHtml } from "shiki";
import { describe, expect, it } from "vitest";
import { linearRgbFromLch, toLch } from "./color";
import { ansiColors, huetShikiTheme, huetShikiTransformer, type AnsiColor, type ShikiThemeSource } from "./shiki";

const highlight = (code: string, lang: string) =>
  codeToHtml(code, { lang, theme: huetShikiTheme(), transformers: [huetShikiTransformer()] });

describe("huetShikiTheme", () => {
  it("colors tokens with Huet variables, never fixed colors", async () => {
    const html = await highlight(`const App = () => <div className="a">{n + 1}</div>; // hi`, "jsx");
    expect(html).toContain("var(--huet-code-keyword, var(--huet-red))");
    expect(html).toContain("var(--huet-code-function, var(--huet-purple))");
    expect(html).toContain("var(--huet-code-tag, var(--huet-green))");
    expect(html).toContain("var(--huet-code-comment, var(--huet-muted))");
    expect(html).toContain("color-mix(in oklab, var(--huet-blue) 55%, var(--huet-foreground))");
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it("colors ANSI output with Huet variables instead of Shiki's fixed terminal palette", async () => {
    const theme = huetShikiTheme();
    for (const name of Object.keys(ansiColors)) {
      const key = name[0].toUpperCase() + name.slice(1);
      const sentinel = theme.colors[`terminal.ansi${key}`];
      expect(theme.colorReplacements[sentinel]).toBe(`var(--huet-code-ansi-${name}, ${ansiColors[name as AnsiColor]})`);
      expect(theme.colorReplacements[theme.colors[`terminal.ansiBright${key}`]]).toBe(theme.colorReplacements[sentinel]);
    }
    const code = "\x1b[31mfail\x1b[0m \x1b[92mok\x1b[0m \x1b[36mcyan\x1b[0m \x1b[2;33mdim\x1b[0m plain";
    // Shiki normalizes a theme object on every call; the colors must survive repeats.
    for (let pass = 0; pass < 2; pass++) {
      const html = await codeToHtml(code, { lang: "ansi", theme });
      expect(html).toContain("color:var(--huet-code-ansi-red, var(--huet-red))");
      expect(html).toContain("color:var(--huet-code-ansi-green, var(--huet-green))");
      expect(html).toContain("color:var(--huet-code-ansi-cyan, color-mix(in oklab, var(--huet-blue), var(--huet-green)))");
      expect(html).toContain("color:var(--huet-code-ansi-yellow, var(--huet-yellow))");
      expect(html).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
  });

  it("keeps another theme's hues, with lightness from Huet", async () => {
    const vesper = {
      name: "vesper",
      type: "dark",
      colors: { "editor.foreground": "#FFF", "editor.background": "#101010", "terminal.ansiRed": "#FF8080" },
      tokenColors: [
        { scope: ["comment"], settings: { foreground: "#8b8b8b94" } },
        { scope: ["keyword"], settings: { foreground: "#A0A0A0" } },
        { scope: "string", settings: { foreground: "#99FFE4", fontStyle: "italic" } },
        { scope: ["entity.name.function"], settings: { foreground: "#FFC799" } },
        { scope: ["variable"], settings: { foreground: "#FFFF" } },
        { scope: ["markup.inserted"], settings: { foreground: "#116329", background: "#dafbe1" } },
      ],
    };
    const theme = huetShikiTheme({ from: vesper });
    expect(theme.name).toBe("vesper");
    const settings = theme.tokenColors.map((rule) => rule.settings);
    // Grays become roles by how strong they are against the theme's background.
    expect(settings[0].foreground).toBe("var(--huet-code-comment, var(--huet-muted))");
    expect(settings[1].foreground).toBe("var(--huet-code-comment, var(--huet-muted))");
    expect(settings[4].foreground).toBe("var(--huet-code-foreground, var(--huet-foreground))");
    // Colors keep their OKLCH hue and chroma; Huet supplies the lightness.
    // Colors keep their hue and chroma; Huet supplies the CIE lightness.
    const kept = (hex: string, base = "var(--huet-code-lightness, var(--huet-muted))") => {
      const [, C, H] = toLch(hex);
      return expect.stringMatching(new RegExp(`^lch\\(from ${base.replace(/[()]/g, "\\$&")} l (?:${+C.toFixed(2)}|min\\(${+C.toFixed(2)}, [^)]+\\)) ${+H.toFixed(2)}\\)$`));
    };
    expect(settings[2]).toEqual({ foreground: kept("#99FFE4"), fontStyle: "italic" });
    expect(settings[3].foreground).toEqual(kept("#FFC799"));
    expect(settings[5].background).toEqual(kept("#dafbe1", "var(--huet-code-background, var(--huet-background))"));
    expect(theme.tokenColors[2].scope).toBe("string");
    // Terminal colors the theme sets keep their hue too; the rest use Huet's.
    expect(theme.colorReplacements[theme.colors["terminal.ansiRed"]]).toEqual(kept("#FF8080"));
    expect(theme.colorReplacements[theme.colors["terminal.ansiGreen"]]).toBe("var(--huet-code-ansi-green, var(--huet-green))");

    const html = await codeToHtml(`// note\nconst f = () => "hi"`, { lang: "js", theme });
    expect(html).toContain("lch(from var(--huet-code-lightness, var(--huet-muted)) l");
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it("keeps the hues of every theme bundled with Shiki", async () => {
    for (const [name, load] of Object.entries(bundledThemes)) {
      const theme = huetShikiTheme({ from: (await load()).default as ShikiThemeSource });
      const html = await codeToHtml("const a = 'b' // c\n\x1b[31mred\x1b[0m", { lang: "js", theme });
      expect(html, name).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
  });

  it("keeps hue-kept tokens inside sRGB at any text lightness, so clipping can't shift their contrast", () => {
    // Saturated sources at every hue: the sRGB primaries and secondaries, and GitHub's ANSI colors.
    const sources = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#f97583", "#85e89d", "#ffea7f", "#79b8ff", "#b392f0", "#56d4dd", "#ff8800", "#8800ff"];
    const theme = huetShikiTheme({
      from: {
        colors: { "editor.foreground": "#fff", "editor.background": "#000" },
        tokenColors: sources.map((foreground) => ({ scope: foreground, settings: { foreground } })),
      },
    });
    theme.tokenColors.forEach(({ settings }, i) => {
      const match = /^lch\(from .+\)\) l (.+) ([\d.]+)\)$/.exec(settings.foreground!)!;
      expect(match, sources[i]).toBeTruthy();
      const [, chroma, hue] = match;
      for (let L = 15; L <= 85; L += 2.5) {
        // Evaluate the CSS chroma at this lightness: min(C, l * k ± b, …) or C.
        const terms = chroma.replace(/^min\(|\)$/g, "").split(", ").map((term) => {
          const line = /^l \* (-?[\d.]+) ([+-]) ([\d.]+)$/.exec(term);
          return line ? Number(line[1]) * L + (line[2] === "-" ? -1 : 1) * Number(line[3]) : Number(term);
        });
        const C = Math.max(0, Math.min(...terms));
        const rgb = linearRgbFromLch(L, C, Number(hue));
        for (const channel of rgb) {
          expect(channel, `${sources[i]} at L* ${L}`).toBeGreaterThanOrEqual(-0.002);
          expect(channel, `${sources[i]} at L* ${L}`).toBeLessThanOrEqual(1.002);
        }
      }
    });
  });

  it("rejects source colors that can't keep their hue", () => {
    const from = { colors: { "editor.foreground": "#fff", "editor.background": "#000" } };
    expect(() => huetShikiTheme({ from: { ...from, tokenColors: [{ scope: "x", settings: { foreground: "red" } }] } })).toThrow(/tokenColors\[0\]\.foreground is "red".*#rgba/);
    const gray = [{ scope: "x", settings: { foreground: "#777" } }];
    expect(() => huetShikiTheme({ from: { colors: { ...from.colors, "editor.background": "white" }, tokenColors: gray } })).toThrow(/editor\.background is "white"/);
    // Values that don't fix a color pass through, as Shiki writes them.
    expect(huetShikiTheme({ from: { ...from, tokenColors: [{ scope: "x", settings: { foreground: "inherit" } }] } }).tokenColors[0].settings.foreground).toBe("inherit");
  });

  it("gives the pre its background and a Huet surface class", async () => {
    const html = await highlight("x", "js");
    expect(html).toMatch(/^<pre class="shiki huet huet-bg-5"/);
    expect(html).toContain("background-color:var(--huet-code-background, var(--huet-background))");
  });

  it("rejects transformer surfaces that aren't Huet backgrounds", () => {
    // @ts-expect-error: a text class
    expect(() => huetShikiTransformer({ surface: "huet-text-50" })).toThrow(/background class/);
    // @ts-expect-error: variants aren't supported
    expect(() => huetShikiTransformer({ surface: "hover:huet-bg-5" })).toThrow(/background class/);
    // @ts-expect-error: not a Huet class
    expect(() => huetShikiTransformer({ surface: "bg-gray-900" })).toThrow(/background class/);
  });

  it("makes highlighted rows Huet surfaces nested in the block", async () => {
    const code = "a(); // [!code --]\nb(); // [!code ++]\nc(); // [!code highlight]\nd();";
    const render = (options?: Parameters<typeof huetShikiTransformer>[0]) =>
      codeToHtml(code, {
        lang: "js",
        theme: huetShikiTheme(),
        transformers: [transformerNotationDiff(), transformerNotationHighlight(), huetShikiTransformer(options)],
      });
    const rows = (html: string) => [...html.matchAll(/<span class="(line[^"]*)"/g)].map((m) => m[1]);
    expect(rows(await render())).toEqual([
      "line diff remove huet-bg-red-20",
      "line diff add huet-bg-green-20",
      "line highlighted",
      "line",
    ]);
    expect(rows(await render({ surface: "huet-bg-90", lines: { highlighted: "huet-bg-30" } }))[2]).toBe("line highlighted huet-bg-30");
    expect(rows(await render({ lines: false }))).toEqual(["line diff remove", "line diff add", "line highlighted", "line"]);
    // @ts-expect-error: a text class
    expect(() => huetShikiTransformer({ lines: { add: "huet-text-50" } })).toThrow(/lines\.add/);
    // A row matching two mapped classes is ambiguous, so it fails the build.
    await expect(render({ lines: { diff: "huet-bg-10" } })).rejects.toThrow(/more than one row background/);
  });
});

describe("toLch", () => {
  it("matches CSS lch() for sRGB colors (D50)", () => {
    // Reference values from CSS Color 4's conversion code.
    const [L, C, H] = toLch("#ff0000");
    expect(L).toBeCloseTo(54.29, 1);
    expect(C).toBeCloseTo(106.84, 1);
    expect(H).toBeCloseTo(40.85, 1);
    expect(toLch("#ffffff")[0]).toBeCloseTo(100, 2);
    expect(toLch("#777777")[1]).toBeLessThan(0.01);
  });
});
