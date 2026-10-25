# Color Contrast: relative semantic scaling

The prior implementation is committed at `71f59a1`. This correction changes the legacy `Color.contrast()` signal path used by the Color Contrast demo. Page markup, layout, control labels, and settings are unchanged. The standalone `huet/core` still uses its earlier contrast-target solver; the relative semantic rule is being evaluated in the requested legacy demo first.

## Diagnosis

Two independent problems explain the middle columns:

- A mandatory 4.5:1 target on middle gray leaves almost no room for chroma. Semantic borders/text converge toward black or white.
- Searching a saturated signal ramp at low contrast picks a color near the background's lightness without reducing its chroma. A 12-strength fill can acquire far more than 12% of the intended color.
- The measured-ratio branch bypassed `startSignalLightness` and `endSignalLightness`. Their controls still updated configuration, but that branch did not use it.

The four columns are relative requests 0, 49, 51, and 100, not fixed absolute gray percentages. With the current neutral solver and a white root, the middle backgrounds resolve to `#777777` and `#747474`. Changing the root changes those backgrounds.

## One path, one strength

1. Choose one light/dark direction from the background's contrast against the primary endpoints. All hues share it.
2. Sample each signal ramp at its existing lightness setting. This is the full-strength anchor on the corresponding black/white endpoint.
3. Express that anchor's OKLab lightness distance as a fraction of the primary range. Apply that same fraction to the available distance from the current background toward the chosen endpoint.
4. Retain the anchor's hue/chroma, reducing chroma only to fit sRGB.
5. Interpolate **all three OKLab channels** from the background to that adapted anchor by `strength × contrastMultiplier`.

For example, a 12-strength submit fill travels 12% of the same path whose endpoint supplies the 100-strength border. It no longer jumps to full saturation. At black and white, full strength reproduces the configured anchor exactly for the default palette.

A polarity guard handles unusual custom anchors and rounding without allowing one hue to reverse direction. Identical primary endpoints return the background.

## Existing settings

- **Signal Lightness on 'Black'** (`endSignalLightness`): the ramp position of the full-strength anchor when going lighter.
- **Signal Lightness on 'White'** (`startSignalLightness`): the ramp position of the full-strength anchor when going darker.
- **Contrast**: the distance traveled along the same path.
- The optional old saturation-rescaling flag remains an additional chroma reduction for compatibility. It is not required for gentle fills now.
- Disabling contrast rescaling retains the old unnormalized path.

No additional setting is needed. For a minimal future API, retain color anchors and strength; these two legacy lightness settings are compatibility controls, not a recommendation to add more knobs.

## Tradeoff and evidence

This policy prioritizes recognizable semantic hue and proportional strength. It does **not** guarantee WCAG 4.5:1 for small semantic text or 3:1 for every colored border. At root 100%, measured semantic contrasts in the two middle columns are about **2.81–2.96:1** and **2.48–2.65:1**. Neutral text still uses the existing measured-contrast solver. This is an explicit policy change, not a claim that hue-preserving mid-gray text now satisfies the previous ratio guarantee.

Screenshots use identical 2000px browser viewports and the unmodified four-column form:

| Root background | Before | After |
| --- | --- | --- |
| 100% | [before](screenshots/contrast-100-before.png) | [after](screenshots/contrast-100-after.png) |
| 75% | [before](screenshots/contrast-75-before.png) | [after](screenshots/contrast-75-after.png) |
| 25% | [before](screenshots/contrast-25-before.png) | [after](screenshots/contrast-25-after.png) |
| 0% | [before](screenshots/contrast-0-before.png) | [after](screenshots/contrast-0-after.png) |

The before captures came from an isolated archive of `71f59a1`. [Raw rendered colors and ratios](screenshots/contrast-measurements.json) accompany the after images.

Validation: 31 unit/integration tests, six Chromium browser tests, TypeScript, and the library build pass. Added checks verify hue/chroma in all four form columns at all four root settings, 12% perceptual travel for fills, shared direction on normal/inverted ramps, endpoint preservation, and actual rendered responses to both lightness sliders. The existing tests also verify no validation backgrounds were added.

## Deferred issue

The neutral gray Submit button remains visually uneven in light, middle-gray, and dark modes. This predates the semantic-ramp correction and is intentionally deferred; the next ramp fix must not change the neutral algorithm or demo markup.

## Near-black spacing and monotonic progression checkpoint

The next correction keeps the semantic anchors and OKLab paths, but spaces strength by **proportional contrast**, using `ratio(amount) = ratio(anchor) ** amount`. It finds the closest quantized color on that same path. This supersedes the raw 12% OKLab-distance rule above: small steps on black no longer round almost to black, and zero/full strength remain unchanged. The contrast target is derived from the chosen anchor, not a mandatory accessibility threshold.

The neutral solver now also chooses its direction once per background. Previously it could choose a dark sample for one strength and a light sample for the next. Every increasing-strength sequence now stays on one side and progresses monotonically. This shared algorithm correction also affects neutral submit fills; no button-specific style or tuning was added.

Tests sweep all integer strengths across 101 backgrounds for gray and all five semantic hues, check low-step visibility on black against white, and measure proportional contrast for rendered submit fills. Earlier screenshots above document the prior checkpoint; [the near-black matrix before this correction](screenshots/ramp-black-before.png) records the newly reported failure.

## Neutral overlays on colored background ramps

When the chosen background ramp was colored, requesting the separate gray ramp fell through to the old ramp-sampling code. That immediately discarded the background hue (including at strength zero). The non-root neutral ramp now follows the same proportional-contrast OKLab mixing path as semantic overlays, from the actual background to the selected neutral endpoint. Its light/dark direction is shared with the background's other colors.

Zero strength preserves the exact background; intermediate strengths retain its tint; full strength reaches the neutral endpoint. This does not change the root-ramp solver, semantic signal solver, direct ramps, or page markup. Custom non-root "furthest" ramps follow the same endpoint rule; disabling contrast rescaling retains the legacy behavior.

Coverage checks all five colored background ramps, several ramp positions, monotonic progression, endpoint behavior, and zero global contrast. A browser regression checks the actual gray cells in row 20 for every colored background selection. [Blue-background matrix after the fix](screenshots/ramp-blue-neutral-after.png).
