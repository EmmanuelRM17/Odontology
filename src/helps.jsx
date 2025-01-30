import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Suspense, lazy } from 'react';

// Importar todas las imágenes de la carpeta "imagenes"
import img1 from '../../../assets/imagenes/img (1).jpeg';
import img2 from '../../../assets/imagenes/img (1).jpg';
import img3 from '../../../assets/imagenes/img (1).png';
import img4 from '../../../assets/imagenes/img (2).jpg';
import img5 from '../../../assets/imagenes/img (3).jpg';
import img6 from '../../../assets/imagenes/img (3).png';
import img7 from '../../../assets/imagenes/img (4).jpg';
import img8 from '../../../assets/imagenes/img (5).jpg';
import img9 from '../../../assets/imagenes/img (6).jpg';
import img10 from '../../../assets/imagenes/img (8).jpg';
import img11 from '../../../assets/imagenes/img (9).jpg';
import img12 from '../../../assets/imagenes/img (10).jpg';
import img13 from '../../../assets/imagenes/img (11).jpg';
import img14 from '../../../assets/imagenes/img (12).jpg';
import img15 from '../../../assets/imagenes/img (13).jpg';
import img16 from '../../../assets/imagenes/img (14).jpg';
import img17 from '../../../assets/imagenes/img (15).jpg';
import img18 from '../../../assets/imagenes/img (16).jpg';
import img19 from '../../../assets/imagenes/img (17).jpg';

const Ubicacion = lazy(() => import('./Ubicacion'));

