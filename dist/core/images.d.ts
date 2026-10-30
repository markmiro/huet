import { Palette, RecolorOptions } from './recolor';
import { HuetTheme } from './theme';
export { applyLut, applyTransform, buildLut, coordinatesOf, rampColor, recolorer, toCube, } from './recolor';
export type { Coordinates, Palette, RecolorOptions, Transform } from './recolor';
export { GpuRecolor } from './gpu';
export interface ImageOptions extends RecolorOptions {
    /** Lattice size of the lookup table each theme is baked into. Defaults to 17. */
    lutSize?: number;
    /**
     * `"gpu"` (the default) renders with WebGL2 and falls back to the CPU when
     * WebGL2 isn't available. `"cpu"` always renders on the CPU.
     */
    renderer?: "gpu" | "cpu";
}
/** The ramps of a theme from `createTheme`, in the shape the recolorer reads. */
export declare function paletteOf(theme: HuetTheme | Palette): Palette;
/** True when the `"gpu"` renderer can use WebGL2 in this browser. */
export declare const hasGpu: () => boolean;
type Source = HTMLImageElement | HTMLCanvasElement | ImageBitmap;
/**
 * Draw a decoded image through a theme into a canvas (a new one unless `out`
 * is given), on the GPU when WebGL2 is available unless `renderer: "cpu"`. Cross-origin images need
 * CORS headers and `crossOrigin` set, or the browser refuses to read them.
 */
export declare function recolorImage(source: Source, theme: HuetTheme | Palette, options?: ImageOptions, out?: HTMLCanvasElement): HTMLCanvasElement;
export interface MountImagesOptions extends ImageOptions {
    /** Which images to recolor. Defaults to `img[data-huet-recolor]`. */
    selector?: string;
    /** Show the original image while the pointer is over it. */
    hoverOriginal?: boolean;
}
/**
 * Recolor matching `<img>` elements under `root` into a theme, and keep them
 * recolored as images are added, change `src`, or the theme is updated.
 * Each image's `src` is replaced with a recolored copy; `destroy` restores it.
 * New originals stay hidden until their recolored copy is ready to paint.
 */
export declare function mountImages(root: ParentNode & Node, theme: HuetTheme | Palette, options?: MountImagesOptions): {
    /** Recolor every image into a new theme, optionally with new options. */
    update(next: HuetTheme | Palette, nextOptions?: ImageOptions): void;
    /** Resolves once every image queued so far has been recolored. */
    ready(): Promise<void>;
    destroy(): void;
};
