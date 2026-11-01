import chroma from "chroma-js";
import { describe, expect, it } from "vitest";

import { rampThrough } from "./ramp";

const [L, C, H] = [0, 1, 2];
const oklch = (color: string) => chroma(color).oklch();
const near = (a: string, b: string) => chroma.deltaE(a, b) < 1;

describe("rampThrough", () => {
  // Amber's chart palette, given lightest first
  const amber = ["#fcd34d", "#f59e0b", "#d97706", "#b45309", "#92400e"];

  it("runs from dark to light through its colors in lightness order", () => {
    const ramp = rampThrough("#000000", "#ffffff", amber);
    expect(ramp(0)).toBe("#000000");
    expect(ramp(1)).toBe("#ffffff");
    expect(ramp.stops.length).toBe(7);
    [...amber].reverse().forEach((color, i) => expect(near(ramp.stops[i + 1], color)).toBe(true));
    for (const color of amber) expect(near(ramp.at(oklch(color)[L]), color)).toBe(true);
  });

  it("gives any lightness the hue of the nearest colors, and keeps their chroma", () => {
    const ramp = rampThrough("#000000", "#ffffff", ["#fcd34d", "#92400e"]);
    for (const l of [0.2, 0.35, 0.5, 0.65, 0.8, 0.95]) expect(oklch(ramp.at(l))[L]).toBeCloseTo(l, 2);
    // Darker reaches toward brown, lighter toward yellow
    expect(oklch(ramp.at(0.5))[H]).toBeLessThan(oklch(ramp.at(0.85))[H]);
    // Chroma lasts past the darkest color instead of fading straight to black
    expect(oklch(ramp.at(0.3))[C]).toBeGreaterThan(0.05);
  });

  it("clamps to its ends, and skips colors beyond them", () => {
    const ramp = rampThrough("#202020", "#e0e0e0", ["#000000", "#2563eb", "#ffffff"]);
    expect(ramp.stops.length).toBe(3);
    expect(near(ramp.stops[1], "#2563eb")).toBe(true);
    expect(ramp.at(0)).toBe("#202020");
    expect(ramp.at(1)).toBe("#e0e0e0");
  });

  it("is the plain blend of its ends without colors", () => {
    const ramp = rampThrough("#102030", "#f0e0d0");
    expect(near(ramp(0.5), chroma.mix("#102030", "#f0e0d0", 0.5, "oklab").hex())).toBe(true);
  });
});
