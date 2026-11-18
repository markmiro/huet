/**
 * A `unicode-range` for an emoji font's `@font-face` rule, so the font can go
 * first in `font-family` and still draw only emoji:
 *
 *   @font-face {
 *     font-family: "Twemoji";
 *     src: url("/fonts/Twemoji.woff2");
 *     unicode-range: U+200D, U+FE0F, U+20E3, U+231A-23FF, U+2600-27BF, U+2B05-2B55, U+1F000-1FAFF, U+E0020-E007F;
 *   }
 *   body { font-family: "Twemoji", system-ui, sans-serif; }
 *
 * CSS can't read it from JavaScript, so copy the value into your stylesheet,
 * or use this string where you write `@font-face` rules or `FontFace` objects
 * from code.
 *
 * It covers the emoji blocks and the joiners, variation selector and tags
 * that emoji sequences are built from. It leaves out digits, `#` and `*`, and
 * the few emoji that are ordinary text symbols outside those blocks (©, ®, ™,
 * ℹ, ↔, ▶ and the like), so they stay in your text font. Keycaps such as 1️⃣
 * therefore fall back to the system's emoji.
 */
export const emojiRange =
  "U+200D, U+FE0F, U+20E3, U+231A-23FF, U+2600-27BF, U+2B05-2B55, U+1F000-1FAFF, U+E0020-E007F";
