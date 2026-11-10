/**
 * SERVICE WORKER (PWA NETWORK-FIRST & OFFLINE FALLBACK) — NOVAVERDE EV TYCOON 3D v3.1
 * Tự động bỏ qua bộ nhớ đệm khi chạy ở Localhost Dev Server để hỗ trợ Hot Reload tức thì
 */
const CACHE_NAME = "novaverde-ev-tycoon-cache-v3.2-modular";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = event.request.url || "";
  if (
    event.request.method !== "GET" ||
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("/__nv_hot_reload") ||
    url.includes("/api/")
  ) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
