// Home.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  CleaningServices,
  MedicalServices,
  LocalHospital,
  NavigateBefore,
  NavigateNext
} from '@mui/icons-material';
import { Suspense, lazy } from 'react';
// Importar imágenes locales

import img1 from '../../../assets/imagenes/img1_1.jpeg';
import img2 from '../../../assets/imagenes/img2_1.jpg';
import img3 from '../../../assets/imagenes/img3_1.png';

// Importaciones optimizadas
const Ubicacion = lazy(() => import('./Ubicacion'));

// Constantes
const TITLE_ROTATION_INTERVAL = 3000;
const SERVICE_ROTATION_INTERVAL = 5000;

// Animaciones predefinidas
const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 }
  },
  serviceCard: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3 }
  }
};

const Home = () => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [empresa, setEmpresa] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeService, setActiveService] = useState(0);
  const [currentTitle, setCurrentTitle] = useState(0);

  
  // Memoizar datos estáticos
  const titles = useMemo(() => [
    "Odontología Carol",
    "Sonrisas Perfectas",
    "Tu Clínica de Confianza"
  ], []);

  const colors = useMemo(() => ({
    background: isDarkMode
      ? 'linear-gradient(135deg, #1A2A3A 30%, #1D2A38 100%)'
      : 'linear-gradient(135deg, #FFFFFF 30%, #E3F2FD 100%)',
    primaryText: isDarkMode ? '#82B1FF' : '#03427C',
    secondaryText: isDarkMode ? '#B0BEC5' : '#616161',
    cardBackground: isDarkMode ? '#2A3A4A' : '#FFFFFF',
  }), [isDarkMode]);

  const services = useMemo(() => [
    {
      title: 'Limpieza Dental',
      icon: <CleaningServices sx={{ fontSize: 40, color: colors.primaryText }} />,
      img: img1,
      description: 'Mantenemos tu sonrisa limpia y saludable.',
    },
    {
      title: 'Ortodoncia',
      icon: <MedicalServices sx={{ fontSize: 40, color: colors.primaryText }} />,
      img: img2,
      description: 'Corrige la posición de tus dientes.',
    },
    {
      title: 'Implantes Dentales',
      icon: <LocalHospital sx={{ fontSize: 40, color: colors.primaryText }} />,
      img: img3,
      description: 'Reemplaza tus dientes faltantes con implantes de calidad.',
    },
  ], [colors.primaryText]);

  // Handlers optimizados
  const handlePrevService = useCallback(() => {
    setActiveService(prev => (prev - 1 + services.length) % services.length);
  }, [services.length]);

  const handleNextService = useCallback(() => {
    setActiveService(prev => (prev + 1) % services.length);
  }, [services.length]);

  // Efecto para el tema oscuro
  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => setIsDarkMode(e.matches);
    
    setIsDarkMode(matchDarkTheme.matches);
    matchDarkTheme.addEventListener('change', handleThemeChange);
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
  }, []);

  // Efecto para rotación de títulos con cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitle(prev => (prev + 1) % titles.length);
    }, TITLE_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [titles.length]);

  // Efecto para rotación de servicios con cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService(prev => (prev + 1) % services.length);
    }, SERVICE_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [services.length]);

  // Fetch de datos optimizado
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchEmpresaData = async () => {
      try {
        const response = await fetch(
          'http://localhost:3001/api/perfilEmpresa/empresa',
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error('Error al obtener los datos de la empresa');
        const data = await response.json();
        setEmpresa(data);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpresaData();
    return () => controller.abort();
  }, []);

  // Componente de servicio optimizado
  const ServiceCard = useCallback(({ service, index }) => (
    <motion.div
      initial="initial"
      animate={{
        ...animations.serviceCard.animate,
        scale: index === activeService ? 1.05 : 0.95,
      }}
      exit="exit"
      transition={animations.serviceCard.transition}
      whileHover={{ scale: 1.08 }}
    >
      <Card
        sx={{
          boxShadow: index === activeService ? 8 : 3,
          borderRadius: '16px',
          height: '100%',
          backgroundColor: colors.cardBackground,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Box sx={{ textAlign: 'center', mt: 2 }}>{service.icon}</Box>
        <CardMedia
          component="img"
          alt={service.title}
          image={service.img}
          loading="lazy"
          sx={{
            height: 180,
            objectFit: 'cover',
            transition: 'transform 0.3s ease-in-out',
          }}
        />
        <CardContent>
          <Typography 
            variant="h5" 
            sx={{ 
              color: colors.secondaryText, 
              mb: 2,
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            {service.title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.secondaryText,
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            {service.description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  ), [activeService, colors.cardBackground, colors.secondaryText]);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: colors.background
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: colors.background
      }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        background: colors.background, 
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        transition: 'background 0.3s ease-in-out'
      }}
    >
      <Container maxWidth="lg" sx={{ py: 10 }} disableGutters>
        {/* Header con animación de títulos */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTitle}
            {...animations.fadeIn}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  color: colors.primaryText,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {titles[currentTitle]}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: colors.secondaryText,
                  mt: 2,
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                {empresa?.slogan || 'Cuidando tu sonrisa con pasión y profesionalismo'}
              </Typography>
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Servicios con carrusel */}
        <Box component="section" sx={{ mb: 12, position: 'relative' }}>
          <Typography
            variant="h4"
            sx={{
              color: colors.primaryText,
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 6,
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Nuestros Servicios
          </Typography>

          <Box sx={{ position: 'relative' }}>
            {/* Botones de navegación */}
            <IconButton
              onClick={handlePrevService}
              sx={{
                position: 'absolute',
                left: { xs: -10, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-50%) scale(1.1)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <NavigateBefore />
            </IconButton>

            <IconButton
              onClick={handleNextService}
              sx={{
                position: 'absolute',
                right: { xs: -10, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-50%) scale(1.1)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <NavigateNext />
            </IconButton>

            {/* Grid de servicios */}
            <AnimatePresence mode="wait">
              <Grid container spacing={4} justifyContent="center">
                {services.map((service, index) => (
                  <Grid item xs={12} sm={6} md={4} key={service.title}>
                    <ServiceCard service={service} index={index} />
                  </Grid>
                ))}
              </Grid>
            </AnimatePresence>
          </Box>
        </Box>

        {/* Componente de ubicación */}
        <Suspense 
          fallback={
            <Box sx={{
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CircularProgress />
            </Box>
          }
        >
          <Ubicacion />
        </Suspense>
      </Container>
    </Box>
  );
};

export default React.memo(Home);