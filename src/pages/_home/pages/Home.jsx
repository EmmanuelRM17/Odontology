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
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  ArrowForward, 
  ChevronLeft, 
  ChevronRight
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import images from '../../../utils/imageLoader';

// Datos de características principales
const featuresData = [
  {
    title: "Cuidado dental con calidez",
    description: "Atención personalizada en un ambiente cálido y acogedor"
  },
  {
    title: "Profesionales expertos",
    description: "Equipo de especialistas con amplia experiencia en todas las áreas"
  },
  {
    title: "Tecnología avanzada",
    description: "Equipos de última generación para tratamientos precisos"
  },
  {
    title: "Atención cercana",
    description: "Seguimiento personalizado para cada uno de nuestros pacientes"
  }
];

const Home = () => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Estados
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Colores según el tema
  const colors = {
    background: isDarkTheme
            ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
            : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
    primary: isDarkTheme ? "#3B82F6" : "#0F52BA", // Azul más profesional
    secondary: isDarkTheme ? "#4ADE80" : "#10B981",
    text: isDarkTheme ? "#F3F4F6" : "#1F2937",
    subtext: isDarkTheme ? "#94A3B8" : "#64748B",
    cardBg: isDarkTheme ? "#1E293B" : "#FFFFFF",
    cardHover: isDarkTheme ? "#263A52" : "#F1F5F9", 
    border: isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    shadow: isDarkTheme
      ? "0 10px 25px rgba(0,0,0,0.3)"
      : "0 10px 25px rgba(0,0,0,0.06)",
    accentGradient: isDarkTheme
      ? "linear-gradient(90deg, #3B82F6, #60A5FA)"
      : "linear-gradient(90deg, #0F52BA, #4A8AF4)"
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

  // Navegación manual entre servicios
  const nextService = useCallback(() => {
    setCurrentServiceIndex(prev => (prev + 1) % services.length);
  }, [services.length]);

  const prevService = useCallback(() => {
    setCurrentServiceIndex(prev => (prev === 0 ? services.length - 1 : prev - 1));
  }, [services.length]);

  // Navegar a la página de servicios
  const handleExploreServices = useCallback(() => {
    navigate('/servicios');
  }, [navigate]);

  return (
    <Box 
      sx={{ 
        background: colors.background,
        pt: { xs: 2, md: 4 },
        pb: { xs: 4, md: 6 }
      }}
    >
      <Container maxWidth="xl">
        {/* Hero Section - más compacta */}
        <Grid 
          container 
          spacing={3}
          sx={{
            alignItems: "center",
            mb: 5
          }}
        >
          {/* Lado izquierdo - Texto principal */}
          <Grid item xs={12} md={6}>
            <Box sx={{ py: { xs: 2, md: 3 }, pl: { md: 2 } }}>
              <Typography 
                variant="h2" 
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mb: 1.5,
                  color: colors.text
                }}
              >
                Bienvenido a{' '}
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
                      bottom: '-4px',
                      left: 0,
                      background: colors.accentGradient,
                      borderRadius: '2px'
                    }
                  }}
                >
                  Odontología Carol
                </Box>
              </Typography>
              
              <Typography 
                variant="h5"
                sx={{
                  color: colors.subtext,
                  fontWeight: 400,
                  mb: 3,
                  fontSize: { xs: '1.1rem', md: '1.3rem' }
                }}
              >
                Sonrisas saludables, vidas felices
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleExploreServices}
                sx={{
                  background: colors.accentGradient,
                  boxShadow: '0 4px 14px rgba(15, 82, 186, 0.3)',
                  borderRadius: '8px',
                  py: 1.5,
                  px: 3,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(15, 82, 186, 0.4)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Explorar nuestros servicios
              </Button>
            </Box>
          </Grid>
          
          {/* Lado derecho - Galería de imágenes mejorada */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                position: 'relative',
                height: { xs: '300px', sm: '350px', md: '380px' },
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: colors.shadow
              }}
            >
              {/* Carrusel de imágenes - nueva implementación más profesional */}
              <Box 
                sx={{
                  display: 'flex',
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)'
                }}
              >
                {Array.from({ length: Math.min(3, images.length) }).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${images[(currentServiceIndex + index) % images.length]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'all 0.5s ease',
                      opacity: index === 0 ? 1 : 0,
                      transform: `scale(${index === 0 ? 1 : 0.9})`,
                      zIndex: 3 - index
                    }}
                  />
                ))}
                
                {/* Controles de navegación */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 0,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                    zIndex: 10
                  }}
                >
                  {images.map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: index === currentServiceIndex % images.length 
                          ? colors.primary 
                          : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Sección "Por qué elegirnos" - Diseño moderno de tarjetas */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 3,
              color: colors.text,
              textAlign: 'center',
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: '-8px',
                width: '40px',
                height: '3px',
                background: colors.accentGradient,
                borderRadius: '3px'
              }
            }}
          >
            ¿Por qué elegirnos?
          </Typography>
          
          <Grid container spacing={3}>
            {featuresData.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: '12px',
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: colors.cardHover,
                      transform: 'translateY(-5px)',
                      boxShadow: colors.shadow
                    },
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2 
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        background: colors.accentGradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mr: 2,
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}
                    >
                      ✓
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: colors.text,
                        fontSize: '1.1rem'
                      }}
                    >
                      {feature.title}
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.subtext,
                      lineHeight: 1.6
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Sección de Servicios Destacados */}
        {services.length > 0 && (
          <Box>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 3 
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: colors.text,
                  position: 'relative',
                  display: 'inline-block',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    bottom: '-8px',
                    width: '40px',
                    height: '3px',
                    background: colors.accentGradient,
                    borderRadius: '3px'
                  }
                }}
              >
                Nuestros Servicios
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={prevService}
                  size="small"
                  sx={{
                    backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 82, 186, 0.05)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 82, 186, 0.1)'
                    }
                  }}
                >
                  <ChevronLeft sx={{ color: colors.primary }} />
                </IconButton>
                <IconButton
                  onClick={nextService}
                  size="small"
                  sx={{
                    backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 82, 186, 0.05)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 82, 186, 0.1)'
                    }
                  }}
                >
                  <ChevronRight sx={{ color: colors.primary }} />
                </IconButton>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              {Array.from({ length: Math.min(3, services.length) }).map((_, offset) => {
                const index = (currentServiceIndex + offset) % services.length;
                const service = services[index];
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      onClick={() => navigate(`/servicios/detalle/${service.id}`)}
                      sx={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: colors.cardBg,
                        transition: 'all 0.3s ease',
                        boxShadow: 'none',
                        border: `1px solid ${colors.border}`,
                        cursor: 'pointer',
                        transform: offset === 0 ? 'scale(1.02)' : 'scale(1)',
                        opacity: offset === 0 ? 1 : 0.8,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: colors.shadow
                        }
                      }}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={`Servicio ${index + 1}/${services.length}`}
                            size="small"
                            sx={{
                              backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 82, 186, 0.1)',
                              color: colors.primary,
                              fontWeight: 500,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: colors.text,
                            mb: 1.5,
                            fontSize: '1.2rem'
                          }}
                        >
                          {service.title}
                        </Typography>
                        
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.subtext,
                            mb: 2,
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {service.description}
                        </Typography>
                        
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                          }}
                        >
                          <Button
                            endIcon={<ArrowForward />}
                            sx={{
                              color: colors.primary,
                              textTransform: 'none',
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: 'transparent',
                                transform: 'translateX(4px)'
                              },
                              transition: 'transform 0.3s ease',
                              p: 0
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
      </Container>
    </Box>
  );
};

export default Home;