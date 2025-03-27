import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Container,
  IconButton,
  Card,
  CardContent,
  Chip,
  Badge,
  useMediaQuery,
  useTheme,
  Divider,
  Slide,
  Fade,
  Zoom
} from '@mui/material';
import { Global } from '@emotion/react';
import {
  ArrowForward,
  ChevronLeft,
  ChevronRight,
  CheckCircleOutline,
  Phone,
  WhatsApp,
  LocationOn,
  AccessTime,
  Star,
  MedicalServices,
  Healing,
  HealthAndSafety,
  MonetizationOn,
  LocalHospital,
  PersonOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import images from '../../../utils/imageLoader';
import ContactButtons from './Steps/ContactButtons';

// Lista de beneficios de visitar al odontólogo
const dentalBenefits = [
  {
    title: "Prevención de problemas graves",
    description: "Detectar y tratar problemas dentales a tiempo evita complicaciones costosas",
    icon: <HealthAndSafety sx={{ fontSize: '22px' }} />
  },
  {
    title: "Mejora de salud general",
    description: "La salud bucal está directamente relacionada con tu bienestar general",
    icon: <Healing sx={{ fontSize: '22px' }} />
  },
  {
    title: "Sonrisa más atractiva",
    description: "Mejora tu confianza y apariencia con una sonrisa cuidada y saludable",
    icon: <PersonOutline sx={{ fontSize: '22px' }} />
  },
  {
    title: "Ahorro a largo plazo",
    description: "La prevención regular es más económica que los tratamientos de emergencia",
    icon: <MonetizationOn sx={{ fontSize: '22px' }} />
  }
];

// Datos de características principales actualizados
const featuresData = [
  {
    title: "Atención personalizada",
    description: "Cada paciente recibe un tratamiento adaptado a sus necesidades específicas",
    icon: <Star sx={{ fontSize: '28px' }} />
  },
  {
    title: "Precios accesibles",
    description: "Servicios odontológicos de alta calidad a precios justos para nuestra comunidad",
    icon: <CheckCircleOutline sx={{ fontSize: '28px' }} />
  },
  {
    title: "Consultas sin espera",
    description: "Respetamos tu tiempo con citas puntuales y atención eficiente",
    icon: <AccessTime sx={{ fontSize: '28px' }} />
  },
  {
    title: "Ubicación privilegiada",
    description: "En el centro de nuestra comunidad, fácil acceso para todos los vecinos",
    icon: <LocationOn sx={{ fontSize: '28px' }} />
  }
];

// Lista básica de servicios principales (esto se combinará con los datos de la API)
const mainServices = [
  "Limpieza dental profesional",
  "Extracciones y cirugías menores",
  "Empastes estéticos",
  "Tratamiento de caries",
  "Consultas generales",
  "Urgencias dentales"
];

// Hook personalizado para detectar cuando un elemento es visible en la pantalla
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isVisible];
};

