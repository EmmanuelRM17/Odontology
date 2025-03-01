import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { useMediaQuery, Tooltip, Card, CardContent } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpandLess, ExpandMore, ArrowBackIos, ArrowForwardIos, ChevronLeft, ChevronRight } from '@mui/icons-material';
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

  const MobileView = ({ isDarkTheme, currentImageIndex, displayedText, navigate }) => {
    const handleExploreClick = useCallback(() => navigate('/servicios'), [navigate]);

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '90vh',
          width: '100%',
          padding: '1rem',
          gap: '1rem'
        }}
      >
        {/* Contenedor de imagen con hardware acceleration */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 0,
            paddingBottom: '75%',
            maxHeight: '500px',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 15px 30px rgba(3, 66, 124, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            marginTop: '1rem',
            background: isDarkTheme
              ? 'linear-gradient(135deg, #1a2a3a 0%, #29629b 100%)'
              : 'linear-gradient(135deg, #e0f0ff 0%, #03427c 100%)',
            transition: 'all 0.4s ease',
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitFontSmoothing: 'subpixel-antialiased'
          }}
        >
          {/* Usamos una sola imagen en lugar de AnimatePresence para reducir complejidad */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${images[currentImageIndex]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.85) contrast(1.1)',
              transition: 'opacity 1s ease-out',
              willChange: 'opacity, transform',
              transform: 'translateZ(0)',
              opacity: 1,
              // Optimización para móviles
              WebkitTapHighlightColor: 'transparent'
            }}
          />

          {/* Overlay con gradiente para mejorar legibilidad */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))',
              zIndex: 3,
            }}
          />

          {/* Contenedor de texto simplificado */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              textAlign: 'center',
              zIndex: 5,
              padding: '1rem',
              borderRadius: '15px',
              backdropFilter: 'blur(6px)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'capitalize',
                letterSpacing: '1.5px',
                position: 'relative',
                display: 'inline-block',
                paddingBottom: '0.5rem',
                textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
                lineHeight: 1.4,
                maxWidth: '100%',
                overflowWrap: 'break-word',
              }}
            >
              {displayedText}
            </Typography>
          </Box>
        </Box>

        {/* Sección de características principales - simplificada */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            marginTop: '-1rem',
          }}
        >
          {/* Evitamos map para reducir el número de componentes */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              backgroundColor: isDarkTheme ?
                'rgba(41, 98, 155, 0.15)' :
                'rgba(3, 66, 124, 0.08)',
              borderRadius: '10px',
            }}
          >
            <Box
              sx={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkTheme ?
                  'rgba(41, 98, 155, 0.6)' :
                  'rgba(3, 66, 124, 0.4)',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              ✓
            </Box>
            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isDarkTheme ?
                  'rgba(255, 255, 255, 0.9)' :
                  'rgba(3, 66, 124, 0.9)',
              }}
            >
              Cuidado dental con calidez y confianza."
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              backgroundColor: isDarkTheme ?
                'rgba(41, 98, 155, 0.15)' :
                'rgba(3, 66, 124, 0.08)',
              borderRadius: '10px',
            }}
          >
            <Box
              sx={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkTheme ?
                  'rgba(41, 98, 155, 0.6)' :
                  'rgba(3, 66, 124, 0.4)',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              ✓
            </Box>
            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isDarkTheme ?
                  'rgba(255, 255, 255, 0.9)' :
                  'rgba(3, 66, 124, 0.9)',
              }}
            >
              Tu sonrisa en manos expertas.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              backgroundColor: isDarkTheme ?
                'rgba(41, 98, 155, 0.15)' :
                'rgba(3, 66, 124, 0.08)',
              borderRadius: '10px',
            }}
          >
            <Box
              sx={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkTheme ?
                  'rgba(41, 98, 155, 0.6)' :
                  'rgba(3, 66, 124, 0.4)',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              ✓
            </Box>
            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isDarkTheme ?
                  'rgba(255, 255, 255, 0.9)' :
                  'rgba(3, 66, 124, 0.9)',
              }}
            >
              Atención cercana, resultados confiables.            </Typography>
          </Box>
        </Box>

        {/* Botón de explorar servicios optimizado */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '0.5rem',
          }}
        >
          <Button
            variant="contained"
            onClick={handleExploreClick}
            startIcon={<ChevronRight />}
            sx={{
              backgroundColor: isDarkTheme ? 'rgba(41, 98, 155, 0.9)' : 'rgba(3, 66, 124, 0.9)',
              color: 'white',
              fontWeight: 'bold',
              padding: '16px 0',
              width: '100%',
              maxWidth: '300px',
              borderRadius: '30px',
              fontSize: '1.1rem',
              textTransform: 'none',
              boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              transform: 'translateZ(0)', // Fuerza aceleración por hardware
              WebkitTapHighlightColor: 'transparent', // Elimina el flash al tocar en dispositivos móviles
              '&:hover, &:active': {
                backgroundColor: isDarkTheme ? 'rgba(41, 98, 155, 1)' : 'rgba(3, 66, 124, 1)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
              },
              // Para evitar problemas de rendimiento, simplificamos la animación
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '40%', // Reducido para mejor rendimiento
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shimmer 2s infinite linear', // Cambiado a linear para mejor rendimiento
              }
            }}
          >
            Explorar Nuestros Servicios
          </Button>
        </Box>

        {/* Definimos la animación con keyframes más simples */}
        <style jsx global>{`
          @keyframes shimmer {
            0% { left: -40%; }
            100% { left: 100%; }
          }
        `}</style>
      </Box>
    );
  };
  return (
    <Box
      sx={{
        background: isDarkTheme
          ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
          : 'linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)',
        transition: 'background 0.5s ease',
        position: 'relative',
        minHeight: '80vh',
        overflow: 'hidden'
      }}
    >
      {/* Semi-circular background for the right side */}
      <Box
        sx={{
          position: 'absolute',
          right: -100,
          top: 0,
          height: '97%',
          width: isMobile ? '55%' : '50%',
          borderTopLeftRadius: isMobile ? '55%' : '45%',
          borderBottomLeftRadius: isMobile ? '55%' : '45%',
          bgcolor: 'rgba(3, 66, 124, 0.1)',
          zIndex: 1
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: isMobile ? '75vh': '90vh',
          display: 'flex',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          padding: { xs: '1rem', md: '2rem' },
        }}
      >

        {isMobile ? (
          // Renderiza la vista móvil con solo el círculo y el botón
          <MobileView
            isDarkTheme={isDarkTheme}
            currentImageIndex={currentImageIndex}
            scrollOpacity={scrollOpacity}
            isSmallScreen={isSmallScreen}
            displayedText={displayedText}
            navigate={navigate}
          />
        ) : (
          <>

            {/* Left Side - Service Cards */}
            <Box
              sx={{
                width: '50%',
                height: '85%',
                display: 'block',
                position: 'relative',
                pl: 4,
              }}
            >
              {/* Título principal para servicios con diseño mejorado */}
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    color: isDarkTheme ? '#ffffff' : '#03427C',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    position: 'relative',
                    display: 'inline-block',
                    padding: '0 1rem 0.5rem',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      width: '60%',
                      height: '3px',
                      background: isDarkTheme ? 'linear-gradient(90deg, rgba(41,98,155,0), rgba(41,98,155,1), rgba(41,98,155,0))' : 'linear-gradient(90deg, rgba(3,66,124,0), rgba(3,66,124,1), rgba(3,66,124,0))',
                      transform: 'translateX(-50%)'
                    }
                  }}
                >
                  Nuestros Servicios
                </Typography>

                {/* Subtítulo descriptivo */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(3,66,124,0.7)',
                    fontSize: '0.9rem',
                    mt: 1,
                    fontStyle: 'italic',
                    maxWidth: '80%',
                    mx: 'auto'
                  }}
                >
                  Conoce nuestra amplia gama de servicios - Haz clic para más detalles
                </Typography>
              </Box>
              {/* Botones de navegación reposicionados */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 6,
                width: '100%',
                mb: 3,
                mt: 2
              }}>
                <IconButton
                  onClick={prevService}
                  sx={{
                    color: 'white',
                    backgroundColor: isDarkTheme ? 'rgba(41, 98, 155, 0.8)' : 'rgba(3, 66, 124, 0.8)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(41, 98, 155, 1)' : 'rgba(3, 66, 124, 1)',
                      transform: 'scale(1.1)',
                    },
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  onClick={nextService}
                  sx={{
                    color: 'white',
                    backgroundColor: isDarkTheme ? 'rgba(41, 98, 155, 0.8)' : 'rgba(3, 66, 124, 0.8)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(41, 98, 155, 1)' : 'rgba(3, 66, 124, 1)',
                      transform: 'scale(1.1)',
                    },
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>


              {/* Visualización de Servicios en Diagonal */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '40vh',
                  perspective: '1000px',
                  overflow: 'visible',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 2
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

                    // Determinamos si es la tarjeta activa
                    const isActive = offset === 0;

                    // Calculamos posiciones para una trayectoria diagonal pero más alineadas
                    const containerWidth = isMobile ? window.innerWidth * 0.8 : window.innerWidth * 0.4;
                    const containerHeight = isMobile ? window.innerHeight * 0.5 : window.innerHeight * 0.7;

                    // Cálculo para trayectoria diagonal pero con rotación mínima
                    let x, y, rotate, scale, opacity, zIndex;

                    if (offset < 0) {
                      // Tarjetas a la izquierda del centro (arriba-izquierda)
                      const factor = Math.abs(offset);
                      x = -containerWidth * 0.3 * factor;
                      y = -containerHeight * 0.2 * factor;
                      rotate = -2 - (factor * 1);
                      opacity = 1 - (factor * 0.3); // Más transparentes
                      scale = 0.85 - (factor * 0.12); // Más pequeñas
                      zIndex = 10 - factor;
                    } else if (offset > 0) {
                      // Tarjetas a la derecha del centro (abajo-izquierda)
                      const factor = Math.abs(offset);
                      x = -containerWidth * 0.3 * factor;
                      y = containerHeight * 0.2 * factor;
                      rotate = 2 + (factor * 1);
                      opacity = 1 - (factor * 0.3); // Más transparentes
                      scale = 0.85 - (factor * 0.12); // Más pequeñas
                      zIndex = 10 - factor;
                    } else {
                      // Tarjeta central - destacamos más esta tarjeta
                      x = 0;
                      y = 0;
                      rotate = 0;
                      opacity = 1;
                      // Aumentamos escala de la tarjeta central para destacarla aún más
                      scale = 1.2; // Más grande que antes
                      zIndex = 20;
                    }

                    // Limitamos la visibilidad a solo 3 tarjetas
                    if (Math.abs(offset) > 2) {
                      opacity = 0;
                    }

                    return (
                      <motion.div
                        key={service.id}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '320px',
                          maxWidth: isMobile ? '85%' : '320px',
                          transformOrigin: 'center center',
                        }}
                        animate={{
                          x: x,
                          y: y,
                          rotate: rotate,
                          scale: scale,
                          opacity: opacity,
                          zIndex: zIndex,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 30
                        }}
                      >
                        <Box
                          onClick={() => navigate(`/servicios/detalle/${service.id}`)}
                          onMouseEnter={() => setIsPaused(true)}
                          onMouseLeave={() => setIsPaused(false)}
                          sx={{
                            background: isDarkTheme
                              ? isActive
                                ? 'linear-gradient(145deg, #1E2B3A 0%, #2A3F55 100%)' // Gradiente más profundo para tema oscuro
                                : 'linear-gradient(145deg, #1A2430 0%, #243545 100%)'
                              : isActive
                                ? 'linear-gradient(145deg, #FFFFFF 0%, #F7FBFF 100%)' // Blanco puro para tema claro
                                : 'linear-gradient(145deg, #F8FCFF 0%, #F0F7FD 100%)',
                            borderRadius: '18px', // Bordes más redondeados
                            padding: '1.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1)', // Transición más suave
                            border: isActive
                              ? isDarkTheme
                                ? '1px solid rgba(79, 142, 206, 0.5)' // Borde más sutil pero visible
                                : '1px solid rgba(3, 66, 124, 0.15)'
                              : isDarkTheme
                                ? '1px solid rgba(255, 255, 255, 0.05)' // Borde apenas visible en inactivas
                                : '1px solid rgba(235, 245, 255, 0.8)',
                            boxShadow: isActive
                              ? isDarkTheme
                                ? '0 15px 30px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(41, 98, 155, 0.1)'
                                : '0 15px 30px rgba(3, 66, 124, 0.08), 0 5px 15px rgba(3, 66, 124, 0.05)'
                              : isDarkTheme
                                ? '0 8px 20px rgba(0, 0, 0, 0.2)'
                                : '0 8px 20px rgba(3, 66, 124, 0.03)',
                            transform: isActive ? 'scale(1.03)' : 'scale(1)',
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.04)',
                              boxShadow: isDarkTheme
                                ? '0 20px 40px rgba(0, 0, 0, 0.35), 0 10px 20px rgba(41, 98, 155, 0.12)'
                                : '0 20px 40px rgba(3, 66, 124, 0.12), 0 10px 20px rgba(3, 66, 124, 0.08)',
                              border: isDarkTheme
                                ? '1px solid rgba(79, 142, 206, 0.6)'
                                : '1px solid rgba(3, 66, 124, 0.25)',
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden',
                            height: '50%', // Altura fija para consistencia
                          }}
                        >
                          {/* Elemento decorativo - efecto de brillo en esquina superior */}
                          {isActive && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '-30px',
                                right: '-30px',
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: isDarkTheme
                                  ? 'radial-gradient(circle, rgba(79, 142, 206, 0.4) 0%, rgba(79, 142, 206, 0) 70%)'
                                  : 'radial-gradient(circle, rgba(3, 66, 124, 0.15) 0%, rgba(3, 66, 124, 0) 70%)',
                                opacity: 0.8,
                                animation: 'pulse 3s infinite ease-in-out',
                              }}
                            />
                          )}

                          {/* Elemento decorativo - línea izquierda */}
                          {isActive && (
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                top: '15%',
                                height: '70%',
                                width: '3px',
                                background: isDarkTheme
                                  ? 'linear-gradient(to bottom, rgba(79, 142, 206, 0), rgba(79, 142, 206, 0.7), rgba(79, 142, 206, 0))'
                                  : 'linear-gradient(to bottom, rgba(3, 66, 124, 0), rgba(3, 66, 124, 0.3), rgba(3, 66, 124, 0))',
                                borderRadius: '3px',
                              }}
                            />
                          )}

                          {/* Contenido de la tarjeta */}
                          <Box sx={{ zIndex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                color: isDarkTheme ? '#FFFFFF' : '#03427C',
                                fontWeight: '700',
                                mb: 2,
                                fontSize: { xs: '1.1rem', md: '1.25rem' },
                                textAlign: 'left',
                                position: 'relative',
                                paddingBottom: '10px',
                                transition: 'all 0.3s ease',
                                '&:after': isActive && {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  width: '40px',
                                  height: '2px',
                                  background: isDarkTheme
                                    ? 'linear-gradient(to right, rgba(79, 142, 206, 0.7), rgba(79, 142, 206, 0))'
                                    : 'linear-gradient(to right, rgba(3, 66, 124, 0.5), rgba(3, 66, 124, 0))',
                                }
                              }}
                            >
                              {service.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: isDarkTheme ? 'rgba(255, 255, 255, 0.85)' : 'rgba(3, 66, 124, 0.85)',
                                fontSize: { xs: '0.875rem', md: '0.95rem' },
                                textAlign: 'left',
                                lineHeight: 1.6,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {service.description.split('.')[0] + '.'}
                            </Typography>
                          </Box>

                          {/* Indicador visual para la tarjeta activa - botón con animación */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                              mt: 2,
                              borderTop: isDarkTheme
                                ? '1px solid rgba(255, 255, 255, 0.08)'
                                : '1px solid rgba(3, 66, 124, 0.08)',
                              paddingTop: 1.5,
                              opacity: isActive ? 1 : 0.5,
                              transition: 'opacity 0.3s ease',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(3, 66, 124, 0.8)',
                                mr: 1,
                                fontSize: '0.8rem',
                                fontWeight: isActive ? 'bold' : 'medium'
                              }}
                            >
                              {isActive ? 'Ver detalles' : 'Seleccionar'}
                            </Typography>
                            <Box
                              sx={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isDarkTheme
                                  ? isActive ? 'rgba(79, 142, 206, 0.4)' : 'rgba(79, 142, 206, 0.2)'
                                  : isActive ? 'rgba(3, 66, 124, 0.2)' : 'rgba(3, 66, 124, 0.1)',
                                transition: 'all 0.4s ease',
                                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                animation: isActive ? 'pulse 2s infinite' : 'none',
                                '@keyframes pulse': {
                                  '0%': { transform: 'scale(1)' },
                                  '50%': {
                                    transform: 'scale(1.15)', boxShadow: isDarkTheme
                                      ? '0 0 10px rgba(79, 142, 206, 0.5)'
                                      : '0 0 10px rgba(3, 66, 124, 0.3)'
                                  },
                                  '100%': { transform: 'scale(1)' },
                                }
                              }}
                            >
                              <ChevronRight
                                sx={{
                                  fontSize: '18px',
                                  color: isDarkTheme
                                    ? isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.8)'
                                    : isActive ? 'rgba(3, 66, 124, 1)' : 'rgba(3, 66, 124, 0.8)',
                                  transition: 'transform 0.3s ease',
                                  transform: isActive ? 'translateX(2px)' : 'translateX(0)',
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </motion.div>
                    );
                  })
                )}
              </Box>

              {/* Estilo para animación de resplandor del borde */}
              <style jsx global>{`
    @keyframes borderGlow {
      0% { opacity: 0.6; }
      100% { opacity: 1; }
    }
  `}</style>
            </Box>

            {/* Right Side - Circular Image with Text Overlay */}
            <Box
              sx={{
                width: '50%',
                height: '96%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative',
              }}
            >

              {/* Circular Image */}
              <Box
                sx={{
                  position: 'relative',
                  width: isMobile ? '90%' : '80%',
                  height: 0,
                  paddingBottom: isMobile ? '90%' : '80%',
                  maxHeight: '500px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 0 30px rgba(3, 66, 124, 0.6)',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  mr: isMobile ? 0 : 5,
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
                      filter: 'brightness(0.9)',
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default Home;