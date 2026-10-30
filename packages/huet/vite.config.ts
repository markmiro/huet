import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Builds the published package into dist/. The workspace uses src/ directly.
export default defineConfig({
  plugins: [
    dts({
      bundleTypes: false,
      tsconfigPath: "./tsconfig.json",
      include: ["src"],
      exclude: ["src/**/*.test.ts"],
    }),
  ],
  build: {
    emptyOutDir: true,
    outDir: "dist",
    sourcemap: true,
    lib: {
      entry: {
        index: "src/core/index.ts",
        images: "src/core/images.ts",
        config: "src/config.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["chroma-js"],
    },
  },
});
