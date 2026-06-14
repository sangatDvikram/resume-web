'use strict';

const VERSION = 'v1';
const API_CACHE = `portfolio-api-${VERSION}`;
const PAGE_CACHE = `portfolio-page-${VERSION}`;
const ALL_CACHES = [API_CACHE, PAGE_CACHE];

// API origins posted by ServiceWorkerRegistrar on mount
const apiOrigins = new Set();

// ── Lifecycle ─────────────────────────────────────────────────────────────────

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !ALL_CACHES.includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ── Config ────────────────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'SW_CONFIG') return;
  try {
    apiOrigins.add(new URL(event.data.apiUrl).origin);
  } catch { /* ignore invalid URL */ }
});

// ── Fetch interception ────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // API: stale-while-revalidate with conditional GET (ETag → 304 skips cache update)
  if (isApiUrl(url)) {
    event.respondWith(staleWhileRevalidate(event, event.request, API_CACHE));
    return;
  }

  // HTML navigation: network-first, cache as offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, PAGE_CACHE));
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function isApiUrl(url) {
  return apiOrigins.has(url.origin) && url.pathname.startsWith('/v1/');
}

/**
 * Stale-while-revalidate with conditional GET.
 *
 * Cached response is served immediately (stale). Background revalidation
 * sends If-None-Match / If-Modified-Since. A 304 means content is unchanged
 * and the cache entry is kept as-is; a 200 replaces it.
 */
async function staleWhileRevalidate(event, request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request.url);

  if (cached) {
    // Serve stale immediately; revalidate in background
    event.waitUntil(doRevalidate(cache, request, cached));
    return cached;
  }

  // Nothing cached yet — block on first fetch
  return doRevalidate(cache, request, null);
}

async function doRevalidate(cache, request, cached) {
  const headers = new Headers();

  if (cached) {
    const etag = cached.headers.get('ETag');
    const lastMod = cached.headers.get('Last-Modified');
    if (etag) headers.set('If-None-Match', etag);
    else if (lastMod) headers.set('If-Modified-Since', lastMod);
  }

  try {
    const fresh = await fetch(
      new Request(request.url, {
        headers,
        credentials: request.credentials,
        mode: 'cors',
      }),
    );

    if (fresh.status === 304) return cached; // unchanged — keep cache
    if (fresh.ok) await cache.put(request.url, fresh.clone());
    return fresh;
  } catch {
    return cached ?? Response.error();
  }
}

/**
 * Network-first for page HTML — cache only used when offline.
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) await cache.put(request.url, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request.url);
    return cached ?? Response.error();
  }
}
