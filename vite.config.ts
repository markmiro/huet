/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const test = {
  environment: "node" as const,
  include: ["src/**/*.test.ts"],
};

export default defineConfig(({ mode }) => {
  if (mode === "lib") {
    return {
      plugins: [
        react(),
        dts({
          bundleTypes: false,
          tsconfigPath: "./tsconfig.build.json",
          include: ["src"],
          exclude: ["src/**/*.test.ts", "src/index.tsx"],
        }),
      ],
      build: {
        emptyOutDir: true,
        outDir: "dist",
        sourcemap: true,
        lib: {
          entry: "src/huet.ts",
          name: "Huet",
          formats: ["es", "cjs"],
          fileName: (format) => (format === "es" ? "huet.js" : "huet.cjs"),
        },
        rollupOptions: {
          external: ["react", "react-dom", "react/jsx-runtime"],
        },
      },
      test,
    };
  }

  return {
    plugins: [react()],
    css: {
      lightningcss: {
        errorRecovery: true,
      },
    },
    build: {
      outDir: "dist-demo",
      emptyOutDir: true,
    },
    test,
  };
});
