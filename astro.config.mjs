import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
const port = Number(env.PORT) || 8731;
const tailscaleHost = env.TAILSCALE_HOST || "mbp.tail0fff0.ts.net";
// The demo is published at https://markmiro.github.io/huet/.
const isPublished = ["build", "preview"].includes(process.argv[2]);

export default defineConfig({
  srcDir: "./src/demo",
  outDir: "./dist-demo",
  base: isPublished ? "/huet" : "/",
  build: { format: "file" },
  server: { host: true, port, allowedHosts: [tailscaleHost, "marks-macbook-pro.tail0fff0.ts.net"] },
  devToolbar: { enabled: false },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    css: { lightningcss: { errorRecovery: true } },
  },
});
