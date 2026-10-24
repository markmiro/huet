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

  const env = loadEnv(mode, ".", "");
  const port = Number(env.PORT) || 8731;
  const tailscaleHost = env.TAILSCALE_HOST || "mbp.tail0fff0.ts.net";

  return {
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
      outDir: "dist-demo",
      emptyOutDir: true,
    },
    test,
  };
});
