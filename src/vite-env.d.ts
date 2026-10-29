/// <reference types="vite/client" />

declare global {
  interface Window {
    cache?: import("./private/cache").default;
  }
}

export {};