const preloadImages = (images) => {
  return Promise.all(
    images.map((imageUrl) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);  // Resolver cuando la imagen esté cargada
        img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`)); // Manejo de errores
        img.src = imageUrl; // Iniciar la carga de la imagen
      });
    })
  );
};


// Optimized animation variants with smoother and fluid transitions
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1], // Custom ease curve for smoother motion
    },
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

// Optimized card animation with more fluid transitions
const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.5, // Duración de transición optimizada
      ease: [0.32, 0.72, 0, 1], // Easing suave
    }
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    transition: { 
      duration: 0.4, 
      ease: [0.32, 0.72, 0, 1], // Easing suave también para la salida
    }
  }
};


// Memoized services array
const services = [
  { title: 'Consulta Dental General', img: img1, description: 'Consulta básica para revisar tu salud bucal.' },
  { title: 'Limpieza Dental por Ultrasonido', img: img2, description: 'Eliminación de placa dental con ultrasonido.' },
  { title: 'Curetaje (Limpieza Profunda)', img: img3, description: 'Limpieza profunda para tratar problemas de encías.' },
  { title: 'Asesoría sobre Diseño de Sonrisa', img: img4, description: 'Diseño de sonrisa personalizado.' },
  { title: 'Cirugía Estética de Encía', img: img5, description: 'Mejora la estética de tus encías.' },
  { title: 'Obturación con Resina', img: img6, description: 'Restauración de dientes dañados por caries con resina.' },
  { title: 'Incrustación Estética y de Metal', img: img7, description: 'Colocación de incrustaciones estéticas o metálicas en dientes.' },
  { title: 'Coronas Fijas Estéticas o de Metal', img: img8, description: 'Coronas fijas para dientes dañados o perdidos.' },
  { title: 'Placas Removibles Parciales', img: img9, description: 'Placas removibles para dientes faltantes.' },
  { title: 'Placas Totales Removibles', img: img10, description: 'Placas removibles para prótesis dentales completas.' },
  { title: 'Guardas Dentales', img: img11, description: 'Protección dental para evitar daño durante la noche.' },
  { title: 'Placas Hawley', img: img12, description: 'Placas ortodónticas para mantener los dientes en su lugar.' },
  { title: 'Extracción Dental', img: img13, description: 'Extracción de dientes problemáticos o innecesarios.' },
  { title: 'Ortodoncia y Ortopedia Maxilar', img: img14, description: 'Tratamientos para corregir la alineación de los dientes y maxilares.' },
].map(service => ({
  ...service,
  imgStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  }
}));

const Home = () => {
  const theme = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedImages, setLoadedImages] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // Theme detection
  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkTheme(matchDarkTheme.matches);

    const handleThemeChange = (e) => setIsDarkTheme(e.matches);
    matchDarkTheme.addEventListener('change', handleThemeChange);
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
  }, []);
  // Preload next image for smoother transitions
  const preloadNextImage = useCallback((nextIndex) => {
    const img = new Image();
    img.src = services[nextIndex].img;
  }, []);

  // Preload images on component mount
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      try {
        await preloadImages(services.map(service => service.img));
      } catch (error) {
        console.error('Error preloading images:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadImages();
  }, []);

 // Enhanced next image handler with direction
  const handleNext = useCallback(() => {
    if (!isPaused && !isLoading) {
      const nextIndex = (activeIndex + 1) % services.length;
      setDirection(1);
      setActiveIndex(nextIndex);
      // Preload the next image
      preloadNextImage((nextIndex + 1) % services.length);
    }
  }, [activeIndex, isPaused, isLoading, preloadNextImage]);

  // Enhanced previous image handler with direction
  const handlePrev = useCallback(() => {
    if (!isPaused && !isLoading) {
      const nextIndex = (activeIndex - 1 + services.length) % services.length;
      setDirection(-1);
      setActiveIndex(nextIndex);
      // Preload the previous image
      preloadNextImage((nextIndex - 1 + services.length) % services.length);
    }
  }, [activeIndex, isPaused, isLoading, preloadNextImage]);

  // Optimized auto-slide with preloading
  useEffect(() => {
    if (!isPaused && !isLoading) {
      const interval = setInterval(() => {
        handleNext();
      }, 3000); // Changed to 3 seconds as requested
      return () => clearInterval(interval);
    }
  }, [handleNext, isPaused, isLoading]);

    // Initial images preloading
    useEffect(() => {
      const preloadAllImages = async () => {
        setIsLoading(true);
        try {
          await Promise.all(
            services.map(service => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = service.img;
              });
            })
          );
        } finally {
          setIsLoading(false);
        }
      };
      preloadAllImages();
    }, []);
  

  // Mouse event handlers
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);  // Pausa la navegación al pasar el ratón
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);  // Reanuda la navegación al quitar el ratón
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkTheme
          ? 'linear-gradient(135deg, #1C2A38 0%, #2C3E50 100%)'
          : 'linear-gradient(120deg, #ffffff 0%, #E5F3FD 100%)',
        transition: 'background 0.5s ease',
        position: 'relative',
        paddingTop: isMobile ? '70px' : '80px', // Espacio para el header fijo
      }}
    >
      {/* Header Fijo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: '1rem 0',
        }}
      >
        <Typography
          variant={isMobile ? "h4" : "h3"}
          fontWeight="bold"
          color="primary"
          fontFamily="Montserrat, sans-serif"
          sx={{
            textAlign: 'center',
            background: 'linear-gradient(45deg, #03427C, #2196F3)',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Odontología Carol
        </Typography>
      </Box>

      {/* Carousel Section */}
      <Box
        sx={{
          position: 'relative',
          height: isMobile ? 'calc(100vh - 70px)' : 'calc(85vh - 80px)',
          overflow: 'hidden',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={activeIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Contenedor de la imagen de fondo */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'transform 0.3s ease-out',
              },
            }}
          >
            <img
              src={services[activeIndex].img}
              alt={services[activeIndex].title}
              style={{
                transform: `scale(${isLoading ? 1.1 : 1})`,
                filter: `blur(${isLoading ? '10px' : '0'})`,
              }}
            />
          </Box>
    
          {/* Overlay (superposición de color y desenfoque) */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6))',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Contenido (tarjeta con texto y botón) */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Box
              sx={{
                position: 'relative',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '3rem',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '0 auto',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                zIndex: 1,
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary"
                mb={2}
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  letterSpacing: '-0.5px',
                }}
              >
                {services[activeIndex].title}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                mb={3}
                sx={{
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                }}
              >
                {services[activeIndex].description}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  borderRadius: '30px',
                  padding: '12px 36px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  backgroundImage: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, #1976D2, #2196F3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Agendar Cita
              </Button>
            </Box>
          </motion.div>
        </motion.div>
      </AnimatePresence>

        {/* Navigation Buttons */}
        {!isMobile && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                zIndex: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  transform: 'translateY(-50%) scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <NavigateBefore />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                zIndex: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  transform: 'translateY(-50%) scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <NavigateNext />
            </IconButton>
          </>
        )}
      </Box>

      {/* Location Section */}
      <Box
        sx={{
            background: isDarkTheme ? '#ffffff05' : '#ffffff05',
          padding: '4rem 0',
          textAlign: 'center',
          maxWidth: isMobile ? '90%' : '60%',
          margin: 'auto',
          borderRadius: '12px',
        }}
      >
        <Suspense fallback={
          <Box sx={{ padding: '2rem' }}>
            <Typography>Cargando mapa...</Typography>
          </Box>
        }>
          <Ubicacion />
        </Suspense>
      </Box>
    </Box>
  );
};

export default React.memo(Home);