const Home = () => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Referencias para observar las secciones
  const [whyUsRef, whyUsVisible] = useIntersectionObserver();
  const [testimonialRef, testimonialVisible] = useIntersectionObserver();
  const [ctaRef, ctaVisible] = useIntersectionObserver();

  // Estados
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const [animateServices, setAnimateServices] = useState(false);
  const [carouselDirection, setCarouselDirection] = useState('next');

  // Colores según el tema - Paleta profesional y cálida
  const colors = {
    background: isDarkTheme
      ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
      : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
    primary: isDarkTheme ? "#3B82F6" : "#2563EB", // Azul más cálido
    secondary: isDarkTheme ? "#10B981" : "#059669",
    text: isDarkTheme ? "#F1F5F9" : "#334155",
    subtext: isDarkTheme ? "#94A3B8" : "#64748B",
    cardBg: isDarkTheme ? "#1E293B" : "#FFFFFF",
    cardHover: isDarkTheme ? "#273449" : "#F8FAFC",
    border: isDarkTheme ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    shadow: isDarkTheme
      ? "0 4px 12px rgba(0,0,0,0.25)"
      : "0 4px 12px rgba(0,0,0,0.05)",
    accentGradient: isDarkTheme
      ? "linear-gradient(90deg, #3B82F6, #60A5FA)"
      : "linear-gradient(90deg, #2563EB, #3B82F6)",
    success: isDarkTheme ? "#10B981" : "#059669",
    lightBg: isDarkTheme ? "rgba(59, 130, 246, 0.1)" : "rgba(37, 99, 235, 0.05)",
    sectionDivider: isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
  };

  // Efecto para cargar servicios de la API
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

  // Efecto para animar servicios después de carga
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setAnimateServices(true);
      }, 500);
    }
  }, [loading]);

  // Auto rotación de servicios
  useEffect(() => {
    if (isPaused || services.length === 0) return;

    const interval = setInterval(() => {
      setCurrentServiceIndex(prevIndex => (prevIndex + 1) % services.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, services]);

  // Sistema mejorado para el carrusel de imágenes
  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    const interval = setInterval(() => {
      handleAutoImageTransition();
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, currentImageIndex, images.length]);

  // Función para manejar la transición automática de imágenes
  const handleAutoImageTransition = useCallback(() => {
    if (isImageTransitioning) return;
    
    setCarouselDirection('next');
    setIsImageTransitioning(true);
    setNextImageIndex((currentImageIndex + 1) % images.length);
    
    setTimeout(() => {
      setCurrentImageIndex(nextImageIndex);
      setIsImageTransitioning(false);
      
      // Preparar el siguiente índice para la próxima transición
      setNextImageIndex((nextImageIndex + 1) % images.length);
    }, 600);
  }, [currentImageIndex, nextImageIndex, isImageTransitioning, images.length]);

  // Navegación manual entre servicios
  const nextService = useCallback(() => {
    setCurrentServiceIndex(prev => (prev + 1) % services.length);
  }, [services.length]);

  const prevService = useCallback(() => {
    setCurrentServiceIndex(prev => (prev === 0 ? services.length - 1 : prev - 1));
  }, [services.length]);

  // Navegación manual entre imágenes (mejorada)
  const nextImage = useCallback(() => {
    if (isImageTransitioning) return;
    
    setCarouselDirection('next');
    setIsImageTransitioning(true);
    const next = (currentImageIndex + 1) % images.length;
    setNextImageIndex(next);
    
    setTimeout(() => {
      setCurrentImageIndex(next);
      setIsImageTransitioning(false);
      setNextImageIndex((next + 1) % images.length);
    }, 600);
  }, [currentImageIndex, isImageTransitioning, images.length]);

  const prevImage = useCallback(() => {
    if (isImageTransitioning) return;
    
    setCarouselDirection('prev');
    setIsImageTransitioning(true);
    const prev = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setNextImageIndex(prev);
    
    setTimeout(() => {
      setCurrentImageIndex(prev);
      setIsImageTransitioning(false);
      setNextImageIndex(prev === 0 ? images.length - 1 : prev - 1);
    }, 600);
  }, [currentImageIndex, isImageTransitioning, images.length]);

  // Navegar a la página de servicios
  const handleExploreServices = useCallback(() => {
    navigate('/servicios');
  }, [navigate]);

  return (
    <Box
      sx={{
        background: colors.background,
        pt: { xs: 3, md: 4 },
        pb: { xs: 5, md: 6 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos decorativos de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: { xs: '150px', md: '300px' },
          height: { xs: '150px', md: '300px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}10 0%, transparent 70%)`,
          zIndex: 0,
          animation: 'float 8s ease-in-out infinite'
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: { xs: '100px', md: '200px' },
          height: { xs: '100px', md: '200px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}08 0%, transparent 70%)`,
          zIndex: 0,
          animation: 'float 12s ease-in-out infinite reverse'
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '30%',
          width: { xs: '80px', md: '150px' },
          height: { xs: '80px', md: '150px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}05 0%, transparent 70%)`,
          zIndex: 0,
          animation: 'float 15s ease-in-out infinite'
        }}
      />
      
      <Global
        styles={`
          @keyframes float {
            0% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
            100% { transform: translateY(0px) scale(1); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .animate-fade-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          .animate-fade-left {
            animation: fadeInLeft 0.6s ease-out forwards;
          }
          
          .animate-fade-right {
            animation: fadeInRight 0.6s ease-out forwards;
          }
        `}
      />
      <Container maxWidth="lg">
        {/* Hero Section - Más profesional y espaciado */}
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          sx={{
            alignItems: "center",
            mb: { xs: 6, md: 8 }
          }}
        >
          {/* Lado izquierdo - Texto principal con mejor espaciado */}
          <Grid item xs={12} md={6}>
            <Box sx={{ py: { xs: 2, md: 3 } }}>
              <Badge
                badgeContent="Odontologia"
                color="primary"
                sx={{
                  mb: 3,
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '4px'
                  }
                }}
              />

              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  mb: 3,
                  color: colors.text,
                  letterSpacing: '-0.02em'
                }}
              >
                Consultorio Dental{' '}
                <Box
                  component="span"
                  sx={{
                    color: colors.primary,
                    position: 'relative',
                    "&::after": {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '4px',
                      bottom: '-6px',
                      left: 0,
                      background: colors.accentGradient,
                      borderRadius: '2px'
                    }
                  }}
                >
                  Carol
                </Box>
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  color: colors.subtext,
                  fontWeight: 400,
                  mb: 4,
                  fontSize: { xs: '1.1rem', md: '1.2rem' },
                  lineHeight: 1.7,
                  maxWidth: '540px'
                }}
              >
                Tu dentista de confianza, con servicios accesibles y atención cálida para toda la familia. Comprometidos con la salud bucal de nuestros vecinos.
              </Typography>

              <Box
                component="div"
                className="scroll-reveal-element"
                sx={{
                  mt: 4,
                  py: 2,
                  display: { xs: 'flex', sm: 'none' }, // Solo visible en móvil
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 1
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      backgroundColor: colors.lightBg,
                      color: colors.primary,
                    }}
                  >
                    <MedicalServices sx={{ fontSize: '1.8rem' }} />
                  </Box>
                </Box>
                <Typography
                  variant="subtitle1"
                  align="center"
                  sx={{
                    color: colors.text,
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  Atención dental de calidad
                </Typography>
                <Typography
                  variant="body2"
                  align="center"
                  sx={{
                    color: colors.subtext,
                    maxWidth: '280px',
                    mb: 1
                  }}
                >
                  Nos preocupamos por ofrecerle los mejores servicios a precios accesibles
                </Typography>
              </Box>

              {/* SECCIÓN ACTUALIZADA: Beneficios de visitar al odontólogo (más compacta) */}
              <Box 
                sx={{ 
                  mt: 3,
                  p: 2,
                  borderRadius: '12px',
                  background: isDarkTheme ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: `1px solid ${colors.border}`,
                  width: '100%',
                  display: { xs: 'none', sm: 'block' }, // Oculto en móvil, visible desde tablet
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Elementos decorativos de fondo */}
                <Box sx={{
                  position: 'absolute',
                  top: -20, right: -20,
                  width: '140px', height: '140px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${colors.primary}22 0%, transparent 70%)`,
                  zIndex: 0
                }}/>
                
                <Box sx={{
                  position: 'absolute',
                  bottom: -30, left: -30,
                  width: '160px', height: '160px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${colors.primary}15 0%, transparent 70%)`,
                  zIndex: 0
                }}/>

                {/* Encabezado */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1.5,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <LocalHospital sx={{ color: colors.primary, fontSize: '1.3rem' }}/>
                  <Typography variant="h6" sx={{
                    color: colors.text,
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    Beneficios de la salud dental
                  </Typography>
                </Box>

                <Divider sx={{ mb: 1.5, opacity: 0.6 }}/>

                {/* Grid de beneficios */}
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { sm: '1fr 1fr' },
                  gap: 1.5, 
                  position: 'relative',
                  zIndex: 1
                }}>
                  {dentalBenefits.map((benefit, index) => (
                    <Slide 
                      direction="right" 
                      in={animateServices} 
                      timeout={300 + (index * 150)}
                      key={index}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.25,
                          borderRadius: '8px',
                          backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                          border: `1px solid ${colors.border}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(5px)',
                            backgroundColor: isDarkTheme ? 'rgba(39, 52, 73, 0.8)' : 'rgba(249, 250, 251, 0.9)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            borderColor: colors.primary
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: colors.lightBg,
                          color: colors.primary,
                          mr: 1.5,
                          flexShrink: 0
                        }}>
                          {benefit.icon}
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.text,
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              mb: 0.2
                            }}
                          >
                            {benefit.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.subtext,
                              display: 'block',
                              fontSize: '0.75rem',
                              lineHeight: 1.2
                            }}
                          >
                            {benefit.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </Slide>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Lado derecho - Carrusel de imágenes mejorado con efecto de deslizamiento */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: '280px', sm: '360px', md: '440px' },
                width: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                border: `1px solid ${colors.border}`
              }}
            >
              {/* Carrusel de imágenes con sistema de transición mejorado */}
              <Box
                sx={{
                  position: 'relative',
                  height: '100%',
                  width: '100%',
                  backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
                  overflow: 'hidden'
                }}
              >
                {/* Imagen actual */}
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
                    transition: 'transform 0.6s ease-out',
                    transform: isImageTransitioning 
                      ? carouselDirection === 'next' 
                        ? 'translateX(-100%)' 
                        : 'translateX(100%)'
                      : 'translateX(0)'
                  }}
                />

                {/* Imagen siguiente/anterior (para transición) */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${images[nextImageIndex]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.6s ease-out',
                    transform: isImageTransitioning 
                      ? 'translateX(0)' 
                      : carouselDirection === 'next' 
                        ? 'translateX(100%)' 
                        : 'translateX(-100%)'
                  }}
                />

                {/* Controles de navegación mejorados */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    zIndex: 10
                  }}
                >
                  <IconButton
                    onClick={prevImage}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(5px)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        transform: 'translateX(-3px)'
                      },
                      transition: 'all 0.3s ease',
                      width: 40,
                      height: 40
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>

                  <IconButton
                    onClick={nextImage}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(5px)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        transform: 'translateX(3px)'
                      },
                      transition: 'all 0.3s ease',
                      width: 40,
                      height: 40
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>

                {/* Overlay con información sobre la imagen - mantiene visibilidad */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                    padding: 3,
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    Consultorio Dental Carol
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}
                  >
                    Nos preocupamos por la salud de su Sonrisa
                  </Typography>
                </Box>

{/* Se eliminaron los indicadores de puntos */}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Separador decorativo */}
        <Box
          sx={{
            width: '100%',
            height: '1px',
            background: colors.sectionDivider,
            my: { xs: 6, md: 8 },
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '80px',
              height: '3px',
              background: colors.accentGradient,
              top: '-1px',
              left: '50%',
              transform: 'translateX(-50%)'
            }
          }}
        />

        {/* Sección "Por qué elegirnos" mejorada con animaciones */}
        <Box 
          ref={whyUsRef}
          sx={{ mb: { xs: 6, md: 8 } }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: colors.text
            }}
          >
            ¿Por qué elegirnos?
          </Typography>

          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              color: colors.subtext,
              maxWidth: '800px',
              mx: 'auto',
              mb: 5,
              fontSize: '1.1rem',
              lineHeight: 1.7
            }}
          >
            Nuestra prioridad es ofrecer servicios odontológicos con un enfoque genuino en el bienestar de nuestra comunidad
          </Typography>

          <Grid container spacing={4}>
            {featuresData.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom 
                  in={whyUsVisible} 
                  style={{ 
                    transitionDelay: whyUsVisible ? `${index * 150}ms` : '0ms',
                    transitionDuration: '500ms' 
                  }}
                >
                  <Paper
                    elevation={0}
                    className={whyUsVisible ? 'animate-fade-up' : ''}
                    sx={{
                      p: 3.5,
                      height: '100%',
                      borderRadius: '16px',
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        backgroundColor: colors.cardHover,
                        transform: 'translateY(-8px)',
                        boxShadow: colors.shadow
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: 0,
                      animation: whyUsVisible ? 'fadeInUp 0.6s forwards' : 'none',
                      animationDelay: `${index * 0.15}s`
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3
                      }}
                    >
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: colors.lightBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.primary,
                          mb: 1
                        }}
                      >
                        {feature.icon}
                      </Box>
                    </Box>

                    <Typography
                      variant="h6"
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: colors.text,
                        fontSize: '1.1rem',
                        mb: 2
                      }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      align="center"
                      sx={{
                        color: colors.subtext,
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Separador decorativo */}
        <Box
          sx={{
            width: '100%',
            height: '1px',
            background: colors.sectionDivider,
            my: { xs: 6, md: 8 },
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '80px',
              height: '3px',
              background: colors.accentGradient,
              top: '-1px',
              left: '50%',
              transform: 'translateX(-50%)'
            }
          }}
        />

        {/* Sección de Servicios Destacados (Carrusel) mejorada */}
        {services.length > 0 && (
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                mb: 4
              }}
            >
              <Box sx={{ mb: { xs: 3, md: 0 } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: colors.text,
                    mb: 1.5
                  }}
                >
                  Nuestros Servicios
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: colors.subtext,
                    maxWidth: '600px'
                  }}
                >
                  Ofrecemos una amplia gama de tratamientos odontológicos para toda la familia
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  onClick={handleExploreServices}
                  variant="outlined"
                  sx={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    borderWidth: '2px',
                    textTransform: 'none',
                    mr: 2
                  }}
                >
                  Ver todos
                </Button>

                <IconButton
                  onClick={prevService}
                  size="medium"
                  sx={{
                    backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)'
                    }
                  }}
                >
                  <ChevronLeft sx={{ color: colors.primary }} />
                </IconButton>
                <IconButton
                  onClick={nextService}
                  size="medium"
                  sx={{
                    backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)'
                    }
                  }}
                >
                  <ChevronRight sx={{ color: colors.primary }} />
                </IconButton>
              </Box>
            </Box>

            <Grid container spacing={4}>
              {Array.from({ length: Math.min(isMobile ? 1 : isTablet ? 2 : 3, services.length) }).map((_, offset) => {
                const index = (currentServiceIndex + offset) % services.length;
                const service = services[index];

                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Fade 
                      in={true} 
                      timeout={800}
                      style={{ transitionDelay: `${offset * 150}ms` }}
                    >
                      <Card
                        onClick={() => navigate(`/servicios/detalle/${service.id}`)}
                        sx={{
                          borderRadius: '16px',
                          overflow: 'hidden',
                          backgroundColor: colors.cardBg,
                          transition: 'all 0.4s ease',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                          border: `1px solid ${colors.border}`,
                          cursor: 'pointer',
                          height: '100%',
                          minHeight: '280px', // Altura mínima fija para evitar movimientos
                          transform: offset === 0 ? 'scale(1.02)' : 'scale(1)',
                          opacity: offset === 0 ? 1 : 0.88,
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: colors.shadow,
                            opacity: 1,
                            borderColor: colors.primary
                          }
                        }}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                      >
                        {/* Barra superior decorativa */}
                        <Box
                          sx={{
                            height: '5px',
                            width: '100%',
                            background: colors.accentGradient
                          }}
                        />

                        <CardContent sx={{ p: 4 }}>
                          <Box
                            sx={{
                              mb: 3,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Chip
                              label="Destacado"
                              size="small"
                              sx={{
                                backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)',
                                color: colors.primary,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                py: 0.5,
                                borderRadius: '6px'
                              }}
                            />

                            <Box
                              sx={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)',
                                color: colors.primary
                              }}
                            >
                              {index + 1}
                            </Box>
                          </Box>

                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: colors.text,
                              mb: 2.5,
                              fontSize: '1.3rem',
                              lineHeight: 1.3
                            }}
                          >
                            {service.title}
                          </Typography>

                          <Typography
                            variant="body1"
                            sx={{
                              color: colors.subtext,
                              mb: 4,
                              lineHeight: 1.7,
                              fontSize: '0.95rem',
                              height: '3.4em', // Altura fija para aproximadamente 2 líneas
                              overflow: 'hidden'
                            }}
                          >
                            {service.description.split('.')[0] + '.'}
                          </Typography>

                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              mt: 'auto'
                            }}
                          >
                            <Button
                              endIcon={<ArrowForward />}
                              sx={{
                                color: 'white',
                                textTransform: 'none',
                                fontWeight: 600,
                                background: colors.accentGradient,
                                px: 2.5,
                                py: 1,
                                borderRadius: '8px',
                                '&:hover': {
                                  background: colors.accentGradient,
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              Ver detalles
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Separador decorativo */}
        <Box
          sx={{
            width: '100%',
            height: '1px',
            background: colors.sectionDivider,
            my: { xs: 6, md: 8 },
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '80px',
              height: '3px',
              background: colors.accentGradient,
              top: '-1px',
              left: '50%',
              transform: 'translateX(-50%)'
            }
          }}
        />

        {/* Sección de Testimonios con animaciones */}
        <Box 
          ref={testimonialRef}
          sx={{ mb: { xs: 6, md: 8 } }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: colors.text
            }}
          >
            Lo que dicen nuestros pacientes
          </Typography>

          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              color: colors.subtext,
              maxWidth: '800px',
              mx: 'auto',
              mb: 5,
              fontSize: '1.1rem',
              lineHeight: 1.7
            }}
          >
            La satisfacción de nuestros pacientes es nuestra mejor carta de presentación
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                name: "María Fernández",
                testimonial: "La atención fue excelente. El doctor me explicó todo el procedimiento y no sentí ninguna molestia. Estoy muy satisfecha con el resultado.",
                rating: 5
              },
              {
                name: "Carlos Gutiérrez",
                testimonial: "Mi hija tenía miedo de ir al dentista, pero el personal fue muy amable y paciente con ella. Ahora hasta quiere regresar para su próxima revisión.",
                rating: 5
              },
              {
                name: "Laura Mendoza",
                testimonial: "Precios muy accesibles y un trabajo profesional. El ambiente del consultorio es muy acogedor y limpio. Definitivamente lo recomiendo.",
                rating: 4
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade 
                  in={testimonialVisible} 
                  timeout={800}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: '16px',
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: colors.cardHover,
                        transform: 'translateY(-5px)',
                        boxShadow: colors.shadow
                      },
                      opacity: 0,
                      animation: testimonialVisible ? 
                        index % 2 === 0 ? 'fadeInLeft 0.6s forwards' : 'fadeInRight 0.6s forwards' 
                        : 'none',
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          sx={{
                            color: i < testimonial.rating ? '#FFD700' : colors.border,
                            fontSize: '1.2rem',
                            mr: 0.5
                          }}
                        />
                      ))}
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        color: colors.text,
                        mb: 3,
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        fontSize: '1rem'
                      }}
                    >
                      "{testimonial.testimonial}"
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary
                      }}
                    >
                      {testimonial.name}
                    </Typography>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Final con animación */}
        <Box
          ref={ctaRef}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: '20px',
            background: colors.accentGradient,
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.2)',
            opacity: 0,
            transform: 'translateY(30px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
            ...(ctaVisible && {
              opacity: 1,
              transform: 'translateY(0)'
            })
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            ¿Necesitas atención dental?
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              opacity: 0.9,
              fontSize: '1.1rem',
              lineHeight: 1.7
            }}
          >
            Estamos comprometidos con la salud bucal de nuestra comunidad. Ofrecemos tratamientos dentales de calidad con un trato cercano y precios accesibles. ¡Tu sonrisa es nuestra prioridad!
          </Typography>

          {/* Componente ContactButtons */}
          <ContactButtons
            colors={colors}
            isDarkTheme={isDarkTheme}
            isCTA={true}
            showLabels={true}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Home;