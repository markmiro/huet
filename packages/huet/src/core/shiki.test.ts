import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";
import { codeToHtml } from "shiki";
import { describe, expect, it } from "vitest";
import { ansiColors, huetShikiTheme, huetShikiTransformer, type AnsiColor } from "./shiki";

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
      expect(theme.colors[`terminal.ansiBright${key}`]).toBe(sentinel);
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
