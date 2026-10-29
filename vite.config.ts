/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const test = {
  environment: "node" as const,
  include: ["src/**/*.test.ts"],
};

// The demo site is built by Astro (astro.config.mjs). This builds the library.
export default defineConfig(({ mode }) => {
  if (mode === "lib") {
    return {
      plugins: [
        react(),
        // Compiles src/configurator.css, which the configurator inlines
        tailwindcss(),
        dts({
          bundleTypes: false,
          tsconfigPath: "./tsconfig.build.json",
          include: ["src"],
          exclude: ["src/**/*.test.ts", "src/demo/**"],
        }),
      ],
      build: {
        emptyOutDir: true,
        outDir: "dist",
        sourcemap: true,
        lib: {
          entry: { huet: "src/huet.ts", core: "src/core/index.ts" },
          name: "Huet",
          formats: ["es", "cjs"],
          fileName: (format, entryName) =>
            `${entryName}.${format === "es" ? "js" : "cjs"}`,
        },
        rollupOptions: {
          external: ["react", "react-dom", "react/jsx-runtime"],
        },
      },
      test,
    };
  }

  return { plugins: [react()], test };
});
