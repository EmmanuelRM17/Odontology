import { useState, useEffect } from 'react';

// Importación manual de imágenes (más confiable)
import img_1 from '../assets/imagenes/img_1.png';
import img_2 from '../assets/imagenes/img_2.png';
import img_3 from '../assets/imagenes/img_3.png';
import img_4 from '../assets/imagenes/img_4.png';
import img_5 from '../assets/imagenes/img_5.png';
import img_6 from '../assets/imagenes/img_6.png';
import img_7 from '../assets/imagenes/img_7.png';
import img_8 from '../assets/imagenes/img_8.png';
import img_9 from '../assets/imagenes/img_9.png';

// Array de imágenes con orden garantizado
const imageArray = [
  img_1,
  img_2, 
  img_3,
  img_4,
  img_5,
  img_6,
  img_7,
  img_8,
  img_9
].filter(Boolean); // Filtra valores undefined/null

// Función de precarga optimizada
const preloadImages = () => {
  if (typeof window === 'undefined') return;
  
  const preload = () => {
    imageArray.forEach((src, index) => {
      if (src) {
        const img = new Image();
        img.src = src;
        img.loading = 'eager';
        // Solo log en desarrollo
        if (process.env.NODE_ENV === 'development') {
          img.onload = () => console.log(`✅ Imagen ${index + 1} cargada`);
          img.onerror = () => console.error(`❌ Error en imagen ${index + 1}`);
        }
      }
    });
  };
  
  // Usar requestIdleCallback si está disponible
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preload, { timeout: 2000 });
  } else {
    setTimeout(preload, 100);
  }
};

// Función para obtener imagen por índice de forma segura
const getImageByIndex = (index) => {
  if (!imageArray.length) return '';
  const safeIndex = ((index % imageArray.length) + imageArray.length) % imageArray.length;
  return imageArray[safeIndex];
};

// Función para obtener imagen aleatoria
const getRandomImage = () => {
  if (!imageArray.length) return '';
  const randomIndex = Math.floor(Math.random() * imageArray.length);
  return imageArray[randomIndex];
};

// Hook personalizado para manejo de imágenes
export const useImages = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    preloadImages();
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  return {
    images: imageArray,
    isLoaded,
    getImageByIndex,
    getRandomImage,
    totalImages: imageArray.length
  };
};

// Solo precargar en cliente
if (typeof window !== 'undefined') {
  preloadImages();
}

export { getImageByIndex, getRandomImage };
export default imageArray;