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

type Source = HTMLImageElement | HTMLCanvasElement | ImageBitmap;
const sizeOf = (source: Source) =>
  source instanceof HTMLImageElement
    ? [source.naturalWidth, source.naturalHeight]
    : [source.width, source.height];

/**
 * Draw a decoded image through a theme into a canvas (a new one unless `out`
 * is given), on the GPU when WebGL2 is available. Cross-origin images need
 * CORS headers and `crossOrigin` set, or the browser refuses to read them.
 */
export function recolorImage(
  source: Source,
  theme: HuetTheme | Palette,
  options: ImageOptions = {},
  out = document.createElement("canvas"),
): HTMLCanvasElement {
  const [width, height] = sizeOf(source);
  const size = options.lutSize ?? 17;
  const lut = lutFor(paletteOf(theme), options);
  const renderer = gpuRecolor();
  if (renderer) {
    renderer.setLut(lut, size);
    renderer.render(source, out, width, height);
    return out;
  }
  out.width = width;
  out.height = height;
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
  original: { src: string | null; srcset: string | null; sizes: string | null };
  /** The URL the browser picked for the original, once it has loaded. */
  source?: string;
  /** The URL this mount last wrote to `src`, so its own writes can be ignored. */
  written?: string;
  recolored?: string;
  generation: number;
  /** The inline `visibility` to put back once the image can be shown. */
  hidden?: [string, string];
  leave?: () => void;
}

/**
 * Recolor matching `<img>` elements under `root` into a theme, and keep them
 * recolored as images are added, change `src`, or the theme is updated.
 * Each image's `src` is replaced with a recolored copy; `destroy` restores it.
 * New originals stay hidden until their recolored copy is ready to paint.
 */
