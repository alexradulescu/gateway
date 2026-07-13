const CACHE_PREFIX = "things-shell-";
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const SHELL_URL = "/things/";
const ASSET_MANIFEST_URL = "/things/asset-manifest.json";
const STATIC_URLS = [
  "/things/manifest.webmanifest",
  "/things/icons/things-icon-192.png",
  "/things/icons/things-icon-512.png",
  "/things/icons/things-apple-touch-icon.png",
  "/things/icons/things-icon.svg",
  "/things/things-art-deco-pattern.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const [shellResponse, manifestResponse] = await Promise.all([
        fetch(SHELL_URL),
        fetch(ASSET_MANIFEST_URL),
      ]);
      if (!shellResponse.ok || !manifestResponse.ok) {
        throw new Error("Could not cache the Things shell.");
      }

      const assetManifest = await manifestResponse.json();
      const versionedAssets = new Set();
      for (const entry of Object.values(assetManifest)) {
        for (const asset of [entry.file, ...(entry.css ?? []), ...(entry.assets ?? [])]) {
          if (asset) versionedAssets.add(`/things/${asset}`);
        }
      }
      const cache = await caches.open(CACHE_NAME);
      await cache.put(SHELL_URL, shellResponse);
      await cache.addAll([ASSET_MANIFEST_URL, ...STATIC_URLS, ...versionedAssets]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const deletions = [];
      for (const name of await caches.keys()) {
        if (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) {
          deletions.push(caches.delete(name));
        }
      }
      await Promise.all(deletions);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // The worker is deliberately limited to the Things application shell. Convex
  // subscriptions and mutations stay network-only and are never queued or cached.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith("/things/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(SHELL_URL)));
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }),
  );
});
