import { describe, expect, it } from "vitest";
import { recolorer } from "huet/images";
import { fontPaletteCss } from "./css";

const plain = { neutral: ["#000000", "#ffffff"] };
const tinted = { neutral: ["#123456", "#abcdef"] };
const font = { family: "Twemoji", colors: ["#000000", "#ffffff", "#dd2e44", "#ffffff80"] };

const overrides = (css: string) => /override-colors: (.*);/.exec(css)![1].split(", ");

describe("fontPaletteCss", () => {
  it("writes one rule that overrides every palette entry", () => {
    expect(fontPaletteCss(plain, font)).toBe(
      '@font-palette-values --huet-fonts {\n  font-family: "Twemoji";\n  override-colors: 0 #000000, 1 #ffffff, 2 #dd2e44, 3 #ffffff80;\n}\n',
    );
  });

  it("maps colors like image pixels, and keeps alpha", () => {
    const [black, white, red, faded] = overrides(fontPaletteCss(tinted, font));
    // Grays land on the theme's neutral ramp.
    expect(black).toBe("0 #123456");
    expect(white).toBe("1 #abcdef");
    expect(faded).toBe("3 #abcdef80");
    const expected = recolorer(tinted)(0xdd / 255, 0x2e / 255, 0x44 / 255)
      .map((value) => Math.round(value * 255).toString(16).padStart(2, "0"))
      .join("");
    expect(red).toBe(`2 #${expected}`);
    expect(red).not.toBe("2 #dd2e44");
  });

  it("takes its own strength and tint, not the theme's image settings", () => {
    const withImages = { ...tinted, images: { strength: 0 } };
    expect(fontPaletteCss(withImages, font)).toBe(fontPaletteCss(tinted, font));
    expect(fontPaletteCss(tinted, font, { strength: 0 })).toBe("");
    const half = overrides(fontPaletteCss(tinted, font, { strength: 0.5 }))[0];
    expect(half).not.toBe("0 #000000");
    expect(half).not.toBe("0 #123456");
    expect(fontPaletteCss(tinted, font, { tint: 0 })).not.toBe(fontPaletteCss(tinted, font));
  });

  it("names the palette and quotes the family", () => {
    const css = fontPaletteCss(plain, { family: 'My "Emoji"', colors: ["#000000"] }, { name: "--sidebar" });
    expect(css).toContain("@font-palette-values --sidebar {");
    expect(css).toContain('font-family: "My \\"Emoji\\"";');
  });

  it("returns nothing for a font without a palette", () => {
    expect(fontPaletteCss(plain, { family: "Twemoji", colors: [] })).toBe("");
  });

  it("rejects bad input", () => {
    expect(() => fontPaletteCss(plain, font, { name: "huet" })).toThrow("name must be a dashed identifier");
    expect(() => fontPaletteCss(plain, font, { strength: 2 })).toThrow("strength must be a number from 0 to 1, got 2");
    expect(() => fontPaletteCss(plain, font, { tint: -1 })).toThrow("tint must be a number from 0 to 1, got -1");
    expect(() => fontPaletteCss(plain, { family: "Twemoji", colors: ["red"] })).toThrow('palette colors must be #rrggbb or #rrggbbaa');
    expect(() => fontPaletteCss({ neutral: ["#000000"] }, font)).toThrow("Invalid Huet theme");
  });
});
