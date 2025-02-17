import React, { useState, useEffect } from 'react'; // Importar Suspense aquí
import { Box, Typography, IconButton } from '@mui/material';
import { useMediaQuery, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lazy } from 'react';
import { useRef } from 'react';

import img1 from '../../../assets/imagenes/img_1.jpg';
import img2 from '../../../assets/imagenes/img_2.jpg';
import img3 from '../../../assets/imagenes/img_3.jpg';
import img4 from '../../../assets/imagenes/img_4.jpg';
import img5 from '../../../assets/imagenes/img_5.jpg';
import img6 from '../../../assets/imagenes/img_6.jpg';
import img7 from '../../../assets/imagenes/img_7.jpg';
import img8 from '../../../assets/imagenes/img_8.jpg';
import img9 from '../../../assets/imagenes/img_9.jpg';
import img10 from '../../../assets/imagenes/img_10.jpg';
import img11 from '../../../assets/imagenes/img_11.jpg';
import img12 from '../../../assets/imagenes/img_12.jpg';

const rotatingTexts = [
  "Cuidamos tu sonrisa",
  "Tu salud bucal, nuestra prioridad",
  "Sonrisas saludables, vidas felices",
  "Excelencia en odontología",
  "Confía en los expertos en salud dental"
];

const Home = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const [currentText, setCurrentText] = useState(rotatingTexts[0]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');
  const typingIntervalRef = useRef(null);
  const autoRotateDelay = 7000;
  const serviceIndexRef = useRef(0);
  const textIndexRef = useRef(0);
  const imageIndexRef = useRef(0);

  useEffect(() => {
    if (isPaused) return;

    let frame;
    let startTime = performance.now();
    const duration = autoRotateDelay;

    const animate = (currentTime) => {
      if (currentTime - startTime >= duration) {
        serviceIndexRef.current = (serviceIndexRef.current + 1) % services.length;
        setCurrentServiceIndex(serviceIndexRef.current);
        startTime = currentTime;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPaused]);

  const nextService = () => {
    setCurrentServiceIndex((prev) => (prev + 1) % services.length);
  };

  const prevService = () => {
    setCurrentServiceIndex((prev) =>
      prev === 0 ? services.length - 1 : prev - 1
    );
  };

  const startTypingEffect = (text) => {
    if (!text) return; // Evitar valores undefined
    setDisplayedText(''); // Limpiar el texto antes de escribir
    let index = 0;

    const typeNextLetter = () => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index)); // Agregar letra sin concatenar manualmente
        index++;
        setTimeout(typeNextLetter, 100); // Velocidad de escritura (ajustable)
      }
    };

    typeNextLetter(); // Iniciar la animación
  };

  useEffect(() => {
    let frame;
    let startTime = performance.now();
    const duration = 10000; // Cambia el texto cada 5 segundos

    const animate = (currentTime) => {
      if (currentTime - startTime >= duration) {
        textIndexRef.current = (textIndexRef.current + 1) % rotatingTexts.length;
        startTypingEffect(rotatingTexts[textIndexRef.current]); // Iniciar escritura del nuevo texto
        startTime = currentTime;
      }
      frame = requestAnimationFrame(animate);
    };

    startTypingEffect(rotatingTexts[0]); // Iniciar el primer texto
    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setCurrentText(rotatingTexts[index]);
  }, [index]);

  const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
        if (!response.ok) {
          throw new Error('Error al obtener los servicios');
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Theme detection
  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkTheme(matchDarkTheme.matches);

    const handleThemeChange = (e) => setIsDarkTheme(e.matches);
    matchDarkTheme.addEventListener('change', handleThemeChange);
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
  }, []);

  // Mejorada la transición de imágenes de fondo
  useEffect(() => {
    let frame;
    let startTime = performance.now();
    const duration = 12000;

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;

      if (elapsedTime >= duration) {
        imageIndexRef.current = (imageIndexRef.current + 1) % images.length;
        setCurrentImageIndex(imageIndexRef.current);
        startTime = currentTime;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Nuevo efecto para manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const fadeStart = windowHeight * 0.3; // Comienza a desvanecer al 30% del scroll
      const fadeEnd = windowHeight * 0.8; // Completamente desvanecido al 80% del scroll

      if (scrollPosition <= fadeStart) {
        setScrollOpacity(1);
      } else if (scrollPosition >= fadeEnd) {
        setScrollOpacity(0);
      } else {
        const opacity = 1 - ((scrollPosition - fadeStart) / (fadeEnd - fadeStart));
        setScrollOpacity(opacity);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <Box
      sx={{
        background: isDarkTheme
          ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
          : 'linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)',
        transition: 'background 0.5s ease',
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden'
      }}
    >

      {/* Background Carousel */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: scrollOpacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute', // Cambiado a absolute para que se mantenga en su posición original
            top: 0,
            left: 0,
            width: '100%',
            height: '90vh',
            backgroundImage: `url(${images[currentImageIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
            willChange: 'opacity', // Optimización de rendimiento
          }}
        />
      </AnimatePresence>

      {/* Content Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: { xs: '1rem', md: '2rem' },
        }}
      >
        {/* Título Bienvenido con Estilo y Animación */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '3rem' }} // 🔹 Ajustamos márgenes
        >
          <Typography
            variant={isSmallScreen ? 'h4' : 'h2'}
            sx={{
              color: '#03427C',
              fontWeight: 700,
              fontFamily: 'Montserrat, sans-serif',
              textTransform: 'capitalize',
              letterSpacing: '1.5px',
              position: 'relative',
              display: 'inline-block',
              paddingBottom: '0.3rem',
              borderBottom: '3px solid #03427C',
              textShadow: '4px 4px 6px rgba(0,0,0,0.3)', // Sombra oscura para resaltar
              WebkitTextStroke: '.5px rgba(255,255,255,0.8)',
            }}
          >
            {displayedText}
          </Typography>
        </motion.div>



        {/* Services Carousel Container */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            my: { xs: 2, md: 4 },
            overflow: 'visible',
          }}
        >
          {/* Navigation Buttons */}
          <IconButton
            onClick={prevService}
            sx={{
              position: 'absolute',
              left: { xs: '5px', md: '50px' },
              zIndex: 5,
              color: 'white',
              backgroundColor: 'rgba(3, 66, 124, 0.2)',
              '&:hover': { backgroundColor: 'rgba(3, 66, 124, 0.4)' }
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Services Display */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '1500px',
              overflow: 'hidden'
            }}
          >
            {/* 🔹 Manejo de Carga */}
            {services.length === 0 ? (
              <Typography sx={{ color: 'white', textAlign: 'center' }}>
                Cargando servicios...
              </Typography>
            ) : (
              services.map((_, index) => {
                if (!services[currentServiceIndex]) return null; 
                const totalServices = services.length;
                if (totalServices === 0) return null; // Evita errores si no hay datos

                const normalizedIndex =
                  ((index - currentServiceIndex) % totalServices + totalServices) % totalServices;
                const offset =
                  normalizedIndex <= totalServices / 2
                    ? normalizedIndex
                    : normalizedIndex - totalServices;
                const service = services[(index + currentServiceIndex) % totalServices];
                const isCenter = offset === 0;

                const position = offset * (isMobile ? 120 : 180);
                const opacity = Math.abs(offset) <= 2 ? 1 - Math.abs(offset) * 0.2 : 0.2;
                const scale = isCenter ? 1 : 0.8 - Math.abs(offset) * 0.1;
                const rotation = offset * -25;

                return (
                  <motion.div
                    key={service.id} // Asegura que cada servicio tenga una clave única
                    style={{
                      position: 'absolute',
                      width: isMobile ? '280px' : '320px',
                    }}
                    animate={{
                      x: `${position}%`,
                      scale: scale,
                      opacity: opacity,
                      zIndex: isCenter ? 3 : 2 - Math.abs(offset),
                      rotateY: rotation,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30
                    }}
                  >
                    <Tooltip title="Click para más información" arrow>
                      <Box
                        onClick={() => navigate(`/servicios/detalle/${service.id}`)}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '15px',
                          padding: '2rem',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: isCenter
                            ? '0 0 30px rgba(3, 66, 124, 0.8), 0 0 50px rgba(3, 66, 124, 0.4)'
                            : '0 0 15px rgba(3, 66, 124, 0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            transform: 'translateY(-5px)',
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'white',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            mb: 2,
                            fontSize: { xs: '1.1rem', md: '1.25rem' }
                          }}
                        >
                          {service.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            textAlign: 'center',
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }}
                        >
                          {service.description.split('.')[0] + '.'}
                        </Typography>

                      </Box>
                    </Tooltip>
                  </motion.div>
                );
              })
            )}
          </Box>

          <IconButton
            onClick={nextService}
            sx={{
              position: 'absolute',
              right: { xs: '5px', md: '50px' },
              zIndex: 5,
              color: 'white',
              backgroundColor: 'rgba(3, 66, 124, 0.2)',
              '&:hover': { backgroundColor: 'rgba(3, 66, 124, 0.4)' }
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;