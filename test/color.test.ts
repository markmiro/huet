import { describe, expect, it } from "vitest";

import { apca, oklabToRgb, parseColor, rgbToOklab, toCss, toHex, toe, toeInv, wcag } from "../src/color.ts";

describe("color", () => {
  it("parses hex, rgb(), oklch() and oklab()", () => {
    expect(toHex(parseColor("#fff"))).toBe("#ffffff");
    expect(toHex(parseColor("#1e6fd9"))).toBe("#1e6fd9");
    expect(toHex(parseColor("rgb(30 111 217)"))).toBe("#1e6fd9");
    expect(toHex(parseColor("rgb(30, 111, 217)"))).toBe("#1e6fd9");
    expect(parseColor("oklch(0.5 0 0)")[0]).toBeCloseTo(0.5);
    expect(toHex(parseColor(toCss(parseColor("#e13639"))))).toBe("#e13639");
  });

  it("rejects colors it can't read", () => {
    expect(() => parseColor("tomato")).toThrow();
    expect(() => parseColor("#12")).toThrow();
  });

  it("round-trips sRGB through OKLab", () => {
    for (const rgb of [[0, 0, 0], [1, 1, 1], [0.2, 0.5, 0.9], [1, 0, 0]] as const) {
      const back = oklabToRgb(rgbToOklab([...rgb]));
      back.forEach((c, i) => expect(c).toBeCloseTo(rgb[i], 6));
    }
  });

  it("toe is invertible", () => {
    for (const l of [0, 0.1, 0.5, 0.9, 1]) expect(toeInv(toe(l))).toBeCloseTo(l, 9);
  });

  it("matches published contrast values", () => {
    const black = parseColor("#000");
    const white = parseColor("#fff");
    expect(wcag(black, white)).toBeCloseTo(21, 5);
    expect(apca(black, white)).toBeCloseTo(106, 0);
    expect(apca(white, black)).toBeCloseTo(-108, 0);
  });
});
