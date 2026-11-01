import { defineConfig } from "@playwright/test";

// The shadcn demo in vendor/shadcn-ui (see scripts/shadcn-huet/README.md).
// Run `pnpm shadcn:setup` once first. SHADCN_URL points at a server that is
// already running; otherwise this starts `pnpm shadcn:dev` on port 4000.
const url = process.env.SHADCN_URL ?? "http://localhost:4000";

export default defineConfig({
  testDir: "./tests/shadcn",
  // Next compiles each route on its first visit in dev, which can take minutes.
  timeout: 5 * 60_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: url,
    viewport: { width: 1280, height: 1000 },
    browserName: "chromium",
    navigationTimeout: 5 * 60_000,
  },
  webServer: process.env.SHADCN_URL
    ? undefined
    : {
        command: "pnpm shadcn:dev",
        url,
        reuseExistingServer: true,
        timeout: 10 * 60_000,
      },
});
