const vertex = `#version 300 es
in vec2 position;
out vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;
const fragment = `#version 300 es
precision highp float;
precision highp sampler3D;
uniform sampler2D image;
uniform sampler3D lut;
uniform float size;
in vec2 uv;
out vec4 color;
void main() {
  vec4 c = texture(image, vec2(uv.x, 1.0 - uv.y));
  // Sample lattice centers so 0 and 1 hit the first and last LUT entries.
  vec3 p = (c.rgb * (size - 1.0) + 0.5) / size;
  color = vec4(texture(lut, p).rgb, c.a);
}`;

/** Applies 3D LUTs with WebGL2: one draw call per image, trilinear filtering for free. */
export class GpuRecolor {
  readonly canvas = document.createElement("canvas");
  private gl: WebGL2RenderingContext;
  private textures = new WeakMap<HTMLImageElement, WebGLTexture>();
  private lut: WebGLTexture;
  private sizeLocation: WebGLUniformLocation;
  private currentLut: Float32Array | null = null;

  constructor() {
    const gl = this.canvas.getContext("webgl2", {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error("WebGL2 is not available");
    this.gl = gl;
    const program = gl.createProgram()!;
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader) ?? "Shader error");
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(gl.getUniformLocation(program, "image"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "lut"), 1);
    this.sizeLocation = gl.getUniformLocation(program, "size")!;
    this.lut = gl.createTexture()!;
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  }

  setLut(lut: Float32Array, size: number) {
    if (lut === this.currentLut) return;
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_3D, this.lut);
    // 8-bit entries are filterable everywhere; float textures need extensions.
    const bytes = Uint8Array.from(lut, (v) => v * 255 + 0.5);
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGB8, size, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, bytes);
    for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R])
      gl.texParameteri(gl.TEXTURE_3D, p, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1f(this.sizeLocation, size);
    this.currentLut = lut;
  }

  private texture(image: HTMLImageElement) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    let texture = this.textures.get(image);
    if (texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return;
    }
    texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.textures.set(image, texture);
  }

  /** Draw `image` through the current LUT into a 2D canvas of the given size. */
  render(image: HTMLImageElement, out: HTMLCanvasElement, width: number, height: number) {
    const gl = this.gl;
    this.texture(image);
    this.canvas.width = width;
    this.canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    out.width = width;
    out.height = height;
    const context = out.getContext("2d")!;
    context.clearRect(0, 0, width, height);
    context.drawImage(this.canvas, 0, 0);
  }

  /** Wait for queued GPU work, so timings include the draw itself. */
  finish() {
    const pixel = new Uint8Array(4);
    this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixel);
  }
}
