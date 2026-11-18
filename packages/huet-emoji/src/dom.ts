import type { Theme } from "huet";
import { fontPaletteCss, paletteMapper, type FontSettings } from "./css";
import { canDecompress, readFontPalette } from "./palette";

/**
 * A color font to theme. A family name alone finds the font's file through the
 * page's `@font-face` rule and reads its palette. Give `colors` (from
 * `readFontPalette`, or `npx huet-emoji palette`) to skip the read, or `src`
 * when no readable stylesheet declares the font.
 */
export type FontSource =
  | string
  | {
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

const familyOf = (name: string) => name.trim().replace(/^(["'])(.*)\1$/, "$2").toLowerCase();

/** The `url()` sources of each `@font-face` rule for a family, in the order the rule lists them. */
function facesOf(scope: Document | ShadowRoot, family: string, base: string) {
  const wanted = familyOf(family);
  const faces: { url: string; hint: string }[][] = [];
  const visit = (rules: CSSRuleList, href: string) => {
    for (const rule of rules) {
      if (rule instanceof CSSFontFaceRule) {
        if (familyOf(rule.style.getPropertyValue("font-family")) !== wanted) continue;
        const sources: { url: string; hint: string }[] = [];
        // Each source is a url() and whatever follows it up to the comma: format() and tech() hints.
        for (const [, double, single, bare, hint] of rule.style
          .getPropertyValue("src")
          .matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)([^,]*)/g))
          sources.push({ url: new URL(double ?? single ?? bare, href).href, hint });
        if (sources.length) faces.push(sources);
      } else if ("cssRules" in rule) visit((rule as CSSGroupingRule).cssRules, href);
    }
  };
  for (const sheet of [...scope.styleSheets, ...(scope.adoptedStyleSheets ?? [])]) {
    try {
      visit(sheet.cssRules, sheet.href ?? base);
    } catch {
      // Cross-origin sheets can't be read.
    }
  }
  return faces;
}

let mounts = 0;

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
export function mountFonts(root: HTMLElement | Document, theme: Theme, options: MountFontsOptions) {
  const { fonts, ...rest } = options;
  const element = "documentElement" in root ? root.documentElement : root;
  const scope = element.getRootNode() as Document | ShadowRoot;
  const inShadow = "host" in scope;
  const name = `--huet-fonts-${++mounts}`;
  let target = theme,
    settings: FontSettings = rest,
    disposed = false;
  // Check the theme and settings now, so bad ones throw here rather than when a font loads.
  paletteMapper(theme, settings);

  const sheet = element.ownerDocument.createElement("style");
  sheet.setAttribute("data-huet-fonts", "");
  (inShadow ? scope : element.ownerDocument.head).append(sheet);
  const saved = [element.style.getPropertyValue("font-palette"), element.style.getPropertyPriority("font-palette")];
  /** Palettes by family, once they're known. */
  const palettes = new Map<string, readonly string[]>();

  const restore = () => {
    if (element.style.getPropertyValue("font-palette") !== name) return;
    if (saved[0]) element.style.setProperty("font-palette", saved[0], saved[1]);
    else element.style.removeProperty("font-palette");
  };
  const render = () => {
    if (disposed) return;
    sheet.textContent = [...palettes]
      .map(([family, colors]) => fontPaletteCss(target, { family, colors }, { ...settings, name }))
      .join("");
    if (sheet.textContent) element.style.setProperty("font-palette", name);
    else restore();
  };

  const read = async (url: string, palette?: number) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} responded with ${response.status}`);
    return readFontPalette(await response.arrayBuffer(), { palette });
  };
  /** One face's palette, from the first of its sources this browser can read. */
  const readFace = async (sources: { url: string; hint: string }[], palette?: number) => {
    const isWoff2 = ({ url, hint }: { url: string; hint: string }) =>
      /woff2/i.test(hint) || /\.woff2$/i.test(new URL(url).pathname);
    const readable = canDecompress("brotli") ? sources : sources.filter((source) => !isWoff2(source));
    if (!readable.length)
      throw new Error(
        "this browser can't read WOFF2 files from a script. Add a WOFF or TTF source to its @font-face rule, " +
          "or pass its palette as `colors` (from `npx huet-emoji palette <font file>`).",
      );
    let failure: unknown;
    for (const { url } of readable) {
      try {
        return await read(url, palette);
      } catch (error) {
        failure = error;
      }
    }
    throw failure;
  };
  const load = async (family: string, src?: string, palette?: number) => {
    if (src) return read(new URL(src, element.baseURI).href, palette);
    const faces = facesOf(scope, family, element.baseURI);
    if (inShadow) faces.push(...facesOf(element.ownerDocument, family, element.baseURI));
    if (!faces.length)
      throw new Error("no readable stylesheet has an @font-face rule for it. Pass its file as `src`, or its palette as `colors`.");
    // Weights and styles often share one file.
    const unique = [...new Map(faces.map((sources) => [sources.map(({ url }) => url).join(" "), sources])).values()];
    const found = await Promise.all(unique.map((sources) => readFace(sources, palette)));
    if (found.some((colors) => colors.join() !== found[0].join()))
      throw new Error(
        "its @font-face rules load files with different palettes, and a palette applies to the whole family. " +
          "Give each file its own font-family name.",
      );
    return found[0];
  };

  const pending: Promise<void>[] = [];
  for (const font of fonts) {
    const { family, colors, src, palette } = typeof font === "string" ? ({ family: font } as Exclude<FontSource, string>) : font;
    if (colors) {
      palettes.set(family, colors);
      continue;
    }
    // Keep the order the fonts were given in, whichever loads first.
    palettes.set(family, []);
    pending.push(
      load(family, src, palette).then(
        (colors) => {
          palettes.set(family, colors);
          render();
        },
        (error: unknown) => {
          palettes.delete(family);
          reportError(
            new Error(
              `Huet couldn't theme the font "${family}", so it keeps its own colors: ${error instanceof Error ? error.message : String(error)}`,
              { cause: error },
            ),
          );
        },
      ),
    );
  }
  render();

  return {
    /** Repaint every font in a new theme, optionally with new strength and tint. */
    update(next: Theme, nextSettings?: FontSettings) {
      if (disposed) throw new Error("Cannot update a destroyed Huet font mount");
      paletteMapper(next, nextSettings ?? settings);
      target = next;
      if (nextSettings) settings = nextSettings;
      render();
    },
    /** Resolves once every font's palette has been read and themed, or reported as unreadable. */
    async ready() {
      await Promise.all(pending);
    },
    /** Remove the palettes and put back the root's own `font-palette`. */
    destroy() {
      if (disposed) return;
      disposed = true;
      sheet.remove();
      restore();
    },
  };
}
