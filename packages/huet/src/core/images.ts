import { GpuRecolor } from "./gpu";
import { applyLut, buildLut, recolorer, type Palette, type RecolorOptions } from "./recolor";
import type { HuetTheme } from "./theme";

export {
  applyLut,
  applyTransform,
  buildLut,
  coordinatesOf,
  rampColor,
  recolorer,
  toCube,
} from "./recolor";
export type { Coordinates, Palette, RecolorOptions, Transform } from "./recolor";
export { GpuRecolor } from "./gpu";

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
export function paletteOf(theme: HuetTheme | Palette): Palette {
  if (!("tokens" in theme)) return theme;
  const { neutral, colors } = theme;
  // A two-stop OKLab ramp is the plain dark → light mix.
  return neutral.colors.length === 2 && neutral.colorModel === "oklab"
    ? { dark: theme.dark, light: theme.light, colors }
    : { neutral, colors };
}

// LUTs are small (17³ × 3 floats ≈ 59 KB), so keep recent ones for reuse.
const luts = new Map<string, Float32Array>();
function lutFor(target: Palette, { lutSize = 17, ...options }: ImageOptions) {
  const key = JSON.stringify([target, options, lutSize]);
  let lut = luts.get(key);
  if (!lut) {
    if (luts.size >= 16) luts.clear();
    luts.set(key, (lut = buildLut(recolorer(target, options), lutSize)));
  }
  return lut;
}

let gpu: GpuRecolor | null | undefined;
const gpuRecolor = () => {
  if (gpu === undefined) {
    try {
      gpu = new GpuRecolor();
    } catch {
      gpu = null;
    }
  }
  return gpu;
};

/** True when the `"gpu"` renderer can use WebGL2 in this browser. */
export const hasGpu = () => gpuRecolor() !== null;

type Source = HTMLImageElement | HTMLCanvasElement | ImageBitmap;
const sizeOf = (source: Source) =>
  source instanceof HTMLImageElement
    ? [source.naturalWidth, source.naturalHeight]
    : [source.width, source.height];

/**
 * Draw a decoded image through a theme into a canvas (a new one unless `out`
 * is given), on the GPU when WebGL2 is available unless `renderer: "cpu"`. Cross-origin images need
 * CORS headers and `crossOrigin` set, or the browser refuses to read them.
 */
export function recolorImage(
  source: Source,
  theme: HuetTheme | Palette,
  options: ImageOptions = {},
  out = document.createElement("canvas"),
): HTMLCanvasElement {
  const [width, height] = sizeOf(source);
  const { renderer: preferred = "gpu", ...lutOptions } = options;
  const size = lutOptions.lutSize ?? 17;
  const lut = lutFor(paletteOf(theme), lutOptions);
  const renderer = preferred === "gpu" ? gpuRecolor() : null;
  if (renderer) {
    renderer.setLut(lut, size);
    renderer.render(source, out, width, height);
    return out;
  }
  // Resizing a canvas reallocates it, even to the same size.
  if (out.width !== width) out.width = width;
  if (out.height !== height) out.height = height;
  const context = out.getContext("2d", { willReadFrequently: true })!;
  context.clearRect(0, 0, width, height);
  context.drawImage(source, 0, 0);
  const pixels = context.getImageData(0, 0, width, height);
  applyLut(pixels.data, lut, size);
  context.putImageData(pixels, 0, 0);
  return out;
}

export interface MountImagesOptions extends ImageOptions {
  /** Which images to recolor. Defaults to `img[data-huet-recolor]`. */
  selector?: string;
  /** Show the original image while the pointer is over it. */
  hoverOriginal?: boolean;
}

interface Entry {
  /** The decoded original, once the `<img>` has loaded it. */
  image?: HTMLImageElement;
  /** Shows the recolored pixels in place of the `<img>`. */
  canvas?: HTMLCanvasElement;
  /** Whether the canvas holds the current original, drawn at some version. */
  ready: boolean;
  /** The theme and options version the canvas was last drawn with. */
  drawn: number;
  failed: boolean;
  hovering: boolean;
  /** Whether the `<img>` or the canvas is near the viewport. */
  near: { img: boolean; canvas: boolean };
  generation: number;
  /** The inline styles this mount overrode on the `<img>`, to put back. */
  saved: Map<string, [string, string]>;
  leave?: () => void;
}

/** Attributes the canvas copies from its `<img>`, and keeps in sync. */
const mirrored = ["class", "title", "alt"];

/**
 * Recolor matching `<img>` elements under `root` into a theme, and keep them
 * recolored as images are added, change `src`, or the theme is updated.
 * Each image is drawn into a `<canvas>` inserted after it, which takes the
 * image's class and inline style; the `<img>` itself is hidden but left as is.
 * New originals stay hidden until their recolored copy is ready to paint.
 * Theme updates redraw once per frame, and images far outside the viewport
 * are redrawn when they scroll near it. `destroy` removes the canvases.
 */
