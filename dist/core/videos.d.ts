import { ImageOptions } from './raster';
import { Theme } from './theme';
export interface MountVideosOptions extends Omit<ImageOptions, "renderer"> {
    /**
     * Which videos to recolor. Defaults to `video[data-huet-recolor], [data-huet-recolor] video`:
     * marked videos, and every video inside a marked element.
     */
    selector?: string;
    /** Show the original video, and its native controls, while the pointer is over it. */
    hoverOriginal?: boolean;
    /**
     * Where Huet can read a video's pixels, given its absolute URL: the URL
     * itself, another one, such as your own origin's proxy for a host without
     * CORS headers, or null when there's no way to read it, which keeps the
     * original. When it's another URL, the video switches to it, with
     * `crossOrigin = "anonymous"`, at the same time and play state; it keeps
     * that source after `destroy`, since switching back would load the video
     * again. The poster is read the same way. Defaults to the URL itself.
     */
    readableUrl?: (src: string) => string | null;
}
/**
 * Recolor matching `<video>` elements under `root` into a theme, frame by
 * frame, and keep them recolored as videos are added, change source, or the
 * theme is updated. Each frame goes through the theme's lookup table on the
 * GPU into a `<canvas>` laid over the video's content box, while the video
 * keeps playing, with its sound, underneath. The canvas ignores the pointer,
 * so clicks reach the video. The poster is recolored too, until the video
 * plays.
 *
 * Only videos near the viewport are drawn, once per new frame, and nothing
 * is drawn while a video is hovered with `hoverOriginal`. Paused videos are
 * redrawn when the theme changes or they seek. Without WebGL2, videos keep
 * their colors, since recoloring frames on the CPU can't keep up. Videos
 * that fail to load, or whose pixels can't be read, keep them too; for the
 * second, which needs a fix, Huet raises an error through `reportError`.
 * `destroy` removes the canvases.
 *
 * Like images, a video's pixels are only readable from another origin with
 * CORS headers and a `crossorigin` attribute; `readableUrl` can route it
 * through your own origin instead. A theme `contrast` below 1 doesn't fade
 * videos, since the original is underneath the canvas.
 */
export declare function mountVideos(root: ParentNode & Node, theme: Theme, options?: MountVideosOptions): {
    /** Recolor every video into a new theme, optionally with new options. */
    update(next: Theme, nextOptions?: Omit<ImageOptions, "renderer">): void;
    /**
     * Resolves once every poster queued so far has loaded and every video
     * with a frame or poster to show has been recolored, including videos
     * outside the viewport, which this draws right away. It doesn't wait for
     * videos to load their first frame: wait for their `loadeddata` first.
     */
    ready(): Promise<void>;
    destroy(): void;
};
