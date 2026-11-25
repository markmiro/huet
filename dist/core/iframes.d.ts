import { RecolorOptions } from './recolor';
import { Theme } from './theme';
export interface BlendLayers {
    /** The color of the layer with `mix-blend-mode: multiply`, painted first. */
    multiply: string;
    /** The color of the layer with `mix-blend-mode: screen`, painted over it. */
    screen: string;
}
/**
 * The colors of two blend layers that move black and white to where `theme`
 * puts them, for content Huet can't read, such as another site's iframe.
 * Paint a `multiply` layer of the first color over the content, then a
 * `screen` layer of the second. `mountIframes` does this for you; this is for
 * CSS, including CSS generated at build time.
 *
 * A channel the theme makes darker at white than at black can't be drawn this
 * way, so it stays at the black end's value.
 */
export declare function blendLayers(theme: Theme, options?: Pick<RecolorOptions, "source">): BlendLayers;
export interface MountIframesOptions extends Pick<RecolorOptions, "source"> {
    /**
     * Which iframes to recolor. Defaults to `iframe[data-huet-recolor], [data-huet-recolor] iframe`:
     * marked iframes, and every iframe inside a marked element.
     */
    selector?: string;
    /** Show the original iframe while the pointer is over it, which is also when it's used. */
    hoverOriginal?: boolean;
}
/**
 * Approximate a theme over matching `<iframe>` elements under `root`, with
 * the two blend layers from `blendLayers` laid over each iframe's content
 * box. Black and white land exactly where the theme puts them; midtones and
 * saturated colors only approximately (see `blendLayers`). The layers ignore
 * the pointer, so the iframe stays usable. Iframes added later are picked
 * up, and `destroy` removes the layers.
 *
 * The layers blend with whatever shows through the iframe, so an iframe with
 * a transparent background also shifts the page behind it. A theme
 * `contrast` below 1 doesn't fade iframes.
 */
export declare function mountIframes(root: ParentNode & Node, theme: Theme, options?: MountIframesOptions): {
    /** Move every iframe's layers to a new theme, optionally with new options. */
    update(next: Theme, nextOptions?: Pick<RecolorOptions, "source">): void;
    destroy(): void;
};
