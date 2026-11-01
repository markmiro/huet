import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  // The shadcn demo has its own server: pnpm test:shadcn.
  testIgnore: "shadcn/**",
  use: {
    baseURL: "http://localhost:8733",
    viewport: { width: 1280, height: 1100 },
    browserName: "chromium",
  },
  webServer: {
    command: "pnpm exec astro dev --port 8733 --ignore-lock",
    url: "http://localhost:8733/lab.html",
    reuseExistingServer: !process.env.CI,
  },
});
