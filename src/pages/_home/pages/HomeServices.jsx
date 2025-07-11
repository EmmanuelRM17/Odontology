import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  IconButton,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
  Fade,
  Paper,
  Skeleton,
  Alert,
  CircularProgress,
  Grow,
  Tooltip,
  Stack,
  CardMedia
} from '@mui/material';
import { ChevronLeft, ChevronRight, ArrowForward, Sync, Schedule, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { SectionDivider } from './Home';

// Componente para error rediseñado
const ErrorMessage = ({ message, onRetry, isDarkTheme }) => (
  <Paper
    elevation={0}
    sx={{
      my: 4,
      p: 4,
      borderRadius: '24px',
      background: isDarkTheme 
        ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))'
        : 'linear-gradient(145deg, rgba(254, 226, 226, 0.8), rgba(255, 255, 255, 0.9))',
      border: `2px solid rgba(239, 68, 68, 0.2)`,
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <Box sx={{ position: 'relative', zIndex: 2 }}>
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
          }}
        >
          <Sync sx={{ fontSize: 28 }} />
        </Box>
        
        <Box flex={1}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 1.5,
              color: isDarkTheme ? '#ffffff' : '#1a1a1a'
            }}
          >
            No pudimos cargar los servicios
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
              lineHeight: 1.6,
              mb: 3
            }}
          >
            {message || 'Algo salió mal. Por favor intenta nuevamente.'}
          </Typography>
          
          <Button
            onClick={onRetry}
            variant="contained"
            size="large"
            startIcon={<Sync />}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(239, 68, 68, 0.4)'
              }
            }}
          >
            Reintentar
          </Button>
        </Box>
      </Stack>
    </Box>
  </Paper>
);

// Skeleton rediseñado
const ServicesSkeleton = ({ isDarkTheme, count = 3 }) => {
  return (
    <Grid container spacing={4}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              height: 400,
              background: isDarkTheme 
                ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))'
                : 'linear-gradient(145deg, rgba(248, 250, 252, 0.9), rgba(255, 255, 255, 0.8))',
              border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Imagen skeleton */}
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={200}
              animation="wave"
            />
            
            {/* Content skeleton */}
            <Box sx={{ p: 3 }}>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
                <Skeleton variant="rounded" width="80%" height={28} sx={{ borderRadius: '8px' }} />
              </Stack>
              
              <Skeleton variant="rounded" width="100%" height={20} sx={{ mb: 1, borderRadius: '6px' }} />
              <Skeleton variant="rounded" width="70%" height={20} sx={{ mb: 3, borderRadius: '6px' }} />
              
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
                <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: '12px' }} />
              </Stack>
              
              <Skeleton variant="rounded" width="100%" height={48} sx={{ borderRadius: '16px' }} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

// Tarjeta de servicio rediseñada usando datos reales
const ServiceCard = ({
  service,
  offset,
  serviceNumber,
  navigate,
  colors,
  setIsPaused,
  isDarkTheme
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  return (
    <Grow
      in={true}
      timeout={800 + (offset * 150)}
      style={{ transformOrigin: '50% 100%' }}
    >
      <Paper
        onClick={() => navigate(`/servicios/detalle/${service.id}`)}
        elevation={0}
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          background: isDarkTheme 
            ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))',
          border: `1px solid ${colors.border}`,
          cursor: 'pointer',
          height: 400,
          position: 'relative',
          transform: offset === 0 ? 'scale(1.02)' : 'scale(1)',
          opacity: offset === 0 ? 1 : 0.85,
          backdropFilter: 'blur(20px)',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            transform: 'translateY(-16px) scale(1.03)',
            opacity: 1,
            boxShadow: isDarkTheme 
              ? '0 32px 80px rgba(0,0,0,0.4)' 
              : `0 32px 80px ${colors.primary}25`,
            '& .service-button': {
              transform: 'translateX(8px)',
            }
          },
          '&:active': {
            transform: 'translateY(-8px) scale(0.98)',
            transition: 'all 0.2s ease',
          }
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Imagen del servicio */}
        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          {!imageError ? (
            <CardMedia
              component="img"
              height="200"
              image={service.image_url}
              alt={service.title}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sx={{
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
                transform: imageLoaded ? 'scale(1)' : 'scale(1.1)',
                opacity: imageLoaded ? 1 : 0
              }}
            />
          ) : (
            // Fallback si la imagen falla
            <Box
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem',
                fontWeight: 700
              }}
            >
              {service.title.charAt(0)}
            </Box>
          )}

          {/* Overlay con gradiente */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)'
            }}
          />

          {/* Badge de categoría */}
          <Chip
            label={service.category}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: 'rgba(255,255,255,0.9)',
              color: colors.primary,
              fontWeight: 600,
              fontSize: '0.75rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          />
          
          {/* Número del servicio */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 36,
              height: 36,
              borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.9)',
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 700,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {serviceNumber}
          </Box>
        </Box>

        {/* Contenido principal */}
        <Box sx={{ p: 3, height: 200, display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: colors.text,
              mb: 2,
              fontSize: '1.25rem',
              lineHeight: 1.3,
              letterSpacing: '-0.025em'
            }}
          >
            {service.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: colors.subtext,
              mb: 3,
              lineHeight: 1.6,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              flex: 1
            }}
          >
            {service.description}
          </Typography>

          {/* Información real del servicio */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule sx={{ fontSize: 16, color: colors.primary }} />
              <Typography variant="caption" sx={{ color: colors.subtext, fontWeight: 500 }}>
                {service.duration}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachMoney sx={{ fontSize: 16, color: colors.primary }} />
              <Typography variant="caption" sx={{ color: colors.subtext, fontWeight: 500 }}>
                ${service.price}
              </Typography>
            </Box>
          </Stack>

          {/* Botón de acción */}
          <Button
            className="service-button"
            fullWidth
            variant="contained"
            endIcon={<ArrowForward />}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5,
              fontSize: '0.95rem',
              background: colors.accentGradient,
              boxShadow: `0 8px 24px ${colors.primary}30`,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '&:hover': {
                background: colors.accentGradient,
                boxShadow: `0 12px 32px ${colors.primary}40`,
                transform: 'translateY(-2px)'
              }
            }}
          >
            Ver detalles
          </Button>
        </Box>
      </Paper>
    </Grow>
  );
};

