/* eslint-disable no-restricted-globals */
const CACHE_VERSION = 'dental-carol-v4.2';
const RUNTIME_CACHE = 'runtime-cache-v4.2';
const API_CACHE = 'api-cache-v4.2';
const IMAGE_CACHE = 'image-cache-v4.2';
const CHUNK_CACHE = 'chunk-cache-v4.2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalar
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando v4.2...');
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activar
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando v4.2...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes('v4.2')) {
            console.log('[SW] Eliminando cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Determinar tipo de request
function isApiRequest(url) {
  return url.hostname === 'back-end-4803.onrender.com' || 
         (url.hostname === 'localhost' && url.port === '3001');
}

function isNavigationRequest(request, url) {
  return request.mode === 'navigate' || 
         request.destination === 'document' ||
         (request.method === 'GET' && 
          request.headers.get('accept') && 
          request.headers.get('accept').includes('text/html'));
}

function isChunkFile(url) {
  return /\.(chunk|bundle)\.(js|css)$/.test(url.pathname) ||
         /\/static\/(js|css)\/.*\.(js|css)$/.test(url.pathname) ||
         url.pathname.includes('vendors~') ||
         url.pathname.includes('node_modules') ||
         /\/static\/js\/\d+\.\w+\.chunk\.js$/.test(url.pathname);
}

// Fetch con auto-cache agresivo de chunks
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // 1. APIs
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 2. Imágenes
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // 3. CHUNKS - Cache First AGRESIVO + Auto-cache
  if (isChunkFile(url)) {
    event.respondWith(chunkStrategyAggressive(request));
    return;
  }

  // 4. JS/CSS generales
  if (/\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 5. Navegaciones
  if (isNavigationRequest(request, url)) {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 6. Otros
  event.respondWith(cacheFirst(request, RUNTIME_CACHE));
});

// Estrategia agresiva para chunks: siempre intenta descargar Y cachear
async function chunkStrategyAggressive(request) {
  const cache = await caches.open(CHUNK_CACHE);
  const url = new URL(request.url);
  
  try {
    // Siempre intentar red primero para chunks
    console.log('[SW] Descargando chunk:', url.pathname);
    const response = await fetch(request);
    
    if (response && response.ok) {
      // Cachear inmediatamente
      cache.put(request, response.clone());
      console.log('[SW] Chunk cacheado:', url.pathname);
      return response;
    }
    return response;
  } catch (error) {
    // Si falla, buscar en cache
    console.log('[SW] Red falló, buscando chunk en cache:', url.pathname);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[SW] Chunk encontrado en cache');
      return cached;
    }
    
    console.error('[SW] Chunk no disponible:', url.pathname);
    return new Response('Chunk no disponible offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network First para APIs
async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 5000)
      )
    ]);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] API desde cache:', request.url);
      return cached;
    }
    return new Response(
      JSON.stringify({ error: 'Sin conexión', offline: true }), 
      { headers: { 'Content-Type': 'application/json' }, status: 503 }
    );
  }
}

// Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || fetchPromise;
}

// Cache First
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
    if (request.destination === 'image') {
      return new Response(
        '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect fill="#ddd" width="100" height="100"/></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Offline', { status: 503 });
  }
}

// Manejo de navegaciones
async function handleNavigation(request) {
  const url = new URL(request.url);
  console.log('[SW] Navegación:', url.pathname);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[SW] Red falló para:', url.pathname);
  }

  const runtimeCache = await caches.open(RUNTIME_CACHE);
  let cached = await runtimeCache.match(request);
  if (cached) return cached;

  const precache = await caches.open(CACHE_VERSION);
  cached = await precache.match('/index.html');
  if (cached) return cached;

  cached = await runtimeCache.match('/index.html');
  if (cached) return cached;

  cached = await runtimeCache.match('/');
  if (cached) return cached;

  return offlinePage();
}

// Página offline
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 2rem;
          }
          .container { max-width: 500px; }
          .icon { font-size: 5rem; margin-bottom: 1.5rem; }
          h1 { font-size: 2rem; margin-bottom: 1rem; }
          p { font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.95; }
          button {
            padding: 1rem 2rem;
            font-size: 1rem;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s;
          }
          button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🦷📡</div>
          <h1>Sin conexión a internet</h1>
          <p>No pudimos cargar esta página. Por favor, verifica tu conexión.</p>
          <button onclick="window.location.reload()">Reintentar</button>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' },
    status: 200
  });
}

// Skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // NUEVO: Mensaje para precachear chunks manualmente
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(CHUNK_CACHE).then(cache => {
      console.log('[SW] Precacheando chunks:', urls.length);
      cache.addAll(urls).catch(err => {
        console.error('[SW] Error precacheando:', err);
      });
    });
  }
});