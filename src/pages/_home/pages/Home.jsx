import React, { useState, useEffect, useCallback } from 'react';
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
  Divider
} from '@mui/material';
import {
  ArrowForward,
  ChevronLeft,
  ChevronRight,
  CheckCircleOutline,
  Phone,
  WhatsApp,
  LocationOn,
  AccessTime,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import images from '../../../utils/imageLoader';

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

const Home = () => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Estados
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);

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

  // Auto rotación de servicios
  useEffect(() => {
    if (isPaused || services.length === 0) return;

    const interval = setInterval(() => {
      setCurrentServiceIndex(prevIndex => (prevIndex + 1) % services.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, services]);

  // Auto rotación de imágenes del carrusel
  useEffect(() => {
    if (isPaused || images.length === 0) return;

    const interval = setInterval(() => {
      setIsImageTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
        setTimeout(() => {
          setIsImageTransitioning(false);
        }, 300);
      }, 300);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, images.length]);

  // Navegación manual entre servicios
  const nextService = useCallback(() => {
    setCurrentServiceIndex(prev => (prev + 1) % services.length);
  }, [services.length]);

  const prevService = useCallback(() => {
    setCurrentServiceIndex(prev => (prev === 0 ? services.length - 1 : prev - 1));
  }, [services.length]);

  // Navegación manual entre imágenes
  const nextImage = useCallback(() => {
    setIsImageTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
      setTimeout(() => {
        setIsImageTransitioning(false);
      }, 300);
    }, 300);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setIsImageTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
      setTimeout(() => {
        setIsImageTransitioning(false);
      }, 300);
    }, 300);
  }, [images.length]);

  // Navegar a la página de servicios
  const handleExploreServices = useCallback(() => {
    navigate('/servicios');
  }, [navigate]);

  // Formatear número de teléfono como enlace
  const formatPhoneLink = (phone) => {
    return `tel:${phone.replace(/\D/g, '')}`;
  };

  // Formatear número para WhatsApp
  const formatWhatsAppLink = (phone) => {
    return `https://wa.me/${phone.replace(/\D/g, '')}`;
  };

  return (
    <Box
      sx={{
        background: colors.background,
        pt: { xs: 3, md: 4 },
        pb: { xs: 5, md: 6 }
      }}
    >
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

              {/* Botones de contacto mejorados */}
              <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', mb: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<Phone />}
                  href={formatPhoneLink("555-123-4567")}
                  sx={{
                    background: colors.accentGradient,
                    boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
                    borderRadius: '8px',
                    py: 1.2,
                    px: 3,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  Llamar ahora
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<WhatsApp sx={{ color: colors.success }} />}
                  href={formatWhatsAppLink("555-123-4567")}
                  target="_blank"
                  rel="noopener"
                  sx={{
                    borderColor: colors.success,
                    borderWidth: '2px',
                    color: colors.success,
                    borderRadius: '8px',
                    py: 1.1,
                    px: 3,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: colors.success,
                      backgroundColor: isDarkTheme ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.05)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  WhatsApp
                </Button>
              </Box>

              {/* Lista de servicios clave mejorada */}
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: colors.text,
                    fontWeight: 600,
                    mb: 2.5,
                    fontSize: '1.1rem'
                  }}
                >
                  Servicios principales:
                </Typography>
                
                {mainServices.slice(0, 4).map((service, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2
                    }}
                  >
                    <CheckCircleOutline
                      sx={{
                        fontSize: '1.2rem',
                        color: colors.primary,
                        mr: 2
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        color: colors.text,
                        fontWeight: 500
                      }}
                    >
                      {service}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Lado derecho - Carrusel de imágenes mejorado con animaciones y difuminado */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: '280px', sm: '360px', md: '420px' },
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: colors.shadow
              }}
            >
              {/* Carrusel de imágenes con animaciones y bordes difuminados */}
              <Box
                sx={{
                  position: 'relative',
                  height: '100%',
                  width: '100%',
                  backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)'
                }}
              >
                {/* Imagen actual con efecto de difuminado en los bordes */}
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
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                    opacity: isImageTransitioning ? 0 : 1,
                    transform: isImageTransitioning ? 'scale(1.08)' : 'scale(1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `
                        radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, ${isDarkTheme ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.6)'} 100%),
                        linear-gradient(to top, ${isDarkTheme ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.6)'} 0%, rgba(0,0,0,0) 15%),
                        linear-gradient(to bottom, ${isDarkTheme ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.6)'} 0%, rgba(0,0,0,0) 15%),
                        linear-gradient(to left, ${isDarkTheme ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.6)'} 0%, rgba(0,0,0,0) 15%),
                        linear-gradient(to right, ${isDarkTheme ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.6)'} 0%, rgba(0,0,0,0) 15%)
                      `,
                      zIndex: 1
                    }
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
                        backgroundColor: 'rgba(255,255,255,0.25)'
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
                        backgroundColor: 'rgba(255,255,255,0.25)'
                      },
                      transition: 'all 0.3s ease',
                      width: 40,
                      height: 40
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>

                {/* Overlay con información sobre la imagen */}
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
                    justifyContent: 'flex-end',
                    transition: 'opacity 0.3s ease',
                    opacity: isImageTransitioning ? 0 : 1
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
                    Atención dental profesional para toda la comunidad
                  </Typography>
                </Box>
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

        {/* Sección "Por qué elegirnos" mejorada */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
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
                <Paper
                  elevation={0}
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
                    flexDirection: 'column'
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

        {/* Sección de Testimonios */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
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
                    }
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
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Final mejorado */}
        <Box
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: '20px',
            background: colors.accentGradient,
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.2)'
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

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Button
              variant="contained"
              startIcon={<Phone />}
              sx={{
                backgroundColor: 'white',
                color: colors.primary,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                },
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '1rem'
              }}
              href={formatPhoneLink("555-123-4567")}
            >
              Llámanos al 555-123-4567
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<WhatsApp />}
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                borderWidth: '2px',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                },
                fontSize: '1rem'
              }}
              href={formatWhatsAppLink("555-123-4567")}
              target="_blank"
              rel="noopener"
            >
              Contáctanos por WhatsApp
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;