// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fontPaletteCss } from "./css";
import { mountFonts } from "./dom";

const tinted = { neutral: ["#123456", "#abcdef"] };
const other = { neutral: ["#202020", "#f0e0d0"] };
const font = { family: "Twemoji", colors: ["#000000", "#ffffff", "#dd2e44"] };

const sheets = () => [...document.head.querySelectorAll("style[data-huet-fonts]")];
const makeRoot = () => {
  const root = document.createElement("div");
  document.body.append(root);
  return root;
};
const paletteOf = (root: HTMLElement) => root.style.getPropertyValue("font-palette");

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  for (const sheet of sheets()) sheet.remove();
});

describe("mountFonts", () => {
  it("themes fonts whose palettes are given, right away", () => {
    const root = makeRoot();
    const mount = mountFonts(root, tinted, { fonts: [font, { family: "Nabla", colors: ["#ffd214"] }] });
    const name = paletteOf(root);
    expect(name).toMatch(/^--huet-fonts-\d+$/);
    expect(sheets()).toHaveLength(1);
    expect(sheets()[0].textContent).toBe(
      fontPaletteCss(tinted, font, { name }) + fontPaletteCss(tinted, { family: "Nabla", colors: ["#ffd214"] }, { name }),
    );

    mount.update(other);
    expect(sheets()[0].textContent).toContain("0 #202020, 1 #f0e0d0");
    expect(paletteOf(root)).toBe(name);

    mount.destroy();
    expect(sheets()).toHaveLength(0);
    expect(paletteOf(root)).toBe("");
    expect(() => mount.update(tinted)).toThrow("Cannot update a destroyed Huet font mount");
  });

  it("gives each mount its own palette name, and the document its root element", () => {
    const first = mountFonts(makeRoot(), tinted, { fonts: [font] });
    const second = mountFonts(document, other, { fonts: [font] });
    const names = sheets().map((sheet) => /@font-palette-values (\S+)/.exec(sheet.textContent!)![1]);
    expect(new Set(names).size).toBe(2);
    expect(paletteOf(document.documentElement)).toBe(names[1]);
    first.destroy();
    second.destroy();
    expect(paletteOf(document.documentElement)).toBe("");
  });

  it("leaves the font's own colors at strength 0, and puts the page's font-palette back", () => {
    const root = makeRoot();
    root.style.setProperty("font-palette", "--mine");
    const mount = mountFonts(root, tinted, { fonts: [font], strength: 0 });
    expect(sheets()[0].textContent).toBe("");
    expect(paletteOf(root)).toBe("--mine");

    mount.update(tinted, { strength: 1 });
    expect(paletteOf(root)).toMatch(/^--huet-fonts-\d+$/);
    mount.update(tinted, { strength: 0 });
    expect(paletteOf(root)).toBe("--mine");
    mount.update(tinted, { strength: 1 });
    mount.destroy();
    expect(paletteOf(root)).toBe("--mine");
  });

  it("reads a font's palette from its file", async () => {
    const bytes = readFileSync(join(import.meta.dirname, "fixtures/twemoji-subset.ttf"));
    const fetched: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      fetched.push(url);
      return new Response(bytes);
    });
    const root = makeRoot();
    const mount = mountFonts(root, tinted, { fonts: [{ family: "Twemoji", src: "/fonts/twemoji.ttf" }] });
    // Until the palette is read, the font keeps its own colors.
    expect(paletteOf(root)).toBe("");
    await mount.ready();
    expect(fetched).toEqual([new URL("/fonts/twemoji.ttf", root.baseURI).href]);
    expect(/override-colors: (.*);/.exec(sheets()[0].textContent!)![1].split(", ")).toHaveLength(20);
    expect(paletteOf(root)).toMatch(/^--huet-fonts-\d+$/);
    mount.destroy();
  });

  it("reports a font it can't read, and themes the rest", async () => {
    const errors: Error[] = [];
    vi.stubGlobal("reportError", (error: Error) => errors.push(error));
    vi.stubGlobal("fetch", async () => new Response("missing", { status: 404 }));
    const root = makeRoot();
    const mount = mountFonts(root, tinted, { fonts: [{ family: "Gone", src: "/gone.woff" }, "Undeclared", font] });
    await mount.ready();
    // The undeclared font fails first, since nothing is fetched for it.
    expect(errors.map((error) => error.message).sort()).toEqual([
      expect.stringMatching(/^Huet couldn't theme the font "Gone", so it keeps its own colors: .*\/gone\.woff responded with 404$/),
      expect.stringMatching(/^Huet couldn't theme the font "Undeclared", .* no readable stylesheet has an @font-face rule for it\./),
    ]);
    expect(sheets()[0].textContent).toBe(fontPaletteCss(tinted, font, { name: paletteOf(root) }));
    mount.destroy();
  });

  it("checks the theme and settings when mounting and updating", () => {
    expect(() => mountFonts(makeRoot(), { neutral: ["#000000"] }, { fonts: [font] })).toThrow("Invalid Huet theme");
    expect(() => mountFonts(makeRoot(), tinted, { fonts: [font], strength: 3 })).toThrow("strength must be a number from 0 to 1");
    const root = makeRoot();
    const mount = mountFonts(root, tinted, { fonts: [font] });
    const before = sheets().at(-1)!.textContent;
    expect(() => mount.update(tinted, { tint: 9 })).toThrow("tint must be a number from 0 to 1");
    expect(sheets().at(-1)!.textContent).toBe(before);
    mount.destroy();
  });
});
