import { RecolorOptions } from './recolor';
import { Theme } from './theme';
export interface MountSvgsOptions extends RecolorOptions {
    /** Which SVG elements to recolor, with everything inside them. Defaults to `svg[data-huet-recolor]`. */
    selector?: string;
}
/**
 * Recolor matching inline SVGs under `root` into a theme, keeping them as
 * vectors, with the theme's `svgs` settings. At strength 0 they keep their
 * own paints. Solid fills, strokes, and gradient stops are mapped like image
 * pixels, including SVG's implicit black fill; their alpha, `none`, paint
 * servers (`url(#…)`), and opacity are kept. Paints that use `currentColor`
 * or a CSS variable are left alone, since the page's CSS already themes them.
 *
 * Mapped paints are written where the original came from: presentation
 * attributes (`fill="…"`) for attribute and default paints, so the page's CSS
 * rules, `:hover` included, still outrank them; and inline styles for paints
 * set by CSS. They go on the SVG, on each element that declares its own paint,
 * and on gradient stops. Children that inherit a paint follow their parent. Every theme update maps the original
 * paints, never the previous theme's. SVGs that are added later, or whose
 * paints change, are recolored at the next frame; removed or opted-out SVGs,
 * and every SVG on `destroy`, get their own inline styles back.
 *
 * To tell CSS-driven paints apart, stylesheet rules are matched in document
 * order, with `!important` first; specificity and layers aren't compared, and
 * cross-origin stylesheets can't be read.
 */
export declare function mountSvgs(root: ParentNode & Node, theme: Theme, options?: MountSvgsOptions): {
    /** Recolor every SVG into a new theme, optionally with new options, at the next frame. */
    update(next: Theme, nextOptions?: RecolorOptions): void;
    /** Resolves once pending updates and DOM changes are recolored, without waiting for a frame. */
    ready(): Promise<void>;
    destroy(): void;
};
