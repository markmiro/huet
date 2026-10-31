import { describe, it, expect } from "vitest";
import { recolorer } from "./images";

describe("image themes", () => {
  it("are the same Theme the rest of Huet takes", () => {
    const theme = { neutral: ["#233b91", "#fffaf0"], colors: { red: "#ff0000" } };
    // Contrast only scales UI colors, so images ignore it.
    const [a, b] = [recolorer(theme), recolorer({ ...theme, contrast: 0.5 })];
    for (const rgb of [[0.2, 0.4, 0.6], [0.9, 0.1, 0.1], [0.5, 0.5, 0.5]] as [number, number, number][])
      expect(a(...rgb)).toEqual(b(...rgb));
  });

  it("reject the old palette shape with a pointer to the new one", () => {
    // @ts-expect-error: dark/light palettes are now { neutral: [dark, light] }
    expect(() => recolorer({ dark: "#111111", light: "#ffffff" })).toThrow(/unknown fields dark, light/);
  });
});
