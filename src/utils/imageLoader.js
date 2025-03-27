// src/utils/imageLoader.js

/**
 * Carga automática optimizada de imágenes con ordenamiento consistente
 */

// Importar automáticamente todas las imágenes de la carpeta 'imagenes'
const importAllImages = (requireContext) => {
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
  };
  
  // Cargar todas las imágenes con extensiones jpg, png, jpeg, ordenadas por nombre
  const images = importAllImages(require.context('../assets/imagenes', false, /\.(jpg|jpeg|png|gif)$/));
  
  // Función para precargar imágenes (mejora el rendimiento del carrusel)
  const preloadImages = () => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  };
  
  // Precargamos imágenes cuando se importa este módulo
  preloadImages();
  
  export default images;