import { overlay, type Overlay } from "./overlay";
import { gpuRecolor, lutFor, type ImageOptions } from "./raster";
import type { Theme } from "./theme";

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

interface Entry {
  canvas: HTMLCanvasElement;
  layer: Overlay;
  /** Within half a screen of the viewport, where frames are drawn. */
  near: boolean;
  hovering: boolean;
  /** The canvas holds a recolored frame or poster. */
  ready: boolean;
  failed: boolean;
  /** The theme version the canvas was last drawn with. */
  drawn: number;
  /** Whether the video has left its poster, by playing or seeking. */
  played: boolean;
  /** The decoded poster, once it's loaded. */
  poster?: HTMLImageElement;
  /** The poster is loading, and the video is hidden until it's drawn. */
  waiting: boolean;
  /** The source this mount switched the video to, through `readableUrl`. */
  rewritten?: { from: string; to: string };
  /** The original source this mount went back to, after the readable one failed. */
  reverted?: string;
  /** The pending frame callback, and how to cancel it. */
  frame?: () => void;
  generation: number;
  /** The video's inline `visibility`, to put back. */
  saved?: [string, string];
  /** Errors reported for this video, so each is reported once. */
  reported: Set<string>;
  listeners: [EventTarget, string, EventListener, boolean?][];
}

