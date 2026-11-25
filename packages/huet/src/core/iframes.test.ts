import { describe, expect, it } from "vitest";
import { blendLayers } from "./iframes";
import { recolorer } from "./recolor";

const channels = (color: string) => color.match(/\d+/g)!.map((v) => Number(v) / 255);
// What the multiply layer, then the screen layer, do to a channel.
const blend = (x: number, multiply: number, screen: number) => 1 - (1 - x * multiply) * (1 - screen);

describe("blendLayers", () => {
  it("lands black and white where the theme puts them", () => {
    const sunset = { neutral: ["#242744", "#ffe173"], colorModel: "hcl" as const };
    const { multiply, screen } = blendLayers(sunset);
    const [m, s] = [channels(multiply), channels(screen)];
    const map = recolorer(sunset);
    for (const x of [0, 1]) {
      const expected = map(x, x, x);
      for (let i = 0; i < 3; i++) expect(blend(x, m[i], s[i])).toBeCloseTo(expected[i], 1);
    }
  });

  it("leave content alone in the default theme and at strength 0", () => {
    const identity = { multiply: "rgb(255 255 255)", screen: "rgb(0 0 0)" };
    expect(blendLayers({ neutral: ["#000000", "#ffffff"] })).toEqual(identity);
    expect(blendLayers({ neutral: ["#242744", "#ffe173"], images: { strength: 0 } })).toEqual(identity);
  });

  it("keep a channel at its black value when white would be darker", () => {
    // Blue falls from black to white here, which multiply and screen can't draw.
    const { multiply, screen } = blendLayers({ neutral: ["#000080", "#ffff00"] });
    const [m, s] = [channels(multiply), channels(screen)];
    expect(m[2]).toBe(0);
    expect(blend(1, m[2], s[2])).toBeCloseTo(s[2]);
  });
});
