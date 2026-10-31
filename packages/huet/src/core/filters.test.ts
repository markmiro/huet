import { describe, it, expect } from "vitest";
import { changesColor, colorFilter } from "./filters";

// What Chromium paints for these filters over solid backgrounds, read back from screenshots.
const measured: [string, [number, number, number], [number, number, number]][] = [
  ["grayscale(1)", [200, 50, 50], [82, 82, 82]],
  ["grayscale(1)", [240, 220, 40], [211, 211, 211]],
  ["grayscale(0.4)", [30, 160, 90], [69, 147, 105]],
  ["sepia(1)", [200, 50, 50], [127, 113, 88]],
  ["saturate(3)", [30, 160, 90], [0, 225, 15]],
  ["hue-rotate(90deg)", [200, 50, 50], [50, 103, 0]],
  ["hue-rotate(90deg)", [30, 160, 90], [90, 128, 225]],
  ["invert(0.3)", [200, 50, 50], [156, 96, 96]],
  ["brightness(0.2)", [240, 220, 40], [48, 44, 8]],
  ["contrast(1.5)", [200, 50, 50], [236, 11, 11]],
  ["brightness(0.2) grayscale(1)", [30, 160, 90], [25, 25, 25]],
];

describe("colorFilter", () => {
  it("matches what the browser paints, in sRGB", () => {
    for (const [filter, input, output] of measured) {
      const { apply } = colorFilter(filter);
      const result = apply!(...(input.map((v) => v / 255) as [number, number, number])).map((v) => v * 255);
      result.forEach((v, i) => expect(Math.abs(v - output[i]), `${filter} on ${input}`).toBeLessThanOrEqual(1));
    }
  });

  it("keeps the functions that don't recolor, in order", () => {
    const filter = 'blur(2px) grayscale(1) drop-shadow(rgb(0, 0, 0) 1px 2px 3px) opacity(0.5) url("#goo")';
    expect(colorFilter(filter).rest).toBe('blur(2px) drop-shadow(rgb(0, 0, 0) 1px 2px 3px) opacity(0.5) url("#goo")');
    expect(colorFilter("grayscale(1)").rest).toBe("none");
    expect(colorFilter("blur(2px)").apply).toBeNull();
  });

  it("reads percentages, angle units, and default amounts", () => {
    const at = (filter: string) => colorFilter(filter).apply!(0.8, 0.2, 0.2);
    expect(at("grayscale(100%)")).toEqual(at("grayscale(1)"));
    expect(at("grayscale()")).toEqual(at("grayscale(1)"));
    expect(at("hue-rotate(0.25turn)")).toEqual(at("hue-rotate(90deg)"));
    at("hue-rotate(1.5708rad)").forEach((v, i) => expect(v).toBeCloseTo(at("hue-rotate(90deg)")[i], 4));
    // Amounts above 1 are clamped for grayscale, sepia, and invert.
    expect(at("grayscale(3)")).toEqual(at("grayscale(1)"));
  });

  it("tells color filters from blurs, shadows, and fades", () => {
    expect(changesColor("none")).toBe(false);
    expect(changesColor("blur(4px) opacity(0.5)")).toBe(false);
    // A shadow's color is an argument, not a color function.
    expect(changesColor("drop-shadow(rgb(255, 0, 0) 0px 0px 2px)")).toBe(false);
    expect(changesColor("blur(4px) grayscale(1)")).toBe(true);
  });
});