// Slider móvil rediseñado
const MobileServiceSlider = ({
  services,
  currentServiceIndex,
  setCurrentServiceIndex,
  navigate,
  colors,
  setIsPaused,
  isDarkTheme
}) => {
  const nextSlide = () => setCurrentServiceIndex((prev) => 
    prev === services.length - 1 ? 0 : prev + 1
  );
  
  const prevSlide = () => setCurrentServiceIndex((prev) => 
    prev === 0 ? services.length - 1 : prev - 1
  );

  return (
    <Box sx={{ position: 'relative', mb: 5 }}>
      {/* Contenedor principal */}
      <Box sx={{ px: 3, position: 'relative' }}>
        <ServiceCard
          service={services[currentServiceIndex]}
          offset={0}
          serviceNumber={currentServiceIndex + 1}
          navigate={navigate}
          colors={colors}
          setIsPaused={setIsPaused}
          isDarkTheme={isDarkTheme}
        />

        {/* Botones flotantes rediseñados */}
        <IconButton
          onClick={prevSlide}
          sx={{
            position: 'absolute',
            left: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: 56,
            height: 56,
            background: isDarkTheme 
              ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.8))'
              : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            color: colors.primary,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              transform: 'translateY(-50%) scale(1.1)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
            }
          }}
        >
          <ChevronLeft sx={{ fontSize: 28 }} />
        </IconButton>

        <IconButton
          onClick={nextSlide}
          sx={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: 56,
            height: 56,
            background: isDarkTheme 
              ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.8))'
              : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            color: colors.primary,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              transform: 'translateY(-50%) scale(1.1)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
            }
          }}
        >
          <ChevronRight sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      {/* Indicadores modernos */}
      <Stack direction="row" justifyContent="center" spacing={1} mt={4}>
        {services.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => setCurrentServiceIndex(idx)}
            sx={{
              width: idx === currentServiceIndex ? 32 : 12,
              height: 12,
              borderRadius: '8px',
              background: idx === currentServiceIndex
                ? `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)`
                : isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              border: idx === currentServiceIndex ? `2px solid ${colors.primary}40` : 'none',
              '&:hover': {
                transform: 'scale(1.2)',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)`
              }
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

// Componente principal
const HomeServices = ({ colors, setIsPaused }) => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const containerRef = useRef(null);

  // Estados (mantenidos igual)
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Funciones (mantenidas igual)
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsRetrying(false);

    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setTimeout(() => {
      fetchServices();
    }, 500);
  }, [fetchServices]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (isMobile || services.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentServiceIndex(prev => (prev + 1) % services.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isMobile, services.length]);

  const prevService = useCallback(() => {
    if (services.length > 1) {
      setCurrentServiceIndex(prev => prev === 0 ? services.length - 1 : prev - 1);
    }
  }, [services.length]);

  const nextService = useCallback(() => {
    if (services.length > 1) {
      setCurrentServiceIndex(prev => (prev + 1) % services.length);
    }
  }, [services.length]);

  const handleExploreServices = useCallback(() => {
    navigate('/servicios');
  }, [navigate]);

  return (
    <Container maxWidth="lg" ref={containerRef} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: { xs: 6, sm: 7, md: 10 } }}>
        {/* Header rediseñado */}
        <Box sx={{ mb: 6, textAlign: 'center', position: 'relative' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${colors.text}, ${colors.text}cc)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              letterSpacing: '-0.02em',
              position: 'relative'
            }}
          >
            Nuestros Servicios
            <Box
              sx={{
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                background: colors.accentGradient,
                borderRadius: '2px'
              }}
            />
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: colors.subtext,
              maxWidth: '600px',
              mx: 'auto',
              mb: 4,
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            Descubre nuestra amplia gama de tratamientos dentales especializados para toda la familia
          </Typography>

          {/* Controles del header */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center" 
            alignItems="center"
          >
            <Button
              onClick={handleExploreServices}
              variant="outlined"
              size="large"
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '16px',
                borderWidth: '2px',
                textTransform: 'none',
                fontSize: '1rem',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  borderWidth: '2px',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 32px ${colors.primary}30`
                }
              }}
            >
              Ver todos los servicios
            </Button>

            {!isMobile && (
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={prevService}
                  disabled={loading || services.length <= 1}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '16px',
                    background: isDarkTheme 
                      ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.1))'
                      : 'linear-gradient(145deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.05))',
                    border: `2px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                    backdropFilter: 'blur(10px)',
                    color: colors.primary,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.05)',
                    },
                    '&:disabled': {
                      opacity: 0.4
                    }
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                
                <IconButton
                  onClick={nextService}
                  disabled={loading || services.length <= 1}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '16px',
                    background: isDarkTheme 
                      ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.1))'
                      : 'linear-gradient(145deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.05))',
                    border: `2px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                    backdropFilter: 'blur(10px)',
                    color: colors.primary,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.05)',
                    },
                    '&:disabled': {
                      opacity: 0.4
                    }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Estados de carga */}
        {isRetrying && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '300px',
            textAlign: 'center'
          }}>
            <CircularProgress size={48} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ color: colors.text, mb: 1 }}>
              Reintentando conexión...
            </Typography>
            <Typography variant="body2" sx={{ color: colors.subtext }}>
              Por favor espera un momento
            </Typography>
          </Box>
        )}

        {error && !isRetrying && (
          <ErrorMessage
            message={error}
            onRetry={handleRetry}
            isDarkTheme={isDarkTheme}
          />
        )}

        {loading && !isRetrying && (
          <ServicesSkeleton
            isDarkTheme={isDarkTheme}
            count={isMobile ? 1 : isTablet ? 2 : 3}
          />
        )}

        {/* Servicios principales */}
        {!loading && !error && services.length > 0 && (
          <>
            {isMobile ? (
              <MobileServiceSlider
                services={services}
                currentServiceIndex={currentServiceIndex}
                setCurrentServiceIndex={setCurrentServiceIndex}
                navigate={navigate}
                colors={colors}
                setIsPaused={setIsPaused}
                isDarkTheme={isDarkTheme}
              />
            ) : (
              <Grid container spacing={4}>
                {(() => {
                  const displayCount = isTablet ? 2 : 3;
                  const visibleServices = [];

                  for (let i = 0; i < displayCount && i < services.length; i++) {
                    const index = (currentServiceIndex + i) % services.length;
                    visibleServices.push({
                      service: services[index],
                      index: index,
                      realIndex: index + 1
                    });
                  }

                  return visibleServices.map((item, offset) => (
                    <Grid item xs={12} sm={6} md={4} key={`service-${item.index}`}>
                      <ServiceCard
                        service={item.service}
                        offset={offset}
                        serviceNumber={item.realIndex}
                        navigate={navigate}
                        colors={colors}
                        setIsPaused={setIsPaused}
                        isDarkTheme={isDarkTheme}
                      />
                    </Grid>
                  ));
                })()}
              </Grid>
            )}

            {/* Indicadores para desktop */}
            {!isMobile && services.length > 3 && (
              <Stack direction="row" justifyContent="center" spacing={1.5} mt={6}>
                {services.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setCurrentServiceIndex(idx)}
                    sx={{
                      width: currentServiceIndex <= idx && idx < currentServiceIndex + (isTablet ? 2 : 3) ? 32 : 12,
                      height: 12,
                      borderRadius: '8px',
                      background: currentServiceIndex <= idx && idx < currentServiceIndex + (isTablet ? 2 : 3)
                        ? `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)`
                        : isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      border: currentServiceIndex <= idx && idx < currentServiceIndex + (isTablet ? 2 : 3) 
                        ? `2px solid ${colors.primary}40` : 'none',
                      '&:hover': {
                        transform: 'scale(1.3)',
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)`
                      }
                    }}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>

      <SectionDivider colors={colors} />
    </Container>
  );
};

export default HomeServices;