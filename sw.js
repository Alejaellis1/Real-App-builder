// This is a basic service worker for Progressive Web App functionality.
// It enables offline capabilities by caching essential files.

const CACHE_NAME = 'solopro-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // You can add more assets here like CSS files, images, or JS bundles
];

// Install event: opens a cache and adds the core files to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serves assets from cache if available, otherwise fetches from network.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      })
  );
});
