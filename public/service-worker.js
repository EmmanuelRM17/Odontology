/* eslint-disable no-restricted-globals */
const CACHE_VERSION = 'dental-carol-v2.0';
const RUNTIME_CACHE = 'runtime-cache-v2.0';
const API_CACHE = 'api-cache-v2.0';

// Recursos críticos para cache
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/assets/logo192.png',
  '/assets/logoS12.png'
];

// URLs de API que se cachean
const API_URLS = [
  'https://back-end-4803.onrender.com/api/perfilEmpresa/getTitleAndLogo',
  'https://back-end-4803.onrender.com/api/servicios'
];

// Instalar y cachear recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_VERSION && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de fetch con Network First para API, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear GET requests
  if (request.method !== 'GET') return;

  // API requests - Network First
  if (url.origin === 'https://back-end-4803.onrender.com') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Assets - Cache First
  event.respondWith(cacheFirstStrategy(request));
});

// Network First - intenta red, fallback a cache
async function networkFirstStrategy(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || new Response(
      JSON.stringify({ error: 'Sin conexión', offline: true }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Cache First - usa cache, actualiza en background
async function cacheFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // Actualizar cache en background
    fetch(request).then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
    }).catch(() => {});
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Escuchar mensajes para skip waiting
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});