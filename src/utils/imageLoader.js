import { useState } from 'react';

// Importación manual de imágenes en formato WebP
import img_1 from '../assets/imagenes/img_1.webp';
import img_2 from '../assets/imagenes/img_2.webp';
import img_3 from '../assets/imagenes/img_3.webp';
import img_4 from '../assets/imagenes/img_4.webp';
import img_5 from '../assets/imagenes/img_5.webp';
import img_6 from '../assets/imagenes/img_6.webp';
import img_7 from '../assets/imagenes/img_7.webp';
import img_8 from '../assets/imagenes/img_8.webp';
import img_9 from '../assets/imagenes/img_9.webp';

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
  const [isLoaded] = useState(true); // Sin precarga, asumimos cargadas por lazy loading

  return {
    images: imageArray,
    isLoaded,
    getImageByIndex,
    getRandomImage,
    totalImages: imageArray.length
  };
};

export { getImageByIndex, getRandomImage };
export default imageArray;