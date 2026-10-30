/// <reference lib="webworker" />
import {
  applyLut,
  applyTransform,
  buildLut,
  recolorer,
  type Palette,
  type RecolorOptions,
} from "huet/images";

export type Request =
  | { type: "lut"; target: Palette; options: RecolorOptions; size: number; fresh?: boolean }
  | {
      type: "apply";
      mode: "lut" | "exact";
      pixels: Uint8ClampedArray;
      target: Palette;
      options: RecolorOptions;
      size: number;
    };

// LUTs are small (33³ × 3 floats ≈ 430 KB), so keep recent ones for reuse.
const luts = new Map<string, Float32Array>();
function lutFor(target: Palette, options: RecolorOptions, size: number, fresh = false) {
  const key = JSON.stringify([target, options, size]);
  let lut = luts.get(key);
  if (!lut || fresh) {
    if (luts.size > 64) luts.clear();
    luts.set(key, (lut = buildLut(recolorer(target, options), size)));
  }
  return lut;
}

self.onmessage = ({ data }: MessageEvent<Request & { id: number }>) => {
  const start = performance.now();
  if (data.type === "lut") {
    const lut = lutFor(data.target, data.options, data.size, data.fresh).slice();
    self.postMessage({ id: data.id, lut, ms: performance.now() - start }, [lut.buffer]);
    return;
  }
  const { pixels } = data;
  if (data.mode === "exact") applyTransform(pixels, recolorer(data.target, data.options));
  else applyLut(pixels, lutFor(data.target, data.options, data.size), data.size);
  self.postMessage({ id: data.id, pixels, ms: performance.now() - start }, [pixels.buffer]);
};
