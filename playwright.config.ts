import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:8733",
    viewport: { width: 1280, height: 1100 },
    browserName: "chromium",
  },
  webServer: {
    command: "npm run dev -- --port 8733",
    url: "http://localhost:8733/lab.html",
    reuseExistingServer: !process.env.CI,
  },
});
