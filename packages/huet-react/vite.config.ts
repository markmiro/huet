import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Builds the published package into dist/. The workspace uses src/ directly.
export default defineConfig({
  plugins: [
    react(),
    // Compiles src/configurator.css, which the configurator inlines
    tailwindcss(),
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
      entry: { index: "src/index.ts" },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      // Dependencies and peers are installed alongside, not bundled.
      external: (id) =>
        /^(react|react-dom|huet|chroma-js|file-saver|lodash-es|@radix-ui\/react-popover|@tabler\/icons-react)(\/|$)/.test(
          id,
        ),
    },
  },
});
