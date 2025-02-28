import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useMediaQuery, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

import images from '../../../utils/imageLoader';

const rotatingTexts = [
  "Cuidamos tu sonrisa",
  "Tu salud bucal, nuestra prioridad",
  "Sonrisas saludables, vidas felices",
  "Excelencia en odontología",
  "Confía en los expertos en salud dental"
];

const Home = () => {
  const { isDarkTheme } = useThemeContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:900px)');
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
    if (isPaused || services.length === 0) return;

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
  }, [isPaused, services]);

  const nextService = () => {
    setCurrentServiceIndex((prev) => (prev + 1) % services.length);
  };

  const prevService = () => {
    setCurrentServiceIndex((prev) =>
      prev === 0 ? services.length - 1 : prev - 1
    );
  };

  const startTypingEffect = (text) => {
    if (!text) return;
    setDisplayedText('');
    let index = 0;

    const typeNextLetter = () => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
        setTimeout(typeNextLetter, 100);
      }
    };

    typeNextLetter();
  };

  useEffect(() => {
    let frame;
    let startTime = performance.now();
    const duration = 10000;

    const animate = (currentTime) => {
      if (currentTime - startTime >= duration) {
        textIndexRef.current = (textIndexRef.current + 1) % rotatingTexts.length;
        startTypingEffect(rotatingTexts[textIndexRef.current]);
        startTime = currentTime;
      }
      frame = requestAnimationFrame(animate);
    };

    startTypingEffect(rotatingTexts[0]);
    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setCurrentText(rotatingTexts[index]);
  }, [index]);

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const fadeStart = windowHeight * 0.3;
      const fadeEnd = windowHeight * 0.8;

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
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100vh',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          padding: { xs: '1rem', md: '2rem' },
        }}
      >
        {/* Servicio Carrusel Vertical - Lado Izquierdo */}
        <Box
          sx={{
            width: isMobile ? '100%' : '40%',
            height: isMobile ? '50vh' : '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Botón de navegación superior */}
          <IconButton
            onClick={prevService}
            sx={{
              position: 'absolute',
              top: '50px',
              zIndex: 5,
              color: 'white',
              backgroundColor: 'rgba(3, 66, 124, 0.2)',
              '&:hover': { backgroundColor: 'rgba(3, 66, 124, 0.4)' }
            }}
          >
            <ExpandLess />
          </IconButton>

          {/* Visualización de Servicios Verticalmente */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: isMobile ? '300px' : '70%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '1500px',
              overflow: 'visible'
            }}
          >
            {loading ? (
              <Typography sx={{ color: isDarkTheme ? 'white' : '#03427C', textAlign: 'center' }}>
                Cargando servicios...
              </Typography>
            ) : error ? (
              <Typography sx={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>
                {error}
              </Typography>
            ) : services.length === 0 ? (
              <Typography sx={{ color: isDarkTheme ? 'white' : '#03427C', textAlign: 'center' }}>
                No hay servicios disponibles en este momento.
              </Typography>
            ) : (
              services.map((service, i) => {
                const totalServices = services.length;
                let offset = i - currentServiceIndex;
                if (offset > totalServices / 2) offset -= totalServices;
                if (offset < -totalServices / 2) offset += totalServices;
                const isCenter = offset === 0;
                const position = offset * 150; // Distancia vertical entre tarjetas
                const opacity = Math.abs(offset) <= 2 ? 1 - Math.abs(offset) * 0.2 : 0;
                const scale = isCenter ? 1 : 0.85 - Math.abs(offset) * 0.1;
                const translateY = position; // Movimiento vertical

                return (
                  <motion.div
                    key={service.id}
                    style={{
                      position: 'absolute',
                      width: '90%',
                      maxWidth: '350px',
                    }}
                    animate={{
                      y: translateY,
                      scale: scale,
                      opacity: opacity,
                      zIndex: isCenter ? 3 : 2 - Math.abs(offset),
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
                          padding: '1.5rem',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: isCenter
                            ? '0 0 30px rgba(3, 66, 124, 0.8), 0 0 50px rgba(3, 66, 124, 0.4)'
                            : '0 0 15px rgba(3, 66, 124, 0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: isDarkTheme ? 'white' : '#03427C',
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
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(3, 66, 124, 0.9)',
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

          {/* Botón de navegación inferior */}
          <IconButton
            onClick={nextService}
            sx={{
              position: 'absolute',
              bottom: '50px',
              zIndex: 5,
              color: 'white',
              backgroundColor: 'rgba(3, 66, 124, 0.2)',
              '&:hover': { backgroundColor: 'rgba(3, 66, 124, 0.4)' }
            }}
          >
            <ExpandMore />
          </IconButton>
        </Box>

        {/* Círculo con Imágenes y Texto - Lado Derecho */}
        <Box
          sx={{
            width: isMobile ? '100%' : '60%',
            height: isMobile ? '50vh' : '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Círculo con imágenes */}
          <Box
            sx={{
              position: 'relative',
              width: isMobile ? '300px' : '500px',
              height: isMobile ? '300px' : '500px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 0 30px rgba(3, 66, 124, 0.6)',
              border: '4px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Imágenes dentro del círculo */}
            <AnimatePresence initial={false}>
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: scrollOpacity }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${images[currentImageIndex]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.7)',
                  willChange: 'opacity',
                }}
              />
            </AnimatePresence>

            {/* Texto centrado dentro del círculo */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                textAlign: 'center',
                zIndex: 5,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '1rem',
                borderRadius: '10px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Typography
                  variant={isSmallScreen ? 'h5' : 'h4'}
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontFamily: 'Montserrat, sans-serif',
                    textTransform: 'capitalize',
                    letterSpacing: '1.5px',
                    position: 'relative',
                    display: 'inline-block',
                    paddingBottom: '0.3rem',
                    borderBottom: '3px solid white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    minHeight: '80px',
                  }}
                >
                  {displayedText}
                </Typography>
              </motion.div>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;