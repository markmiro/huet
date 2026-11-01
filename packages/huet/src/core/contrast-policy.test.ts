import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

/*
  Huet measures contrast with APCA (roles: text, muted, borders) and CIE L*
  (explicit strengths and small fill steps), never the WCAG 2 ratio
  (L1 + 0.05) / (L2 + 0.05). See docs/color-contrast.md#apca-roles-and-l-strengths.
  The ratio is one import away (chroma.contrast), so this fails `pnpm test`,
  and CI, wherever code computes it.
*/

const root = new URL("../../../../", import.meta.url);
const code = /\.(?:[cm]?[jt]sx?|astro|patch)$|(?:^|\/)package\.json$/;
const self = "packages/huet/src/core/contrast-policy.test.ts";

const banned: [RegExp, string][] = [
  [/\+\s*0?\.05\s*\)\s*\/\s*\(/, "the WCAG 2 ratio formula, (L1 + 0.05) / (L2 + 0.05)"],
  [/\bchroma\s*\.\s*contrast\s*\(/, "chroma.contrast(), a WCAG 2 ratio"],
  [/\b(?:wcagContrast|contrastRatio|getContrastRatio)\b|\breadability\s*\(/, "a WCAG 2 ratio helper"],
  [/wcag/i, "WCAG (contrast here is APCA or CIE L*; call luminance \"relative luminance\")"],
];

/** Each line of `text` that measures contrast the WCAG 2 way, with why. */
function findWcag(text: string) {
  const hits: string[] = [];
  text.split("\n").forEach((line, index) => {
    for (const [pattern, why] of banned)
      if (pattern.test(line)) {
        hits.push(`${index + 1}: ${why}\n    ${line.trim()}`);
        break;
      }
  });
  return hits;
}

describe("findWcag", () => {
  test.each([
    "return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);",
    "const ratio = (l1 + .05)/(l2 + .05)",
    "if (chroma.contrast(color, card) >= 1.25) return color",
    'import { wcagContrast } from "culori"',
    "tinycolor.readability(a, b)",
    '"wcag-contrast": "^3.0.0",',
  ])("flags %s", (line) => expect(findWcag(line)).toHaveLength(1));

  test.each([
    "const lc = contrast(background, color)",
    "return Math.abs(apca(color, background))",
    "const distance = Math.abs(lightness(a) - lightness(b))",
    "return 0.2126 * r + 0.7152 * g + 0.0722 * b;",
    "const sum = a + 0.05 * b",
  ])("allows %s", (line) => expect(findWcag(line)).toEqual([]));
});

test("no tracked code measures contrast with WCAG 2", () => {
  const files = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter((file) => code.test(file) && file !== self);
  expect(files.length).toBeGreaterThan(50);
  const found = files.flatMap((file) =>
    findWcag(readFileSync(new URL(file, root), "utf8")).map((hit) => `${file}:${hit}`),
  );
  expect(
    found,
    "Huet measures contrast with APCA for roles (`contrast` in huet/internal) and CIE L* for " +
      "strengths and fill steps (`lightness`), not WCAG 2 ratios. " +
      "See docs/color-contrast.md#apca-roles-and-l-strengths.",
  ).toEqual([]);
});
