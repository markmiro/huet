/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import dts from "vite-plugin-dts";

const test = {
  environment: "node" as const,
  include: ["src/**/*.test.ts"],
};

// Print the Tailscale URL alongside Vite's Local/Network URLs.
const tailscaleUrl = (host: string, port: number): Plugin => ({
  name: "tailscale-url",
  configureServer(server) {
    const printUrls = server.printUrls.bind(server);
    server.printUrls = () => {
      printUrls();
      const actualPort = server.config.server.port ?? port;
      server.config.logger.info(`  Tailscale: http://${host}:${actualPort}`);
    };
  },
});

export default defineConfig(({ mode, command, isPreview }) => {
  if (mode === "lib") {
    return {
      plugins: [
        react(),
        dts({
          bundleTypes: false,
          tsconfigPath: "./tsconfig.build.json",
          include: ["src"],
          exclude: ["src/**/*.test.ts", "src/index.tsx", "src/demo/lab.ts"],
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

  const env = loadEnv(mode, ".", "");
  const port = Number(env.PORT) || 8731;
  const tailscaleHost = env.TAILSCALE_HOST || "mbp.tail0fff0.ts.net";

  return {
    // The demo is published at https://markmiro.github.io/huet/.
    base: command === "build" || isPreview ? "/huet/" : "/",
    plugins: [react(), tailscaleUrl(tailscaleHost, port)],
    server: {
      host: true,
      port,
      strictPort: true,
      allowedHosts: [tailscaleHost, "marks-macbook-pro.tail0fff0.ts.net"],
    },
    css: {
      lightningcss: {
        errorRecovery: true,
      },
    },
    build: {
      rollupOptions: { input: { main: "index.html", lab: "lab.html" } },
      outDir: "dist-demo",
      emptyOutDir: true,
    },
    test,
  };
});
