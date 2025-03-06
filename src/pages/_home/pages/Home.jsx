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
  useTheme
} from '@mui/material';
import {
  ArrowForward,
  ChevronLeft,
  ChevronRight,
  CheckCircleOutline,
  Phone,
  WhatsApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import images from '../../../utils/imageLoader';

// Datos de características principales actualizados
const featuresData = [
  {
    title: "Atención cercana",
    description: "Tratamiento personalizado para cada paciente"
  },
  {
    title: "Precio justo",
    description: "Servicios odontológicos de calidad a precios accesibles"
  },
  {
    title: "Consultorio local",
    description: "Ubicado en el corazón de nuestra comunidad"
  },
  {
    title: "Confianza y experiencia",
    description: "Más de 10 años cuidando sonrisas"
  }
];

// Lista básica de servicios principales (esto se combinará con los datos de la API)
const mainServices = [
  "Limpieza dental",
  "Extracciones",
  "Empastes",
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
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

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
    lightBg: isDarkTheme ? "rgba(59, 130, 246, 0.1)" : "rgba(37, 99, 235, 0.05)"
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
        {/* Hero Section - Más simple y directo */}
        <Grid
          container
          spacing={4}
          sx={{
            alignItems: "center",
            mb: { xs: 4, md: 5 }
          }}
        >
          {/* Lado izquierdo - Texto principal */}
          <Grid item xs={12} md={6}>
            <Box sx={{ py: { xs: 2, md: 3 } }}>
              <Badge
                badgeContent="Comunidad"
                color="primary"
                sx={{
                  mb: 2,
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    px: 1,
                    py: 0.5,
                    borderRadius: '4px'
                  }
                }}
              />

              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                  fontWeight: 700,
                  lineHeight: 1.3,
                  mb: 2,
                  color: colors.text
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
                      height: '3px',
                      bottom: '-4px',
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
                  mb: 3,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.6
                }}
              >
                Tu dentista de confianza en la comunidad. Ofrecemos atención personalizada, cálida y a precios accesibles.
              </Typography>

              {/* Botones de contacto */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Phone />}
                  href={formatPhoneLink("555-123-4567")}
                  sx={{
                    background: colors.accentGradient,
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    borderRadius: '6px',
                    py: 1,
                    px: 2.5,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      transform: 'translateY(-2px)'
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
                    color: colors.success,
                    borderRadius: '6px',
                    py: 1,
                    px: 2.5,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: colors.success,
                      backgroundColor: isDarkTheme ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.05)'
                    }
                  }}
                >
                  WhatsApp
                </Button>
              </Box>

              {/* Lista de puntos clave */}
              <Box sx={{ mt: 3 }}>
                {mainServices.slice(0, 3).map((service, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1.5
                    }}
                  >
                    <CheckCircleOutline
                      sx={{
                        fontSize: '1.1rem',
                        color: colors.primary,
                        mr: 1.5
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text
                      }}
                    >
                      {service}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Lado derecho - Carrusel de imágenes (mantenido del diseño original) */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: '250px', sm: '300px', md: '320px' },
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: colors.shadow
              }}
            >
              {/* Carrusel de imágenes */}
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

        {/* Sección "Por qué elegirnos" */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 3,
              color: colors.text,
              position: 'relative',
              paddingBottom: '10px',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '40px',
                height: '3px',
                background: colors.primary,
                borderRadius: '2px'
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
                    p: 2.5,
                    height: '100%',
                    borderRadius: '10px',
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: colors.cardHover,
                      transform: 'translateY(-4px)',
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
                      mb: 1.5
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        background: colors.accentGradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mr: 1.5,
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: colors.text,
                        fontSize: '1rem'
                      }}
                    >
                      {feature.title}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.subtext,
                      lineHeight: 1.5,
                      fontSize: '0.9rem'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>


        {/* Sección de Servicios Destacados (Carrusel) */}
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
                  paddingBottom: '10px',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '40px',
                    height: '3px',
                    background: colors.primary,
                    borderRadius: '2px'
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
                    backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)'
                    }
                  }}
                >
                  <ChevronLeft sx={{ color: colors.primary, fontSize: '1.2rem' }} />
                </IconButton>
                <IconButton
                  onClick={nextService}
                  size="small"
                  sx={{
                    backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)'
                    }
                  }}
                >
                  <ChevronRight sx={{ color: colors.primary, fontSize: '1.2rem' }} />
                </IconButton>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {Array.from({ length: Math.min(isMobile ? 1 : isTablet ? 2 : 3, services.length) }).map((_, offset) => {
                const index = (currentServiceIndex + offset) % services.length;
                const service = services[index];

                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      onClick={() => navigate(`/servicios/detalle/${service.id}`)}
                      sx={{
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundColor: colors.cardBg,
                        transition: 'all 0.3s ease',
                        boxShadow: 'none',
                        border: `1px solid ${colors.border}`,
                        cursor: 'pointer',
                        transform: offset === 0 ? 'scale(1.02)' : 'scale(1)',
                        opacity: offset === 0 ? 1 : 0.9,
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
                              backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)',
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
                            fontSize: '1.1rem'
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

        {/* CTA Final */}
        <Box
          sx={{
            mt: 5,
            p: 3,
            borderRadius: '10px',
            background: colors.accentGradient,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 2
            }}
          >
            ¿Necesitas atención dental?
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              maxWidth: '800px',
              mx: 'auto',
              opacity: 0.9
            }}
          >
            Estamos aquí para cuidar de tu salud bucal con tratamientos de calidad y atención personalizada. ¡Agenda tu cita hoy mismo!
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'white',
                color: colors.primary,
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: '6px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
              href={formatPhoneLink("555-123-4567")}
            >
              Llámanos al 555-123-4567
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;