import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";

// Print the Tailscale URL alongside Vite's Local/Network URLs.
const tailscaleUrl = (host: string): Plugin => ({
  name: "tailscale-url",
  configureServer(server) {
    const printUrls = server.printUrls.bind(server);
    server.printUrls = () => {
      printUrls();
      server.config.logger.info(`  Tailscale: http://${host}:${server.config.server.port}`);
    };
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(import.meta.dirname, ".."), "");
  const port = Number(env.PORT) || 8731;
  const tailscaleHost = env.TAILSCALE_HOST || "mbp.tail0fff0.ts.net";
  return {
    root: import.meta.dirname,
    base: "./",
    plugins: [tailwindcss(), tailscaleUrl(tailscaleHost)],
    server: { host: true, port, strictPort: true, allowedHosts: [tailscaleHost] },
    build: {
      outDir: resolve(import.meta.dirname, "../dist-demo"),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: resolve(import.meta.dirname, "index.html"),
          compare: resolve(import.meta.dirname, "compare.html"),
        },
      },
    },
  };
});
