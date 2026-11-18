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
      // The CLI loads the palette reader alone, without the theme engine.
      entry: { index: "src/index.ts", palette: "src/palette.ts" },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      // The peer is installed alongside, not bundled.
      external: (id) => /^huet(\/|$)/.test(id),
    },
  },
});