export function mountImages(
  root: ParentNode & Node,
  theme: HuetTheme | Palette,
  options: MountImagesOptions = {},
) {
  const { selector = "img[data-huet-recolor]", hoverOriginal = false, ...recolor } = options;
  let target = paletteOf(theme),
    settings: ImageOptions = recolor,
    disposed = false;
  const entries = new Map<HTMLImageElement, Entry>();
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
  const write = (img: HTMLImageElement, entry: Entry, src: string) => {
    entry.written = src;
    if (img.getAttribute("src") !== src) img.setAttribute("src", src);
  };
  const hide = (img: HTMLImageElement, entry: Entry) => {
    if (entry.hidden) return;
    const { style } = img;
    entry.hidden = [style.getPropertyValue("visibility"), style.getPropertyPriority("visibility")];
    style.setProperty("visibility", "hidden", "important");
  };
  const reveal = (img: HTMLImageElement, entry: Entry) => {
    if (!entry.hidden) return;
    const [value, priority] = entry.hidden;
    if (value) img.style.setProperty("visibility", value, priority);
    else img.style.removeProperty("visibility");
    entry.hidden = undefined;
  };
  /** Show the original after all, marking that it couldn't be recolored. */
  const giveUp = (img: HTMLImageElement, entry: Entry) => {
    img.setAttribute("data-huet-recolored", "original");
    reveal(img, entry);
  };
  const revoke = (entry: Entry) => {
    if (entry.recolored) URL.revokeObjectURL(entry.recolored);
    entry.recolored = undefined;
  };
  const restore = (img: HTMLImageElement, entry: Entry) => {
    entry.leave?.();
    reveal(img, entry);
    for (const [name, value] of Object.entries(entry.original))
      if (value === null) img.removeAttribute(name);
      else img.setAttribute(name, value);
    revoke(entry);
    img.removeAttribute("data-huet-recolored");
    entries.delete(img);
  };

  const render = async (img: HTMLImageElement, entry: Entry) => {
    const current = ++entry.generation;
    const src = entry.source;
    if (!src) return giveUp(img, entry);
    try {
      const source = await load(src, img.crossOrigin);
      if (disposed || current !== entry.generation || !entries.has(img)) return;
      const canvas = recolorImage(source, target, settings);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
      if (disposed || current !== entry.generation || !entries.has(img)) return;
      if (!blob) throw new Error("Could not encode the recolored image");
      revoke(entry);
      entry.recolored = URL.createObjectURL(blob);
      // `srcset` would take precedence over the recolored `src`.
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      if (!(hoverOriginal && img.matches(":hover"))) write(img, entry, entry.recolored);
      img.setAttribute("data-huet-recolored", "");
      if (!entry.hidden) return;
      // The browser keeps painting the previous image until the new one decodes.
      await img.decode().catch(() => {});
      if (current === entry.generation && entries.has(img)) reveal(img, entry);
    } catch {
      // Unreadable (e.g. cross-origin without CORS) or broken images stay as they are.
      if (current === entry.generation && entries.has(img)) giveUp(img, entry);
    }
  };
  const track = (promise: Promise<void>) => {
    pending.add(promise);
    void promise.finally(() => pending.delete(promise));
  };

  const adopt = (img: HTMLImageElement) => {
    const entry: Entry = {
      original: {
        src: img.getAttribute("src"),
        srcset: img.getAttribute("srcset"),
        sizes: img.getAttribute("sizes"),
      },
      generation: 0,
    };
    entries.set(img, entry);
    if (hoverOriginal) {
      const enter = () => entry.source && write(img, entry, entry.source);
      const leave = () => entry.recolored && write(img, entry, entry.recolored);
      img.addEventListener("pointerenter", enter);
      img.addEventListener("pointerleave", leave);
      entry.leave = () => {
        img.removeEventListener("pointerenter", enter);
        img.removeEventListener("pointerleave", leave);
      };
    }
    start(img, entry);
  };
  /** Wait for the original to load, so `currentSrc` reflects srcset. */
  const start = (img: HTMLImageElement, entry: Entry) => {
    hide(img, entry);
    const begin = async () => {
      if (!entries.has(img)) return;
      // Only srcset needs `currentSrc`, which can lag behind a new `src`.
      entry.source = (img.srcset ? img.currentSrc : "") || img.src || undefined;
      await render(img, entry);
    };
    track(
      img.complete
        ? begin()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(begin()), { once: true });
            img.addEventListener(
              "error",
              () => resolve(entries.get(img) === entry ? giveUp(img, entry) : undefined),
              { once: true },
            );
          }),
    );
  };

  const scan = () => {
    if (disposed) return;
    const found = new Set<HTMLImageElement>();
    if (root instanceof HTMLImageElement && root.matches(selector)) found.add(root);
    for (const img of root.querySelectorAll<HTMLImageElement>(selector)) found.add(img);
    for (const [img, entry] of entries) if (!found.has(img)) restore(img, entry);
    for (const img of found) if (!entries.has(img)) adopt(img);
  };

  const observer = new MutationObserver((records) => {
    for (const { type, target: node, attributeName } of records) {
      if (type !== "attributes" || !(node instanceof HTMLImageElement)) continue;
      const entry = entries.get(node);
      if (!entry || attributeName === "data-huet-recolor") continue;
      const value = node.getAttribute(attributeName!);
      // This mount's own writes: the recolored `src` and the removed srcset.
      if (attributeName === "src" ? value === entry.written : value === null) continue;
      // The page changed the image itself: recolor its new original.
      if (attributeName === "src") entry.original.src = value;
      else entry.original.srcset = value;
      entry.source = entry.written = undefined;
      entry.generation++;
      start(node, entry);
    }
    scan();
  });
  scan();
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src", "srcset", "data-huet-recolor"],
  });

  return {
    /** Recolor every image into a new theme, optionally with new options. */
    update(next: HuetTheme | Palette, nextOptions?: ImageOptions) {
      if (disposed) throw new Error("Cannot update a destroyed Huet image mount");
      target = paletteOf(next);
      if (nextOptions) settings = nextOptions;
      for (const [img, entry] of entries) track(render(img, entry));
    },
    /** Resolves once every image queued so far has been recolored. */
    async ready() {
      while (pending.size) await Promise.all(pending);
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      for (const [img, entry] of entries) restore(img, entry);
      pending = new Set();
    },
  };
}
