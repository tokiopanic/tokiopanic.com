// sw.js - Service Worker para TOKIO PANIC
const CACHE_NAME = 'tokio-panic-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/noticias-loader.js',
  '/logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png'
  // Añade aquí otros archivos importantes (imágenes, etc.)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registrado con éxito:', registration);
    })
    .catch(error => {
      console.error('Error al registrar el Service Worker:', error);
    });
}