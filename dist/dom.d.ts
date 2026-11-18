import { Theme } from 'huet';
import { FontSettings } from './css';
/**
 * A color font to theme. A family name alone finds the font's file through the
 * page's `@font-face` rule and reads its palette. Give `colors` (from
 * `readFontPalette`, or `npx huet-emoji palette`) to skip the read, or `src`
 * when no readable stylesheet declares the font.
 */
export type FontSource = string | {
    /** The `font-family` name the page's `@font-face` rule gives the font. */
    family: string;
    /** The font's palette, when you have read it ahead of time. */
    colors?: readonly string[];
    /** The font file to read the palette from, instead of looking up `@font-face`. */
    src?: string;
    /** Which of the font's palettes to read. Defaults to 0. */
    palette?: number;
};
export interface MountFontsOptions extends FontSettings {
    /** The color fonts to theme: your emoji font, and any other COLR font. */
    fonts: readonly FontSource[];
}
/**
 * Theme color fonts under `root`: emoji from a COLR emoji font such as
 * Twemoji, and any other COLR font. Each font's palette is mapped into the
 * theme, like an inline SVG's fills, and applied with `@font-palette-values`,
 * so the text stays text: selectable, with no wrappers or images. `root` gets
 * an inline `font-palette`, which text inside it inherits.
 *
 * The page loads the fonts itself, with `@font-face`. For emoji, put the emoji
 * font first in `font-family` and limit it with `unicode-range` (see
 * `emojiRange`), so it draws only emoji.
 *
 * A font given without `colors` is fetched to read its palette, and takes the
 * theme once that's done; until then it shows its own colors. A font that
 * can't be read keeps its own colors and is reported as an error. `ready`
 * resolves when every font has been themed or reported.
 */
export declare function mountFonts(root: HTMLElement | Document, theme: Theme, options: MountFontsOptions): {
    /** Repaint every font in a new theme, optionally with new strength and tint. */
    update(next: Theme, nextSettings?: FontSettings): void;
    /** Resolves once every font's palette has been read and themed, or reported as unreadable. */
    ready(): Promise<void>;
    /** Remove the palettes and put back the root's own `font-palette`. */
    destroy(): void;
};
