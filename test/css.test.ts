import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";

import { buildCss } from "../src/static.ts";
import huet from "../src/tailwind.ts";

const twDir = path.dirname(createRequire(import.meta.url).resolve("tailwindcss/package.json"));

async function tailwind(candidates: string[], plugin = `@plugin "huet";`) {
  const compiler = await compile(`@import "tailwindcss/utilities.css"; ${plugin}`, {
    base: process.cwd(),
    loadStylesheet: async (id) => {
      const file = path.join(twDir, id.replace("tailwindcss/", ""));
      return { path: file, base: path.dirname(file), content: fs.readFileSync(file, "utf8") };
    },
    loadModule: async () => ({ path: "", base: "", module: huet }),
  });
  return compiler.build(candidates);
}

const selector = (cls: string) => `.${cls.replace(/[%:/[\]]/g, (c) => `\\${c}`)}`;

describe("tailwind plugin", () => {
  it("generates valid classes", async () => {
    const valid = ["bg-5%", "text-red-100%", "border-neutral-25%", "hue-blue", "placeholder-50%", "divide-10%"];
    const css = await tailwind([...valid, "hover:bg-10%"]);
    for (const cls of valid) expect(css).toContain(selector(cls));
    expect(css).toContain(selector("hover:bg-10%"));
    expect(css).toContain("@property --huet-pos");
  });

  it("ignores invalid classes and arbitrary values", async () => {
    const css = await tailwind(["bg-7%", "bg-pink-10%", "hue-pink", "border-25%/50"]);
    for (const cls of ["bg-7%", "bg-pink-10%", "hue-pink", "border-25%/50"]) {
      expect(css).not.toContain(selector(cls));
    }
    // Arbitrary values stay Tailwind's (background-position, font-size).
    const arbitrary = await tailwind(["bg-[5%]", "text-[5%]"]);
    expect(arbitrary).toMatch(/\.bg-\\\[5\\%\\\] \{\s*background-position: 5%;\s*\}/);
    expect(arbitrary).toMatch(/\.text-\\\[5\\%\\\] \{\s*font-size: 5%;\s*\}/);
  });

  it("takes hues from CSS options", async () => {
    const css = await tailwind(["bg-teal-10%", "bg-red-10%"], `@plugin "huet" { teal: #0f9; bg: 0.2; }`);
    expect(css).toContain(selector("bg-teal-10%"));
    expect(css).not.toContain(selector("bg-red-10%"));
    expect(css).toContain("--huet-bg: 0.2");
  });

  it("adds named themes", async () => {
    const css = await tailwind([], `@plugin "huet" { bg: 1; }`);
    expect(css).not.toContain("[data-theme=");
    const withThemes = buildCss({}, { themes: { night: { bg: 0 } } });
    expect(withThemes).toContain(`[data-theme="night"]`);
  });
});

describe("buildCss", () => {
  const css = buildCss();

  it("contains every class", () => {
    for (const cls of ["bg-0%", "bg-100%", "text-blue-55%", "ring-10%", "hue-purple", "decoration-30%"]) {
      expect(css).toContain(selector(cls));
    }
  });

  it("uses class specificity so resets don't override it", () => {
    expect(css).not.toContain(":where(.bg");
  });

  it("stays small", () => {
    expect(css.length).toBeLessThan(250_000);
  });
});