const sourceOf = (video: HTMLVideoElement) => {
  const src =
    video.currentSrc ||
    video.getAttribute("src") ||
    video.querySelector("source[src]")?.getAttribute("src");
  return src ? new URL(src, document.baseURI).href : "";
};

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
export function mountVideos(
  root: ParentNode & Node,
  theme: Theme,
  options: MountVideosOptions = {},
) {
  const {
    selector = "video[data-huet-recolor], [data-huet-recolor] video",
    hoverOriginal = false,
    readableUrl,
    ...recolor
  } = options;
  let target = theme,
    settings: ImageOptions = recolor,
    version = 0,
    frame: number | undefined,
    disposed = false;
  const entries = new Map<HTMLVideoElement, Entry>();
  let pending = new Set<Promise<void>>();
  // The table for the current version, looked up once rather than every frame.
  let lut: { version: number; table: Float32Array } | undefined;
  const table = () => {
    if (lut?.version !== version) lut = { version, table: lutFor(target, settings) };
    return lut.table;
  };

  const report = (video: HTMLVideoElement, entry: Entry, message: string) => {
    if (entry.reported.has(message)) return;
    entry.reported.add(message);
    reportError(new Error(message, { cause: video }));
  };
  /** Hide the video while waiting, show the canvas once it's ready, and mark the video. */
  const present = (video: HTMLVideoElement, entry: Entry) => {
    const shown = entry.ready && !entry.failed && !entry.hovering;
    entry.canvas.style.visibility = shown ? "" : "hidden";
    if (entry.failed) entry.layer.detach();
    else if (!entry.canvas.isConnected) entry.layer.attach();
    if (entry.waiting && !entry.failed) {
      entry.saved ??= [video.style.getPropertyValue("visibility"), video.style.getPropertyPriority("visibility")];
      video.style.setProperty("visibility", "hidden", "important");
    } else if (entry.saved) {
      const [value, priority] = entry.saved;
      if (value) video.style.setProperty("visibility", value, priority);
      else video.style.removeProperty("visibility");
      entry.saved = undefined;
    }
    if (entry.failed) video.setAttribute("data-huet-recolored", "original");
    else if (entry.ready) video.setAttribute("data-huet-recolored", "");
    else video.removeAttribute("data-huet-recolored");
  };

  const stop = (entry: Entry) => {
    entry.frame?.();
    entry.frame = undefined;
  };
  /** Keep the original, as for a video that won't load or can't be read. */
  const giveUp = (video: HTMLVideoElement, entry: Entry, message?: string) => {
    stop(entry);
    entry.failed = true;
    entry.waiting = false;
    present(video, entry);
    if (message) report(video, entry, message);
  };

  /** The poster shows until the video plays or seeks, or while it has no frame. */
  const showsPoster = (video: HTMLVideoElement, entry: Entry) =>
    !!entry.poster && (!entry.played || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA);

  const draw = (video: HTMLVideoElement, entry: Entry) => {
    if (entry.failed || entry.hovering || disposed) return;
    const poster = showsPoster(video, entry);
    if (!poster && video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    const source = poster ? entry.poster! : video;
    const [width, height] = poster
      ? [entry.poster!.naturalWidth, entry.poster!.naturalHeight]
      : [video.videoWidth, video.videoHeight];
    if (!width || !height) return;
    // Draw at the size the video is shown at, never larger than the source.
    const { layer } = entry;
    const shown = Math.max((layer.width * devicePixelRatio) / width, (layer.height * devicePixelRatio) / height);
    const scale = shown > 0 ? Math.min(1, shown) : 1;
    const renderer = gpuRecolor()!;
    try {
      renderer.setLut(table(), settings.lutSize ?? 17);
      renderer.render(source, entry.canvas, Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)));
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "SecurityError")) throw error;
      const src = poster ? entry.poster!.src : sourceOf(video);
      return giveUp(
        video,
        entry,
        `Huet can't read the pixels of the video${poster ? " poster" : ""} at ${src}, since it's from another origin. ` +
          `Serve it with CORS headers and add crossorigin="anonymous" to the <video>, ` +
          `or pass readableUrl to mountVideos to load it through your own origin.`,
      );
    }
    entry.drawn = version;
    const changed = !entry.ready || entry.waiting;
    entry.ready = true;
    entry.waiting = false;
    if (changed) present(video, entry);
  };

  /** Draw each new frame while the video is near the viewport and not hovered. */
  const loop = (video: HTMLVideoElement, entry: Entry) => {
    if (entry.frame || !entry.near || entry.hovering || entry.failed) return;
    if ("requestVideoFrameCallback" in video) {
      let id = 0;
      const tick = () => {
        id = video.requestVideoFrameCallback(tick);
        draw(video, entry);
      };
      id = video.requestVideoFrameCallback(tick);
      entry.frame = () => video.cancelVideoFrameCallback(id);
    } else {
      // Without frame callbacks, check each animation frame for a new one.
      const element: HTMLVideoElement = video;
      let id = 0,
        last = -1;
      const tick = () => {
        id = requestAnimationFrame(tick);
        if (element.currentTime !== last) {
          last = element.currentTime;
          draw(element, entry);
        }
      };
      id = requestAnimationFrame(tick);
      entry.frame = () => cancelAnimationFrame(id);
    }
  };

  const stale = (entry: Entry) => !entry.failed && entry.drawn !== version;
  /** Redraw stale videos near the viewport, or every stale video with `all`. */
  const flush = (all = false) => {
    frame = undefined;
    for (const [video, entry] of entries) if (stale(entry) && (all || entry.near)) draw(video, entry);
  };
  const schedule = () => {
    if (disposed || frame !== undefined) return;
    frame = requestAnimationFrame(() => flush());
  };

  const visibility = new IntersectionObserver(
    (records) => {
      for (const { target: element, isIntersecting } of records) {
        const video = element as HTMLVideoElement;
        const entry = entries.get(video);
        if (!entry) continue;
        entry.near = isIntersecting;
        if (isIntersecting) {
          entry.layer.place();
          draw(video, entry);
          loop(video, entry);
        } else stop(entry);
      }
    },
    { rootMargin: "50% 0px" },
  );

  const track = (promise: Promise<void>) => {
    pending.add(promise);
    void promise.finally(() => pending.delete(promise));
  };

  /** Switch the video to a source Huet can read, keeping its place. */
  const switchSource = (video: HTMLVideoElement, entry: Entry, from: string, to: string) => {
    const { currentTime, paused } = video;
    entry.rewritten = { from, to };
    video.crossOrigin = "anonymous";
    video.src = to;
    if (currentTime || !paused) {
      const resume = () => {
        if (currentTime) video.currentTime = currentTime;
        if (!paused) video.play().catch(() => {});
      };
      video.addEventListener("loadedmetadata", resume, { once: true });
    }
  };

  /** Load and decode the poster, then draw it if the video hasn't played. */
  const loadPoster = (video: HTMLVideoElement, entry: Entry, current: number) => {
    const attribute = video.getAttribute("poster");
    if (!attribute) return;
    const src = new URL(attribute, document.baseURI).href;
    const url = readableUrl ? readableUrl(src) : src;
    if (!url) return;
    const image = new Image();
    image.crossOrigin = url === src ? video.crossOrigin : "anonymous";
    image.src = url;
    entry.waiting = !entry.played;
    present(video, entry);
    track(
      image.decode().then(
        () => {
          if (entries.get(video) !== entry || current !== entry.generation) return;
          entry.poster = image;
          entry.drawn = -1;
          draw(video, entry);
          if (entry.waiting) {
            // Nothing to draw yet, e.g. the video isn't laid out; show it as it is.
            entry.waiting = false;
            present(video, entry);
          }
        },
        () => {
          if (entries.get(video) !== entry || current !== entry.generation) return;
          entry.waiting = false;
          present(video, entry);
          report(video, entry, `Huet couldn't load the poster ${url} to recolor it, so the video's original poster shows until it plays.`);
        },
      ),
    );
  };

  /** Recolor the video's current source and poster, from scratch. */
  const start = (video: HTMLVideoElement, entry: Entry) => {
    const current = ++entry.generation;
    stop(entry);
    entry.poster = undefined;
    entry.ready = entry.failed = entry.waiting = false;
    entry.drawn = -1;
    entry.played = !video.paused || video.currentTime > 0;
    if (!gpuRecolor()) return giveUp(video, entry);
    const src = sourceOf(video);
    if (src && src === entry.reverted) return giveUp(video, entry);
    if (src && entry.rewritten?.to !== src) {
      const url = readableUrl ? readableUrl(src) : src;
      if (!url) return giveUp(video, entry);
      if (url !== src) switchSource(video, entry, src, url);
    }
    if (video.error) return giveUp(video, entry);
    present(video, entry);
    loadPoster(video, entry, current);
    entry.layer.place();
    draw(video, entry);
    loop(video, entry);
  };

  const adopt = (video: HTMLVideoElement) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-huet-video", "");
    const style = getComputedStyle(video);
    canvas.style.objectFit = style.objectFit;
    canvas.style.objectPosition = style.objectPosition;
    const entry: Entry = {
      canvas,
      layer: overlay(video, [canvas]),
      near: false,
      hovering: false,
      ready: false,
      failed: false,
      drawn: -1,
      played: false,
      waiting: false,
      generation: 0,
      reported: new Set(),
      listeners: [],
    };
    entries.set(video, entry);
    const on = (target: EventTarget, type: string, listener: EventListener, capture?: boolean) => {
      target.addEventListener(type, listener, capture);
      entry.listeners.push([target, type, listener, capture]);
    };
    // Paused videos don't present frames, so draw the ones they land on.
    on(video, "loadeddata", () => entry.near && draw(video, entry));
    on(video, "seeked", () => entry.near && draw(video, entry));
    on(video, "play", () => (entry.played = true));
    on(video, "seeking", () => (entry.played = true));
    on(video, "error", () => {
      if (!video.error) return;
      const { rewritten } = entry;
      if (rewritten && video.getAttribute("src") === rewritten.to) {
        // The readable source didn't load: go back to the original, uncolored.
        entry.rewritten = undefined;
        entry.reverted = rewritten.from;
        video.removeAttribute("crossorigin");
        video.src = rewritten.from;
        return giveUp(
          video,
          entry,
          `Huet switched a video to ${rewritten.to}, the URL readableUrl gave for ${rewritten.from}, ` +
            `but it didn't load, so the video plays from its original source, unrecolored.`,
        );
      }
      giveUp(video, entry);
    });
    if (hoverOriginal) {
      on(video, "pointerenter", () => {
        entry.hovering = true;
        stop(entry);
        present(video, entry);
      });
      on(video, "pointerleave", () => {
        entry.hovering = false;
        draw(video, entry);
        present(video, entry);
        loop(video, entry);
      });
    }
    visibility.observe(video);
    start(video, entry);
  };

  const restore = (video: HTMLVideoElement, entry: Entry) => {
    stop(entry);
    entry.generation++;
    for (const [target, type, listener, capture] of entry.listeners)
      target.removeEventListener(type, listener, capture);
    entry.waiting = false;
    entry.failed = entry.ready = false;
    present(video, entry);
    entry.layer.remove();
    visibility.unobserve(video);
    entries.delete(video);
  };

  const scan = () => {
    if (disposed) return;
    const found = new Set<HTMLVideoElement>();
    if (root instanceof HTMLVideoElement && root.matches(selector)) found.add(root);
    for (const video of root.querySelectorAll(selector))
      if (video instanceof HTMLVideoElement) found.add(video);
    for (const [video, entry] of entries)
      if (!found.has(video)) restore(video, entry);
      // Moved videos take their canvas along.
      else if (!entry.failed && video.nextSibling !== entry.canvas) entry.layer.place();
    for (const video of found) if (!entries.has(video)) adopt(video);
  };

  const observer = new MutationObserver((records) => {
    const changed = new Set<HTMLVideoElement>();
    for (const { type, target: node, attributeName, addedNodes, removedNodes } of records) {
      if (type === "childList") {
        // A <source> added or removed: the video picks its source again.
        if (
          node instanceof HTMLVideoElement &&
          entries.has(node) &&
          [...addedNodes, ...removedNodes].some((n) => n instanceof HTMLSourceElement)
        )
          changed.add(node);
        continue;
      }
      const video =
        node instanceof HTMLVideoElement
          ? node
          : node instanceof HTMLSourceElement && node.parentElement instanceof HTMLVideoElement
            ? node.parentElement
            : null;
      const entry = video && entries.get(video);
      if (!entry || attributeName === "data-huet-recolor") continue;
      // This mount's own switches.
      const src = video.getAttribute("src");
      if (node === video && attributeName === "src" && src && (src === entry.rewritten?.to || src === entry.reverted))
        continue;
      changed.add(video);
    }
    for (const video of changed) {
      const entry = entries.get(video)!;
      const src = video.getAttribute("src");
      if (src !== entry.rewritten?.to) entry.rewritten = undefined;
      if (src !== entry.reverted) entry.reverted = undefined;
      start(video, entry);
    }
    scan();
  });
  scan();
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src", "poster", "data-huet-recolor"],
  });

  return {
    /** Recolor every video into a new theme, optionally with new options. */
    update(next: Theme, nextOptions?: Omit<ImageOptions, "renderer">) {
      if (disposed) throw new Error("Cannot update a destroyed Huet video mount");
      target = next;
      if (nextOptions) settings = nextOptions;
      version++;
      schedule();
    },
    /**
     * Resolves once every poster queued so far has loaded and every video
     * with a frame or poster to show has been recolored, including videos
     * outside the viewport, which this draws right away. It doesn't wait for
     * videos to load their first frame: wait for their `loadeddata` first.
     */
    async ready() {
      do {
        await Promise.all(pending);
        if (!disposed) flush(true);
      } while (pending.size);
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      for (const [video, entry] of entries) restore(video, entry);
      pending = new Set();
    },
  };
}
