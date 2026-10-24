/// <reference types="vite/client" />

declare global {
  interface Window {
    cache?: import("./private/cache").default;
    debug?: <T>(thing: T) => T;
  }
}

export {};