export function mountImages(
  root: ParentNode & Node,
  theme: HuetTheme | Palette,
  options: MountImagesOptions = {},
) {
  const { selector = "img[data-huet-recolor]", hoverOriginal = false, ...recolor } = options;
  let target = paletteOf(theme),
    settings: ImageOptions = recolor,
    version = 0,
    frame: number | undefined,
    disposed = false;
  const entries = new Map<HTMLImageElement, Entry>();
  const canvases = new Map<HTMLCanvasElement, HTMLImageElement>();
  const sources = new Map<string, Promise<HTMLImageElement>>();
  let pending = new Set<Promise<void>>();

  const load = (src: string, crossOrigin: string | null) => {
    const key = `${crossOrigin} ${src}`;
    let source = sources.get(key);
    if (!source) {
      const image = new Image();
      image.crossOrigin = crossOrigin;
      image.src = src;
      sources.set(key, (source = image.decode().then(() => image)));
      source.catch(() => sources.delete(key));
    }
    return source;
  };

  /** Override an inline style on the `<img>`, or put the page's value back. */
  const style = (img: HTMLImageElement, entry: Entry, property: string, value?: string) => {
    const saved = entry.saved.get(property);
    if (value === undefined) {
      if (!saved) return;
      entry.saved.delete(property);
      if (saved[0]) img.style.setProperty(property, saved[0], saved[1]);
      else img.style.removeProperty(property);
      return;
    }
    if (!saved)
      entry.saved.set(property, [img.style.getPropertyValue(property), img.style.getPropertyPriority(property)]);
    img.style.setProperty(property, value, "important");
  };
  const mirror = (img: HTMLImageElement, canvas: HTMLCanvasElement, name: string) => {
    const value = img.getAttribute(name);
    if (name === "alt") {
      // An empty alt marks a decorative image.
      if (value) canvas.setAttribute("aria-label", value);
      else canvas.removeAttribute("aria-label");
      if (value === "") canvas.setAttribute("aria-hidden", "true");
      else canvas.removeAttribute("aria-hidden");
    } else if (value === null) canvas.removeAttribute(name);
    else canvas.setAttribute(name, value);
  };
  const createCanvas = (img: HTMLImageElement, entry: Entry) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    for (const name of mirrored) mirror(img, canvas, name);
    // The page's inline style, without this mount's overrides.
    canvas.style.cssText = img.style.cssText;
    for (const [property, [value, priority]] of entry.saved)
      if (value) canvas.style.setProperty(property, value, priority);
      else canvas.style.removeProperty(property);
    if (hoverOriginal) {
      const enter = () => {
        entry.hovering = true;
        present(img, entry);
      };
      const leave = () => {
        entry.hovering = false;
        present(img, entry);
      };
      canvas.addEventListener("pointerenter", enter);
      img.addEventListener("pointerleave", leave);
      entry.leave = () => img.removeEventListener("pointerleave", leave);
    }
    canvases.set(canvas, img);
    visibility.observe(canvas);
    return canvas;
  };

  const showsCanvas = (entry: Entry) => entry.ready && !entry.failed && !entry.hovering;
  /** Show the canvas, the original, or neither, from the entry's state. */
  const present = (img: HTMLImageElement, entry: Entry) => {
    const { canvas } = entry;
    if (canvas && showsCanvas(entry)) {
      if (img.nextSibling !== canvas) img.after(canvas);
      style(img, entry, "display", "none");
    } else {
      canvas?.remove();
      style(img, entry, "display");
    }
    // Waiting for a recolored copy: keep the space, but don't paint the original.
    if (entry.ready || entry.failed) style(img, entry, "visibility");
    else style(img, entry, "visibility", "hidden");
    if (entry.failed) img.setAttribute("data-huet-recolored", "original");
    else if (entry.ready) img.setAttribute("data-huet-recolored", "");
    else img.removeAttribute("data-huet-recolored");
  };
  /** Show the original after all, marking that it couldn't be recolored. */
  const giveUp = (img: HTMLImageElement, entry: Entry) => {
    entry.failed = true;
    entry.ready = false;
    present(img, entry);
  };
  const restore = (img: HTMLImageElement, entry: Entry) => {
    entry.leave?.();
    if (entry.canvas) {
      entry.canvas.remove();
      canvases.delete(entry.canvas);
      visibility.unobserve(entry.canvas);
    }
    visibility.unobserve(img);
    for (const property of [...entry.saved.keys()]) style(img, entry, property);
    img.removeAttribute("data-huet-recolored");
    entries.delete(img);
  };

  const draw = (img: HTMLImageElement, entry: Entry) => {
    try {
      const canvas = (entry.canvas ??= createCanvas(img, entry));
      recolorImage(entry.image!, target, settings, canvas);
      entry.drawn = version;
      entry.ready = true;
      present(img, entry);
    } catch {
      // Unreadable (e.g. cross-origin without CORS) images stay as they are.
      giveUp(img, entry);
    }
  };
  const stale = (entry: Entry) => entry.image && !entry.failed && entry.drawn !== version;
  /** Draw stale images near the viewport, or every stale image with `all`. */
  const flush = (all = false) => {
    frame = undefined;
    for (const [img, entry] of entries)
      if (stale(entry) && (all || entry.near.img || entry.near.canvas)) draw(img, entry);
  };
  const schedule = () => {
    if (disposed || frame !== undefined) return;
    frame = requestAnimationFrame(() => flush());
  };
  // Start drawing a screen ahead, so scrolling rarely reveals a stale image.
  const visibility = new IntersectionObserver(
    (records) => {
      for (const { target: element, isIntersecting } of records) {
        const isCanvas = element instanceof HTMLCanvasElement;
        const img = isCanvas ? canvases.get(element) : (element as HTMLImageElement);
        const entry = img && entries.get(img);
        if (!entry) continue;
        entry.near[isCanvas ? "canvas" : "img"] = isIntersecting;
        if (isIntersecting && stale(entry)) schedule();
      }
    },
    { rootMargin: "100% 0px" },
  );

  const track = (promise: Promise<void>) => {
    pending.add(promise);
    void promise.finally(() => pending.delete(promise));
  };

  const adopt = (img: HTMLImageElement) => {
    const entry: Entry = {
      ready: false,
      drawn: -1,
      failed: false,
      hovering: false,
      near: { img: false, canvas: false },
      generation: 0,
      saved: new Map(),
    };
    entries.set(img, entry);
    visibility.observe(img);
    start(img, entry);
  };
  /** Wait for the original to load, so `currentSrc` reflects srcset. */
  const start = (img: HTMLImageElement, entry: Entry) => {
    const current = ++entry.generation;
    entry.image = undefined;
    entry.ready = entry.failed = entry.hovering = false;
    present(img, entry);
    const begin = async () => {
      if (entries.get(img) !== entry || current !== entry.generation) return;
      // Only srcset needs `currentSrc`, which can lag behind a new `src`.
      const src = (img.srcset ? img.currentSrc : "") || img.src;
      if (!src) return giveUp(img, entry);
      try {
        const image = await load(src, img.crossOrigin);
        if (entries.get(img) !== entry || current !== entry.generation) return;
        entry.image = image;
        entry.drawn = -1;
        schedule();
      } catch {
        if (entries.get(img) === entry && current === entry.generation) giveUp(img, entry);
      }
    };
    track(
      img.complete
        ? begin()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(begin()), { once: true });
            img.addEventListener(
              "error",
              () =>
                resolve(
                  entries.get(img) === entry && current === entry.generation
                    ? giveUp(img, entry)
                    : undefined,
                ),
              { once: true },
            );
          }),
    );
  };

  const scan = () => {
    if (disposed) return;
    const found = new Set<HTMLImageElement>();
    if (root instanceof HTMLImageElement && root.matches(selector)) found.add(root);
    // A selector that matches by class also matches the canvases, which copy it.
    for (const img of root.querySelectorAll(selector))
      if (img instanceof HTMLImageElement) found.add(img);
    for (const [img, entry] of entries)
      if (!found.has(img)) restore(img, entry);
      // Moved images take their canvas along, and a removed canvas comes back.
      else if (showsCanvas(entry) && img.nextSibling !== entry.canvas) present(img, entry);
    for (const img of found) if (!entries.has(img)) adopt(img);
  };

  const observer = new MutationObserver((records) => {
    for (const { type, target: node, attributeName } of records) {
      if (type !== "attributes" || !(node instanceof HTMLImageElement)) continue;
      const entry = entries.get(node);
      if (!entry) continue;
      if (mirrored.includes(attributeName!)) {
        if (entry.canvas) mirror(node, entry.canvas, attributeName!);
      } else if (attributeName !== "data-huet-recolor") {
        // The page changed the image itself: recolor its new original.
        start(node, entry);
      }
    }
    scan();
  });
  scan();
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src", "srcset", "sizes", "data-huet-recolor", ...mirrored],
  });

  return {
    /** Recolor every image into a new theme, optionally with new options. */
    update(next: HuetTheme | Palette, nextOptions?: ImageOptions) {
      if (disposed) throw new Error("Cannot update a destroyed Huet image mount");
      target = paletteOf(next);
      if (nextOptions) settings = nextOptions;
      version++;
      schedule();
    },
    /**
     * Resolves once every image queued so far has been recolored, including
     * images outside the viewport, which this draws right away.
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
      for (const [img, entry] of entries) restore(img, entry);
      pending = new Set();
    },
  };
}

export { mountSvgs, type MountSvgsOptions } from "./svgs";
