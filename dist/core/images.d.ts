import { RecolorOptions } from './recolor';
import { Theme } from './theme';
export { applyLut, applyTransform, buildLut, coordinatesOf, rampColor, recolorer, toCube, } from './recolor';
export type { Coordinates, RecolorOptions, Transform } from './recolor';
export { GpuRecolor } from './gpu';
export { mountSvgs, type MountSvgsOptions } from './svgs';
export interface ImageOptions extends RecolorOptions {
    /** Lattice size of the lookup table each theme is baked into. Defaults to 17. */
    lutSize?: number;
    /**
     * `"gpu"` (the default) renders with WebGL2 and falls back to the CPU when
     * WebGL2 isn't available. `"cpu"` always renders on the CPU.
     */
    renderer?: "gpu" | "cpu";
}
/** True when the `"gpu"` renderer can use WebGL2 in this browser. */
export declare const hasGpu: () => boolean;
type Source = HTMLImageElement | HTMLCanvasElement | ImageBitmap;
/**
 * Draw a decoded image through a theme into a canvas (a new one unless `out`
 * is given), on the GPU when WebGL2 is available unless `renderer: "cpu"`. Cross-origin images need
 * CORS headers and `crossOrigin` set, or the browser refuses to read them.
 */
export declare function recolorImage(source: Source, theme: Theme, options?: ImageOptions, out?: HTMLCanvasElement): HTMLCanvasElement;
export interface MountImagesOptions extends ImageOptions {
    /** Which images to recolor. Defaults to `img[data-huet-recolor]`. */
    selector?: string;
    /** Show the original image while the pointer is over it. */
    hoverOriginal?: boolean;
}
/**
 * Recolor matching `<img>` elements under `root` into a theme, and keep them
 * recolored as images are added, change `src`, or the theme is updated.
 * Each image is drawn into a `<canvas>` inserted after it, which takes the
 * image's class and inline style; the `<img>` itself is hidden but left as is.
 * New originals stay hidden until their recolored copy is ready to paint.
 * Theme updates redraw once per frame, and images far outside the viewport
 * are redrawn when they scroll near it. `destroy` removes the canvases.
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
