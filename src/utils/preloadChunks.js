// Precarga todos los chunks de rutas lazy en background
export const preloadAllChunks = () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    // Esperar 3 segundos después de la carga inicial
    setTimeout(() => {
      console.log('[Preload] Iniciando precarga de chunks...');
      
      // Detectar todos los chunks en el HTML
      const scripts = Array.from(document.querySelectorAll('script[src*="chunk"]'));
      const links = Array.from(document.querySelectorAll('link[href*="chunk"]'));
      
      const chunkUrls = [
        ...scripts.map(s => s.src),
        ...links.map(l => l.href)
      ].filter(url => url.includes('chunk') || url.includes('static/js'));

      // Precargar chunks manualmente
      chunkUrls.forEach(url => {
        fetch(url, { mode: 'no-cors' })
          .then(() => console.log('[Preload] Chunk cargado:', url))
          .catch(() => {});
      });

      // Enviar al SW para que los cachee
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_URLS',
          urls: chunkUrls
        });
      }
    }, 3000);
  }
};

// Prefetch de rutas lazy específicas
export const prefetchRoutes = () => {
  // Si usas React.lazy, esto fuerza la descarga
  setTimeout(() => {
    console.log('[Preload] Prefetching rutas...');
    
    // Simular navegación en background para forzar descarga de chunks
    const routes = ['/', '/servicios', '/Contact', '/FAQ', '/about', '/login', '/register', '/agendar-cita'];
    
    routes.forEach(route => {
      // Crear link invisible para prefetch
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }, 2000);
};