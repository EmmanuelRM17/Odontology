import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
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
          height: '90vh',
          display: 'flex',
          flexDirection: isMobile ? 'column-reverse' : 'row', 
          padding: { xs: '1rem', md: '2rem' },
        }}
      >
        {/* Left Side - Service Cards */}
        <Box
          sx={{
            width: isMobile ? '100%' : '50%',
            height: isMobile ? '50vh' : '85%',
            display: 'block',
            position: 'relative',
            pl: isMobile ? 0 : 4,
            pt: isMobile ? 4 : 0,
          }}
        >
          {/* Título principal para servicios con diseño mejorado */}
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
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
              height: isMobile ? '30vh' : '40vh',
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
                            ? 'linear-gradient(135deg, #1C2A38 0%, #2C3E50 100%)'
                            : 'linear-gradient(135deg, #1C2A38 0%, #253545 100%)'
                          : isActive
                            ? 'linear-gradient(135deg, #ffffff 0%, #E5F3FD 100%)'
                            : 'linear-gradient(135deg, #F8FCFF 0%, #EBF5FC 100%)',
                        borderRadius: '16px',
                        padding: '1.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        // Cambio: Eliminar efectos exagerados, borde más limpio y profesional
                        border: isActive
                          ? isDarkTheme
                            ? '2px solid rgba(41, 98, 155, 0.8)'
                            : '2px solid rgba(3, 66, 124, 0.8)'
                          : 'none',
                        boxShadow: isActive
                          ? isDarkTheme
                            ? '0 10px 20px rgba(0, 0, 0, 0.2)'
                            : '0 10px 20px rgba(3, 66, 124, 0.15)'
                          : isDarkTheme
                            ? '0 5px 15px rgba(0, 0, 0, 0.15)'
                            : '0 5px 15px rgba(3, 66, 124, 0.1)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: isDarkTheme
                            ? '0 12px 25px rgba(0, 0, 0, 0.25)'
                            : '0 12px 25px rgba(3, 66, 124, 0.2)',
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Decoración de la tarjeta, un pequeño círculo decorativo en la esquina */}
                      {isActive && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isDarkTheme
                              ? 'rgba(41, 98, 155, 0.5)'
                              : 'rgba(3, 66, 124, 0.2)',
                            zIndex: 0,
                            filter: 'blur(5px)',
                          }}
                        />
                      )}

                      {/* Contenido de la tarjeta */}
                      <Box sx={{ zIndex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: isDarkTheme ? '#ffffff' : '#03427C',
                            fontWeight: 'bold',
                            mb: 2,
                            fontSize: { xs: '1.1rem', md: '1.25rem' },
                            textAlign: 'left',
                            transform: 'rotate(0deg)',
                            borderBottom: isActive
                              ? isDarkTheme
                                ? '2px solid rgba(41, 98, 155, 0.4)'
                                : '2px solid rgba(3, 66, 124, 0.4)'
                              : 'none',
                            paddingBottom: isActive ? '8px' : '0',
                          }}
                        >
                          {service.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.85)' : 'rgba(3, 66, 124, 0.85)',
                            fontSize: { xs: '0.875rem', md: '1rem' },
                            textAlign: 'left',
                            transform: 'rotate(0deg)',
                            lineHeight: 1.6,
                          }}
                        >
                          {service.description.split('.')[0] + '.'}
                        </Typography>
                      </Box>

                      {/* Indicador visual para la tarjeta activa */}
                      {isActive && (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            mt: 2,
                            borderTop: isDarkTheme
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(3, 66, 124, 0.1)',
                            paddingTop: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(3, 66, 124, 0.8)',
                              mr: 1,
                              fontSize: '0.8rem',
                              fontWeight: 'medium'
                            }}
                          >
                            Ver detalles
                          </Typography>
                          <Box
                            sx={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: isDarkTheme ? 'rgba(41, 98, 155, 0.3)' : 'rgba(3, 66, 124, 0.2)',
                              transition: 'all 0.3s ease',
                              animation: 'pulse 1.5s infinite',
                              '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                                '100%': { transform: 'scale(1)' },
                              }
                            }}
                          >
                            <ChevronRight
                              sx={{
                                fontSize: '16px',
                                color: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(3, 66, 124, 0.9)'
                              }}
                            />
                          </Box>
                        </Box>
                      )}
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
            width: isMobile ? '85%' : '50%',
            height: isMobile ? '35vh' : '96%',
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
      </Box>
    </Box>
  );
};

export default Home;