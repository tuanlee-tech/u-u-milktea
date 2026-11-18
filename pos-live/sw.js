const CACHE_NAME = 'office-order-pwa-v1';
const CORE_SHELL = [
  './',
  './index.html',
  './style.css',
  './live.js',
  './manifest.webmanifest',
  './assets/img/opt/logo.webp',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/audio/pay-confirmed.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        CORE_SHELL.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('office-order-pwa-') && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (!req || req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Never cache Apps Script APIs, Cloudflare Workers WS/relay, or Google Fonts dynamic requests
  const host = url.hostname.toLowerCase();
  if (
    host.includes('script.google.com') ||
    host.includes('script.googleusercontent.com') ||
    host.includes('workers.dev') ||
    host.includes('img.vietqr.io')
  ) {
    return;
  }

  // Only handle same-origin requests in SW cache
  if (url.origin !== self.location.origin) return;

  const isNav = req.mode === 'navigate';
  const pathname = url.pathname || '';
  const isCoreCode =
    isNav ||
    pathname.endsWith('/') ||
    pathname.endsWith('/index.html') ||
    pathname.endsWith('/live.js') ||
    pathname.endsWith('/style.css') ||
    pathname.endsWith('/manifest.webmanifest');

  if (isCoreCode) {
    // Network-First so realtime app updates go live immediately, falling back to cache offline
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            const cacheKey = isNav ? './index.html' : req;
            caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => {
          if (isNav) {
            return caches.match('./index.html').then((r) => r || caches.match('./'));
          }
          return caches.match(req);
        })
    );
    return;
  }

  // Static media / icons / audio: Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  if (event.notification) event.notification.close();
  const data = (event.notification && event.notification.data) || {};
  const targetUrl = data.url || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const c = clientList[i];
        if (c && 'focus' in c) {
          if (data.bill && c.url && c.url.indexOf(data.bill) !== -1) {
            return c.focus();
          }
        }
      }
      if (clientList.length > 0 && 'focus' in clientList[0]) {
        return clientList[0].focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
