/** Applies 3D LUTs with WebGL2: one draw call per image, trilinear filtering for free. */
export declare class GpuRecolor {
    /** Where the shader draws: as large as the largest image so far, with the last one in its bottom-left corner. */
    readonly canvas: HTMLCanvasElement;
    private gl;
    private textures;
    private scratch;
    private lut;
    private sizeLocation;
    private currentLut;
    constructor();
    setLut(lut: Float32Array, size: number): void;
    private texture;
    /** Draw `image` through the current LUT into a 2D canvas of the given size. */
    render(image: TexImageSource, out: HTMLCanvasElement, width: number, height: number): void;
    /** Wait for queued GPU work, so timings include the draw itself. */
    finish(): void;
}
