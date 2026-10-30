/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Unit tests for the workspace. The demo site is built by Astro
// (astro.config.mjs), and each package builds itself (packages/*/vite.config.ts).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["packages/*/src/**/*.test.ts", "src/**/*.test.ts"],
  },
});
