import { describe, it, expect } from "vitest";
import { createTheme } from "./theme";
import { paletteOf, recolorer } from "./images";

describe("paletteOf", () => {
  it("reads a dark/light theme as the same palette", () => {
    const options = { dark: "#233b91", light: "#fffaf0", colors: { red: "#ff0000" } };
    const palette = paletteOf(createTheme(options));
    expect(palette).toEqual({ ...options, colors: expect.objectContaining(options.colors) });
    const [a, b] = [recolorer(palette), recolorer(options)];
    for (const rgb of [[0.2, 0.4, 0.6], [0.9, 0.1, 0.1], [0.5, 0.5, 0.5]] as [number, number, number][])
      expect(a(...rgb)).toEqual(b(...rgb));
  });

  it("keeps multi-stop and hue-based neutral ramps", () => {
    const neutral = { colors: ["#040816", "#ffb980", "#ffffff"], colorModel: "hcl" as const };
    expect(paletteOf(createTheme({ neutral })).neutral).toEqual(neutral);
  });

  it("passes palettes through", () => {
    const palette = { dark: "#111111" };
    expect(paletteOf(palette)).toBe(palette);
  });
});
