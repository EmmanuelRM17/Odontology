
// src/utils/imageLoader.js

// Importar automáticamente todas las imágenes de la carpeta 'imagenes'
const importAllImages = (requireContext) => {
    return requireContext.keys().map(requireContext);
};

// Cargar todas las imágenes con extensiones jpg, png, jpeg
const images = importAllImages(require.context('../assets/imagenes', false, /\.(jpg|jpeg|png|gif)$/));

export default images;
