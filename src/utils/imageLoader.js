/**
 * Carga automática optimizada de imágenes con ordenamiento consistente
 */

// Importar automáticamente todas las imágenes de la carpeta 'imagenes'
const importAllImages = (requireContext) => {
  try {
    // Obtenemos los keys (rutas) de todas las imágenes
    const keys = requireContext.keys();
    
    // Creamos un objeto con clave: ruta, valor: imagen
    const images = {};
    keys.forEach(key => {
      images[key] = requireContext(key);
    });
    
    // Ordenamos las keys alfabéticamente para tener un orden consistente
    const sortedKeys = keys.sort();
    
    // Creamos un array de imágenes ordenado según las keys ordenadas
    return sortedKeys.map(key => images[key]);
  } catch (error) {
    console.error('Error cargando imágenes:', error);
    return []; // Devolvemos array vacío en caso de error
  }
};

// Detectamos si estamos en entorno de servidor (SSR) para evitar errores
const isServer = typeof window === 'undefined';

// Wrapper para require.context que funciona tanto en desarrollo como en producción
const safeRequireContext = () => {
  if (isServer) return { keys: () => [] }; // Si estamos en servidor, devuelve objeto vacío
  
  try {
    return require.context('../assets/imagenes', false, /\.(jpg|jpeg|png|gif)$/);
  } catch (error) {
    console.warn('Error en require.context:', error);
    return { keys: () => [] };
  }
};

// Cargar todas las imágenes con extensiones jpg, png, jpeg, ordenadas por nombre
const images = importAllImages(safeRequireContext());

// Función para precargar imágenes (mejora el rendimiento del carrusel)
const preloadImages = () => {
  if (isServer) return; // No precargar en el servidor
  
  // Utilizar requestIdleCallback para no bloquear el hilo principal si está disponible
  const preload = () => {
    images.forEach((src) => {
      if (typeof src === 'string') {
        const img = new Image();
        img.src = src;
      }
    });
  };
  
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(preload, { timeout: 2000 });
  } else {
    // Fallback a setTimeout para navegadores que no soportan requestIdleCallback
    setTimeout(preload, 300);
  }
};

// Precargamos imágenes cuando se importa este módulo (solo en cliente)
if (!isServer) {
  preloadImages();
}

// Exportamos las imágenes y también una función para obtener una imagen específica por índice de manera segura
const getImageByIndex = (index) => {
  if (!images.length) return ''; // Si no hay imágenes, devolver string vacío
  
  // Asegurarse de que el índice sea válido (modulo length)
  const safeIndex = ((index % images.length) + images.length) % images.length;
  return images[safeIndex];
};

export { getImageByIndex };
export default images;