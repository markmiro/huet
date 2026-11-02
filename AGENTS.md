# Agent notes

## Contrast: APCA and L\*, never WCAG

Huet doesn't use WCAG contrast, in code, tests or docs. Don't add it back.

- **Readability uses APCA.** Use `apca()` / `contrast()` from `packages/huet/src/core/color.ts`, which return lightness contrast (Lc). Preset roles aim for Lc 90 (foreground), 60 (muted) and 30 (border). See [APCA roles and L\* strengths](docs/color-contrast.md#apca-roles-and-l-strengths).
- **Strengths and spacing use CIE L\*.** Use `lightness()`, or `toLch()` for exact L\*.
- **No contrast ratios.** Don't write `(L1 + 0.05) / (L2 + 0.05)`, "4.5:1", "AA" or "AAA", or cite WCAG, as a target, a test assertion or a measurement in docs. Write Lc values instead, such as "Lc 60".
- `luminance()` (sRGB relative luminance) is fine for ordering colors and picking a side. Don't build a ratio from it.
- Huet makes no conformance claim: Lc values are design targets.
