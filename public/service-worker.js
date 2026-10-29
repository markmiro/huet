// The old Create React App build registered a Workbox service worker at this
// URL. Browsers re-fetch it on navigation, so serving this replacement removes
// the stale precache and unregisters the worker for returning visitors.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Other github.io projects share this origin, so only delete caches
      // that Workbox scoped to this registration.
      const scope = self.registration.scope;
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key.includes(scope)).map((key) => caches.delete(key)),
      );
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
