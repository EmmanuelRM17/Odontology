/* eslint-disable no-restricted-globals */
const CACHE_VERSION = 'dental-carol-v4.3';
const RUNTIME_CACHE = 'runtime-cache-v4.3';
const API_CACHE = 'api-cache-v4.3';
const IMAGE_CACHE = 'image-cache-v4.3';
const CHUNK_CACHE = 'chunk-cache-v4.3';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const NETWORK_TIMEOUT = 10000; // 10 segundos
const QUICK_TIMEOUT = 3000; // 3 segundos para navegación

// Instalar
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando v4.3...');
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando v4.3...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes('v4.3')) {
            console.log('[SW] Eliminando cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Verificar si hay conexión real
async function isOnline() {
  if (!navigator.onLine) return false;
  
  try {
    const response = await fetch('/manifest.json', { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Determinar si es request de API
function isApiRequest(url) {
  return url.hostname === 'back-end-4803.onrender.com' || 
         (url.hostname === 'localhost' && url.port === '3001');
}

// Determinar si es navegación
function isNavigationRequest(request, url) {
  return request.mode === 'navigate' || 
         request.destination === 'document' ||
         (request.method === 'GET' && 
          request.headers.get('accept') && 
          request.headers.get('accept').includes('text/html'));
}

// Determinar si es chunk
function isChunkFile(url) {
  return /\.(chunk|bundle)\.(js|css)$/.test(url.pathname) ||
         /\/static\/(js|css)\/.*\.(js|css)$/.test(url.pathname) ||
         url.pathname.includes('vendors~') ||
         /\/static\/js\/\d+\.\w+\.chunk\.js$/.test(url.pathname);
}

// Fetch principal
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // APIs
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Imágenes
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Chunks
  if (isChunkFile(url)) {
    event.respondWith(networkFirst(request, CHUNK_CACHE));
    return;
  }

  // JS/CSS
  if (/\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Navegaciones
  if (isNavigationRequest(request, url)) {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default
  event.respondWith(cacheFirst(request, RUNTIME_CACHE));
});

// Network First con timeout inteligente
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response && response.ok) {
      cache.put(request, response.clone());
      return response;
    }
    
    return response;
  } catch (error) {
    // Solo usar cache si realmente no hay red
    if (error.name === 'AbortError' || !navigator.onLine) {
      const cached = await cache.match(request);
      if (cached) {
        console.log('[SW] Desde cache:', request.url);
        return cached;
      }
    }
    
    // Si es API, retornar error JSON
    if (request.url.includes('back-end')) {
      return new Response(
        JSON.stringify({ error: 'Error de conexión', offline: true }), 
        { 
          headers: { 'Content-Type': 'application/json' }, 
          status: 503 
        }
      );
    }
    
    throw error;
  }
}

// Stale While Revalidate optimizado
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// Cache First con fallback
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Solo para imágenes retornar placeholder
    if (request.destination === 'image') {
      return new Response(
        '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect fill="#e0e0e0" width="100" height="100"/></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

// Manejo inteligente de navegaciones
async function handleNavigation(request) {
  const url = new URL(request.url);
  
  try {
    // Intentar red con timeout corto
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), QUICK_TIMEOUT);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[SW] Timeout/Error en navegación, usando cache');
  }

  // Buscar en caches
  const caches_list = [RUNTIME_CACHE, CACHE_VERSION];
  
  for (const cacheName of caches_list) {
    const cache = await caches.open(cacheName);
    
    // Intentar URL exacta
    let cached = await cache.match(request);
    if (cached) return cached;
    
    // Intentar index.html
    cached = await cache.match('/index.html');
    if (cached) return cached;
    
    // Intentar root
    cached = await cache.match('/');
    if (cached) return cached;
  }

  // Solo si realmente no hay nada en cache
  return offlinePage();
}

// Página offline simple
function offlinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sin conexión - Odontología Carol</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #4B9FFF 0%, #1976d2 100%);
            color: white;
            text-align: center;
            padding: 2rem;
          }
          .container { max-width: 500px; }
          .icon { font-size: 5rem; margin-bottom: 1.5rem; }
          h1 { font-size: 2rem; margin-bottom: 1rem; font-weight: 600; }
          p { font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9; line-height: 1.5; }
          button {
            padding: 1rem 2.5rem;
            font-size: 1rem;
            background: white;
            color: #1976d2;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
          }
          button:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(0,0,0,0.3); 
          }
          button:active { transform: translateY(0); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🦷</div>
          <h1>Sin conexión</h1>
          <p>No se puede cargar esta página sin conexión a internet. Verifica tu red e intenta nuevamente.</p>
          <button onclick="window.location.reload()">Reintentar</button>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' },
    status: 200
  });
}

// Mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(CHUNK_CACHE).then(cache => {
      console.log('[SW] Precacheando:', urls.length);
      return cache.addAll(urls).catch(err => {
        console.warn('[SW] Error precacheando:', err);
      });
    });
  }
});