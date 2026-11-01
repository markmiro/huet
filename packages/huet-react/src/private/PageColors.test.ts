import chroma from "chroma-js";
import { describe, expect, it } from "vitest";

import { reshape } from "./PageColors";

const [L, C, H] = [0, 1, 2];
const oklch = (color: string) => chroma(color).oklch();

describe("reshape", () => {
  // Amber's chart palette: yellow at the light end, brown at the dark end
  const amber = ["#fcd34d", "#f59e0b", "#d97706", "#b45309", "#92400e"];

  it("turns every color of a palette by the middle color's change, keeping lightness and spread", () => {
    const middle = "#d97706";
    const [, , fromH] = oklch(middle);
    const to = chroma.oklch(oklch(middle)[L], oklch(middle)[C], fromH + 120).hex();
    const turned = reshape(amber, to);
    turned.forEach((color, i) => {
      expect(oklch(color)[L]).toBeCloseTo(oklch(amber[i])[L], 2);
      expect(((oklch(color)[H] - oklch(amber[i])[H] + 360) % 360)).toBeCloseTo(120, -1);
    });
    expect(chroma.deltaE(turned[2], to)).toBeLessThan(2);
  });

  it("gives a gray palette the picked hue and chroma", () => {
    const gray = ["#e5e5e5", "#a3a3a3", "#737373", "#525252", "#262626"];
    for (const color of reshape(gray, "#2563eb")) {
      expect(oklch(color)[H]).toBeCloseTo(oklch("#2563eb")[H], -1);
      expect(oklch(color)[C]).toBeGreaterThan(0.03);
    }
  });

  it("replaces a single color", () => {
    expect(reshape(["#737373"], "#2563eb")).toEqual(["#2563eb"]);
  });
});
