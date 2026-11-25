import { GpuRecolor } from "./gpu";
import { recolorer, type RecolorOptions } from "./recolor";
import type { Theme } from "./theme";

/*
  What images and videos share: the lookup table each theme is baked into, and
  the one WebGL2 renderer that applies it. Baking a table takes 15–25 ms, so
  every mount reuses the same cached tables.
*/

export interface ImageOptions extends RecolorOptions {
  /** Lattice size of the lookup table each theme is baked into. Defaults to 17. */
  lutSize?: number;
  /**
   * `"gpu"` (the default) renders with WebGL2 and falls back to the CPU when
   * WebGL2 isn't available. `"cpu"` always renders on the CPU.
   */
  renderer?: "gpu" | "cpu";
}

// LUTs are small (17³ × 3 floats ≈ 59 KB), so keep recent ones for reuse.
const luts = new Map<string, Float32Array>();
export function lutFor(target: Theme, { lutSize = 17, renderer, ...options }: ImageOptions) {
  // Contrast fades a mounted image as a whole (see mountImages), so it isn't part of the key.
  const key = JSON.stringify([target.neutral, target.colorModel, target.colors, target.images, options, lutSize]);
  let lut = luts.get(key);
  if (!lut) {
    if (luts.size >= 16) luts.clear();
    luts.set(key, (lut = recolorer(target, options).lut(lutSize)));
  }
  return lut;
}

let gpu: GpuRecolor | null | undefined;
/** The shared WebGL2 renderer, or null without WebGL2. */
export const gpuRecolor = () => {
  if (gpu === undefined) {
    try {
      gpu = new GpuRecolor();
    } catch {
      gpu = null;
    }
  }
  return gpu;
};
