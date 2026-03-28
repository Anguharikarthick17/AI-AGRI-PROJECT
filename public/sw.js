// Simple service worker for PWA
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // Simple pass-through
  return fetch(e.request);
});
