import { GpuRecolor } from './gpu';
import { RecolorOptions } from './recolor';
import { Theme } from './theme';
export interface ImageOptions extends RecolorOptions {
    /** Lattice size of the lookup table each theme is baked into. Defaults to 17. */
    lutSize?: number;
    /**
     * `"gpu"` (the default) renders with WebGL2 and falls back to the CPU when
     * WebGL2 isn't available. `"cpu"` always renders on the CPU.
     */
    renderer?: "gpu" | "cpu";
}
export declare function lutFor(target: Theme, { lutSize, renderer, ...options }: ImageOptions): Float32Array<ArrayBufferLike>;
/** The shared WebGL2 renderer, or null without WebGL2. */
export declare const gpuRecolor: () => GpuRecolor | null;
