import { ImageOptions } from './raster';
import { Theme } from './theme';
export { applyLut, applyTransform, buildLut, coordinatesOf, rampColor, recolorer, toCube, } from './recolor';
export type { Coordinates, RecolorOptions, Transform } from './recolor';
export { GpuRecolor } from './gpu';
export { mountSvgs, type MountSvgsOptions } from './svgs';
export { mountVideos, type MountVideosOptions } from './videos';
export { blendLayers, mountIframes, type BlendLayers, type MountIframesOptions } from './iframes';
export type { ImageOptions } from './raster';
/** True when the `"gpu"` renderer can use WebGL2 in this browser. */
export declare const hasGpu: () => boolean;
type Source = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap;
/**
 * Draw a decoded image, or a video's current frame, through a theme into a
 * canvas (a new one unless `out` is given), on the GPU when WebGL2 is
 * available unless `renderer: "cpu"`. Cross-origin sources need CORS headers
 * and `crossOrigin` set, or the browser refuses to read them.
 */
export declare function recolorImage(source: Source, theme: Theme, options?: ImageOptions, out?: HTMLCanvasElement): HTMLCanvasElement;
export interface MountImagesOptions extends ImageOptions {
    /**
     * Which images to recolor. Defaults to `img[data-huet-recolor], [data-huet-recolor] img`:
     * marked images, and every image inside a marked element.
     */
    selector?: string;
    /** Show the original image while the pointer is over it. */
    hoverOriginal?: boolean;
    /**
     * Where Huet can read an image's pixels, given its absolute URL: the URL
     * itself, another one, such as your own origin's proxy for a host without
     * CORS headers, or null when there's no way to read it, which keeps the
     * original. Another URL is fetched with `crossOrigin = "anonymous"`, and the
     * `<img>` keeps its own `src`. Defaults to the URL itself.
     */
    readableUrl?: (src: string) => string | null;
}
/**
 * Recolor matching `<img>` elements under `root` into a theme, and keep them
 * recolored as images are added, change `src`, or the theme is updated.
 * Each image is drawn into a `<canvas>` inserted after it, which takes the
 * image's class and inline style; the `<img>` itself is hidden but left as is.
 * New originals stay hidden until their recolored copy is ready to paint.
 * Theme updates redraw once per frame, and images far outside the viewport
 * are redrawn when they scroll near it. `destroy` removes the canvases.
 *
 * Color functions of a CSS `filter` on the image, such as `grayscale(1)`, are
 * applied before recoloring and lifted from the canvas, since they would
 * otherwise wash out the theme. So are filters on ancestors that wrap only
 * recolored images. A color filter on an ancestor that also shows other
 * content can't be lifted, so it's reported as an error, once per image.
 *
 * A theme `contrast` below 1 fades the recolored copies toward what's behind
 * them, as it fades the page's colors, so at 0 they're gone.
 */
export declare function mountImages(root: ParentNode & Node, theme: Theme, options?: MountImagesOptions): {
    /** Recolor every image into a new theme, optionally with new options. */
    update(next: Theme, nextOptions?: ImageOptions): void;
    /**
     * Resolves once every image queued so far has been recolored, including
     * images outside the viewport, which this draws right away.
     */
    ready(): Promise<void>;
    destroy(): void;
};
